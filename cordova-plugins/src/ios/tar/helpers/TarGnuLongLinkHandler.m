#import "TarGnuLongLinkHandler.h"

@interface TarGnuLongLinkHandler()
@property (nonatomic, strong) NSMutableData *nameData;
@end

@implementation TarGnuLongLinkHandler
@synthesize nameData;

- (id)initWithHeader:(TarBlock *)headerBlockptr destinationRootPath:(NSString *)destRootPath {
	if ((self = [super init])) {
		self.nameData = [[NSMutableData alloc] init];
	}
	
	return self;
}


- (BOOL)handleBlock:(TarBlock *)blockptr ofSize:(size_t)size withError:(NSError **)error {
	[self.nameData appendBytes:blockptr length:size];
	return YES;
}

- (BOOL)finishWithError:(NSError **)error {
	return YES;
}

- (NSString *)nameForLaterEntry {
	return [[NSString alloc] initWithData:self.nameData encoding:NSUTF8StringEncoding];
}


@end
