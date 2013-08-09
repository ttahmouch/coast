Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

var fs = require('fs'),
    dir = require('path');

function TexasRanger(path) {
    /**
     * Defaults to the current path if dir.resolve() is invoked with an empty string.
     */
    this._path = dir.resolve(((typeof path === 'string') ? path : ''));

    this._fileDelegate = null;
    this._directoryDelegate = null;
    this._blockDeviceDelegate = null;
    this._characterDeviceDelegate = null;
    this._symbolicLinkDelegate = null;
    this._fifoDelegate = null;
    this._socketDelegate = null;

    this._fileArray = [];
    this._directoryArray = [];
    this._blockDeviceArray = [];
    this._characterDeviceArray = [];
    this._symbolicLinkArray = [];
    this._fifoArray = [];
    this._socketArray = [];

    this._shouldLogWalk = false;

    return this;
}

TexasRanger.method('setPath', function (path) {
    /**
     * Defaults to the current path if dir.resolve() is invoked with an empty string.
     */
    this._path = dir.resolve(((typeof path === 'string') ? path : ''));
    return this;
});

TexasRanger.method('setFileDelegate', function (delegate) {
    this._fileDelegate = (typeof delegate === 'function') ? delegate : null;
    return this;
});

TexasRanger.method('setDirectoryDelegate', function (delegate) {
    this._directoryDelegate = (typeof delegate === 'function') ? delegate : null;
    return this;
});

TexasRanger.method('setBlockDeviceDelegate', function (delegate) {
    this._blockDeviceDelegate = (typeof delegate === 'function') ? delegate : null;
    return this;
});

TexasRanger.method('setCharacterDeviceDelegate', function (delegate) {
    this._characterDeviceDelegate = (typeof delegate === 'function') ? delegate : null;
    return this;
});

TexasRanger.method('setSymbolicLinkDelegate', function (delegate) {
    this._symbolicLinkDelegate = (typeof delegate === 'function') ? delegate : null;
    return this;
});

TexasRanger.method('setFifoDelegate', function (delegate) {
    this._fifoDelegate = (typeof delegate === 'function') ? delegate : null;
    return this;
});

TexasRanger.method('setSocketDelegate', function (delegate) {
    this._socketDelegate = (typeof delegate === 'function') ? delegate : null;
    return this;
});

TexasRanger.method('getFileArray', function () {
    return this._fileArray;
});

TexasRanger.method('getDirectoryArray', function () {
    return this._directoryArray;
});

TexasRanger.method('getBlockDeviceArray', function () {
    return this._blockDeviceArray;
});

TexasRanger.method('getCharacterDeviceArray', function () {
    return this._characterDeviceArray;
});

TexasRanger.method('getSymbolicLinkArray', function () {
    return this._symbolicLinkArray;
});

TexasRanger.method('getFifoArray', function () {
    return this._fifoArray;
});

TexasRanger.method('getSocketArray', function () {
    return this._socketArray;
});

TexasRanger.method('setShouldLogWalk', function (shouldLogWalk) {
    this._shouldLogWalk = !!shouldLogWalk;
    return this;
});

TexasRanger.method('getShouldLogWalk', function () {
    return this._shouldLogWalk;
});

TexasRanger.method('walk', function walk(path) {
    path = (typeof path === 'string') ? path : this._path;

    var that = this;

    /**
     * Finish implementing.
     */
});

