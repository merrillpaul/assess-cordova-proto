import { Promise } from 'es6-promise';
import { Observable, Subject } from 'rxjs';
import { Inject, Service } from 'typedi';

import { AppContext } from '@assess/app-context';

const EXTRACTED_VERSIONS_FILE: string = "extractedHashes.json";

@Service()
export class FileService {

  private rootDir: DirectoryEntry;

  @Inject()
  private appContext: AppContext;
  
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
    // console.log('parentPath', parentPath, 'fileName', fileName);

    
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
  public writeFile(
    dir: DirectoryEntry,
    fileName: string,
    data: Blob
  ): Promise<FileEntry> {
    return new Promise<FileEntry>((res, rej) => {
      dir.getFile(
        fileName,
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
    const p = new Promise<DirectoryEntry>((res, rej) => {

      if (this.rootDir != null) {
        res(this.rootDir);
        return;
      }

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
   * 
   */
  public getExtractedHashesFileContent(): Promise<string> {

    const p = new Promise<string>((res, rej) => {
      // we are mocking the extractedHashes for normal browser
      if (this.appContext.withinCordova) {
        res("{}");
        return;
      }

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


}
