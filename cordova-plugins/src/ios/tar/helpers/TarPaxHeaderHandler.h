#import <Foundation/Foundation.h>
#import "TarEntryHandler.h"

@interface TarPaxHeaderHandler : NSObject<TarEntryHandler>

- (id)initWithHeader:(TarBlock *)headerBlockptr destinationRootPath:(NSString *)destRootPath;
- (BOOL)handleBlock:(TarBlock *)blockptr ofSize:(size_t)size withError:(NSError **)error;
- (BOOL)finishWithError:(NSError **)error;
- (NSString *)nameForLaterEntry;
@end
