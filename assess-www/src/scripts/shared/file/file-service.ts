import { Promise } from 'es6-promise';
import { Observable, Subject } from 'rxjs';
import { Inject, Service } from 'typedi';

import { AppContext } from '@assess/app-context';
import { NewContentVersion } from '@assess/content/dto';
import { Logger } from '@assess/shared/log/logger-annotation';
import {  LoggingService } from '@assess/shared/log/logging-service';


const EXTRACTED_VERSIONS_FILE: string = "extractedHashes.json";
const CONTENT_ARCHIVE_DIR: string = "contentArchive";
const TMP_EXTRACT_DIR:string = "zipExtractTemp";
const CONTENT_WWW_FOLDER = "contentWww";
const WWW_FOLDER = "give-www"
const USERS_FOLDER = "users"


@Service()
export class FileService {

  private rootDir: DirectoryEntry;

  private wwwDir: DirectoryEntry;

  private userDir: DirectoryEntry;

  @Inject()
  private appContext: AppContext;

  private logger: LoggingService = new LoggingService('FileService');
  
  /**
   * Makde dirs recursively under a parent dir
   * @param parentDir 
   * @param path 
   */
  public mkDirs(parentDir: DirectoryEntry, path: string): Promise<DirectoryEntry> {
    const paths = path.split('/').reverse();
    const p = new Promise<DirectoryEntry>((res, rej) => {

      let prevDir = parentDir;      
      const createDir = (dir:string) => {
        // console.log("create dir " + dir);
        prevDir.getDirectory(dir, { create: true, exclusive: false}, newDir => {
          // console.log("dir created " + newDir.fullPath);
          prevDir = newDir;
          if (paths.length > 0) {
            createDir(paths.pop() as string);
          } else {
            // console.log("all dir created");
            res(newDir);
          }
        }, e => {
          rej(e);
        });
       };

       createDir(paths.pop() as string);
    });
    return p;
  }

  /**
   * Creates the chain of folders within the root folder
   * @param path path like "/foler1/subfolder2"
   */
  public mkDirsInRoot(path: string): Promise<DirectoryEntry> {
      const p = new Promise<DirectoryEntry>((res, rej) => {
      this.getRootPath()
      .then(rootDir => {
        this.mkDirs(rootDir, path).then(dir => res(dir)).catch(e => rej(e));
      })
    });
    return p;
  }

  /**
   * Creates file inside an full path into the root
   * @param path 
   * @param contents 
   */
  public createFileWithPath(
    parentDir: DirectoryEntry,
    path: string,
    contents: Blob
  ): Observable<FileEntry> {
    const subject = new Subject<FileEntry>();
    const parentPath: string = path.substr(0, path.lastIndexOf('/'));
    const fileName: string = path.substr(path.lastIndexOf('/') + 1);
    

    
    setTimeout(() => {
      this.mkDirs(parentDir, parentPath)
      .then((subDir: DirectoryEntry) => {
        // console.log('subDir', subDir.fullPath, subDir.toURL(), subDir.nativeURL,  subDir.toInternalURL ? subDir.toInternalURL(): '');
        this.writeFile(subDir, fileName, contents)
          .then(fileEntry => {
            subject.next(fileEntry);
            subject.complete();
          })
          .catch(e => {
            subject.error(e);
            subject.complete();
          });
      })
      .catch(e => {
        subject.error(e);
        // console.error(parentPath, fileName, e);
        subject.complete();
      });
    }, 10);
    

    return subject;
  }

  /**
   * Writes a blob to a file in the directory
   * @param dir 
   * @param fileName 
   * @param data 
   */
  public writeFile(dir: DirectoryEntry, fileName: string, data: Blob): Promise<FileEntry> {

    return new Promise<FileEntry>((res, rej) => {
      dir.getFile(fileName,
        { create: true },
        fileEntry => {
          fileEntry.createWriter(writer => {
            writer.write(data);
            res(fileEntry);
          });
        },
        e => {
          rej(e);
        }
      );
    });
  }

