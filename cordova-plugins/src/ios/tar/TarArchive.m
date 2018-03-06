#import "TarArchive.h"
#include <stdio.h>
#import "NSError+Give.h"
#import "TarEntryHandler.h"
#import "TarRegularFileHandler.h"
#import "TarPaxHeaderHandler.h"
#import "TarGnuLongLinkHandler.h"


typedef enum {
	TarBlockTypeNull,
	TarBlockTypeFile,
	TarBlockTypePax,
	TarBlockTypeGnuLongLink,
	TarBlockTypeIgnored,	// symlinks, device files, directories, etc
	TarBlockTypeUnsupported
} TarBlockType;


static TarBlock nullBlock;
static BOOL nullBlockInited = NO;


@interface TarArchive () {
	int consecutiveNulls;
	long lastReportedPosition;
}
// Rather than plumbing an error parameter all the way through the various calls, methods that fail set
// the error property to something appropriate.
@property (nonatomic, strong) NSError *error;
@property (nonatomic, assign) FILE *tarFp;
@property (nonatomic, assign) int numBlocksRead;
@property (nonatomic, strong) NSString *destPath;
@property (nonatomic, strong) NSString *overrideNameForFollowingEntry;

- (id)initWithTarPath:(NSString *)tarPath destPath:(NSString *)destPath;
- (BOOL)extract;
- (BOOL)verifyMagic:(TarBlock *)blockptr;
- (TarBlockType)getBlockType:(TarBlock *)blockptr;
- (Class)entryHandlerForType:(TarBlockType)type;
- (BOOL)readEntryForHeader:(TarBlock *)headerBlockptr ofType:(TarBlockType)type;
- (BOOL)readNextBlock:(TarBlock *)blockptr;
@end

@implementation TarArchive

@synthesize tarFp, error, numBlocksRead, destPath, overrideNameForFollowingEntry;

+ (BOOL)extractArchiveAtPath:(NSString *)tarPath intoDirectory:(NSString *)destPath
				   withError:(NSError **)error {
	
	TarArchive *archive = [[TarArchive alloc] initWithTarPath:tarPath destPath:destPath];
	BOOL result = [archive extract];
	
	if (error) {
		*error = archive.error;
	}
	
	return result;
}

- (id)init {
	@throw [NSException exceptionWithName:@"Wrong initializer" 
								   reason:@"TarArchive's designated initializer wasn't called." 
								 userInfo:nil];
}

- (id)initWithTarPath:(NSString *)tarPath destPath:(NSString *)theDestPath {
	if ((self = [super init])) {
		FILE *fp = fopen([tarPath cStringUsingEncoding:NSUTF8StringEncoding], "rb");
		
		if (fp) {
			self.error = nil;
			self.tarFp = fp;
		} else {
			self.error = [NSError errorForErrno:errno withPrefix:[NSString stringWithFormat:
																  @"Couldn't extract tar file at %@", tarPath]];
			self.tarFp = NULL;
		}
		
		self.numBlocksRead = 0;
		consecutiveNulls = 0;
		lastReportedPosition = 0;
		self.destPath = theDestPath;
		self.overrideNameForFollowingEntry = nil;
	}
	
	return self;
}

- (void)dealloc {
	if (self.tarFp) {
		fclose(self.tarFp);
		self.tarFp = NULL;
	}
	
}

- (BOOL)extract {
	if (!self.tarFp) {
		return NO;
	}
	
	while (consecutiveNulls < 2) {
		@autoreleasepool {
			if (![self processNextEntry]) {
				return NO;
			}
		}
	}
	
	return YES;
}

- (BOOL)processNextEntry {
	TarBlock block;
	
	if (![self readNextBlock:&block]) {
		return NO;
	}
	
	// If this is the first block, verify that we've got a tar file
	if (self.numBlocksRead == 1 && ![self verifyMagic:&block]) {
		return NO;
	}
	
	TarBlockType type = [self getBlockType:&block];
	
	switch (type) {
		case TarBlockTypeNull:
			consecutiveNulls++;
			break;
		case TarBlockTypeUnsupported:
			self.error = [NSError applicationErrorWithDescription:
						  [NSString stringWithFormat:@"Unrecognized tar block type %c (%d)\n",
						   block.header.type, block.header.type]];
			return NO;
		case TarBlockTypeFile:
		case TarBlockTypePax:
		case TarBlockTypeGnuLongLink:
		case TarBlockTypeIgnored:
			if (![self readEntryForHeader:&block ofType:type]) {
				return NO;
			}
			
			break;
	}
	
	if (type != TarBlockTypeNull) {
		consecutiveNulls = 0;
	}
	
	if (type != TarBlockTypePax && type != TarBlockTypeGnuLongLink) {
		self.overrideNameForFollowingEntry = nil;
	}
	
	
	long pos = ftell(self.tarFp);
	lastReportedPosition = pos;
	return YES;
}

- (BOOL)verifyMagic:(TarBlock *)blockptr {
	// Verify that the first block contains the magic indicator that this is a tar file
	// The magic indicator is sometimes directly null-terminated and sometimes padded out
	// to the field width with trailing spaces.
	if (strncmp(blockptr->header.magic, TAR_MAGIC, strlen(TAR_MAGIC)) != 0) {
		self.error = [NSError applicationErrorWithDescription:@"File isn't a valid tar file"];
		return NO;
	}
	
	return YES;

}

