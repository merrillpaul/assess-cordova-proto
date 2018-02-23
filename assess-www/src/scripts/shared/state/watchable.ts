export const WATCHABLE_METADATA = "design:watchables";

export interface IWatchableItem {
  reducerName: string
  properties: string[]
}

export const Watchables = (options: IWatchableItem[]) => {
    return target => {
      Reflect.defineMetadata(WATCHABLE_METADATA, options, target);
    };
};