# Intro
This cordova upgrade or 'Vanilla Ice' project aims to upgrade the Cordova library and the Cordova project to be used to build the native build.

## Process
- Assess's give ./buildContent builds content and nonstim-all-tar which essentially is the www folder for Assess. These generate the various versions of homeUI, testDirector and stims
- The above process pulls in the cordova js api and the assess js plugins through bower
- The cordova based app presents the HTML5 login (and mfa) pages and authenticates with Central
- Ios 'NoCloud' folders are prepped for various uses, for eg saving current user, battery repop, content archive folder and so on
- The app downloads the content tars into a temp zip and untars these to a `www` folder in the above mentioned folder
- The content is extracted using a tar extraction process and preps the give-www folder
- The app decides which i18nized landing page , be it stim or homeUI
- The app's webview ( UI or WK) loads the give-www landing page at which point it loads the Assess.

## Pre-Modules Plan

### Reuse /Refactor / Replace Native Plugins
- Just like File and Sync plugins have been migrated , we would need to reinstate functionality from Audio, BT etc. Due diligence is needed for any android counterparts as well like the TarPlugin we have moved.

### Replace `PhoneGap.exec`
- Search for occurences of `PhoneGap.exec` and start replacing these with `AssessPlugins.<service>`
- The `AssessPlugins.<service>` methods (https://github.com/merrillpaul/assess-cordova-proto/blob/master/assess-www/src/scripts/app-plugin-lib.ts) typically return Promises or rxJs Observables.
- Change Give-www JS code to use Promise or Observable semantics wherever `PhoneGap.exec` gets replaced, instead of callbacks.


### TestCases
- Smoke tests
- Regression
- Multi login and MFA
- Multiple syncs at the same time
- Battery image and audio upload
- BT Handling
- Memory warning error handling
- App backgrounding and resuming
- Resume battery 

### Specs
- Last but not least , cover the new TS code with specs.

# Setup
* Install cordova npm tools 
* Run `npm install`
* `cordova platform add browser`
* `cordova platform add ios`

# Build
`npm run build` ( this one is  a wrapper which browserifies all plugins and cordova js to a single js) 
This single cordova will be used inside give-www
or `cordova run build`. 

## To build to specific branch and config
`QI_BRANCH=merrill-cordova-prep QI_CONFIG_NAME=release npm run build` - internally calls cordova cli

# Run in Browser
`cordova run browser`

## Cleanup browser file system
```

window.webkitRequestFileSystem(window.PERSISTENT, 1024*1024, function(fs) {
  fs.root.getDirectory('assessRoot', {}, function(dirEntry) {

    dirEntry.removeRecursively(function() {
      console.log('Directory removed.');
    });

  });
});
```

## Browse filesystem
Paste `filesystem:http://localhost:3000/persistent/assessRoot/` in chrome url box and browse the file system

# Run with Xcode
`cordova platform remove ios && cordova platform add ios && cordova build`
Then open the platforms/ios/<Name>.xcode project and run it on an ipad simulator.

# Run in iOs Simulator
`npm start` or `cordova run ios --target="iPad-Retina, 10.2"` . Choose your targets appropriately. Look in cordova docs to see how to list the targets on your machine

# Run just the assess-www
`cd assess-www && npm start`
Checkout the readme inside assess-www

# Run just the assess-www webpack build
`cd assess-www && npm run build`

# Project Structure
## Root project
This is built using cordova create commands. The `www` folder is a placeholder and actually gitignored.
## Assess-WWW
This is a vanilla typescript /webpack/ scss project without any heavy weight frameworks. This will have rxjs and redux shortly. This project is the replacement of all we have in the Ipad project in terms of login page, mfa, authentication , content download etc. This is because we need es6 transpilation into the `www` folder of our cordova project. Essentially this is our real `www` folder. 
The prehook in `hooks/beforeBuild` gets the webpack bundling and copying into pur cordova project.

### cordova-plugins
Our assess plugins.

They are automatically added to the project. However if you want to change some plugins for dev , you should
* `cordova plugin remove assess-cordova-plugins` . This removes all assess plugins from the actual cordova project
* `cordova plugin add cordova-plugins/ -save ` to add the local plugin folder to our main cordova project
* `cordova build` to build plugins and our apps

- contains www with the various plugin JS facades.

* Note: This is in a single project as there is potential of our exisitng pluigns to cross reference or reuse common code. 

#### JS plugins
While developing the replacement of the assess ios code with typescript , it occured that we are creating some components which can be resused, as is,  within give-www directly. Case in point is the loggingService and probably others.

To achieve this:- 
* Assess-www webpack generates a `plugin.js` from the `app-plugin-lib.ts`. With This was most of the components used in the typescript code is exposed to give-www using the `AssessPlugins`.
For eg, in `app-plugin-lib.ts` a `loggingService` function is exposed which can be used in give-www as `AssessPlugins.loggingService().debug(...`
We could potentially use the TarPlugin, any direct File API using cordova plugin etc without any change within give-www.

* Changes in `/buildContent.py`
added entries in bower.json to pull in the browserified cordova and the assess-js plugins 

* Changes in the HTML templates ( homeUI, stimPad etc) - to refer to these files from bower

## give-non-stim-all.tar
This will be downloaded as part of the content download and extracted into a `persistentFolder` prescribed by cordova. Search for details here -> https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/index.html. Once this content is extracted into the above folder , typically as `'persistentFolder'/give-www` , the login page on success, would call the homeUI etc using the `cdvfile://'persistentFolder'/give-www/homeUI.html`  url. This scheme is allowed in the config.xml . Look at where I got that inspired from -> https://github.com/murlex/UpdatableApp. Unfortunately we cannot use that plugin directly due to our content download which is specific for QI.

## TODOS   

### Update give-www
Update all occurences of `PhoneGap.exec` and check to see if we need to embed custom plugins like we did for the TarPlugin or whether we can use AssessPlugins ( JS ), which could internally use any standard cordova plugin JS files or our custom ones.

#### Operations

* Legend
PA - Possible to use AssessPlugins ( the js way )
DK - DOnt know or yet to investigate
MP - Might need custom plugin like the TAR plugin

- ChooseSharePlugin.downloadChooseShareAssessmentList *PA
- SyncPlugin2.uploadAssessmentImagesToChooseShare *PA
- SyncPlugin2.cancelUploadAssessmentImages *PA
- ChooseSharePlugin.notifyChooseShareAssessmentSucceeded *PA
- FileManagerPlugin.removeBatteryFromRepoWithId *PA
- SyncPlugin2.queueUpdateIndicator *DK
- SyncPlugin2.queueBatteryForSync *DK
- FileManagerPlugin.saveSubtestData *PA
- SyncPlugin2.transferSingleBatteryDataToShareAndRemove *PA
- SyncPlugin2.syncSubtestDataToShare *PA
- SyncPlugin2.getLastSuccessfulSync *PA
- AudioPlugin.isRecording_PhoneGap *DK
- AudioPlugin.startRecordingToFile_PhoneGap *DK
- AudioPlugin.stopRecording_PhoneGap *DK
- AudioPlugin.stopAllRecordings *DK
- AudioPlugin.startPlayingRecording_PhoneGap *DK
- AudioPlugin.startPlayingContent_PhoneGap *DK
- AudioPlugin.getPlaybackPosition *DK
- AudioPlugin.pausePlaying_PhoneGap *DK
- AudioPlugin.resumePlaying_PhoneGap *DK
- AudioPlugin.stopPlaying_PhoneGap *DK
- AudioPlugin.setScrubTime_PhoneGap *DK
- AudioPlugin.getRecordingDuration_PhoneGap *DK
- AudioPlugin.getContentDuration_PhoneGap *DK
- BluetoothClientPlugin2.beginSearchingForServers *MP
- BluetoothClientPlugin2.getConnectionState *MP
- BluetoothClientPlugin2.sendMessage2 *MP
- BluetoothServerPlugin2.beginListening *MP
- BluetoothServerPlugin2.sendMessage *MP
- AppVersionPlugin.getVersionInfo *PA
- DeveloperToolsPlugin.showConsole  *DK
- ErrorHandlerPlugin.didReceiveError *PA
- PreferencesPlugin.getShowScaledCompositeScores *DK
- FileManagerPlugin.savePngData *PA
- ChooseSharePlugin.logoutAndForgetCredentials *PA
- ChooseSharePlugin.logout *PA
- NativeAnimationPlugin.subtestTransitionBegan *DK
- NativeAnimationPlugin.subtestTransitionFinished *DK
- NativeAnimationPlugin.auxTransitionBegan *DK
- NativeAnimationPlugin.auxTransitionFinished *DK
- TestDirectorPlugin2.showHomeUI *PA
- FileManagerPlugin.getSavedTestBatteryThumbnails *PA
- FileManagerPlugin.getSavedTestBattery *PA
- FileManagerPlugin.getSavedTestBatteryIds *PA
- TestStatePlugin.getLoggedInClinician *PA
- TestStatePlugin.getLoggedInClinicianId *PA
- TestStatePlugin.getEligibleSubtests *PA
- TestStatePlugin.getDeviceUniqueId *PA
- TestStatePlugin.isUsingOfflineAuthentication *PA
- ChooseSharePlugin.loginUsingCachedCredentials2 *PA
- TestStatePlugin.isAuxViewOpenWithNotesOverlayInMainView *DK
- TouchMaskPlugin.showMaskWithUnmaskedRegions *DK
- TouchMaskPlugin.hideMask *DK


### Investigate Crashlytics integration

### Offline Auth


