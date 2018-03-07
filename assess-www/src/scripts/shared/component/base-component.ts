import { AppContext } from '@assess/app-context';
import { ELEMENT_METADATA, IElementProperty } from '@assess/shared/component/element';
import { Store } from 'redux';
import { Inject } from 'typedi';

import * as handlebars from 'handlebars';

export const COMPILE_TEMPLATE_METADATA = "design:comp_template";
export const ComponentTemplate = (rawTemplate: string) => {
    return target => {
        Reflect.defineMetadata(COMPILE_TEMPLATE_METADATA, handlebars.compile(rawTemplate), target);
    };
}

export interface IComponentModel<T> {
    data: T;
}

export abstract class BaseComponent {
    @Inject() private appContext: AppContext;

    private rootContainer: HTMLDivElement;    

    private componentTemplate: (model, options?) => string;

    public dispatchAction(action: any): void {
        this.appContext.dispatchAction(action);
    }

    public getStore(): Store<any> {
        return this.appContext.getStore();
    }

    public getState(): any | null {
        return this.appContext.getState();
    }

    public createContainer<T>(): HTMLDivElement {
        this.rootContainer = document.createElement("div") as HTMLDivElement;
        const model: IComponentModel<T> = this.prepareComponent(this.rootContainer);
        this.componentTemplate = Reflect.getMetadata(COMPILE_TEMPLATE_METADATA, this.constructor);
        this.updateTemplate(model);
        const elAnnotations = Reflect.getMetadata(ELEMENT_METADATA, this.constructor);
        if (elAnnotations) {
            elAnnotations.forEach((element: IElementProperty)  => {
                this[element.propertyName] = this.rootContainer.querySelector(element.selector);
            });  
        }
        this.initEvents(this.rootContainer);        
        return this.rootContainer;
    }

    public updateTemplate<T>(model: IComponentModel<T>) {
        this.rootContainer.innerHTML = this.componentTemplate(model ? model.data : {});
    }

    protected abstract prepareComponent<T>(rootContainer: HTMLDivElement): IComponentModel<T>;

    protected abstract initEvents(rootContainer: HTMLDivElement): void;
}