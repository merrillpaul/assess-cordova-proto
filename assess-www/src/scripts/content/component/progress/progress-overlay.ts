import { ContentStateProvider } from '@assess/content/reducers/content-state-provider';
import { I18n } from '@assess/i18n/i18n';
import { BaseOverlay } from '@assess/overlay/base-overlay';
import { ComponentTemplate, IComponentModel } from '@assess/shared/component/base-component';
import { El } from '@assess/shared/component/element';
import { FileService } from '@assess/shared/file/file-service';
import progressTemplate from './progress-overlay.html';
import './progress-overlay.scss';

import { Inject, Service } from 'typedi';

@Service()
@ComponentTemplate(progressTemplate)
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

  @Inject()
  private i18n: I18n;

  constructor() {
    super('progress-overlay-ctr');
  }

  public updateMessage(message: string): void {
    this.message.innerHTML = message;
  }

  public startInstall(): void {
    this.message.innerHTML = this.i18n.getMessage('give.content.installing');
    this.progressText.innerHTML = this.i18n.getMessage('give.content.installing.find.tars');     
  }

  protected init(): void {
        this.provider.onPendingDownloadsChange().subscribe(change => {
            const tarDownloadResult = this.provider.getTarDownloadResult();
            this.progressText.innerHTML = this.i18n.getMessage('give.content.download.starting' , { 
              downloaded: this.fileService.getSizeDescription(tarDownloadResult.downloadedSize), 
              total: this.fileService.getSizeDescription(tarDownloadResult.totalSize)});
            this.progressBar.max = tarDownloadResult.versionsTotal;
            this.progressBar.value = tarDownloadResult.versionsTotal - tarDownloadResult.pendingDownloads.length;
        });

        this.provider.onTarsCount().subscribe(change => {
          this.progressBar.max = change.newVal;
          this.progressBar.value = 0;
          this.progressBar.innerHTML = this.i18n.getMessage('give.content.installing.tar.progress', { current: 0, total: change.newVal } );
        });

        this.provider.onPendingTarsChange().subscribe(change => {
          const tarState = this.provider.getTarExtractionResult();
          this.progressText.innerHTML = this.i18n.getMessage('give.content.installing.tar.progress', { current: tarState.completedTarFiles.length, 
              total: tarState.totalTarFiles } );
          this.progressBar.max = tarState.totalTarFiles;
          this.progressBar.value = tarState.totalTarFiles - tarState.pendingTarFiles.length;
        });
  }
  
}
