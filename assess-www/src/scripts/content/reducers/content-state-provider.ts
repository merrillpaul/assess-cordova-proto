import { IContentQueryState, ITarDownloadState } from '@assess/content/dto';
import { BaseStateProvider,	IStoreObservable } from "@assess/shared/state/base-state-provider";
import { Watchables } from "@assess/shared/state/watchable";

import { Observable } from "rxjs";
import { Service } from "typedi";


@Service()
@Watchables([
	{
		properties: ["contentQueryStatus"],
		reducerName: "queryContent"
	},
	{
		properties: ["downloadedSize"],
		reducerName: "tarsDownloaded"
	}
])
export class ContentStateProvider extends BaseStateProvider {

    public getQueryContentResult(): IContentQueryState {
        return this.appContext.getState().queryContent;
	}
	
	public getTarDownloadResult(): ITarDownloadState {
		return this.appContext.getState().tarsDownloaded;
	}

	public onQueryVersion(): Observable<IStoreObservable> {
		return this.onChange("queryContent", "contentQueryStatus");
	}

	public onDownloadedSizeChange(): Observable<IStoreObservable> {
		return this.onChange("tarsDownloaded", "downloadedSize");
	}
}
