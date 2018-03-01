import { BaseStateProvider,	IStoreObservable } from "@assess/shared/state/base-state-provider";
import { Watchables } from "@assess/shared/state/watchable";

import { Observable } from "rxjs";
import { Service } from "typedi";

@Service()
@Watchables([
	{
		properties: ["contentQueryStatus"],
		reducerName: "queryContent"
	}
])
export class ContentStateProvider extends BaseStateProvider {
	public onQueryVersion(): Observable<IStoreObservable> {
		return this.onChange("queryContent", "contentQueryStatus");
	}
}
