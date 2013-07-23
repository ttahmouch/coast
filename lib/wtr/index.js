/**
 * Augments the Function type object's prototype with a method called "method."
 * This method allows any Constructor Function, that prototypally inherits from
 * Function.prototype (so all Constructor Functions), to easily add methods to
 * their own prototype objects.
 *
 * @param name is the name of the method passed as a String object argument.
 * @param func is the first-class function object passed in as an argument.
 * @return {*} a reference to your respective Constructor Function.
 */
Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

/**
 * Module dependencies.
 */
var fs = require('fs'),
    dir = require('path');

/**
 * Walker, Texas Ranger is a file tree walker. The intention of Walker, Texas Ranger is to allow the ability to
 * navigate a path in synchronous and asynchronous fashion.
 *
 * @param path is a String instance representing the path of origin to start walking.
 *
 * @return {*}
 * @constructor
 */
function TexasRanger(path) {
    this._path = (typeof path === 'string') ? path : '';
    /**
     * Initialize delegate properties on any instance to make these properties immediately dereferenceable.
     */
    this._fileDelegate = null;
    this._directoryDelegate = null;
    this._blockDeviceDelegate = null;
    this._characterDeviceDelegate = null;
    this._symbolicLinkDelegate = null;
    this._fifoDelegate = null;
    this._socketDelegate = null;
    /**
     * Verbose.
     */
    return this;
}

/**
 * Accessor method to allow for the setting of the path of the TexasRanger.
 *
 * @param path is a String instance representing the path of origin to start walking.
 *
 * @return {*}
 */
TexasRanger.method('setPath', function (path) {
    this._path = (typeof path === 'string') ? path : '';
    return this;
});

/**
 * Accessor method to allow for the setting of the optional delegate.
 *
 * @param delegate should be a first-class Function Object that accepts one parameter representative of the path of the
 * file the Walker, Texas Ranger is currently iterating over.
 *
 * @return {*}
 */
TexasRanger.method('setFileDelegate', function (delegate) {
    this._fileDelegate = (typeof delegate === 'function') ? delegate : null;
    return this;
});

/**
 * Accessor method to allow for the setting of the optional delegate.
 *
 * @param delegate should be a first-class Function Object that accepts one parameter representative of the path of the
 * file the Walker, Texas Ranger is currently iterating over.
 *
 * @return {*}
 */
TexasRanger.method('setDirectoryDelegate', function (delegate) {
    this._directoryDelegate = (typeof delegate === 'function') ? delegate : null;
    return this;
});

/**
 * Accessor method to allow for the setting of the optional delegate.
 *
 * @param delegate should be a first-class Function Object that accepts one parameter representative of the path of the
 * file the Walker, Texas Ranger is currently iterating over.
 *
 * @return {*}
 */
TexasRanger.method('setBlockDeviceDelegate', function (delegate) {
    this._blockDeviceDelegate = (typeof delegate === 'function') ? delegate : null;
    return this;
});

/**
 * Accessor method to allow for the setting of the optional delegate.
 *
 * @param delegate should be a first-class Function Object that accepts one parameter representative of the path of the
 * file the Walker, Texas Ranger is currently iterating over.
 *
 * @return {*}
 */
TexasRanger.method('setCharacterDeviceDelegate', function (delegate) {
    this._characterDeviceDelegate = (typeof delegate === 'function') ? delegate : null;
    return this;
});

/**
 * Accessor method to allow for the setting of the optional delegate.
 *
 * @param delegate should be a first-class Function Object that accepts one parameter representative of the path of the
 * file the Walker, Texas Ranger is currently iterating over.
 *
 * @return {*}
 */
TexasRanger.method('setSymbolicLinkDelegate', function (delegate) {
    this._symbolicLinkDelegate = (typeof delegate === 'function') ? delegate : null;
    return this;
});

/**
 * Accessor method to allow for the setting of the optional delegate.
 *
 * @param delegate should be a first-class Function Object that accepts one parameter representative of the path of the
 * file the Walker, Texas Ranger is currently iterating over.
 *
 * @return {*}
 */
TexasRanger.method('setFifoDelegate', function (delegate) {
    this._fifoDelegate = (typeof delegate === 'function') ? delegate : null;
    return this;
});

/**
 * Accessor method to allow for the setting of the optional delegate.
 *
 * @param delegate should be a first-class Function Object that accepts one parameter representative of the path of the
 * file the Walker, Texas Ranger is currently iterating over.
 *
 * @return {*}
 */
TexasRanger.method('setSocketDelegate', function (delegate) {
    this._socketDelegate = (typeof delegate === 'function') ? delegate : null;
    return this;
});

/**
 * This method allows you to attempt to walk the path specified in the TexasRanger instance asynchronously.
 */
