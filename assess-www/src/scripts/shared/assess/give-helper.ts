import { BatteryStatusDAO } from '@assess/shared/battery/battery-status-dao';
import { AssessmentService } from '@assess/shared/central/assessment-service';
import { ConfigService } from '@assess/shared/config/config-service';
import { LoginUserInfo } from '@assess/shared/dto/login-state';
import { FileService } from '@assess/shared/file/file-service';
import { LocaleHelperService } from '@assess/shared/locale/locale-helper';
import { Logger } from '@assess/shared/log/logger-annotation';
import { LoggingService } from '@assess/shared/log/logging-service';
import { UserStoreService } from '@assess/shared/security/user-store-service';
import { SyncService } from '@assess/shared/sync/sync-service';
import { Inject, Service } from 'typedi';

@Service()
export class GiveHelperService {
    

    @Inject()
    private localHelper: LocaleHelperService;

    @Inject()
    private assesssmentService: AssessmentService;

    @Inject()
    private userStoreService: UserStoreService;

    @Inject()
    private batteryStatusDao: BatteryStatusDAO

    @Inject()
    private fileService: FileService;

    @Inject()
    private configService: ConfigService;

    @Inject()
    private syncService: SyncService;

    @Logger()
    private logger: LoggingService;

    public getVersionInfo(): Promise<any> {
        return this.configService.getVersionInfo();
    }

    public navigateToHomeUI(batteryId: string, isCalledFromToDoOverlay: boolean): void {
        this.localHelper.getHomeLocalized().then(homeUiUrl => {
            const url = `${homeUiUrl}?batteryId=${batteryId}&isCalledFromTestDirector=${isCalledFromToDoOverlay}`;    
            window.location.href = encodeURI(url);        
        });
    }

    public getAssessments(existingAssessmentIds: string[]): Promise<string> {
        return this.assesssmentService.getAssessmentList(existingAssessmentIds)
        .then(list => JSON.stringify(list));
    }

    public notifyChooseShareAssessmentSucceeded(assessmentId: string): void {
        this.assesssmentService.notifyChooseShareAssessmentSucceeded(assessmentId);
    }

    public getLoggedInUser(): Promise<string> {
        return this.userStoreService.getLoggedInClinician();
    }

    public getLoggedInClinicianId(): Promise<string> {
        return this.userStoreService.getLoggedInClinicianId();
    }

    public getEligibleSubtestGuids(): Promise<string> {
        return this.userStoreService.getEligibleSubtestGuids().then(guids => JSON.stringify(guids));
    }

    public logout() {
        this.userStoreService.markLogout()
        .then(() => this.batteryStatusDao.onLogout())
        .then(() => this.fileService.getWwwDir())
        .then(wwwDir => this.fileService.getFile(wwwDir, 'index.html'))
        .then(indexHtml => `${indexHtml.toInternalURL()}?logout=true`)
        .then(targetPage => window.location.href = targetPage);
        
        // cancel all syncs using axios and FT upload cancelling semantics
        this.syncService.cancelPendingSyncs();
        this.syncService.cancelUploadAssessmentImages();

    }

    public getConsoleLog(): Promise<string> {
        return this.logger.getConsoleLog();
    }

    public clearConsoleLog(): Promise<boolean> {
        return this.logger.clearConsoleLog();
    }
}