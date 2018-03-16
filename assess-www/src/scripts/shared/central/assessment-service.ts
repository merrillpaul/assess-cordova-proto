import { ConfigService } from '@assess/shared/config/config-service';
import { BatteryInfo } from '@assess/shared/dto/battery';
import { HttpService } from '@assess/shared/http/http-service';
import { Logger } from '@assess/shared/log/logger-annotation';
import { LoggingService } from '@assess/shared/log/logging-service';
import * as qs from 'qs';
import { Inject, Service } from 'typedi';

@Service()
export class AssessmentService {
    @Inject()
    private httpService: HttpService;

    @Inject()
    private configService: ConfigService;

    @Logger()
    private logger: LoggingService;

    public getAssessmentList(existingAssessmentIds: string[]): Promise<BatteryInfo> {
        const url = '/sync/getReady';
        return new Promise<BatteryInfo>((res, rej) => {            

            this.logger.info(`Pulling assessment list`);

            this.configService.getConfig().then (config => {
                const bodyFormData: any = {};
                bodyFormData.platformVersion = config.configuredVersion;
                bodyFormData.json = JSON.stringify(existingAssessmentIds);                
                return bodyFormData;
            }).then(bodyFormData =>
                this.httpService.post(url, qs.stringify(bodyFormData))
                .then(response => {               
                    res(response as BatteryInfo);
            }))
            .catch(error => rej(error));
        });
    }

    public notifyChooseShareAssessmentSucceeded(assessmentId: string): void {
        const url = `/sync/assessmentDownloadSucceeded?id=${assessmentId}`;
        // fire and forget
        this.httpService.post(url, {})
        .then(() => this.logger.success(`Notified assessment succeeded with id ${assessmentId}`))
        .catch(e => this.logger.error(`Error in notifying ${assessmentId} with ${JSON.stringify(e)}`));
    }
}