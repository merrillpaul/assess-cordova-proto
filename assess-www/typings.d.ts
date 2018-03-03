// typings.d.ts
/// <reference path="../node_modules/cordova-plugin-file/types/index.d.ts" />
/// <reference path="../node_modules/cordova-plugin-file-transfer/types/index.d.ts" />

declare module "*.html" {
	const content: string;
	export default content;
}

declare module "*.json" {
    const value: any;
	export default value;
}

declare module 'js-untar';

interface UntarredFile {
	name: string;
	buffer: ArrayBuffer;
	blob: Blob;
}


interface Window {
	/**
     * Requests a filesystem in which to store application data.
     * @param type              Whether the filesystem requested should be persistent, as defined above. Use one of TEMPORARY or PERSISTENT.
     * @param size              This is an indicator of how much storage space, in bytes, the application expects to need.
     * @param successCallback   The callback that is called when the user agent provides a filesystem.
     * @param errorCallback     A callback that is called when errors happen, or when the request to obtain the filesystem is denied.
     */
  webkitRequestFileSystem(
		type: LocalFileSystem,
		size: number,
		successCallback: (fileSystem: FileSystem) => void,
		errorCallback?: (fileError: FileError) => void
	): void;

   __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: Function;
}
