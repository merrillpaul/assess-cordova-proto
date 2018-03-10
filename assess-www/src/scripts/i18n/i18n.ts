import * as Handlebars from 'handlebars';
import { Service } from 'typedi';
import { messageProperties } from './keys';

const DEFAULT_KEY: string = 'en';

/**
 * For use in templates of directlty
 * In templates , if the i18n/<lang>.ts has this following key 
 * KEYS["give.login.page.hello"] = "Hello {{ name }} of {{ emp }}";
 * and the template html has ( refer login-form.html)
 * {{ i18n key='give.login.page.hello' name='Merrill' emp="Test" }}
 * it would generate
 * `Hello Merrill of Test
 */
@Service()
export class I18n {

    private i18nProperties: any = {};

    constructor() {
        this.precompileKeys();
    }

    public getMessage(key: string, data?: any): string {
        const lang = window.navigator.language;
        const langKeys = this.i18nProperties[lang.toLowerCase()] || this.i18nProperties[DEFAULT_KEY];
        const val = langKeys[key];
        if (!val) {
            return `?? ${key} ??`;
        }
       
        return (val)(data);
    }

    private precompileKeys(): void {
        Object.keys(messageProperties).forEach( k => {
            const langKeys: any = {};

            const originalKeys = messageProperties[k];
            Object.keys(originalKeys).forEach(k1 => {
                langKeys[k1] = Handlebars.compile(originalKeys[k1]);
            });

            this.i18nProperties[k.toLowerCase()] = langKeys;
        });
    }
}