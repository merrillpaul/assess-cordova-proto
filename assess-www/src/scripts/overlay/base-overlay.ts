import template from './base-overlay.html';
import './base-overlay.scss';

export abstract class BaseOverlay {
  private className: string = '';
  private ctr: HTMLElement;

  constructor(className: string) {
    this.className = className;
  }

  public show(root?: HTMLElement): void {
    this.ctr = document.createElement('div');
    this.ctr.setAttribute('class', `overlay ${this.className}`);
    this.ctr.innerHTML = template;

    const targetElement: HTMLElement = root ? root : document.body;
    targetElement.appendChild(this.ctr);
    this.addOverlayContent(targetElement.querySelector(
      '.overlay-content'
    ) as HTMLElement);
  }

  public dispose(): void {
    this.ctr.remove();
  }

  protected abstract addOverlayContent(content: HTMLElement): void;
}
