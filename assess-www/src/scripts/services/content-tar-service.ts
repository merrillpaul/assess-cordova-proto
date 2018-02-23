import axios from 'axios';

import { Observable, Subject } from 'rxjs';

import {
  ContentDownload,
  ContentProgressState,
} from '@assess/dto/content-download-status';
import { FileService } from './file-service';

import * as untar from 'js-untar';
import { Service, Inject } from 'typedi';

const CONTENT_ROOT_FOLDER = "/contentRoot/";

@Service()
export class ContentTarService {

  @Inject()
  private fileService: FileService;  
  
  public testAjax() {
    axios.get(`data/test.json?q=${Date.now()}`).then(data => {
      console.log('Got data', data);
      alert(JSON.stringify(data, null, 6));
    }).catch(e => {
      console.log("Error in ajax", e);
    })
  }

  public getContentRoot(): Observable<DirectoryEntry> {
    const subject = new Subject<DirectoryEntry>();

    this.fileService.getRootPath().then(((rootDir: DirectoryEntry) => {
      rootDir.getDirectory(CONTENT_ROOT_FOLDER, { create: true, exclusive: false }, (contentRootDir => {
        subject.next(contentRootDir);
      }), e => { subject.error(e) });
    })).catch(e => { subject.error(e) });
    
    return subject;
  }

  /**
     * Will download the tar and extract it     * 
     * @param url 
     */
  public downloadAndExtract(url: string): Observable<ContentDownload> {
    const status = new ContentDownload(url);
    const subject = new Subject<ContentDownload>();
    setTimeout(() => {
      subject.next(status);
    }, 1);

    axios
      .get(url, {
        responseType: 'arraybuffer',
        timeout: 1000 * 60 * 30
      })
      .then(response => {
        status.progress = ContentProgressState.DOWNLOADED;
        subject.next(status);
        // untar into our content root
        this.getContentRoot().subscribe(rootDir => {
          this.untar(rootDir, response.data, subject, status);
        }, (e => {
          status.progress = ContentProgressState.ERROR;
          status.error.push(e);
          subject.error(status);
          subject.complete();
        }));        
      })
      .catch(e => {
        status.progress = ContentProgressState.ERROR;
        status.error.push(e);
        subject.error(status);
        subject.complete();
      });
    return subject;
  }

  private untar(
    dir: DirectoryEntry,
    data: ArrayBuffer,
    subject: Subject<ContentDownload>,
    status: ContentDownload
  ): void {
    untar(data).then(
      (allFiles: UntarredFile[]) => {
        const files = allFiles.filter (file => file.blob.size > 0).reverse();
        // this nextfile mechanism is to make the file writing sequentially
        // cause otherwise filewriting with html5 plugin complains if too many file calls
        // are done parallelly. So we kind of twist the asynchronous to synchronous file writing, one by one.
        const nextFile = () => {
          // if we have more files to process
          if (files.length > 0) {
            writeFiles(files.pop() as UntarredFile);
          } else {
            console.log('Processed all files');
            status.progress = ContentProgressState.EXTRACTED;
            subject.next(status);
            subject.complete();
          }
        };
        const writeFiles = (file: UntarredFile) => {          

          if (file) {
            const filename = file.name.split('/').pop() as string;
            console.log(filename, file.name, file.blob.size);
            status.progress = ContentProgressState.EXTRACTING;
            status.fileCount += 1;
            //status.addFile(extractedFile.name);
            subject.next(status);
            this.fileService.createFileWithPath(dir, file.name, file.blob).subscribe(fileEntry => {
              /* console.log(
                'file created',
                fileEntry.fullPath,
                fileEntry.toURL(),
                fileEntry.nativeURL,
                fileEntry.toInternalURL ? fileEntry.toInternalURL(): ''
              );*/
              nextFile();
            }, e => {
              status.progress = ContentProgressState.ERROR_SAVE_FILE;
              status.error.push(file.name + ": " +e);
              console.log('Error in untarring/extraction', e, JSON.stringify(e, null, 5));
              subject.next(status);
              nextFile();
            });         

          }          
        };
        writeFiles(files.pop() as UntarredFile);  
      },
      (e: any) => {
        status.progress = ContentProgressState.ERROR_EXTRACTION;
        status.error.push(e);
        console.log('Error in untarring/extraction', e, JSON.stringify(e, null, 5));
        subject.error(status);
        subject.complete();
      },
      (extractedFile: UntarredFile) => {       
        // IGNORED
        // I could have used this mechanism , but i had issue in getting the completed result
      }
    );
  }
}
