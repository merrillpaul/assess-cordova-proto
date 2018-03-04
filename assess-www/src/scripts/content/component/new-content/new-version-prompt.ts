import { NewContentVersion } from '@assess/content/dto';
import { BaseOverlay } from '@assess/overlay/base-overlay';
import { El } from '@assess/shared/component/element';
import { FileService } from '@assess/shared/file/file-service';

import promptTemplate from './new-version-prompt.html';
import './new-version-prompt.scss';

import { Inject, Service } from 'typedi';

@Service()
export class NewContentVersionPrompt extends BaseOverlay {
  

  @Inject()
  private fileService: FileService;

  @El('input.yes')
  private yesButton: HTMLButtonElement;

  @El('input.no')
  private noButton: HTMLButtonElement;
  
  @El('.title')
  private title: HTMLDivElement;

  @El('.content-display')
  private contentDisplay: HTMLDivElement;
  
  private promise: Promise<string>;

  constructor() {
    super('new-content-version-ctr');
  }

  public updateContentVersions(newContentVersions: NewContentVersion[]) {
    const totalSizeInBytes = newContentVersions.map(it => it.size || 0).reduce((prev, el) => prev + el);
    this.title.innerHTML = `There is ${this.fileService.getSizeDescription(totalSizeInBytes)} of new content available`;

    const displayText = newContentVersions.map(it => {
        return `<div class="content-version">${it.displayName || it.versionWithType}</div>`
    }).join("\n");
    this.contentDisplay.innerHTML = displayText;
     
  }
  

  public showPrompt(newContentVersions: NewContentVersion[]) : Promise<string> {
      super.show();
      this.updateContentVersions(newContentVersions);
      this.promise = new Promise((res, rej) => {
        this.yesButton.addEventListener('click', ()=> {
            this.dispose();
            res('yes');            
        });
    
        this.noButton.addEventListener('click', ()=> {
            res('no');
            this.dispose();
        });
      });
      return this.promise;
  }

  protected addOverlayContent(content: HTMLElement): void {
    content.innerHTML = promptTemplate;
  }  

}
