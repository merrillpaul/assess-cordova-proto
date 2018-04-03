# assess-www

## Fetch dependencies
```
npm install
```

## Run webpack
```
npm run build
```

## Start http-server
```
npm start
```

## Cleanup browser file system
```

window.webkitRequestFileSystem(window.PERSISTENT, 1024*1024, function(fs) {
  fs.root.getDirectory('assessRoot', {}, function(dirEntry) {

    dirEntry.removeRecursively(function() {
      console.log('Directory removed.');
    });

  });
});
```
