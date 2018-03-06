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

declare var TarService: {
    new (): TarService;
};