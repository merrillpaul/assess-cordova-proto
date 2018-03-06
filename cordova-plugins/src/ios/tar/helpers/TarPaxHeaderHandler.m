#import "TarPaxHeaderHandler.h"
#import "NSError+Give.h"

@interface TarPaxHeaderHandler ()
@property (nonatomic, strong) NSMutableData *data;
@property (nonatomic, strong) NSString *filename;
@end

@implementation TarPaxHeaderHandler

@synthesize filename, data;

- (id)initWithHeader:(TarBlock *)headerBlockptr destinationRootPath:(NSString *)destRootPath {
	if ((self = [super init])) {
		self.filename = nil;
		self.data = [[NSMutableData alloc] init];
	}
	
	return self;
}


- (BOOL)handleBlock:(TarBlock *)blockptr ofSize:(size_t)size withError:(NSError **)error {
	// Records within a pax header may span multiple blocks. To simplify things, we'll read all the blocks into
	// a single contiguous buffer and proccess them all at the end.
	[self.data appendBytes:blockptr length:size];
	return YES;
}

- (BOOL)finishWithError:(NSError **)error {
	size_t offset = 0;
	
	while (offset < [self.data length]) {
		char *record = ((char *)[self.data mutableBytes]) + offset;
		int recordSize, keyOffset;
		
		// Records are in the form <size> <key>=<value>\n, where size is the length of the record in bytes
		// including the size itself and the newline.
		if (sscanf(record, "%d %n", &recordSize, &keyOffset) != 1 || recordSize <= 0) {
			if (error) {
				*error = [NSError applicationErrorWithDescription:@"Couldn't find the size of a pax header record"];
			}
			
			return NO;
		}
		
		if (offset + recordSize > [self.data length]) {
			if (error) {
				*error = [NSError applicationErrorWithDescription:
						  @"Pax record would have extended past the end of the header"];
			}
			
			return NO;
		}
		
		offset += recordSize;
		
		// Replace the trailing newline with a null so we can start treating the record as a string
		if (record[recordSize - 1] != '\n' && record[recordSize - 1] != '\0') {
			if (error) {
				*error = [NSError applicationErrorWithDescription:@"Pax header record wasn't newline-terminated"];
			}
			
			return NO;
		} 
		
		record[recordSize - 1] = '\0';
		
		char *key = record + keyOffset;
		char *eq = strchr(key, '=');
		
		if (!eq) {
			if (error) {
				*error = [NSError applicationErrorWithDescription:
						  @"Couldn't find the value separator in a pax header record"];
			}
			
			return NO;
		}
		
		*eq = '\0';
		
		// Many keys are possible. We only care about path.
		if (strcmp(key, "path") == 0) {
			self.filename = [NSString stringWithCString:eq + 1 encoding:NSUTF8StringEncoding];
			return YES;  // no need to look at any other records
		}
	}
	
	return YES;
}

- (NSString *)nameForLaterEntry {
	return self.filename;
}

@end
