const KEYS: any = {};
/* Used when a version is disabled on Choose-Share */
KEYS["give.assessment.download.prevented.message"] = "Ihre Version von Assess ist abgelaufen. Bitte updaten Sie Ihre App im App Store, um neue Tests aufnehmen zu können. Sie können weiterhin Tests durchführen, die sich bereits auf Ihrem Gerät befinden, und Ihre Daten werden weiterhin synchronisiert.";

KEYS["give.assessment.download.prevented.title"] = "Test-Download verhindert";

/* Message displayed when we migrate from old to new file system! */
KEYS["give.battery.migration"] = "Sie haben möglicherweise bereits vorher abgeschlossene Tests in Ihrer Seitenleiste. Falls dies der Fall ist, können Sie, wenn Sie sie anzeigen lassen, sicher auf \"Entfernen\" tippen, um sie aus der Seitenleiste zu entfernen. Dies wird die Informationen an Q-interactive Central transferieren und den Test von Ihrem Gerät entfernen. Sollten Sie lokal vor dem Entfernen irgendwelche Änderungen vornehmen, werde diese Änderungen in Q-interactive Central widergespiegelt.";

KEYS["give.battery.migration.title"] = "Information";

/* User still has default BT name */
KEYS["give.bluetooth.invalid.name"] = "Bitte ändern Sie den Bluetooth-Namen dieses Geräts innerhalb von Einstellungen auf dem Home-Bildschirm. Dieser Name muss mit dem Bluetooth-Namen des Stimulus-Geräts übereinstimmen, das Sie nutzen werden.";

KEYS["give.bluetooth.invalid.title"] = "Ungültiger Bluetooth-Name";

KEYS["give.reply.affirmative"] = "Ja";
KEYS["give.reply.negative"] = "Nein";
KEYS["give.common.cancel"] = "Abbrechen";
KEYS["give.common.done"] = "Fertig";
KEYS["give.console"] = "Konsole";
KEYS["give.console.mark"] = "Markieren";
KEYS["give.console.clear"] = "Löschen";
KEYS["give.hide.toolbar"] = "Symbolleiste ausblenden";
KEYS["give.transition.wait"] = "Bitte warten...";

/* Presented when we can't talk to the server, but have content we can use */
KEYS["give.content.cannot.check.run.old"] = "Assess konnte nicht prüfen, ob eine neue Version verfügbar ist. Die vorherige Version wird stattdessen ausgeführt.";

KEYS["give.content.no-content.error"] = "Es sind keine Inhalte für diese Version von Q-interactive verfügbar. Bitte kontaktieren Sie Q-interactive Support.";
KEYS["give.content.generic.error"] = "Assess war es nicht möglich, Inhalte herunterzuladen. Bitte kontaktieren Sie den Support.";
KEYS["give.content.generic.error.title"] = "Fehler";
KEYS["give.content.timeouts.title"] = "Netzwerkprobleme";
KEYS["give.content.timeouts.mandatory"] = "Assess hat Probleme, Inhalte herunterzuladen. Bitte überprüfen Sie Ihre Netzwerkverbindung. Assess wird es weiterhin versuchen.";
KEYS["give.content.timeouts.mandatory.dismiss"] = "OK";
KEYS["give.content.timeouts.optional"] = "Assess hat Probleme, Inhalte herunterzuladen. Möchten Sie es weiterhin versuchen?";
KEYS["give.content.timeouts.optional.keepTrying"] = "Weiterhin versuchen";
KEYS["give.content.timeouts.optional.launchNow"] = "Jetzt starten";

/* When the user has content that is too old for the current platform */
KEYS["give.content.manifest.mismatch"] = "Die aktuellen Inhalte auf dem Gerät und diese Version von Assess sind nicht kompatibel. Sie müssen eine Internetverbindung haben und alle Updates zu Inhalten akzeptieren, um fortzufahren.";
KEYS["give.content.manifest.mismatch.title"] = "Manifest Mismatch";

/* If they download an old platform, but do not have content, and the content available is too new */
KEYS["give.content.must.update"] = "Bitte Upgrade zur neuesten Version von Assess durchführen.";
KEYS["give.content.must.update.title"] = "Update erforderlich";

