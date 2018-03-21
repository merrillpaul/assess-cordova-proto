import { AppContext } from '@assess/app-context';
import { FileService } from '@assess/shared/file/file-service';
import { Logger } from '@assess/shared/log/logger-annotation';
import { LoggingService } from '@assess/shared/log/logging-service';
import { UserStoreService } from '@assess/shared/security/user-store-service';
import { Inject, Service } from 'typedi';


interface IImage {
    fileName: string;
    subtestInstanceId: string;
    batteryId: string;
}

interface IBatteryItem {
    id: string;
    images?: IImage[]
}

interface IActive {
    id: string;
    type: string;
    subtestInstanceId: string;
    batteryId: string;
}

interface ISync {
    pending: any[];
    pendingImages: IImage[];
    active: IActive;
    lastSync: any;
    lastSyncSuccess: any;
}
interface IStatus {
    sync: ISync;
    repo: IBatteryItem[];
}

const STATUS_FILE = "status.json";

@Service()
export class BatteryStatusDAO {


    private status: IStatus;

    private inited: boolean = false;

    @Inject() private fileService: FileService;

    @Inject() private userStoreService: UserStoreService

    @Inject() private appContext: AppContext;

    @Logger()
    private logger: LoggingService;

    public addBatteryToRepoWithId(batteryId: string): Promise<boolean> {
        return this.isBatteryInRepo(batteryId)
        .then(status => {
            if (status) {
                return status;
            } else {
                const item: IBatteryItem = {id: batteryId};
                return this.getRepoItems()
                .then(repos => { 
                    repos.push(item); 
                    this.saveStatus();
                })
                .then(() => true);
            }
        });
    }

    public removeBatteryFromRepoWithId(batteryId: string): Promise<boolean> {
        return this.isBatteryInRepo(batteryId)
        .then(status => {
            if (!status) {
                return status;
            } else {
                return this.getRepoItems()
                .then(repos => { 
                    repos = repos.filter(it => it.id !== batteryId);
                    this.status.repo = repos;
                })
                .then(() => true);
            }
        });
    }

    public getBatteryFromRepo(batteryId: string): Promise<IBatteryItem> {
        return this.getRepoItems()
        .then(repos => {
            const rep = repos.filter(it => it.id === batteryId)[0];
            if (rep) {
                return rep;
            }
            return null;
        });
    }

    public getImage(imageId: string, batteryId: string, subtestInstanceId: string): Promise<IImage> {
        return this.getBatteryFromRepo(batteryId)
        .then(battery => {
            if (battery) {
            const image = battery.images
            .filter(im => im.fileName === imageId && im.subtestInstanceId === subtestInstanceId )[0];
            return image;
            } else {
                return null;
            }
        })
    }

    public addImage(imageId: string, batteryId: string, subtestInstanceId: string): Promise<boolean> {
        return this.getBatteryFromRepo(batteryId)
        .then(battery => {
            if(!battery) {
                throw new Error(`Battery for ${batteryId} not found`);
            }
            return Promise.all([battery, this.getImage(imageId, batteryId, subtestInstanceId)]);
        })
        .then(results => {
            const battery = results[0];
            const image = results[1];
            if (image) {
                return false;
            }

            battery.images.push({
                batteryId,
                fileName: imageId,
                subtestInstanceId
            })
            this.saveStatus();
            return true;
        });
    }

    public removeImage(imageId: string, batteryId: string, subtestInstanceId: string ) : Promise<boolean> {
        return this.getBatteryFromRepo(batteryId)
        .then(battery => {
            if(!battery) {
                throw new Error(`Battery for ${batteryId} not found`);
            }
            battery.images = battery.images
            .filter( image => image.fileName !== imageId && image.subtestInstanceId !== subtestInstanceId);
            this.saveStatus();
            return true;
        });
    }

    public getTotalImages(): Promise<number> {
        return this.getRepoItems()
        .then(repos => repos.map(repo => repo.images.length).reduce((acc, val) => acc + val));
    }

    public hasImagePending(): Promise<boolean> {
       return this.getPendingImages()
       .then(images => images.length > 0);
    }

    public getPendingImages(): Promise<IImage[]> {
        return this.getStatusSyncMap()
        .then(status => status.pendingImages);
    }

