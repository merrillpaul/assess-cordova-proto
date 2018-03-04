import { Promise } from 'es6-promise';
import { Observable, Subject } from 'rxjs';
import { Inject, Service } from 'typedi';

import { AppContext } from '@assess/app-context';
import { Logger, LoggingService } from '@assess/shared/log/logging-service';


const EXTRACTED_VERSIONS_FILE: string = "extractedHashes.json";
const CONTENT_ARCHIVE_DIR: string = "/contentArchive";
const TMP_EXTRACT_DIR:string = "/zipExtractTemp";

@Service()
export class FileService {

  private rootDir: DirectoryEntry;

  private contentArchiveDir: DirectoryEntry;

  private zipExtractTmpDir: DirectoryEntry;

  @Inject()
  private appContext: AppContext;

  @Logger()
  private logger: LoggingService;
  
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

  public getContentArchiveDir(): Promise<DirectoryEntry> {
    if (this.contentArchiveDir) {
      return Promise.resolve(this.contentArchiveDir);
    } else {
      return this.mkDirsInRoot(CONTENT_ARCHIVE_DIR).then( cDir => {
        this.contentArchiveDir = cDir;
        this.logger.debug(`Created content archive dir ${cDir.nativeURL} ${cDir.toInternalURL()}  ${cDir.fullPath}`);
        return this.contentArchiveDir;
      });
    }
  }

  public getZipExtractTmpDir(): Promise<DirectoryEntry> {
    if (!this.appContext.withinCordova) { // mock when opened in browser
      return Promise.resolve(null);
    }

    if (this.zipExtractTmpDir) {
      return Promise.resolve(this.zipExtractTmpDir);
    } else {
      return this.mkDirsInRoot(TMP_EXTRACT_DIR).then( cDir => {
        this.zipExtractTmpDir = cDir;
        this.logger.debug(`Created zip extract tmp archive dir ${cDir.nativeURL} ${cDir.toInternalURL()}  ${cDir.fullPath}`);
        return this.zipExtractTmpDir;
      });
    }
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


  public getSizeDescription(bytes: number): string {
    if (bytes <= 1024) {
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

  /**
   * Downloads a file with name to a folder 
   * @param url 
   * @param filename 
   * @param targetDir 
   */
  public downloadUrlToDir(url: string, filename: string, targetDir: DirectoryEntry): Promise<FileEntry> {
    return new Promise((res, rej) => {
      const transfer = new FileTransfer();
      const uri = encodeURI(url);
      transfer.download(uri, `${targetDir.toInternalURL()}/${filename}`, entry => {
        this.logger.debug(`Downloaded ${url} to ${entry.toInternalURL()}`);
        res(entry);
      }, e => rej(e), true, {
        headers: { withCredentials: true }
      });
    });
  }

  public copyToContentArchiveDir(tarFile: FileEntry): Promise<FileEntry> {
    return this.getContentArchiveDir().then(contentArchDir => {
      return new Promise<FileEntry>((res, rej) => {
        tarFile.copyTo(contentArchDir, null, entry => res(entry as FileEntry), e => rej(e));
      });      
    });
  }


  public getContentDirTarFileNames(): Promise<string[]> {
    return this.getContentArchiveDir().then(contentArchDir => {
      return new Promise<string[]>((res, rej) => {
        this.logger.debug(`Getting list of tar file names in ${contentArchDir.toInternalURL()}`);
        const reader = contentArchDir.createReader();
        reader.readEntries(entries => {
            this.logger.debug(`Got tar files `, entries.map(it => it.name));
            res(entries.map(it => it.name));
          }, e => rej(e));        
      });      
    });
  }


}
