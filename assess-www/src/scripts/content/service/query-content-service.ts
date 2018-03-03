import config from '@appEnvironment';
import { IContentQueryState, NewContentVersion, QueryVersionStatus } from '@assess/content/dto';
import { HttpService } from '@assess/shared/http/http-service';
import { Inject, Service } from 'typedi-no-dynamic-require';
import * as interfaceManifest from '../../../public/data/interface-manifest.json';

/** 
 * Most of the logic from QueryContentVersion.m 
 */
@Service()
export class QueryContentService {

    @Inject()
    private httpService: HttpService;

    public queryVersion(query: string): Promise<IContentQueryState> {
        const url = `/content/queryVersion?branch=${config.branch}&config=${config.config}&query=${query}&interfaceManifest=${JSON.stringify(interfaceManifest)}`;
        return new Promise<IContentQueryState>((res, rej) => {
            this.httpService.getCentralRequest().post(url)
            .then(response => {
                const downloadables: NewContentVersion[] = [];
                for (let i = 0, len = response.data.length; i < len; i++ ) {
                    const item = response.data[i];
                    const status = item.status;
                    if ("must upgrade" === status) {
                        rej(QueryVersionStatus.UPDATE_NEEDED);
                        return;
                    } else if ("found" === status) {
                        
                        if (item.url) {
                            downloadables.push ({
                                displayName: item.displayName,
                                hash: item.hash,
                                path: item.path,      
                                size: parseInt(item.size, 10),
                                url: item.url,
                                versionWithType: item.filetype                                                           
                            });
                        } else {
                            rej(QueryVersionStatus.INVALID_URL);
                            return;
                        }
                    } else if ("not found" === status) {
                        // The server didn't know about a content type that we have. This shouldn't happen, but it can
			            // e.g if the app was first built and run for one configuration and then built and run for another
                        // that doens't support all the same content types.
                        // IGNORED, may just need a log
                    } else if ("unchanged" !== status) {
                        // unknown state
                        rej(QueryVersionStatus.FAILED);
                        return;
                    }
                }
                const result: IContentQueryState = { 
                    contentQueryStatus: downloadables.length > 0 ? QueryVersionStatus.SUCCESS_WITH_NEW_VERSIONS : QueryVersionStatus.SUCCESS_WITH_NO_NEW_VERSION, 
                    downloadsNeeded: downloadables
                };
                res(result);
                // rej(QueryVersionStatus.UPDATE_NEEDED);
            })
            .catch(error => rej(QueryVersionStatus.FAILED));
        });
       
    }
}