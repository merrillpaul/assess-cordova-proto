#import <Foundation/Foundation.h>

// Relevant references:
// http://www.freebsd.org/cgi/man.cgi?query=tar&sektion=5&manpath=FreeBSD+8-current
// http://www.gnu.org/software/tar/manual/tar.html
// http://en.wikipedia.org/wiki/Tar_(file_format)
// http://code.turnkeylinux.org/busybox/docs/tar_pax.txt
// GNU extensions:
// http://stackoverflow.com/questions/2078778/what-exactly-is-the-gnu-tar-longlink-trick 

#define TAR_BLOCKSIZE 512
#define TAR_NAME_SIZE 100
#define TAR_SIZE_SIZE 12
#define TAR_MAGIC_SIZE 6
#define TAR_MAGIC "ustar"
#define TAR_PREFIX_SIZE 155

typedef struct {
	char name[TAR_NAME_SIZE];
	char mode[8];
	char uid[8];
	char gid[8];
	char size[TAR_SIZE_SIZE];
	char mtime[12];
	char checksum[8];
	char type;
	char linkname[100];
	char magic[TAR_MAGIC_SIZE];
	char version[2];
	char uname[32];
	char gname[32];
	char devmajor[8];
	char devminor[8];
	char prefix[TAR_PREFIX_SIZE];
	char pad[12];
} PosixTarHeader;


typedef union TarBlock {
	unsigned char rawdata[TAR_BLOCKSIZE];
	PosixTarHeader header;
} TarBlock;



// Protocol for classes that process a particular type of tar file entry
@protocol TarEntryHandler <NSObject>

@required
- (id)initWithHeader:(TarBlock *)headerBlockptr destinationRootPath:(NSString *)destRootPath;
- (BOOL)handleBlock:(TarBlock *)blockptr ofSize:(size_t)size withError:(NSError **)error;
- (BOOL)finishWithError:(NSError **)error;

@optional
// If an entry overrides the filename of a later entry in the archive, implement this method to return that name.
// It will be called after finishWithError:.
- (NSString *)nameForLaterEntry;

- (void)overrideHeaderNameWith:(NSString *)name;

@end
