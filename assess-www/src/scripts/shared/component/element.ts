export const ELEMENT_METADATA = "design:dom_elements";

export interface IElementProperty {
    propertyName: string;
    selector: string;
}

export function El(selector: string) {

    return (target: any, propertyName: string) => {
        const elements: IElementProperty[] = Reflect.getMetadata(ELEMENT_METADATA, target.constructor) || [];
        elements.push({ propertyName, selector});
        Reflect.defineMetadata(ELEMENT_METADATA, elements, target.constructor);
    };
}

