import { AppContext } from '@assess/app-context';
import { ELEMENT_METADATA, IElementProperty } from '@assess/shared/component/element';
import { Store } from 'redux';
import { Inject } from 'typedi-no-dynamic-require';

export abstract class BaseComponent {
    @Inject() private appContext: AppContext;

    private rootContainer: HTMLDivElement;    

    public dispatchAction(action: any): void {
        this.appContext.dispatchAction(action);
    }

    public getStore(): Store<any> {
        return this.appContext.getStore();
    }

    public getState(): any | null {
        return this.appContext.getState();
    }

    public createContainer(): HTMLDivElement {
        this.rootContainer = document.createElement("div") as HTMLDivElement;
        this.prepareComponent(this.rootContainer);
        Reflect.getMetadata(ELEMENT_METADATA, this.constructor).forEach((element: IElementProperty)  => {
            this[element.propertyName] = this.rootContainer.querySelector(element.selector);
        });  
        this.initEvents(this.rootContainer);        
        return this.rootContainer;
    }

    protected abstract prepareComponent(rootContainer: HTMLDivElement): void;

    protected abstract initEvents(rootContainer: HTMLDivElement): void;
}