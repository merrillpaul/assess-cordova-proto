#import "TarRegularFileHandler.h"
#import "NSError+Give.h"

@interface TarRegularFileHandler()
@property (nonatomic, assign) FILE *outFp;
@property (nonatomic, strong) NSString *fullPath;
@property (nonatomic, strong) NSString *destRootPath;
- (BOOL)ensureOutputFileOpenWithError:(NSError **)error;
@end

@implementation TarRegularFileHandler
@synthesize outFp, fullPath, destRootPath;

- (id)initWithHeader:(TarBlock *)headerBlockptr destinationRootPath:(NSString *)theDestRootPath {
	if ((self = [super init])) {
		self.destRootPath = theDestRootPath;
		// TODO handle names > 100 chars

		// The filename in the tar header is only null-terminated if it's less than TAR_NAME_SIZE bytes.
		// If it's exactly TAR_NAME_SIZE bytes long and we don't terminate it ourselves, we'll eventually
		// hit a null terminator but only after reading in the following header field too.
		// The prefix field has a similar issue.
		char tmp[TAR_PREFIX_SIZE + TAR_NAME_SIZE + 2]; // allow for a slash and a null terminator
		char *nameDest;
		
		if (headerBlockptr->header.prefix[0] == '\0') {
			nameDest = tmp;
		} else {
			strncpy(tmp, headerBlockptr->header.prefix, TAR_PREFIX_SIZE);
			tmp[TAR_PREFIX_SIZE] = '\0';
			nameDest = strchr(tmp, '\0');
			*nameDest++ = '/';
		}
		
		strncpy(nameDest, headerBlockptr->header.name, TAR_NAME_SIZE);
		nameDest[TAR_NAME_SIZE] = '\0';
		NSString *fileBasename = [NSString stringWithCString:tmp encoding:NSUTF8StringEncoding];
		self.fullPath = [self.destRootPath stringByAppendingPathComponent:fileBasename];
	}
	
	return self;
}

- (void)dealloc {
	// We should have closed the file in finishWithError:, but clean up in case that didn't happen.
	if (self.outFp) {
		fclose(self.outFp);
	}
	
}

- (void)overrideHeaderNameWith:(NSString *)name {
	self.fullPath = [self.destRootPath stringByAppendingPathComponent:name];
}


- (BOOL)handleBlock:(TarBlock *)blockptr ofSize:(size_t)size withError:(NSError **)error {
	// If this is the first block, open the output file for writing.
	if (![self ensureOutputFileOpenWithError:error]) {
		return NO;
	}

	if (fwrite(blockptr, size, 1, self.outFp) != 1) {
		if (error) {
			*error = [NSError errorForErrno:errno withPrefix:[NSString stringWithFormat:@"Error writing to %@", 
															  self.fullPath]];
		}
		
		return NO;
	}
	
	return YES;
}

- (BOOL)finishWithError:(NSError **)error {
	// Open the file if it hasn't already been open. This ensures that we actually create the output file even if
	// the entry is zero-length.
	if (![self ensureOutputFileOpenWithError:error]) {
		return NO;
	}
	
	FILE *fp = self.outFp;
	self.outFp = nil;
	
	if (fclose(fp) != 0) {
		if (error) {
			*error = [NSError errorForErrno:errno withPrefix:[NSString stringWithFormat:@"Error writing to %@", 
															  self.fullPath]];
		}
		
		return NO;
	}
	
	return YES;
}

- (BOOL)ensureOutputFileOpenWithError:(NSError **)error {
	if (self.outFp) {
		// Already open
		return YES;
	}
	
	if ([self.fullPath rangeOfString:@"/../"].location != NSNotFound) {
		if (error) {
			*error = [NSError applicationErrorWithDescription:@"Tar entry path contained a parent directory reference"];
		}
		
		return NO;
	}
	
	// Create the directory, if needed.
	NSString *dirname = [self.fullPath stringByDeletingLastPathComponent];
	
	if (![[NSFileManager defaultManager] createDirectoryAtPath:dirname withIntermediateDirectories:YES attributes:nil 
														 error:error]) {
		return NO;
	}
	
	self.outFp = fopen([self.fullPath cStringUsingEncoding:NSUTF8StringEncoding], "wb");
	
	if (!self.outFp) {
		if (error) {
			*error = [NSError errorForErrno:errno withPrefix:[NSString 
															  stringWithFormat:@"Error opening %@ for writing", 
															  self.fullPath]];
		}
		
		return NO;
	}

	return YES;
}

@end
