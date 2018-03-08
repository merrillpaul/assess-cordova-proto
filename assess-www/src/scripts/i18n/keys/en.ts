const KEYS: any = {};
/* Used when a version is disabled on Choose-Share */
KEYS["give.assessment.download.prevented.message"] = "Your version of Assess is out of date. Please update your application using the App Store in order to receive new assessments. You will still be able to administer assessments that are already present and your data will continue to sync.";

KEYS["give.assessment.download.prevented.title"] = "Assessment Download Prevented";

/* Message displayed when we migrate from old to new file system! */
KEYS["give.battery.migration"] = "You may have previously completed assessments in your sidebar. If so, you can safely tap \"Remove\" when viewing them to remove them from your sidebar. This will transfer the information to Q-interactive Central and remove the assessment from your device. Should you make any changes locally before removing, those changes will be reflected in Q-interactive Central.";

KEYS["give.battery.migration.title"] = "Information";

/* User still has default BT name */
KEYS["give.bluetooth.invalid.name"] = "Please change the Bluetooth Name of this device from within Settings on the home screen. This name must match the Bluetooth Name of the Stim Device you will be using.";

KEYS["give.bluetooth.invalid.title"] = "Invalid Bluetooth Name";

KEYS["give.reply.affirmative"] = "Yes";
KEYS["give.reply.negative"] = "No";
KEYS["give.common.cancel"] = "Cancel";
KEYS["give.common.done"] = "Done";
KEYS["give.console"] = "Console";
KEYS["give.console.mark"] = "Mark";
KEYS["give.console.clear"] = "Clear";
KEYS["give.hide.toolbar"] = "Hide toolbar";
KEYS["give.transition.wait"] = "Please wait...";

/* Presented when we can't talk to the server, but have content we can use */
KEYS["give.content.cannot.check.run.old"] = "Assess was unable to check if a new version is available. The previous version will run instead.";

KEYS["give.content.no-content.error"] = "There is no content available for this version of Q-interactive. Please contact Q-interactive support.";
KEYS["give.content.generic.error"] = "Assess was unable to download content. Please contact support.";
KEYS["give.content.generic.error.title"] = "Error";
KEYS["give.content.timeouts.title"] = "Network trouble";
KEYS["give.content.timeouts.mandatory"] = "Assess is having trouble downloading content. Please check your network connection. Assess will keep trying.";
KEYS["give.content.timeouts.mandatory.dismiss"] = "OK";
KEYS["give.content.timeouts.optional"] = "Assess is having trouble downloading content. Do you want to keep trying?";
KEYS["give.content.timeouts.optional.keepTrying"] = "Keep trying";
KEYS["give.content.timeouts.optional.launchNow"] = "Launch now";

/* When the user has content that is too old for the current platform */
KEYS["give.content.manifest.mismatch"] = "The content currently on the device and this version of Assess are not compatible. You must have an Internet connection and accept any content updates to continue.";
KEYS["give.content.manifest.mismatch.title"] = "Manifest Mismatch";

/* If they download an old platform, but do not have content, and the content available is too new */
KEYS["give.content.must.update"] = "Please upgrade to the latest version of Assess.";
KEYS["give.content.must.update.title"] = "Update needed";

/* Alert shown when there's new content */
KEYS["give.content.new.available"] = "There is {{ size }} of new content available:";
KEYS["give.content.ask.download"] = "\nDo you want to download the new content now?";
KEYS["give.content.download.starting"] = "Downloaded {{ downloaded }} of {{ total }}";
KEYS["give.content.download.width"] = "600";
KEYS["give.content.downloading"] = "Downloading the latest Assess content. Please wait.";
KEYS["give.content.installing"] = "Installing the latest Assess content. Please wait.";
KEYS["give.content.installing.tar.progress"] = "Installed {{ current }} out of {{ total }}";
KEYS["give.content.installing.find.tars"] = "Finding tars to extract...";
KEYS["give.content.query"] = "Please wait a moment while Assess gets any new content";

/* When the platform is too old for the new content, but they have a version to run */
KEYS["give.content.old.platform"] = "Updated content is available, but it can't be downloaded until you upgrade Assess to the latest version.";
KEYS["give.content.old.platform.title"] = "Update needed";

KEYS["give.login.page.hello"] = "Hello";
KEYS["give.login.page.username"] = "Username";
KEYS["give.login.page.password"] = "Password";
KEYS["give.login.page.login.btn"] = "Login";

