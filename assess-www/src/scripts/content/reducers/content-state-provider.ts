import { IContentQueryState, ITarDownloadState, ITarExtractionState } from '@assess/content/dto';
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
		properties: ["pendingDownloads"],
		reducerName: "tarsDownloaded"
	},
	{
		properties: ["totalTarFiles", "pendingTarFiles"],
		reducerName: "tarsExtracted"
	}
])
export class ContentStateProvider extends BaseStateProvider {

    public getQueryContentResult(): IContentQueryState {
        return this.appContext.getState().queryContent;
	}
	
	public getTarDownloadResult(): ITarDownloadState {
		return this.appContext.getState().tarsDownloaded;
	}

	public getTarExtractionResult(): ITarExtractionState {
		return this.appContext.getState().tarsExtracted;
	}

	public onQueryVersion(): Observable<IStoreObservable> {
		return this.onChange("queryContent", "contentQueryStatus");
	}

	public onPendingDownloadsChange(): Observable<IStoreObservable> {
		return this.onChange("tarsDownloaded", "pendingDownloads");
	}

	public onTarsCount(): Observable<IStoreObservable> {
		return this.onChange("tarsExtracted", "totalTarFiles");
	}

	public onPendingTarsChange(): Observable<IStoreObservable> {
		return this.onChange("tarsExtracted", "pendingTarFiles");
	}
}
