# Setup
* Install cordova npm tools 
* Run `npm install`
* `cordova platform add browser`
* `cordova platform add ios`

# Build
`cordova run build`

# Run in Browser
`cordova run browser`

# Run in iOs Simulator
`cordova run ios --target="iPad-Retina, 10.2"` . Choose your targets appropriately. Look in cordova docs to see how to list the targets on your machine

# Run just the assess-www
`cd assess-www && npm start`

# Run just the assess-www webpack build
`cd assess-www && npm run build`

# Project Structure
## Root project
This is built using cordova create commands. The `www` folder is a placeholder and actually gitignored.
## Assess-WWW
This is a vanilla typescript /webpack/ scss project without any heavy weight frameworks. This will have rxjs and redux shortly. This project is the replacement of all we have in the Ipad project in terms of login page, mfa, authentication , content download etc. This is because we need es6 transpilation into the `www` folder of our cordova project. Essentially this is our real `www` folder. 
The prehook in `hooks/beforePrepare` gets the webpack bundling and copying into pur cordova project.

## give-non-stim-all.tar
This will be downloaded as part of the content download and extracted into a `persistentFolder` prescribed by cordova. Search for details here -> https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/index.html. Once this content is extracted into the above folder , typically as `'persistentFolder'/give-www` , the login page on success, would call the homeUI etc using the `cdvfile://'persistentFolder'/give-www/homeUI.html`  url. This scheme is allowed in the config.xml . Look at where I got that inspired from -> https://github.com/murlex/UpdatableApp. Unfortunately we cannot use that plugin directly due to our content download which is specific for QI.