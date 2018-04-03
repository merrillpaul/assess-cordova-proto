import { AppContext } from '@assess/app-context';
import { BatteryStatusDAO } from '@assess/shared/battery/battery-status-dao';
import { FileService } from '@assess/shared/file/file-service';
import { Logger } from '@assess/shared/log/logger-annotation';
import { LoggingService } from '@assess/shared/log/logging-service';
import { UserStoreService } from '@assess/shared/security/user-store-service';
import { Inject, Service } from 'typedi';


@Service()
export class BatteryService {

    @Inject()
    private fileService: FileService;

    @Inject()
    private userStoreService: UserStoreService;

    @Inject()
    private batteryStatusDao: BatteryStatusDAO;

    @Inject()
    private appContext: AppContext;

    @Logger()
    private logger: LoggingService;

    public saveSubtestData(json: string, batteryId: string): Promise<boolean> {

        if(!this.appContext.withinCordova) { // mock for browser

            // Cache battery data in local storage to simulate saving, unless we're in a Jasmine test.
			// We don't want to leak state between Jasmine tests.
			if (!window.jasmine) { // refer exportDataService.js #24
			    sessionStorage.setItem("batteryRepo", `[${json}]`);
				sessionStorage.setItem("batteryToRun", json);
			}
            return Promise.resolve(true);
        }

        return this.userStoreService.getUserSavedBatteryDir()
        .then(savedBatteryDir => this.fileService.writeFile(savedBatteryDir, `${batteryId}.json`, 
            new Blob([json], {type : 'application/json'})))
        .then(file => {
            this.logger.success(`Wrote battery json to ${file.nativeURL}`);
            return this.batteryStatusDao.addBatteryToRepoWithId(batteryId);
        });
    }

    public removeBatteryFromRepoWithId(batteryId: string): Promise<boolean> {
        if(!this.appContext.withinCordova) { // mock for browser

            if (!window.jasmine) { 
			    sessionStorage.removeItem("batteryRepo");
				sessionStorage.removeItem("batteryToRun");
			}
            return Promise.resolve(true);
        }

        return this.userStoreService.getUserSavedBatteryDir()
        .then(savedBatteryDir => this.fileService.deleteFileSilently(savedBatteryDir, `${batteryId}.json`))
        .then(() => this.deleteAudioFilesForBatteryId(batteryId))
        .then(() => this.batteryStatusDao.removeBatteryFromRepoWithId(batteryId))
    }

    public getSavedTestBattery(batteryId: string): Promise<string> {
        if(!this.appContext.withinCordova) { // mock for browser
            const sessionBatteryRepo = window.sessionStorage.getItem("batteryToRun");
            const battery = (!window.jasmine && sessionBatteryRepo)? sessionBatteryRepo : '{}';
            return Promise.resolve(battery);
        }

        return this.getBatteryContents(batteryId);
    }


    public getSavedTestBatteryIds(): Promise<string> {
        if(!this.appContext.withinCordova) { // mock for browser
            const sessionBatteryRepo = window.sessionStorage.getItem("batteryRepo");
            const battery = (!window.jasmine && sessionBatteryRepo)? sessionBatteryRepo : '[]';
            return Promise.resolve(battery);
        }

        return this.batteryStatusDao.getRepoIds().then(ids => JSON.stringify(ids));
    }

    public getSavedTestBatteryThumbnails(): Promise<string> {
        if(!this.appContext.withinCordova) { // mock for browser
            const sessionBatteryRepo = window.sessionStorage.getItem("batteryRepo");
            const battery = (!window.jasmine && sessionBatteryRepo)? sessionBatteryRepo : '[]';
            return Promise.resolve(battery);
        }

        return this.batteryStatusDao.getRepoIds()
        .then(repoIds => {
            const promises:Array<Promise<any>> = [];
            repoIds.forEach(id => {
               promises.push (new Promise<any>((res, rej) => {
                   this.getBatteryContents(id)
                   .then(contents => {
                       try {
                        const batteryAsJson = JSON.parse(contents);
                        const thumb: any = {
                            administrationDate: batteryAsJson.administrationDate,
                            examiners: batteryAsJson.examiners,
                            id: batteryAsJson.id,
                            identifier: batteryAsJson.identifier,
                            patient: batteryAsJson.patient                            
                        };
                        if (batteryAsJson.state) {
                            thumb.state = batteryAsJson.state;
                        }
                        res(thumb);
                       } catch (e) {
                           this.logger.warn(`Error in parsing json for ${id} with ${JSON.stringify(e)}`);
                           res(null);
                       }
                   })
                   .catch(e => {
                       this.logger.warn(`Error parsing battery json for ${id}`);
                        res(null);
                   });
               }));
            });
            return Promise.all(promises);
        })
        .then(results => results.filter(it => it !== null))
        .then(results => JSON.stringify(results));
    }

    public getTestHierarchyJson(): Promise<string> {
        return this.fileService.getGiveWwwDir().then(wwwDir => {
            this.logger.debug(`Getting testhiearchy from ${wwwDir.fullPath}`);
            return this.fileService.readAsText(wwwDir, 'test-hierarchy.json');
        })
        .then(jsonStr => {
            const tests: any[] = JSON.parse(jsonStr);
            return Promise.all([tests, this.userStoreService.getEligibleSubtestGuids()]);
        })
        .then(results => {
            let tests: any[] = results[0];
            const subtestGuids: string[] = results[1];
            tests.forEach(test => {
                const subtests: any[] = [];
                test.subtests.forEach(subtest => {
                    if (subtestGuids.indexOf(subtest.subtestGUID) !== -1) {
                        subtests.push(subtest);
                    }
                });
                test.subtests = subtests;
            });
            tests = tests.filter(test => test.subtests.length > 0);
            return tests;
        })
        .then(tests => JSON.stringify(tests));
    }

    public deleteAudioFilesForBatteryId(batteryId: string): Promise<boolean> {
        return this.userStoreService.getUserSavedBatteryDir()
        .then (savedBatteryDir => this.fileService.deleteFolderSilently(savedBatteryDir, batteryId))
    }

    private getBatteryContents(batteryId: string): Promise<string> {
        return new Promise<string>((res, rej) => {
            this.userStoreService.getUserSavedBatteryDir()
            .then(savedBatteryDir => this.fileService.readAsText(savedBatteryDir, `${batteryId}.json`, false))
            .then(contents => res(contents))
            .catch(e => {
                this.logger.error(`Battery for ${batteryId} not found. Removing from battery dao now`);
                this.batteryStatusDao.removeBatteryFromRepoWithId(batteryId);
                rej(e);
            });
        });       
    }

   

}