  /**
   * Returns a promise which evaluates the root path where we save the project/app files
   */
  public getRootPath(): Promise<DirectoryEntry> {
    if (this.rootDir != null) {
      return Promise.resolve(this.rootDir);
    }

    const p = new Promise<DirectoryEntry>((res, rej) => {    

      if (window.cordova) {
          window.resolveLocalFileSystemURL(
            cordova.file.dataDirectory,
            dirEntry => {
              this.rootDir = dirEntry as DirectoryEntry;
              res(dirEntry as DirectoryEntry);
            },
            e => {
              rej(e);
            }
          );       
      } else {
        window.webkitRequestFileSystem(
            window.PERSISTENT,
            1024 * 1024 * 1024,
            fs => {
              this.rootDir = fs.root;
              res(fs.root);
            },
            e => {
              rej(e);
            }
        );
               
      }
    });
    return p;
  }

  /**
   * Returns a promise which evaluates the user path where we save the project/app files
   */
  public getUserDir(): Promise<DirectoryEntry> {
    return this.getRootPath()
      .then(root => {
        return new Promise<DirectoryEntry>((res, rej) => {
          root.getDirectory(USERS_FOLDER, { create: true, exclusive: false}, dir => res(dir), e => rej(e));
        });
    });
  }

  public getContentArchiveDir(): Promise<DirectoryEntry> {
   return this.getRootPath()
      .then(root => {
        return new Promise<DirectoryEntry>((res, rej) => {
          root.getDirectory(CONTENT_ARCHIVE_DIR, { create: true, exclusive: false}, dir => res(dir), e => rej(e));
        });
    });
  }

  public getZipExtractTmpDir(): Promise<DirectoryEntry> {
    if (!this.appContext.withinCordova) { // mock when opened in browser
      return Promise.resolve(null);
    }
    return this.getRootPath()
      .then(root => {
        return new Promise<DirectoryEntry>((res, rej) => {
          root.getDirectory(TMP_EXTRACT_DIR, { create: true, exclusive: false}, dir => res(dir), e => rej(e));
        });
    });
  }


  public recreateZipExractTmpDir(): Promise<boolean> {
    if (!this.appContext.withinCordova) { // mock when opened in browser
      return Promise.resolve(true);
    }
    const createTmpDir = (rootDir: DirectoryEntry, res, rej) => {
      rootDir.getDirectory(TMP_EXTRACT_DIR, {create: true}, (dir) => res(true), (e) => rej(e));
    };

    return new Promise((res, rej) => {
      this.getRootPath().then(rootDir => {
          this.logger.debug( 'rootDir ', rootDir.nativeURL);
          rootDir.getDirectory(TMP_EXTRACT_DIR, {}, dir => {
              // dir exists we need to remove and recreate
              dir.removeRecursively(() => createTmpDir(rootDir, res, rej), e => rej(e));                   
          }, () => {
              // path doesnt exist, we create it then
              createTmpDir(rootDir, res, rej);
          });
      }).catch(e => rej(e));
    });
  }

  /**
   * 
   */
  public getExtractedHashesFileContent(): Promise<string> {
    // we are mocking the extractedHashes for normal browser
    if (!this.appContext.withinCordova) {
      return Promise.resolve("{}");
    }

    const p = new Promise<string>((res, rej) => {
      this.getRootPath()
      .then(rootDir => {
          rootDir.getFile(EXTRACTED_VERSIONS_FILE, { create: true, exclusive: false}, fileEntry => {
            fileEntry.file(file => {
              const reader = new FileReader();
              reader.onloadend = () => {
                res(reader.result || "{}");                
              };
              reader.readAsText(file);              
            });
            
          }, e => rej(e));
      })
      .catch(e => rej(e));

    });
    return p;
  }


  public readAsText(parentDir: DirectoryEntry, fileName: string, create: boolean = true, encoding: string = 'UTF-8'): Promise<string> {
    const p = new Promise<string>((res, rej) => {   
          parentDir.getFile(fileName, { create, exclusive: false}, fileEntry => {
            fileEntry.file(file => {
              const reader = new FileReader();
              reader.onloadend = () => {
                res(reader.result);                
              };
              reader.readAsText(file, encoding);              
            });            
          }, e => rej(e));
    });
    return p;
  }

