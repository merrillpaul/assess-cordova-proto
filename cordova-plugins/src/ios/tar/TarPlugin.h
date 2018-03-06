#import <Foundation/Foundation.h>
#import <Cordova/CDVPlugin.h>
#import "TarArchive.h"

@interface TarPlugin : CDVPlugin {
    @private
    CDVInvokedUrlCommand* _command;
}


- (void)untar:(CDVInvokedUrlCommand*)command;

@end