TexasRanger.method('walkSync', function walkSync(path) {
    /**
     * Consider moving this to an explicit reset method.
     *
     * May not be necessary to move to a reset method if the user of this method chooses to pass in an explicit string
     * when starting the walk as opposed to relying on the accessor method.
     */
    if (!path) {
        this._fileArray = [];
        this._directoryArray = [];
        this._blockDeviceArray = [];
        this._characterDeviceArray = [];
        this._symbolicLinkArray = [];
        this._fifoArray = [];
        this._socketArray = [];
    }

    path = (typeof path === 'string') ? path : this._path;

    var that = this;

    try {
        var stat = fs.lstatSync(path),
            fileDelegate = this._fileDelegate,
            directoryDelegate = this._directoryDelegate,
            blockDeviceDelegate = this._blockDeviceDelegate,
            characterDeviceDelegate = this._characterDeviceDelegate,
            symbolicLinkDelegate = this._symbolicLinkDelegate,
            fifoDelegate = this._fifoDelegate,
            socketDelegate = this._socketDelegate,
            fileArray = this._fileArray,
            directoryArray = this._directoryArray,
            blockDeviceArray = this._blockDeviceArray,
            characterDeviceArray = this._characterDeviceArray,
            symbolicLinkArray = this._symbolicLinkArray,
            fifoArray = this._fifoArray,
            socketArray = this._socketArray,
            shouldLogWalk = this._shouldLogWalk;

        if (stat.isFile()) {
            if (!!fileDelegate) {
                fileDelegate(path);
            }
            if (!!shouldLogWalk) {
                fileArray.push(path);
            }
        } else if (stat.isDirectory()) {
            if (!!directoryDelegate) {
                directoryDelegate(path);
            }
            if (!!shouldLogWalk) {
                directoryArray.push(path);
            }
            try {
                var subpaths = fs.readdirSync(path);
                subpaths.forEach(function (subpath) {
                    walkSync.call(that, path + dir.sep + subpath);
                });
            } catch (e) {
                console.log('The path, ' + path + ', DOES exist, and cannot be walked.');
            }
        } else if (stat.isBlockDevice()) {
            if (!!blockDeviceDelegate) {
                blockDeviceDelegate(path);
            }
            if (!!shouldLogWalk) {
                blockDeviceArray.push(path);
            }
        } else if (stat.isCharacterDevice()) {
            if (!!characterDeviceDelegate) {
                characterDeviceDelegate(path);
            }
            if (!!shouldLogWalk) {
                characterDeviceArray.push(path);
            }
        } else if (stat.isSymbolicLink()) {
            if (!!symbolicLinkDelegate) {
                symbolicLinkDelegate(path);
            }
            if (!!shouldLogWalk) {
                symbolicLinkArray.push(path);
            }
        } else if (stat.isFIFO()) {
            if (!!fifoDelegate) {
                fifoDelegate(path);
            }
            if (!!shouldLogWalk) {
                fifoArray.push(path);
            }
        } else if (stat.isSocket()) {
            if (!!socketDelegate) {
                socketDelegate(path);
            }
            if (!!shouldLogWalk) {
                socketArray.push(path);
            }
        }
    } catch (e) {
        console.log('The path, ' + path + ', DOES NOT exist, and cannot be walked.');
    }
});

function ranger(path) {
    return new TexasRanger(path);
}

ranger.isPrototypeOf = function (object) {
    return object instanceof TexasRanger;
};

module.exports = exports = ranger;

(function () {
    /**
     * Nonexistent, directory, file, symbolic link, pipe, character device, block device, socket, hypermedia directory.
     */
    var walker = ranger(),
        paths = [
            './test/nonexistent',
            './test/nonexistent/..',
            './test/nonexistent/../index.js',
            './test/nonexistent/../sl',
            './test/nonexistent/../pipe',
            './test',
            './test/index.js',
            './test/sl',
            './test/pipe',
            '/dev/null',
            '/dev/disk0',
            '/tmp/launch-8m5d5k/ServiceProcessSocket',
            '../api/gen'
        ],
        test = function () {
            for (var i = 0; i < 2; i++) {
                for (var path in paths) {
                    console.log('[START]');
                    walker.setPath(paths[path]);
                    walker.walkSync();
                    console.dir(walker.getBlockDeviceArray());
                    console.dir(walker.getCharacterDeviceArray());
                    console.dir(walker.getDirectoryArray());
                    console.dir(walker.getFifoArray());
                    console.dir(walker.getFileArray());
                    console.dir(walker.getSocketArray());
                    console.dir(walker.getSymbolicLinkArray());
                }
                walker.setShouldLogWalk(true);
            }
        };

    console.dir(walker);

    walker.setBlockDeviceDelegate(function (path) {
        console.log('Block Device: ' + path);
    });
    walker.setCharacterDeviceDelegate(function (path) {
        console.log('Character Device: ' + path);
    });
    walker.setDirectoryDelegate(function (path) {
        console.log('Directory: ' + path);
    });
    walker.setFifoDelegate(function (path) {
        console.log('FIFO: ' + path);
    });
    walker.setFileDelegate(function (path) {
        console.log('File: ' + path);
    });
    walker.setSocketDelegate(function (path) {
        console.log('Socket: ' + path);
    });
    walker.setSymbolicLinkDelegate(function (path) {
        console.log('Symbolic Link: ' + path);
    });

    console.dir(walker);

    test();
})();
