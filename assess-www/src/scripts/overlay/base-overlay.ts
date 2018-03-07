import template from './base-overlay.html';
import './base-overlay.scss';

import { COMPILE_TEMPLATE_METADATA, IComponentModel } from '@assess/shared/component/base-component';
import { ELEMENT_METADATA, IElementProperty } from '@assess/shared/component/element';

import * as handlebars from 'handlebars';

export abstract class BaseOverlay {
  private className: string = '';
  
  private overlayContainer: HTMLDivElement;

  private componentTemplate: (model, options?) => string;

  constructor(className: string) {
    this.className = className;
  }

  public createContainer<T>(): HTMLDivElement {
    this.overlayContainer = document.createElement("div") as HTMLDivElement;
    this.overlayContainer.setAttribute('class', `overlay ${this.className}`);
    this.overlayContainer.innerHTML = template;
    const model: IComponentModel<T> = this.prepareOverlayContent(this.overlayContainer);
    this.componentTemplate = Reflect.getMetadata(COMPILE_TEMPLATE_METADATA, this.constructor);
    this.updateTemplate(model);    
    const elAnnotations = Reflect.getMetadata(ELEMENT_METADATA, this.constructor);
    if (elAnnotations) {
      elAnnotations.forEach((element: IElementProperty)  => {
          this[element.propertyName] = this.overlayContainer.querySelector(element.selector);
      }); 
    }
    this.init(); 
    this.initEvents(this.overlayContainer);        
    return this.overlayContainer;
  }  

  public show(root?: HTMLElement): void {
    this.createContainer();
    const targetElement: HTMLElement = root ? root : document.body;
    targetElement.appendChild(this.overlayContainer);    
  }

  public dispose(): void {
    if ( this.overlayContainer ) {
      this.overlayContainer.remove();
    }
  }

  public updateTemplate<T>(model: IComponentModel<T>) {
    const overlayContent = this.overlayContainer.querySelector(
      '.overlay-content'
    ) as HTMLElement;
    overlayContent.innerHTML = this.componentTemplate(model ? model.data : {});
  }

  protected init(): void {
    // STUB
  }

  protected initEvents(rootContainer: HTMLDivElement): void {
    // STUB
  }  
  protected prepareOverlayContent<T>(content: HTMLElement): IComponentModel<T> {
    return null;
  }
}
