export enum ContentProgressState {
  STARTED,
  ERROR,
  DOWNLOADED,
  EXTRACTED,
  ERROR_SAVE_FILE,
  ERROR_EXTRACTION,
  EXTRACTING,
}

export class ContentDownload {
  public progress: ContentProgressState;
  public error: string[] = [];
  public fileCount: number = 0;
  private fileNames: string[] = [];

  constructor(private path: string) {
    this.progress = ContentProgressState.STARTED;
  }

  public addFile(name: string) {
    this.fileNames.push(name);
  }

  public get files(): string[] {
    return this.fileNames;
  }
}
