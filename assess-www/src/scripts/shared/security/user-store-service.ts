import { AppContext } from '@assess/app-context';
import { LoginUserInfo } from '@assess/shared/dto/login-state';
import { FileService } from '@assess/shared/file/file-service';
import { Logger } from '@assess/shared/log/logger-annotation';
import { LoggingService } from '@assess/shared/log/logging-service';
import { Inject, Service } from 'typedi';


const CURRENT_USER_KEY ='currentUser';

const OFFLINE_CREDS = 'passwd';

@Service()
export class UserStoreService {

    @Inject()
    private appContext: AppContext;

    @Inject()
    private fileService: FileService;

    @Logger()
    private logger: LoggingService;


    /**
     * Save current logged in user into store/ Overwrites any existing one
     * and 
     * @param userInfo 
     */
    public markLoggedinUser(userInfo: LoginUserInfo, username: string, hashedPassword: string): void {
        this.logger.info('marking user login');
        
        if (!this.appContext.withinCordova) {
            window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userInfo));
        } else {
            this.fileService.getUserDir().then(userDir => {
                this.logger.debug(`writing current logged in user into ${userDir.nativeURL}`);
               
                return this.fileService.writeFile(userDir, `${CURRENT_USER_KEY}.json`, new Blob([JSON.stringify(userInfo)], { type: 'application/json' }));
            })
            .then(fileEntry => this.logger.success(`Wrote current user into ${fileEntry.nativeURL}`))
            .then(() =>  this.updatePasswordFile(userInfo.userId, hashedPassword));
        }
    }


    public markLogout(): Promise<boolean> {
        this.logger.info('marking user logout');
        
        if (!this.appContext.withinCordova) {
            window.localStorage.removetItem(CURRENT_USER_KEY);
            return Promise.resolve(true);
        } else {
            return this.getUserPendingBatteryDir()
            .then((dir) => this.fileService.deleteDirSilently(dir))
            .then(() => {
                this.fileService.getUserDir().then(userDir => {
                    this.logger.debug(`removing current logged in user into ${userDir.nativeURL}`);               
                    return this.fileService.deleteFileSilently(userDir, `${CURRENT_USER_KEY}.json`);
                })
            })         
            .then(() => true);
        }
    }

    public forgetCachedCredentialsForLoggedInUser(): void {
        this.getLoggedInUserDetails().then(userInfo => this.removePasswordHash(userInfo.userId));
    }


    public getLoggedInClinician(): Promise<string> {
        return this.getLoggedInUserDetails()
        .then(userInfo => userInfo.userName);
    }

    public getLoggedInClinicianId(): Promise<string> {
        return this.getLoggedInUserDetails().then(user => user.userId);
    }

    public getEligibleSubtestGuids(): Promise<string[]> {
        this.logger.debug('calling getEligibleSubtestGuids');
        return this.getLoggedInUserDetails().then(user => user.eligibleSubtestGUIDs);
    }


    public getUserHomeDir(): Promise<DirectoryEntry> {
        return this.getLoggedInClinicianId()
        .then(id => {
            return this.fileService.getUserDir().then(userDir => {
               return new Promise<DirectoryEntry>((res, rej) => {
                    userDir.getDirectory(id, {create: true}, dir => res(dir), e => rej(e));
               }); 
            });
        });
    }


    public getUserSavedBatteryDir(): Promise<DirectoryEntry> {
        return this.getUserHomeDir().then(homeDir => {
           
                return new Promise<DirectoryEntry>((res, rej) => {
                    homeDir.getDirectory('savedBatteries', {create: true}, dir => res(dir), e => rej(e));
                }); 
             
        });
    }

    public getUserPendingBatteryDir(): Promise<DirectoryEntry> {
        return this.getUserHomeDir().then(homeDir => {
           
                return new Promise<DirectoryEntry>((res, rej) => {
                    homeDir.getDirectory('pending', {create: true}, dir => res(dir), e => rej(e));
                }); 
             
        });
    }


    public getUserSavedImageDir(): Promise<DirectoryEntry> {
        return this.getUserHomeDir().then(homeDir => {
           
                return new Promise<DirectoryEntry>((res, rej) => {
                    homeDir.getDirectory('savedImages', {create: true}, dir => res(dir), e => rej(e));
                }); 
             
        });
    }

    private getLoggedInUserDetails(): Promise<LoginUserInfo> {
        if (!this.appContext.withinCordova) {
            return Promise.resolve(JSON.parse( window.localStorage.getItem(CURRENT_USER_KEY)));            
        } else {
            return new Promise<LoginUserInfo>((res, rej) =>{
                this.fileService.getUserDir().then(userDir => {
                    userDir.getFile(`${CURRENT_USER_KEY}.json`, {}, fileEntry => {
                        fileEntry.file(file => {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            res(JSON.parse(reader.result || "{}"));                
                          };
                          reader.readAsText(file);              
                        });
                        
                      }, e => rej(e));
                })
            });
        }
    }

    private updatePasswordFile(userName: string, hashedPassword: string): void {
        if (!this.appContext.withinCordova) {
            // play wit LS
            const passwdContent = window.localStorage.getItem(OFFLINE_CREDS) || '{}';
            const passwdObj = JSON.parse(passwdContent);
            passwdObj[userName] = hashedPassword;
            window.localStorage.setItem(OFFLINE_CREDS, JSON.stringify(passwdObj));
        } else {
            this.fileService.getUserDir().then(userDir => {
                return Promise.all([userDir, this.fileService.readAsText(userDir, OFFLINE_CREDS)]);
            }).then(results => {
                const userDir = results[0];
                let passwdContent = results[1];
                passwdContent = (passwdContent && passwdContent.length > 0 ) ? passwdContent : '{}';
                const passwdObj = JSON.parse(passwdContent);
                passwdObj[userName] = hashedPassword;
                return Promise.all([userDir, JSON.stringify(passwdObj)]);
            }).then(results => {
                const userDir = results[0];
                const passwdContentString = results[1];
                return this.fileService.writeFile(userDir, OFFLINE_CREDS, new Blob([passwdContentString], {type: 'text/plain'}));
            }).then(passwdFile => this.logger.success(`Updated password file ${passwdFile.nativeURL}`));
        }
    }

    private removePasswordHash(userName: string): void {
        if (!this.appContext.withinCordova) {
            // play wit LS
            const passwdContent = window.localStorage.getItem(OFFLINE_CREDS) || '{}';
            const passwdObj = JSON.parse(passwdContent);
            delete passwdObj[userName];
            window.localStorage.setItem(OFFLINE_CREDS, JSON.stringify(passwdObj));
        } else {
            this.fileService.getUserDir().then(userDir => {
                return Promise.all([userDir, this.fileService.readAsText(userDir, OFFLINE_CREDS)]);
            }).then(results => {
                const userDir = results[0];
                let passwdContent = results[1];
                passwdContent = (passwdContent && passwdContent.length > 0 ) ? passwdContent : '{}';
                const passwdObj = JSON.parse(passwdContent);
                delete passwdObj[userName];
                return Promise.all([userDir, JSON.stringify(passwdObj)]);
            }).then(results => {
                const userDir = results[0];
                const passwdContentString = results[1];
                return this.fileService.writeFile(userDir, OFFLINE_CREDS, new Blob([passwdContentString], {type: 'text/plain'}));
            }).then(passwdFile => this.logger.success(`Updated password file ${passwdFile.nativeURL}`));
        }
    }
}