/* Alert shown when there's new content */
KEYS["give.content.new.available"] = "Es sind {{ size }} neue Inhalte verfügbar:";
KEYS["give.content.ask.download"] = "\nMöchten Sie die neuen Inhalte jetzt herunterladen?";
KEYS["give.content.download.starting"] = "Herunterladen von {{ downloaded}} of {{total}} beginnt";
KEYS["give.content.download.width"] = "600";
KEYS["give.content.downloading"] = "Download der neuesten Assess-Inhalte läuft. Bitte warten.";
KEYS["give.content.installing"] = "Installation neuester Assess-Inhalte läuft. Bitte warten.";
KEYS["give.content.installing.tar.progress"] = "Installed {{ current }} out of {{ total }}";
KEYS["give.content.installing.find.tars"] = "Finding tars to extract...";
KEYS["give.content.query"] = "Please wait a moment while Assess gets any new content";

/* When the platform is too old for the new content, but they have a version to run */
KEYS["give.content.old.platform"] = "Aktualisierte Inhalte sind verfügbar, können jedoch nicht heruntergeladen werden, bis Sie ein Upgrade von Assess zur neuesten Version durchführen.";
KEYS["give.content.old.platform.title"] = "Update erforderlich";

KEYS["give.login.page.hello"] = "Hello";
KEYS["give.login.page.username"] = "Username";
KEYS["give.login.page.password"] = "Password";
KEYS["give.login.page.login.btn"] = "Login";

/* Login error messages */
KEYS["give.login.badcredential"] = "Entschuldigung, wir konnten keinen Nutzer mit diesem Nutzernamen und Passwort finden.";
KEYS["give.login.badcredential.hint"] = "Beachten Sie bitte die Groß- und Kleinschreibung von Nutzername und Passwort. Falls Sie diese vergessen haben, klicken Sie auf den entsprechenden Link zur Wiederherstellung der Anmeldeinformationen.";
KEYS["give.login.badcredential.central"] = "Entschuldigung, es war uns nicht möglich, einen Aurora-Nutzer mit diesem Nutzernamen und Passwort in Central zu finden.";
KEYS["give.login.badcredential.hint.central"] = "Beachten Sie bitte die Groß- und Kleinschreibung von Nutzername und Passwort";
KEYS["give.login.account.willbelocked"] = "Ihr Konto wird nach einem weiteren nicht erfolgreichen Anmeldeversuch gesperrt werden.";
KEYS["give.login.account.willbelocked.hint"] = "Bitte klicken Sie vor Ihrem nächsten Anmeldeversuch auf den entsprechenden Link zur Wiederherstellung der Anmeldeinformationen auf qiactive.com.";
KEYS["give.login.account.expired"] = "Entschuldigung, Ihr Konto ist abgelaufen.";
KEYS["give.login.account.disabled"] = "Entschuldigung, Ihr Konto ist deaktiviert.";
KEYS["give.login.account.unknownstatus"] = "Entschuldigung, es konnte nicht auf Ihr Konto zugegriffen werden. Bitte kontaktieren Sie Ihren Administrator.";
KEYS["give.login.account.locked"] = "Zu viele nicht autorisierte Versuche.";
KEYS["give.login.account.locked.hint"] = "Nutzen Sie den Link „Passwort vergessen?“ auf qiactive.com, wenn Sie sich nicht an Ihr Passwort erinnern können.";
KEYS["give.login.account.locked.timer.label"] = "Sie können versuchen, sich erneut anzumelden in:";
KEYS["give.login.account.locked.timer.minutes"] = "Minuten";
KEYS["give.login.account.locked.timer.minute"] = "Minute";
KEYS["give.login.account.locked.timer.seconds"] = "Sekunden";
KEYS["give.login.account.locked.timer.second"] = "Sekunde";
KEYS["give.login.generic.error"] = "Entschuldigung, wir können im Moment keine Verbindung zu dem Authentifizierungsserver herstellen. Sollte dieses Problem weiterhin bestehen, kontaktieren Sie bitte Ihren Administrator.";
KEYS["give.login.offline.incorrect"] = "Falsche Anmeldeinformationen eingegeben (Hinweis: Sie sind nicht verbunden).";
KEYS["give.login.sslerror"] = "Es gab einen Fehler bei der Herstellung einer sicheren Verbindung zum Server. Bitte kontaktieren Sie den Customer Service unter +49 69 756146-0 und halten Sie bitte die folgenden Details zur Mitteilung bereit:\n\n%@";

