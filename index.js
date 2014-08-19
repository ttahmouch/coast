#!/usr/bin/env node

/**
 * Falsy Values: false, 0, "", null, undefined, NaN
 *
 * - Command Line Usage:
 * node index.js --debug --dir=/path/to/api.json/and/handler/subdirectories
 */
(function () {
    /**
     * Module Dependencies.
     * @type {exports}
     */
    var http = require('http'),
        path = require('path'),
        argo = require('argo'),
        router = require('argo-url-router'),
        hypermedia = require('hypermedia'),
        slop = require('slop');

    /**
     * Walks a file system directory, and invokes the callback function at every encountered file.
     *
     * @param dir {string} representing a file system directory.
     * @example "/"
     *
     * @param callback {Function} with a single 'file' path argument.
     * @example
     * function (file) {
     *     var path = require('path'),
     *         name = path.basename(file);
     * }
     *
     * @return {undefined}
     */
    function walkSync(dir, callback) {
        if (typeof dir === 'string' && typeof callback === 'function') {
            try {
                var fs = require('fs'),
                    path = require('path'),
                    stat = fs.lstatSync(dir);
                if (stat.isFile()) {
                    callback(dir);
                } else if (stat.isDirectory()) {
                    try {
                        fs.readdirSync(dir).forEach(function (sub) {
                            walkSync(path.join(dir, sub), callback);
                        });
                    } catch (error) {
                        console.error('The path, ' + dir + ', cannot be walked.');
                    }
                }
            } catch (error) {
                console.error('The path, ' + dir + ', does not exist.');
            }
        }
    }

    /**
     * Walks a file system directory, and looks for Node Javascript files that export a handler function.
     *
     * @param dir {string} representing a file system directory.
     * @example "/"
     *
     * @param id {string} representing the name of the file without the ".js" extension.
     * @example "name"
     *
     * @return {Function} if a handler function was exported; {null}, otherwise.
     */
    function handlerById(dir, id) {
        var handler = null;
        if (typeof id === 'string' && typeof dir === 'string') {
            walkSync(dir, function (file) {
                var path = require('path'),
                    name = path.basename(file, '.js');
                if (name === id) {
                    if (debug) {
                        console.log('The ' + id + '.js directory is ' + file + '.');
                    }
                    try {
                        handler = require(file);
                    } catch (error) {
                        handler = null;
                    }
                }
            });
        }
        return typeof handler === 'function' ? handler : null;
    }

    /**
     * Command Line Options.
     * Dir will resolve a given path, or be the current working directory.
     */
    var opt = slop().parse(process.argv),
        dir = path.resolve(typeof opt.get('dir') === 'string' ? opt.get('dir') : ''),
        debug = opt.has('debug');

    if (debug) {
        console.log('The cwd directory is ' + process.cwd() + '.');
        console.log('The api directory is ' + dir + '.');
    }

    /**
     * HTTP Application Router.
     */
    var app = argo(),
        hapi = {};

    /**
     * Walk the given directory in an attempt to find and parse a file called api.json.
     */
    walkSync(dir, function (file) {
        var name = path.basename(file, '.json');
        if (name === 'api') {
            if (debug) {
                console.log('The api.json directory is ' + file + '.');
            }
            try {
                hapi = require(file);
            } catch (error) {
                hapi = {};
            }
        }
    });

    /**
     * Set up middleware including:
     * - URI route handling
     * - CORS request handling
     * - CORS response handling
     * - Hypermedia response handling
     * - Unhandled Exception handling
     *
     * Order:
     * 1. Request Middleware - Order Added.
     * 2. Request Route
     * 3. Response Route
     * 4. Response Middleware - Order Reversed.
     */
    app
        .use(router)
        .use(function (handle) {
            handle('request', function (env, next) {
                /**
                 * Cross-Origin Request
                 * @see http://www.w3.org/TR/cors
                 * @see http://www.html5rocks.com/static/images/cors_server_flowchart.png
                 */
                hapi.incomingMessageCors(env.request, env.cors = env.cors || {});
                return next(env);
            });
        })
        .use(function (handle) {
            handle('response', function (env, next) {
                /**
                 * Cross-Origin Response
                 * @see http://www.w3.org/TR/cors
                 * @see http://www.html5rocks.com/static/images/cors_server_flowchart.png
                 */
                hapi.serverResponseCors(env.response, env.cors = env.cors || {});
                return next(env);
            });
        })
        .use(function (handle) {
            handle('response', function (env, next) {
                /**
                 * Hypermedia Response
                 */
                hapi.serverResponseNavData(env.response, env.hypermedia);
                return next(env);
            });
        })
        .use(function (handle) {
            handle('error', function (env, error, next) {
                /**
                 * Unhandled Exceptions
                 */
                console.error('The server had an unhandled exception. Exiting the process.');
                console.error(new Date().toUTCString() + ' uncaughtException:', error.message);
                console.error(error.stack);
                env.response.statusCode = 500;
                next(env);
                process.exit(1);
            });
        });

    /**
     * Create a hypermedia.Api from the parsed api.json file.
     * Map middleware and apis defined in the file to the HTTP Application Router.
     */
    hapi = hypermedia.Api.create(hapi);
    hapi
        .eachReqMiddleware(function (m) {
            var handler = handlerById(dir, m.id);
            app.use(function (handle) {
                handle(m.middleware, handler || function (env, next) {
                    if (debug) {
                        console.log('The middleware, ' + m.id + ', needs a handler.');
                    }
                    return next(env);
                });
            });
            if (debug) {
                console.log('The middleware, ' + m.id + ', ' + (handler ? 'has' : 'needs') + ' a handler.');
            }
        })
        .eachApi(function (a) {
            var handler = handlerById(dir, a.id);
            app.route(a.uri, { 'methods': [ a.method ] }, function (handle) {
                handle('request', function (env, next) {
                    env.api = a;
                    if (debug) {
                        console.log('The api, ' + a.id + ', will be used.');
                    }
                    return next(env);
                });
                handle('request', handler || function (env, next) {
                    env.response.statusCode = 200;
                    if (debug) {
                        console.log('The api, ' + a.id + ', needs a handler.');
                    }
                    return next(env);
                });
            });
            if (debug) {
                console.log('The api, ' + a.id + ', ' + (handler ? 'has' : 'needs') + ' a handler.');
            }
        })
        .eachResMiddleware(function (m) {
            var handler = handlerById(dir, m.id);
            app.use(function (handle) {
                handle(m.middleware, handler || function (env, next) {
                    if (debug) {
                        console.log('The middleware, ' + m.id + ', needs a handler.');
                    }
                    return next(env);
                });
            });
            if (debug) {
                console.log('The middleware, ' + m.id + ', ' + (handler ? 'has' : 'needs') + ' a handler.');
            }
        });

    console.log('The server port is ' + hapi.port + '.');
    console.log('The server hostname is ' + hapi.hostname + '.');

    /**
     * Create an HTTP Server with the Application Router.
     */
    http
        .createServer(app.build().run)
        .on('error', function (error) {
            console.error('The server may need root user privileges to start.');
            console.error(new Date().toUTCString() + ' caughtException:', error.message);
            console.error(error.stack);
        })
        .on('listening', function () {
            console.log('The server started.');
        })
        .listen(hapi.port, hapi.hostname);
})();