  public readAsBinary(parentDir: DirectoryEntry, fileName: string, create: boolean = true): Promise<string> {
    const p = new Promise<string>((res, rej) => {   
          parentDir.getFile(fileName, { create, exclusive: false}, fileEntry => {
            fileEntry.file(file => {
              const reader = new FileReader();
              reader.onloadend = () => {
                res(reader.result);                
              };
              reader.readAsBinaryString(file);              
            });            
          }, e => rej(e));
    });
    return p;
  }

  public readAsTextFromFile(fileEntry: FileEntry, encoding: string = 'UTF-8'): Promise<string> {
    const p = new Promise<string>((res, rej) => {            
        fileEntry.file(file => {
              const reader = new FileReader();
              reader.onloadend = () => {
                res(reader.result);                
              };
              reader.readAsText(file, encoding);              
            });   
    });
    return p;
  }


  public hasFile(parentDir: DirectoryEntry, filePath: string): Promise<boolean> {
    return new Promise<boolean>((res, rej) => {
      parentDir.getFile(filePath, {}, fileEntry => {
        fileEntry.file(file => {
          const reader = new FileReader();
          reader.onloadend = () => {
              // The file exists and is readable
              this.logger.success(`Found file ${fileEntry.toInternalURL()}`);
              res(true);
          };
          reader.readAsText(file);
      }, e => {
        this.logger.error(`hasFile error  finding file ${fileEntry.toInternalURL()} with ${JSON.stringify(e)}`);
        res(false);
      });
      }, e => {
        this.logger.error(`hasFile: no file found ${parentDir.toInternalURL()} ${filePath} with ${JSON.stringify(e)}`);
        res(false);
      });
    });
  }


  public getSizeDescription(bytes: number): string {
    if (bytes === 0) {
      return "0KB";
    } else if (bytes <= 1024) {
      return "1KB";
    } else if (bytes < 1024 * 512) {
      return `${Math.round(bytes/1024.0)}KB`;
    } else if (bytes < 1048576) {
      const roundedTenthMB = Math.round((bytes *10 )/ 1048576.0);
      if (roundedTenthMB % 10 === 0) {
        return `${roundedTenthMB/10}MB`;
      } else {
        return `${roundedTenthMB/10.0}MB`;
      }
    } else {
      return `${Math.round(bytes/1048576.0)}MB`;
    }
  }

  public deleteFileSilently(parentDir: DirectoryEntry, filename: string): Promise<boolean> {
    return new Promise((res, rej) => {
      parentDir.getFile(filename, { create: false }, fileEntry => {
        fileEntry.remove(() => res(true), () => res(false));
      }, e => res(false))
    });
  }

  public deleteFolderSilently(parentDir: DirectoryEntry, subDir: string): Promise<boolean> {
    return new Promise((res, rej) => {
      parentDir.getDirectory(subDir, { create: false }, dirEntry => {
        dirEntry.removeRecursively(() => res(true), () => res(false));
      }, e => res(false))
    });
  }

  public deleteDirSilently(dir: DirectoryEntry): Promise<boolean> {
    return new Promise((res, rej) => {     
        dir.removeRecursively(() => res(true), () => res(false));      
    });
  }

  public deleteFolder(dir: DirectoryEntry): Promise<boolean> {
    return new Promise<boolean>((res, rej) => {
      dir.removeRecursively(() => res(true), e => rej(e));
    });
  }

  /**
   * Downloads a file with name to a folder 
   * @param url 
   * @param filename 
   * @param targetDir 
   */
  public downloadUrlToDir(contentVersion: NewContentVersion, url: string, filename: string, targetDir: DirectoryEntry, progressCb): Promise<FileEntry> {
    return new Promise((res, rej) => {
      const transfer = new FileTransfer();
      const uri = encodeURI(url);
      transfer.onprogress = (progressEvent: ProgressEvent) => {
        progressCb(progressEvent);
      };
      transfer.download(uri, `${targetDir.toInternalURL()}${filename}`, entry => {
        this.logger.debug(`Downloaded ${url} to ${entry.toInternalURL()}`);
        res(entry);
      }, e => rej(e), true, {
        headers: { withCredentials: true }
      });
    });
  }

