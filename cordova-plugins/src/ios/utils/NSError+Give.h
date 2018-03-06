#import <Foundation/Foundation.h>

@interface NSError (Give)

+ (NSError *)errorForErrno:(int)errorNum withPrefix:(NSString *)prefix;
+ (NSError *)applicationErrorWithDescription:(NSString *)description;
+ (NSError *)errorWithDomain:(NSString *)domain description:(NSString *)description;
+ (NSError *)errorWithDomain:(NSString *)domain code:(NSUInteger)code description:(NSString *)description;
+ (NSError *)errorFromNetServicesDict:(NSDictionary *)errorDict;

- (BOOL)isNetworkConnectionFailedError;

@end