    public batteryHasImagesInPending(batteryId: string): Promise<boolean> {
        return this.getBatteryFromRepo(batteryId)
        .then(battery => {
            if(!battery) {
                throw new Error(`Battery not found in repo for ${batteryId}`);
            }

            return this.getPendingImages();
        })
        .then(pendingImages => pendingImages.map(image => image.batteryId).indexOf(batteryId) !== -1);
    }

    public addImageToPending(imageId: string, subtestInstanceId: string, batteryId: string): Promise<boolean> {
        return this.getBatteryFromRepo(batteryId)
        .then(battery => {
            if(!battery) {
                throw new Error(`Battery not found in repo for ${batteryId}`);
            }

            return this.isImagePending(imageId, subtestInstanceId, batteryId);
        })
        .then(pending => {
            if (pending) {
                return false; // yo, this is already pending, no need to add again
            }
            this.getPendingImages()
            .then(pendingImages => {
                pendingImages.push({
                    batteryId,
                    fileName: imageId,
                    subtestInstanceId
                });
                this.saveStatus();
                return true;
            })
        });
    }

    public removeImageFromPending(imageId: string, subtestInstanceId: string, batteryId: string): Promise<boolean> {
        return this.getPendingImages()
        .then(pendingImages => {
            return pendingImages = pendingImages.filter(image => {
                return !(image.fileName === imageId && image.batteryId === batteryId && image.subtestInstanceId === subtestInstanceId );
            });
        })
        .then(newPendingImages => {
            this.status.sync.pendingImages = newPendingImages;
            return true;
        })
    }

    public addImageToRepoAndPending(imageId: string, subtestInstanceId: string, batteryId: string): Promise<boolean> {
        return this.addImage(imageId, batteryId, subtestInstanceId)
        .then(added => {
            if (added) {
                return this.addImageToPending(imageId, subtestInstanceId, batteryId);
            }
            return false;
        });
    }


    public isImagePending(imageId: string, subtestInstanceId: string, batteryId: string): Promise<boolean> {
        return this.getBatteryFromRepo(batteryId)
        .then(battery => {
            if(!battery) {
                throw new Error(`Battery not found in repo for ${batteryId}`);
            }
            return this.getPendingImages();
        })
        .then(pendingImages => {
            return pendingImages
            .filter(image => image.fileName === imageId && image.batteryId === batteryId && image.subtestInstanceId === subtestInstanceId)
            .length > 0;
        })
    }

    public onLogout(): Promise<boolean> {
        this.logger.debug('OnLogout in battery status dao');
        return this.initIfNot().then(() => {this.saveStatus(); return true});
    }

    public isBatteryInRepo(batteryId: string): Promise<boolean> {
        return this.getRepoItems()
        .then(repo => {
            return repo.map(r => r.id).indexOf(batteryId) > -1;
        });
    }

    public isBatteryIdPending(batteryId: string): Promise<boolean> {
        this.logger.debug(`Checking if ${batteryId} is pending`);
        return this.isBatteryInRepo(batteryId)
        .then(status => {
            if (!status) {
                throw new Error(`battery with id ${batteryId} not in repo`);
            }
            this.logger.debug(`Battery ${batteryId} is in repo`);
            return this.getSyncPending().then(pending => {
                return pending.indexOf(batteryId) !== -1;
            });
        });
    }

    public hasBatteriesInPending(): Promise<boolean> {
        return this.getSyncPending()
        .then(pending => pending.length > 0);
    }

    public addBatteryIdToPending(batteryId: string): Promise<boolean> {
        this.logger.debug(`Adding battery ${batteryId} to the repo`);
        return this.isBatteryInRepo(batteryId)
        .then(status => {
            this.logger.debug(`Is in repo battery ${batteryId}  ${status}`);
            if(!status) {
                return status;
            }
            
            return this.isBatteryIdPending(batteryId);
        })
        .then(status => {
            this.logger.debug(`Is battery pending ${batteryId}  ${status}`);
            if(!status) { return status; }
            return this.getSyncPending().then(pending => { pending.push(batteryId); return true; });
        })
        .then(() => this.saveStatus())
        .then(() => true);
    }
    