/* We only allow one simultanious login attempt */
KEYS["give.login.already.inprogress"] = "Eine Überprüfung der Authentifizierung wird bereits ausgeführt. Bitte erneut versuchen";

/* Trailing space is on purpose */
KEYS["give.login.password.blank"] = "Bitte ein Passwort angeben. ";
KEYS["give.login.username.blank"] = "Bitte einen Nutzernamen angeben. ";

KEYS["give.login.server.internal"] = "Interner Serverfehler.";
KEYS["give.login.server.unreachable"] = "Anmeldeserver nicht erreichbar";
KEYS["give.login.unknown.error"] = "Unbekannter Fehler";
KEYS["give.login.username.password.blank"] = "Bitte einen Nutzernamen und Passwort angeben";

KEYS["give.offline.cannot.launch"] = "Es gab einen Fehler beim Verbinden mit dem Server, um Inhalte von Assess herunterzuladen. Bitte überprüfen Sie Ihre Netzwerkeinstellungen und versuchen Sie es erneut.";
KEYS["give.offline.cannot.launch.title"] = "Anmeldefehler";

KEYS["give..login.offline.confirm"] = "Offline anmelden";
KEYS["give.login.wait"] = "Bitte warten Sie einen Moment, während Assess Sie einloggt.";
KEYS["give.migration.perform"] = "Performing One Time Migration";

KEYS["give.sync.error.title"] = "Synchronisierungs-Fehler";

/* This is shown when they don't have debug code */
KEYS["give.uncaught.error"] = "Ein Fehler ist aufgetreten (%@). Falls die App nicht mehr reagiert, schließen Sie bitte die App und starten Sie sie erneut. Sollte das Problem weiterhin bestehen, kontaktieren Sie bitte +49 69 756146-0";

/* This is shown when they do have debug code */
KEYS["give.uncaught.error.dev"] = "Ein Fehler ist aufgetreten (%@). Falls die App nicht mehr reagiert, schließen Sie bitte die App und starten Sie sie erneut. Sollte das Problem weiterhin bestehen, aktivieren Sie bitte \"Fehlerberichterstattung\" für Assess über \"Einstellungen\" auf dem Home-Bildschirm und starten Sie die App erneut.";
KEYS["give.uncaught.error.title"] = "Fehler aufgetreten";

/* Multi-Factor Authentication error message for Login Screen */

KEYS["give.login.auth.error.mfa.not.setup.description"] = "Leider konnten wir Ihre Anmeldung nicht verarbeiten";
KEYS["give.login.auth.error.mfa.not.setup.reason"] = "Zwei-Faktor-Authentifizierung ist erforderlich, für diesen Nutzer jedoch nicht eingerichtet.";
KEYS["give.login.auth.error.mfa.not.setup.suggestion"] = "Bitte melden Sie sich unter www.qiactive.com an und richten Sie die Zwei-Faktor-Authentifizierung ein.";

/*** Multi-Factor Authentication Screen ***/

/* Screen title */
KEYS["give.mfa.screen.title"] = "Zwei-Faktor-Authentifizierung";

/* Instructions */
KEYS["give.mfa.instructions"] = "Senden Sie den Zwei-Faktor-Authentifizierungscode an das gewählte Gerät, geben Sie dann den erhaltenen Code ein. Sie können eine andere Authentifizierungsmethode wählen, falls Sie diese Optionen in Ihren Kontoeinstellungen in Central eingerichtet haben.";

/* MFA type selector label */
KEYS["give.mfa.select.method.label"] = "Methode";

/* MFA type selector options */
KEYS["give.mfa.option.label.email"] = "Code an E-Mail senden: %@";
KEYS["give.mfa.option.label.sms"] = "Code an Telefon senden: %@";
KEYS["give.mfa.option.label.googleAuthenticator"] = "Google Authenticator App nutzen%@";

/* Send code button */
KEYS["give.mfa.button.send"] = "Senden";

/* Code entry field place holder text */
KEYS["give.mfa.code.entry.label"] = "Code";

/* Login button */
KEYS["give.mfa.button.login"] = "Anmelden";

/* Invalid MFA code error */
KEYS["give.mfa.error.invalid.code"] = "Der von Ihnen angegebene Code ist ungültig. Bitte erneut versuchen.";

/* MFA Remember this device */
KEYS["give.mfa.remember.device.label"] = "Dieses Gerät merken. Es ist vertrauenswürdig.";

export const keys = KEYS;