  /**
   * Copying from the tmp zip to content archive, Dont ask why, thats how Assess does now.
   * HTML5 File API does not have a way to overwrite while copying . Hence doing this delete and copy
   * @param tarFile 
   */
  public copyToContentArchiveDir(tarFile: FileEntry): Promise<FileEntry> {
    return this.getContentArchiveDir().then(contentArchDir => {
      return Promise.all([contentArchDir, this.deleteFileSilently(contentArchDir, tarFile.name)])
    }).then(results => {
      const contentArchDir: DirectoryEntry = results[0];
      return contentArchDir;
    }).then(contentArchDir => {
      return new Promise<FileEntry>((res, rej) => {
        tarFile.copyTo(contentArchDir, null, entry => res(entry as FileEntry), e => rej(e));
      }); 
    });
  }

  /**
   * Gets names of tar files inside the content archive dir
   */
  public getContentDirTarFileNames(): Promise<string[]> {
    return this.getContentArchiveDir().then(contentArchDir => {
      return new Promise<string[]>((res, rej) => {
        this.logger.debug(`Getting list of tar file names in ${contentArchDir.toInternalURL()}`);
        const reader = contentArchDir.createReader();  
        let tarEntries: string[] = [];
        const readEntries = () => {
            reader.readEntries(entries => {
              if (!entries.length) {
                this.logger.debug(`Got tars  ${tarEntries.length}`);
                res(tarEntries);
              } else {
                tarEntries = tarEntries.concat(entries.map(it => it.name).filter(it => (/\.tar$/i).test(it)));
                readEntries();
              }
            }, e => rej(e));
        };
        readEntries();
      });      
    });
  }

  /**
   * Writes the hashes so that next content query gets only stuff that has changed.
   * @param hashes 
   */
  public writeExtractedHashes(hashes: any) : Promise<boolean> {
    const hashString: string = JSON.stringify(hashes);
    // this.logger.info(`Writing the hashes json with ${hashString}`);
    if (!this.appContext.withinCordova) {
      return Promise.resolve(true); // mock for browser
    }

    return this.getRootPath()
    .then(rootDir => {
      return this.writeFile(rootDir, EXTRACTED_VERSIONS_FILE, new Blob([
        hashString
      ], {
        type: 'application/json'
      }));
    }).then (() => true);
  }

  /**
   * Gets/Creates the assess www folder
   */
  public getContentWwwDir(): Promise<DirectoryEntry> {      
    return this.getRootPath()
      .then(root => {
        return new Promise<DirectoryEntry>((res, rej) => {
          root.getDirectory(CONTENT_WWW_FOLDER, { create: true, exclusive: false}, dir => res(dir), e => rej(e));
        });
    });
  }

  public getGiveWwwDir(): Promise<DirectoryEntry> {
    return this.getContentWwwDir()
    .then (dir => new Promise<DirectoryEntry>((res, rej) => {
      dir.getDirectory(WWW_FOLDER, {}, wwwDir => res(wwwDir), e => rej(e));
    }));
  }

  /**
   * Gets/Creates the assess www folder
   */
  public getWwwDir(): Promise<DirectoryEntry> {

    if (this.wwwDir != null) {
      return Promise.resolve(this.wwwDir);
    }

    return new Promise<DirectoryEntry>((res, rej) => {
        window.resolveLocalFileSystemURL(
          cordova.file.applicationDirectory + 'www',
          dirEntry => {  
            this.wwwDir = dirEntry as DirectoryEntry;                    
            res(dirEntry as DirectoryEntry);
          },
          e => {
            rej(e);
          }
        ); 
      });    
  }