    public removeBatteryIdFromPending(batteryId: string): Promise<boolean> {
        return this.isBatteryInRepo(batteryId)
        .then(status => {
            if(!status) {
                return status;
            }
            return this.isBatteryIdPending(batteryId);
        })
        .then(status => {
            if(!status) { return status; }
            return this.getSyncPending().then(pending => { 
                pending = pending.filter(it => it !== batteryId);
                this.status.sync.pending = pending;
                return true; 
            });
        })
        .then(() => this.saveStatus())
        .then(() => true);
    }

    public getRepoItems(): Promise<IBatteryItem[]> {
        return this.initIfNot().then(() => this.status.repo);
    }

    public getRepoIds(): Promise<string[]> {
        return this.getRepoItems()
        .then(repo => repo.map(r => r.id));
    }

    public getSyncPending(): Promise<any[]> {
        return this.getStatusSyncMap().then(sync => sync.pending);
    }

    public getStatusSyncMap(): Promise<ISync> {
        return this.initIfNot().then(() => this.status.sync);
    }

    public getLastSync(): Promise<string> {
        return this.getStatusSyncMap().then(sync => sync.lastSync);
    }

    public getLastSyncSuccess(): Promise<string> {
        return this.getStatusSyncMap().then(sync => sync.lastSyncSuccess);
    }

    public setLastSync(syncdate: string): Promise<boolean> {
        return this.getStatusSyncMap()
        .then(sync => {
            sync.lastSync = syncdate;
            this.saveStatus();
            return true;
        })
    }

    public setLastSyncSuccess(syncdate: string): Promise<boolean> {
        return this.getStatusSyncMap()
        .then(sync => {
            sync.lastSyncSuccess = syncdate;
            this.saveStatus();
            return true;
        })
    }

    public getActiveItem(): Promise<IActive> {
        return this.initIfNot().then(() => this.status.sync.active)
        .then(active => {
            if (
                active.id === null && active.batteryId === null &&
                active.type === null && active.subtestInstanceId === null
            ) {
                return null;
            }
            return active;
        });
    }


    public getActiveBatteryId(): Promise<string> {
        return this.initIfNot().then(() => this.status.sync.active.id);
    }

    public setActiveBattery(batteryId: string): Promise<boolean> {
        return this.isBatteryInRepo(batteryId)
        .then(found => {
            if (found) {
                return this.isBatteryIdPending(batteryId);
            }
            return found;
        })
        .then(found => {
            if (!found) {
                return found;
            }
            const active: IActive = {
                batteryId,
                id: batteryId,
                subtestInstanceId: null,
                type: 'battery'                
            };
            this.status.sync.active = active;
            return this.removeBatteryIdFromPending(batteryId)
            .then(() => { 
                this.saveStatus(); 
                return true;
            })
        });
    }

    public setActiveImage(imageId: string, batteryId: string, subtestGuid: string ): Promise<boolean> {
        return this.getBatteryFromRepo(batteryId)
        .then(battery => {
            if(!battery) {
                throw new Error(`Battery not found in repo for ${batteryId}`);
            }
            return this.isImagePending(imageId, subtestGuid, batteryId);
        })
        .then(isPending => {
            if (!isPending) {
                throw new Error('Cannot set image active for sync because it was not in the image sync pending queue');
            }
            const active: IActive = {
                batteryId,
                id: imageId,
                subtestInstanceId: subtestGuid,
                type: 'image'                
            };
            this.status.sync.active = active;
            return this.removeImageFromPending(imageId, subtestGuid, batteryId);
        })
        .then(removed => {
            this.saveStatus();
            return true;
        });
    }

    public clearActive(): Promise<boolean> {
        return this.getStatusSyncMap()
        .then(status => {
            status.active = {
                batteryId: null,
                id: null,
                subtestInstanceId: null,
                type: null            
            };
            this.saveStatus();
            return true;
        });
    }

    private initIfNot(): Promise<boolean> {
        this.logger.debug(`Initing ${this.inited}`);
        if (this.inited === false) {
            return this.loadOrCreateBatteryStatus()
            .then((status: IStatus) => {
                this.status = status;
                this.inited = true;
                this.logger.debug(`got battery status ${JSON.stringify(status)}`);
                return true;
            })
            .then(() => this.saveStatus())
            .then(() => true);
        } else {
            return Promise.resolve(true);
        }
    }