/* Login error messages */
KEYS["give.login.badcredential"] = "Sorry, we were not able to find a user with that user name and password.";
KEYS["give.login.badcredential.hint"] = "Remember that both user name and password are case-sensitive. If you have forgotten them, click the appropriate login information recovery link.";
KEYS["give.login.badcredential.central"] = "Sorry, we were not able to find a Aurora user with that user name and password in Central";
KEYS["give.login.badcredential.hint.central"] = "Remember that both user name and password are case-sensitive";
KEYS["give.login.account.willbelocked"] = "Your account will be locked after one more unsuccessful login attempt.";
KEYS["give.login.account.willbelocked.hint"] = "Please click the appropriate login information recovery link at qiactive.com prior to your next login attempt.";
KEYS["give.login.account.expired"] = "Sorry, your account has expired.";
KEYS["give.login.account.disabled"] = "Sorry, your account is disabled.";
KEYS["give.login.account.unknownstatus"] = "Sorry, we are unable to access your account. Please contact your administrator.";
KEYS["give.login.account.locked"] = "Too many unauthorized attempts.";
KEYS["give.login.account.locked.hint"] = "Use the Forgot Password? link on qiactive.com if you cannot remember your password.";
KEYS["give.login.account.locked.timer.label"] = "You may attempt to login again in:";
KEYS["give.login.account.locked.timer.minutes"] = "minutes";
KEYS["give.login.account.locked.timer.minute"] = "minute";
KEYS["give.login.account.locked.timer.seconds"] = "seconds";
KEYS["give.login.account.locked.timer.second"] = "second";
KEYS["give.login.generic.error"] = "We're sorry, but we cannot connect to the authentication server right now. If this problem persists, please contact your administrator.";
KEYS["give.login.offline.incorrect"] = "Incorrect Offline Credentials Entered.";
KEYS["give.login.sslerror"] = "There was an error establishing a secure connection to the server. Please contact customer service at 800-249-0659, and be prepared to provide the following details:\n\n%@";

/* We only allow one simultanious login attempt */
KEYS["give.login.already.inprogress"] = "Already performing an authentication check. Please try again";

/* Trailing space is on purpose */
KEYS["give.login.password.blank"] = "Please provide a Password. ";
KEYS["give.login.username.blank"] = "Please provide a User Name. ";

KEYS["give.login.server.internal"] = "Internal server error.";
KEYS["give.login.server.unreachable"] = "Unable to reach login server";
KEYS["give.login.unknown.error"] = "Unknown error";
KEYS["give.login.username.password.blank"] = "Please provide a User Name and Password";

KEYS["give.offline.cannot.launch"] = "There was an error connecting to the server to download Assess content. Please check your network settings and try again.";
KEYS["give.offline.cannot.launch.title"] = "Login error";

KEYS["give.login.offline.confirm"] = "Log in Offline";
KEYS["give.login.wait"] = "Please wait a moment while Assess logs you in.";
KEYS["give.migration.perform"] = "Performing One Time Migration";

KEYS["give.sync.error.title"] = "Sync error";

/* This is shown when they don't have debug code */
KEYS["give.uncaught.error"] = "An error has occurred (%@). If the application has become unresponsive, please close and restart the application. If the problem persists, please contact 1-800-249-0659";

/* This is shown when they do have debug code */
KEYS["give.uncaught.error.dev"] = "An error has occurred (%@). If the application has become unresponsive, please close and restart the application. If the problem persists, please turn on \"Error Reporting\" for Assess via \"Settings\" on the Home Screen, and restart the application.";
KEYS["give.uncaught.error.title"] = "Error Occurred";

/* Multi-Factor Authentication error message for Login Screen */

KEYS["give.login.auth.error.mfa.not.setup.description"] = "Sorry, we are unable to process your login";
KEYS["give.login.auth.error.mfa.not.setup.reason"] = "Two-Factor Authentication is required but not setup for this user.";
KEYS["give.login.auth.error.mfa.not.setup.suggestion"] = "Please log into www.qiactive.com and setup Two-Factor Authentication.";

/*** Multi-Factor Authentication Screen ***/

/* Screen title */
KEYS["give.mfa.screen.title"] = "Two-Factor Authentication";

/* Instructions */
KEYS["give.mfa.instructions"] = "Send the Two-Factor Authentication code to your chosen device, then enter the code that you receive. You may select another authentication method if you have set up those options in your account settings found within www.qiactive.com.";

/* MFA type selector label */
KEYS["give.mfa.select.method.label"] = "Method";

/* MFA type selector options */
KEYS["mfa.type.email"] = "Send code to email: {{ communicatorAddress }}";
KEYS["mfa.type.sms"] = "Send code to phone: {{ communicatorAddress }}";
KEYS["mfa.type.google.authenticator"] = "Use Google Authenticator app";

/* Send code button */
KEYS["give.mfa.button.send"] = "Send";

/* Code entry field place holder text */
KEYS["give.mfa.code.entry.label"] = "Code";

/* Login button */
KEYS["give.mfa.button.login"] = "Login";

/* Invalid MFA code error */
KEYS["give.mfa.error.invalid.code"] = "The code you provided is invalid. Please try again.";

/* MFA Remember this device */
KEYS["give.mfa.remember.device.label"] = "Remember this device. It is trusted.";

export const keys = KEYS;
