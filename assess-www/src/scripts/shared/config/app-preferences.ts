import { Service } from 'typedi';

@Service()
export class AppPreferences {

    public isPractitioner(): Promise<boolean> {
        return AppSettingsService.fetch('application_mode_preference')
        .then(res => res === 'practitioner');
    }

    public getHost(): Promise<string> {
        return AppSettingsService.fetch('application_host_preference');
    }

    public shouldEnableBTBypass(): Promise<boolean> {
        return AppSettingsService.fetch('enable_bluetooth_bypass');
    }
    
    public shouldCaptureAudio(): Promise<boolean> {
        return AppSettingsService.fetch('enable_audio_capture');
    }

    public isExternalApp(): Promise<boolean> {
        return AppSettingsService.fetch('external_app_mode_preference');
    }

    public shouldReportErrors(): Promise<boolean> {
        return AppSettingsService.fetch('error_reporting_mode_preference');
    }
}