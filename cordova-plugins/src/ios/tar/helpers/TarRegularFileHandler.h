#import <Foundation/Foundation.h>
#import "TarEntryHandler.h"

@interface TarRegularFileHandler : NSObject<TarEntryHandler>
- (void)overrideHeaderNameWith:(NSString *)name;
- (id)initWithHeader:(TarBlock *)headerBlockptr destinationRootPath:(NSString *)destRootPath;
- (BOOL)handleBlock:(TarBlock *)blockptr ofSize:(size_t)size withError:(NSError **)error;
- (BOOL)finishWithError:(NSError **)error;
@end