- (TarBlockType)getBlockType:(TarBlock *)blockptr {
	if (!nullBlockInited) {
		bzero(&nullBlock, sizeof nullBlock);
	}
	
	if (memcmp(blockptr, &nullBlock, sizeof *blockptr) == 0) {
		return TarBlockTypeNull;
	}
	
	switch (blockptr->header.type) {
		case '0':	// documented value for regular files
			return TarBlockTypeFile;
			
		case '1':	// hard link
		case '2':	// symbolic link
		case '3':	// character device
		case '4':	// block device
		case '5':	// directory
		case '6':	// pipe
			return TarBlockTypeIgnored;
			
		case 'x':	// PAX header
			return TarBlockTypePax;
		case 'L':	// GNU format long filename 
			return TarBlockTypeGnuLongLink;
//		case '7':	// reserved
			
		default:
			// POSIX compliant tars treat any unrecognized type, including '\0', as a regular file. See e.g. 
			// http://www.freebsd.org/cgi/man.cgi?query=tar&sektion=5&manpath=FreeBSD+8-current
			// However, since we only support a limited set of tar implementations, we want to know if we're 
			// hitting something we don't know about.
			return TarBlockTypeUnsupported;
	}
}

- (Class)entryHandlerForType:(TarBlockType)type {
	switch (type) {
		case TarBlockTypeFile:
			return [TarRegularFileHandler class];
		case TarBlockTypePax:
			return [TarPaxHeaderHandler class];
		case TarBlockTypeGnuLongLink:
			return [TarGnuLongLinkHandler class];
		default:
			self.error = [NSError applicationErrorWithDescription:
						  [NSString stringWithFormat:@"No handler for tar entry type %d", type]];
			return nil;
	}
}

- (BOOL)getSize:(TarBlock *)blockptr into:(size_t *)result {
	char buf[TAR_SIZE_SIZE + 1];
	bzero(buf, TAR_SIZE_SIZE + 1);
	memcpy(buf, &(blockptr->header.size), TAR_SIZE_SIZE);
	buf[TAR_SIZE_SIZE] = '\0';
	char *endp;
	*result = strtoul(buf, &endp, 8);
	
	// The spec doesn't appear to require it, but the last character of the size field is a space.
	// Tolerate either that or an octal number that completely fills the size field and reject 
	// anything else.
	if (!endp || (*endp != '\0' && *endp != ' ')) {
		self.error = [NSError applicationErrorWithDescription:
					  [NSString stringWithFormat:@"Tar: Couldn't read the size of block %d",
					  self.numBlocksRead]];
		return NO;
	}
	
	return YES;
}

- (BOOL)readEntryForHeader:(TarBlock *)headerBlockptr ofType:(TarBlockType)type {
	size_t size;
	
	if (![self getSize:headerBlockptr into:&size]) {
		return NO;
	}
	
	size_t nblocks = size / TAR_BLOCKSIZE;
	size_t nread = 0;
	
	if ((size % TAR_BLOCKSIZE) != 0) {
		nblocks++;
	}
	
	id<TarEntryHandler> handler = nil;
	
	if (type != TarBlockTypeIgnored) {
		Class handlerClass = [self entryHandlerForType:type];
		
		if (!handlerClass) {
			return NO;
		}
		
		handler = [[handlerClass alloc] initWithHeader:headerBlockptr destinationRootPath:self.destPath];
		
		if (self.overrideNameForFollowingEntry && [handler respondsToSelector:@selector(overrideHeaderNameWith:)]) {
			[handler overrideHeaderNameWith:self.overrideNameForFollowingEntry];
		}
	}
	
	NSError *blockError = nil;
		
	for (size_t i = 0; i < nblocks; i++) {
		@autoreleasepool {
			TarBlock contentBlock;
			
			if (![self readNextBlock:&contentBlock]) {
				return NO;
			}
			
			size_t thisBlocksize = MIN(TAR_BLOCKSIZE, size - nread);
			
			if (handler && ![handler handleBlock:&contentBlock ofSize:thisBlocksize withError:&blockError]) {
				self.error = blockError;
				return NO;
			}

			nread += thisBlocksize;
		}
	}
	
	if (handler && ![handler finishWithError:&blockError]) {
		self.error = blockError;
		return NO;
	}
	
	if ([handler respondsToSelector:@selector(nameForLaterEntry)]) {
		self.overrideNameForFollowingEntry = [handler nameForLaterEntry];
	}
	
	return YES;
}

- (BOOL)readNextBlock:(TarBlock *)blockptr {
	size_t nread = fread(blockptr, TAR_BLOCKSIZE, 1, self.tarFp);
	
	if (nread != 1) {
		if (feof(self.tarFp)) {
			NSString *msg = [NSString stringWithFormat:@"Unexpected end of file reading block %d of tar file", 
							 self.numBlocksRead];
			self.error = [NSError applicationErrorWithDescription:msg];
		} else {
			NSString *prefix = [NSString stringWithFormat:@"Error reading block %d of tar file", 
							 self.numBlocksRead];
			self.error = [NSError errorForErrno:errno withPrefix:prefix];
		}
		
		return NO;
	}
	
	self.numBlocksRead++;
	return YES;
}


@end
