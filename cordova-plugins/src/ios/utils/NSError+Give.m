#import "NSError+Give.h"
#include <errno.h>

@implementation NSError (Give)

+ (NSError *)errorForErrno:(int)errorNum withPrefix:(NSString *)prefix {
	NSString *msg = [NSString stringWithFormat:@"%@: %s", prefix, strerror(errorNum)];
	NSDictionary *userInfo = [NSDictionary dictionaryWithObjectsAndKeys:msg, NSLocalizedDescriptionKey, nil];
	return [NSError errorWithDomain:NSPOSIXErrorDomain code:errorNum userInfo:userInfo];
}

+ (NSError *)applicationErrorWithDescription:(NSString *)description {
	NSDictionary *userInfo = [NSDictionary dictionaryWithObjectsAndKeys:description, NSLocalizedDescriptionKey, nil];
	return [NSError errorWithDomain:@"Give application" code:-1 userInfo:userInfo];
}

+ (NSError *)errorWithDomain:(NSString *)domain description:(NSString *)description {
	NSDictionary *userInfo = [NSDictionary dictionaryWithObject:description forKey:NSLocalizedDescriptionKey];
	return [NSError errorWithDomain:domain code:-1 userInfo:userInfo];
}

+ (NSError *)errorWithDomain:(NSString *)domain code:(NSUInteger)code description:(NSString *)description {
	NSDictionary *userInfo = [NSDictionary dictionaryWithObject:description forKey:NSLocalizedDescriptionKey];
	return [NSError errorWithDomain:domain code:code userInfo:userInfo];
}

+ (NSError *)errorFromNetServicesDict:(NSDictionary *)errorDict {
	return [NSError errorWithDomain:[errorDict objectForKey:NSNetServicesErrorDomain]
							   code:[errorDict objectForKey:NSNetServicesErrorCode]
						   userInfo:nil];
}

- (BOOL)isNetworkConnectionFailedError {
	return self.domain == NSURLErrorDomain && self.code == kCFURLErrorCannotConnectToHost;
}

@end
