import template from './base-overlay.html';
import './base-overlay.scss';

import { ELEMENT_METADATA, IElementProperty } from '@assess/shared/component/element';

export abstract class BaseOverlay {
  private className: string = '';
  
  private overlayContainer: HTMLDivElement;

  constructor(className: string) {
    this.className = className;
  }

  public createContainer(): HTMLDivElement {
    this.overlayContainer = document.createElement("div") as HTMLDivElement;
    this.overlayContainer.setAttribute('class', `overlay ${this.className}`);
    this.overlayContainer.innerHTML = template;
    this.addOverlayContent(this.overlayContainer.querySelector(
      '.overlay-content'
    ) as HTMLElement);
    const elAnnotations = Reflect.getMetadata(ELEMENT_METADATA, this.constructor);
    if (elAnnotations) {
      elAnnotations.forEach((element: IElementProperty)  => {
          this[element.propertyName] = this.overlayContainer.querySelector(element.selector);
      }); 
    } 
    this.initEvents(this.overlayContainer);        
    return this.overlayContainer;
  }  

  public show(root?: HTMLElement): void {
    this.createContainer();
    const targetElement: HTMLElement = root ? root : document.body;
    targetElement.appendChild(this.overlayContainer);    
  }

  public dispose(): void {
    this.overlayContainer.remove();
  }

  protected initEvents(rootContainer: HTMLDivElement): void {
    // STUB
  }  

  protected abstract addOverlayContent(content: HTMLElement): void;
}
