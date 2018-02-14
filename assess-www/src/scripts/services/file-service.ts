import { Promise } from 'es6-promise';

export class FileService {
  /**
   * Creates the chain of folders within the root folder
   * @param path path like "/foler1/subfolder2"
   */
  public recursiveMkDir(path: string): Promise<DirectoryEntry> {
    const paths = path.split('/').filter(it => it.length > 0);
    const p = new Promise<DirectoryEntry>((res, rej) => {
      this.getRootPath()
        .then(rootDir => {
          console.log('Root path ', rootDir);
          const prevDir = rootDir;

          const pathIterator = (
            subPaths: string[],
            prevRootDir: DirectoryEntry
          ) => {
            if (subPaths.length > 0) {
              prevRootDir.getDirectory(
                subPaths[0],
                { create: true },
                newDir => {
                  pathIterator(subPaths.slice(1), newDir);
                },
                e => {
                  rej(e);
                }
              );
            } else {
              res(prevRootDir);
            }
          };

          pathIterator(paths, rootDir);
        })
        .catch(e => {
          console.error(e);
          alert(e);
        });
    });
    return p;
  }

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

  private getRootPath(): Promise<DirectoryEntry> {
    const p = new Promise<DirectoryEntry>((res, rej) => {
      if (window.cordova) {
        alert(JSON.stringify(cordova.file, null, 7));

        window.resolveLocalFileSystemURL(
          //'cdvfile://localhost/persistent',
          cordova.file.dataDirectory,
          dirEntry => {
            res(dirEntry as DirectoryEntry);
          },
          e => {
            rej(e);
          }
        );
      } else {
        window.webkitRequestFileSystem(
          window.PERSISTENT,
          1024 * 1024,
          fs => {
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
}
