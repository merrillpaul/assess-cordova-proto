import { BaseOverlay } from '@assess/overlay/base-overlay';
import './content-query-spinner.scss';


export class ContentQuerySpinnerOverlay extends BaseOverlay {
  constructor() {
    super('content-query-spinner-ctr');
  }

  protected addOverlayContent(content: HTMLElement): void {
    content.innerHTML = `
    <div class="content-query-spinner">
      <div class="message">
          Please wait a moment while Assess gets any new content.
      </div>

      <div class="spinner">
          
      </div>
    </div>
    `;
  }
}
