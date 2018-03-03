import { ContentStateProvider } from '@assess/content/reducers/content-state-provider';
import { BaseOverlay } from '@assess/overlay/base-overlay';
import { El } from '@assess/shared/component/element';
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

  constructor() {
    super('progress-overlay-ctr');
  }

  public updateMessage(message: string): void {
    this.message.innerHTML = message;
  }

  protected addOverlayContent(content: HTMLElement): void {
    content.innerHTML = progressTemplate;
  }

  protected init(): void {
        this.provider.onPendingDownloadsChange().subscribe(change => {
            const tarDownloadResult = this.provider.getTarDownloadResult();
            this.progressText.innerHTML = `Downloaded ${tarDownloadResult.downloadedSize} of ${tarDownloadResult.totalSize}`;
            this.progressBar.max = tarDownloadResult.versionsTotal;
            this.progressBar.value = tarDownloadResult.versionsTotal - tarDownloadResult.pendingDownloads.length;
        });
  }
  
}