    private createBatteryItem(batteryId: string): IBatteryItem {
        return {
            id: batteryId || null,
            images: []
        };
    }

    private createNewStatus(): IStatus {

        const active: IActive = {
            batteryId: null,
            id: null,
            subtestInstanceId: null,
            type: null            
        };
        const sync: ISync = {
            active,
            lastSync: null,
            lastSyncSuccess: null,
            pending: [],
            pendingImages: []            
        };

        return {
            repo: [],
            sync
        };
    }

    private saveStatus(): void {
        if (!this.appContext.withinCordova) {
            window.localStorage.setItem(STATUS_FILE, JSON.stringify(this.status));            
        } else {
            this.logger.debug("Saving batterys status saveStatus");
            this.userStoreService.getUserHomeDir()
            .then(userDir => this.fileService.writeFile(userDir, STATUS_FILE, new Blob([JSON.stringify(this.status)], 
            { type: 'application/json'})))
            .then(savedStatusFile => this.logger.success(`Wrote battery dao status file into ${savedStatusFile.nativeURL}`))
            .catch(e => this.logger.error(`Error in saving battery dao status with ${JSON.stringify(e)}`));
        }
    }


    private loadOrCreateBatteryStatus(): Promise<IStatus> {
        if (!this.appContext.withinCordova) {
            const json = window.localStorage.getItem(STATUS_FILE);
            if (!json) {
                return Promise.resolve(this.createNewStatus());
            } else {
                return Promise.resolve(JSON.parse(json));
            }
        }

        return this.userStoreService.getUserHomeDir()
        .then(userDir => Promise.all([userDir, this.fileService.hasFile(userDir, STATUS_FILE)]))
        .then(results => {
            const userDir: DirectoryEntry = results[0];
            const hasFile: boolean = results[1];

            if (!hasFile) {
                this.logger.debug('No status file found, hence creating one');
                const newStatus: IStatus = this.createNewStatus();
                return this.getAllBatteryAndAddToRepoArray()
                .then((repos: IBatteryItem[]) => {
                    newStatus.repo = repos;
                    return newStatus;
                });
            } else {
                return this.fileService.readAsText(userDir, STATUS_FILE)
                .then(statusJson => {
                    this.logger.debug(`status contents ${statusJson}`);
                    return JSON.parse(statusJson);
                });
            }
        })

    }


    private getAllBatteryAndAddToRepoArray(): Promise<IBatteryItem[]> {
        return this.userStoreService.getUserSavedBatteryDir()
        .then(batteryDir => {
            return new Promise<any>((res, rej) => {
                this.logger.debug(`Getting list of jsons file names in ${batteryDir.toInternalURL()}`);
                const reader = batteryDir.createReader();  
                let jsonEntries: string[] = [];
                const readEntries = () => {
                    reader.readEntries(entries => {
                    if (!entries.length) {
                        this.logger.debug(`Got jsons  ${jsonEntries.length}`);
                        res({batteryDir, jsonEntries});
                    } else {
                        jsonEntries = jsonEntries.concat(entries.map(it => it.name).filter(it => (/\.json$/i).test(it)));
                        readEntries();
                    }
                    }, e => rej(e));
                };
                readEntries();
            });
        })
        .then(result => {
            const dir = result.batteryDir;
            const files = result.jsonEntries || [];

            const promises: Array<Promise<IBatteryItem>> = [];
            files.forEach(file => {
                promises.push(new Promise((res, rej) => {
                    this.fileService.readAsText(dir, file).then(json => res(JSON.parse(json)))
                    .catch(e => {
                        this.logger.warn(`Error reading ${file}`);
                        res(null);
                    })
                })); 
            });
            return Promise.all(promises);
        }).then(jsons => jsons.filter(it => it !== null))
        .then(jsons => {
            const repo: IBatteryItem[] = [];
            jsons.forEach(json => {
                repo.push(this.createBatteryItem(json.id));
            });
            this.logger.debug('Got all repos ');
            return repo;
        });
    }


}