TexasRanger.method('walk', function walk() {
    /**
     * Get a stack frame reference to the path specified in the current instance.
     */
    var path = this._path;
    console.log('You need to learn to crawl before you can walk the: ' + path);
});

/**
 * This method allows you to attempt to walk the path specified in the TexasRanger instance synchronously.
 * Respective delegates are informed when a complementary file type is being walked over.
 *
 * @param path is a String instance representing the current path in the file tree. This argument is optional, and will
 * only be used if sub-paths exist.
 */
TexasRanger.method('walkSync', function walkSync(path) {
    /**
     * Get a reference to the current path.
     */
    path = (typeof path === 'string') ? path : this._path;

    /**
     * Lexical-scoping bug with Javascript runtime environments.
     */
    var that = this;

    try {
        /**
         * Attempt to get the file status of the specified path if it exists.
         * If the path exists, then the status Object is returned. Else, an error is thrown.
         *
         * Also, dereference every field reference to a delegate callback function.
         * If there is a delegate callback function associated with a field, then that Function Object reference is
         * set. Else, null can be expected explicitly. In other words, truthy and falsy checks can be done.
         */
        var stat = fs.lstatSync(path),
            fileDelegate = this._fileDelegate,
            directoryDelegate = this._directoryDelegate,
            blockDeviceDelegate = this._blockDeviceDelegate,
            characterDeviceDelegate = this._characterDeviceDelegate,
            symbolicLinkDelegate = this._symbolicLinkDelegate,
            fifoDelegate = this._fifoDelegate,
            socketDelegate = this._socketDelegate;

        /**
         * If the status Object returned any of the acknowledged file types, then drop into the conditional.
         *
         * For every case:
         *
         * If the delegate was null, then do nothing.
         * Else, invoke the delegate callback function with the respective path.
         *
         * A Function Object or null can be expected explicitly.
         */
        if (stat.isFile()) {
            if (!!fileDelegate) {
                fileDelegate(path);
            }
        } else if (stat.isDirectory()) {
            if (!!directoryDelegate) {
                directoryDelegate(path);
            }
            try {
                /**
                 * If the attempt to read the directory does not throw an error, then it will return an Array instance.
                 * If an Array instance is returned successfully, the recursively call walkSync on each sub path in the
                 * Array instance.
                 */
                var subpaths = fs.readdirSync(path);
                subpaths.forEach(function (subpath) {
                    /**
                     * dir.sep allows for platform-agnostic path separators.
                     */
                    walkSync.call(that, path + dir.sep + subpath);
                });
            } catch (e) {
                console.log('The path, ' + path + ', DOES exist, and cannot be walked.');
                return;
            }
        } else if (stat.isBlockDevice()) {
            if (!!blockDeviceDelegate) {
                blockDeviceDelegate(path);
            }
        } else if (stat.isCharacterDevice()) {
            if (!!characterDeviceDelegate) {
                characterDeviceDelegate(path);
            }
        } else if (stat.isSymbolicLink()) {
            if (!!symbolicLinkDelegate) {
                symbolicLinkDelegate(path);
            }
        } else if (stat.isFIFO()) {
            if (!!fifoDelegate) {
                fifoDelegate(path);
            }
        } else if (stat.isSocket()) {
            if (!!socketDelegate) {
                socketDelegate(path);
            }
        }
    } catch (e) {
        console.log('The path, ' + path + ', DOES NOT exist, and cannot be walked.');
        return;
    }
});

/**
 * Convenience method to enforce safe method invocations without the use of the new operator.
 * @return {TexasRanger}
 */
function ranger(path) {
    return new TexasRanger(path);
}

/**
 * Convenience method to allow for type checking outside of the scope of this module.
 * @param object is a reference to an object you would like to test the prototypal inheritance chain on.
 * @return {Boolean}
 */
ranger.isPrototypeOf = function (object) {
    return object instanceof TexasRanger;
};

/**
 * Temporary unit testing.
 */
(function () {
    /**
     * @type {TexasRanger}
     */
    var walker = ranger(),
        /**
         * Nonexistent, directory, file, symbolic link, pipe, character device, block device, socket.
         */
            paths = ['../nonexistent', './test', './index.js', './sl', './pipe', '/dev/null', '/dev/disk0', '/tmp/launch-8m5d5k/ServiceProcessSocket', '../afford/api'],
        testWalking = function () {
            try {
                for (var path in paths) {
                    console.log('[START]');
                    walker.setPath(paths[path]);
                    walker.walkSync();
                    console.log('[END]');
                }
            } catch (e) {
                console.log(e);
            }
        };

    testWalking();
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
    testWalking();
})();

module.exports = exports = ranger;
