#import <Foundation/Foundation.h>

@interface TarArchive : NSObject

+ (BOOL)extractArchiveAtPath:(NSString *)tarPath intoDirectory:(NSString *)destPath withError:(NSError **)error;

@end