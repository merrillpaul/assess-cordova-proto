import { Inject, Service } from 'typedi';

import { AppContext } from '@assess/app-context';
import { FileService } from '@assess/services/file-service';

const TMP_EXTRACT_DIR ="/zipExtractTemp";

@Service()
export class ContentUtilsService {
    
    @Inject()
    private appContext: AppContext;

    @Inject()
    private fileService: FileService;

    public recreateTarExtractTmpDir(): Promise<boolean> {
        // for local browser we just mock it
        if (!this.appContext.withinCordova) {
            return Promise.resolve(true);
        } else {
        
            const createTmpDir = (rootDir, res, rej) => {
                rootDir.getDirectory(TMP_EXTRACT_DIR, {create: true}, (dir) => res(true), (e) => rej(e));
            };

            return new Promise((res, rej) => {
            this.fileService.getRootPath().then(rootDir => {
                console.log( 'rootDir ', rootDir.nativeURL);
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
    }

    /**
     * This should actually check whether there is any content in our Content root.
     * So that it will cause the prompt. FOr the moment always true
     */
    public canLaunchAssess(): Promise<boolean> {
        // this should always res with true or false
        return Promise.resolve(true);
    }

}