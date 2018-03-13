interface TarService {

    untar(
        tarFilePath: string,
        outputPath: string,
        callback: (result: boolean) => void): void;
    
    tar(
        sourceFolderPath: string,
        targetFilePath: string,
        callback: (result: boolean) => void): void;
    
}

interface AppSettingsService {
    show(
        successCallback: () => void,
        errorCallback: () => void): void;

    fetch (key: string): Promise<any>;
}

declare var TarService: {
    new (): TarService;
};
declare var AppSettingsService: AppSettingsService;
