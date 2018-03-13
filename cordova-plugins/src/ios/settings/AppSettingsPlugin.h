#import <Foundation/Foundation.h>

#import <Cordova/CDV.h>

@interface AppSettingsPlugin : CDVPlugin

- (void)defaultsChanged:(NSNotification *)notification;
- (void)watch:(CDVInvokedUrlCommand*)command;
- (void)fetch:(CDVInvokedUrlCommand*)command;
- (void)remove:(CDVInvokedUrlCommand*)command;
- (void)clearAll:(CDVInvokedUrlCommand*)command;
- (void)show:(CDVInvokedUrlCommand*)command;
- (void)store:(CDVInvokedUrlCommand*)command;
- (NSString*)getSettingFromBundle:(NSString*)settingsName;

- (NSDictionary*)validateOptions:(CDVInvokedUrlCommand*)command;
- (id)getStoreForOptions:(NSDictionary*)options;


@end