  /**
   * Moves content of sourcePath to target
   * @param sourcePath 
   * @param targetDir 
   */
  public move(sourceDir: DirectoryEntry, targetDir: DirectoryEntry): Promise<boolean> {
    return new Promise<boolean>((res, rej) => {
      sourceDir.moveTo(targetDir, null, () => res(true), e => rej(e));
    });    
  }


  public getFile(parentDir: DirectoryEntry, path: string, create: boolean = false): Promise<FileEntry> {
    return new Promise<FileEntry>((res, rej) => {
      parentDir.getFile(path, {create, exclusive: false}, fileEntry => res(fileEntry), e => rej(e));
    });
  }

  /**
   * Copies cordova.js from www to our give-www/bower_components/cordova.
   * Relying on this because we are browserifying so all plugins and core go
   * to a single file.
   */
  public copyCordovaJs(): Promise<boolean> {
    if (!this.appContext.withinCordova) {
      // mock in browser
      return Promise.resolve(true);
    }

    return this.getWwwDir().then(wwwDir => {
      this.logger.debug('wwwDir location ' + wwwDir.nativeURL + ' internal ' + wwwDir.toInternalURL());
      return new Promise<FileEntry>((res, rej) => {
        wwwDir.getFile('cordova.js', {}, fileEntry => res(fileEntry), e => rej(e));
      });      
    })
    .then(cordovaJsFile => {
      return Promise.all([cordovaJsFile, 
        new Promise<DirectoryEntry>((res, rej) => {
          this.getContentWwwDir().then(wwwDir => {
            wwwDir.getDirectory(`${WWW_FOLDER}/bower_components/cordova`, {}, dir => res(dir), e => rej(e));
          }).catch((e) => rej(e));
        })
      ]);
    })
    .then(results => {
        const cordovaJSFile: FileEntry = results[0];
        const targetDir: DirectoryEntry = results[1];
        this.logger.debug(`Deleting the cordova indexjs from ${targetDir.toInternalURL()}`);
        return this.deleteFileSilently(targetDir, 'index.js').then(() => 
          new Promise<boolean> ((res, rej) => {
            this.logger.debug(`Copying ${cordovaJSFile.toInternalURL()}`);
            cordovaJSFile.copyTo(targetDir, 'index.js', () => res(true), e => rej(e));
          })
        );        
    });
  }


  /**
   * Copies plugin.js from www to our give-www/bower_components/assess_plugins.
   * Relying on this because we are browserifying so all plugins and core go
   * to a single file.
   */
  public copyAssessPluginsJs(): Promise<boolean> {
    if (!this.appContext.withinCordova) {
      // mock in browser
      return Promise.resolve(true);
    }

    return this.getWwwDir().then(wwwDir => {
      this.logger.debug('wwwDir location ' + wwwDir.nativeURL + ' internal ' + wwwDir.toInternalURL());
      return new Promise<FileEntry>((res, rej) => {
        wwwDir.getFile('plugins/plugins.js', {}, fileEntry => res(fileEntry), e => rej(e));
      });      
    })
    .then(cordovaJsFile => {
      return Promise.all([cordovaJsFile, 
        new Promise<DirectoryEntry>((res, rej) => {
          this.getContentWwwDir().then(wwwDir => {
            wwwDir.getDirectory(`${WWW_FOLDER}/bower_components/assess_plugins`, {}, dir => res(dir), e => rej(e));
          }).catch((e) => rej(e));
        })
      ]);
    })
    .then(results => {
        const cordovaJSFile: FileEntry = results[0];
        const targetDir: DirectoryEntry = results[1];
        this.logger.debug(`Deleting the assess plugins indexjs from ${targetDir.toInternalURL()}`);
        return this.deleteFileSilently(targetDir, 'index.js').then(() => 
          new Promise<boolean> ((res, rej) => {
            this.logger.debug(`Copying ${cordovaJSFile.toInternalURL()}`);
            cordovaJSFile.copyTo(targetDir, 'index.js', () => res(true), e => rej(e));
          })
        );        
    });
  }

}
