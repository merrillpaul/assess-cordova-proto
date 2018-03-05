import { ContentStateProvider } from '@assess/content/reducers/content-state-provider';
import { BaseOverlay } from '@assess/overlay/base-overlay';
import { El } from '@assess/shared/component/element';
import { FileService } from '@assess/shared/file/file-service';
import progressTemplate from './progress-overlay.html';
import './progress-overlay.scss';

import { Inject, Service } from 'typedi';

@Service()
export class ContentProgressOverlay extends BaseOverlay {

  @El('.message')
  private message: HTMLDivElement;

  @El('.progress-ctr .progress-text')
  private progressText: HTMLDivElement;

  @El('.progress-ctr .progress-bar progress')
  private progressBar: HTMLProgressElement;

  @Inject()
  private provider: ContentStateProvider;

  @Inject()
  private fileService: FileService;

  constructor() {
    super('progress-overlay-ctr');
  }

  public updateMessage(message: string): void {
    this.message.innerHTML = message;
  }

  public startInstall(): void {
    this.message.innerHTML = 'Installing the latest Assess content. Please wait.';
    this.progressText.innerHTML = 'Finding tars to extract...';     
  }

  protected addOverlayContent(content: HTMLElement): void {
    content.innerHTML = progressTemplate;
  }

  protected init(): void {
        this.provider.onPendingDownloadsChange().subscribe(change => {
            const tarDownloadResult = this.provider.getTarDownloadResult();
            this.progressText.innerHTML = `Downloaded ${this.fileService.getSizeDescription(tarDownloadResult.downloadedSize)} of ${this.fileService.getSizeDescription(tarDownloadResult.totalSize)}`;
            this.progressBar.max = tarDownloadResult.versionsTotal;
            this.progressBar.value = tarDownloadResult.versionsTotal - tarDownloadResult.pendingDownloads.length;
        });

        this.provider.onTarsCount().subscribe(change => {
          this.progressBar.max = change.newVal;
          this.progressBar.value = 0;
          this.progressBar.innerHTML = `Installed 0 out of ${change.newVal}`;
        });

        this.provider.onPendingTarsChange().subscribe(change => {
          const tarState = this.provider.getTarExtractionResult();
          this.progressText.innerHTML = `Installed ${tarState.completedTarFiles.length} out of ${tarState.totalTarFiles}`;
          this.progressBar.max = tarState.totalTarFiles;
          this.progressBar.value = tarState.totalTarFiles - tarState.pendingTarFiles.length;
        });
  }
  
}
