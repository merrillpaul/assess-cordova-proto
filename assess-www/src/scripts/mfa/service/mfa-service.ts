import { IOtpResult } from '@assess/mfa/dto';
import { IMfaDetails } from '@assess/shared/dto/login-state';
import { HttpService } from '@assess/shared/http/http-service';
import * as qs from 'qs';
import { Inject, Service } from 'typedi';

@Service()
export class MfaService {

    @Inject()
    private httpService: HttpService;

    /**
     * Triggers OTP with mfaType
     * @param mfaType 
     * @param codeFldName 
     */
    public triggerOTP(mfaType: string, codeFldName: string): Promise<IOtpResult> {
        const url = `/mfa/triggerOtp?${codeFldName}=${mfaType}`;
        return this.httpService.getCentralRequest().post(url).then(result => {
            const otpResult: IOtpResult = result.data;
            return otpResult;
        });
    }


    public login(mfaType: string, mfaCode: string, mfaDetails: IMfaDetails): Promise<boolean> {
        const bodyFormData: any = {};
        bodyFormData[mfaDetails.typeFldName] = mfaType;
        bodyFormData[mfaDetails.codeEntryFldName] = mfaCode;
        const url = `/${mfaDetails.postUrl}`;
        return new Promise<boolean>((res, rej) => {
            this.httpService.getCentralRequest().post(url, qs.stringify(bodyFormData)).then(() => res(true), e => res(false));
        });
    }
}