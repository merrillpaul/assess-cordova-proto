import { Service } from 'typedi-no-dynamic-require';

@Service()
export class ContentUtilsService {

    public canLaunchAssess(): Promise<boolean> {
        return new Promise((res, rej) => {
            res(true);
        });
    }

}