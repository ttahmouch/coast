#!/usr/bin/env node

/**
 * Falsy Values: false, 0, "", null, undefined, NaN
 * Command Line Usage (Local):  node [path/to/]index.js
 * Command Line Usage (Global): coast
 */

/**
 * Walk a file system directory, and callback at every file.
 *
 * @param dir {String} representing a file system directory.
 * @example "/"
 * @param callback {Function} with a single 'file' path argument.
 * @example function (file) { var name = require('path').basename(file); }
 * @return {Undefined}
 */
function walkDirByFileSync(dir, callback) {
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
                        walkDirByFileSync(path.join(dir, sub), callback);
                    });
                } catch (error) {
                    console.error(new Date().toUTCString() + ' caughtException:', error.message);
                    console.error(error.stack);
                }
            }
        } catch (error) {
            console.error(new Date().toUTCString() + ' caughtException:', error.message);
            console.error(error.stack);
        }
    }
}

/**
 * Walk a file system directory, and require file by name.
 *
 * @param dir {String} representing a file system directory.
 * @example "/"
 * @param name {String} representing the name of the file.
 * @example "name.js"
 * @return {Object}
 * @example module.exports
 * @example null
 */
function requireFileByName(dir, name) {
    var handler = null;
    if (typeof dir === 'string' && typeof name === 'string') {
        walkDirByFileSync(dir, function (file) {
            var path = require('path');
            if (path.basename(file) === name) {
                try {
                    handler = require(file);
                } catch (error) {
                    handler = null;
                }
            }
        });
    }
    return handler;
}

/**
 * Look for api.json in cwd.
 */
var lostFile = true;

walkDirByFileSync(process.cwd(), function (file) {
    var path = require('path');
    if (path.basename(file) === 'api.json') {
        /**
         * Found api.json in cwd.
         * Require Hypermedia as a module to use exported middleware in a server.
         * Read and minify Hypermedia as a text file to use exported client in a browser.
         */
        var fs = require('fs'),
            hypermedia = require('hypermedia'),
            uglify = require('uglify-js'),
            clientPath = require.resolve('hypermedia'),
            readClient = fs.readFileSync(clientPath, 'utf-8'),
            miniClient = uglify.minify(clientPath).code,
            api = hypermedia.Api.createFromFile(file);

        lostFile = false;

        if (api.protocol === 'http') {
            var express = require('express'),
                app = express(),
                lostMiddleware = [];

            /**
             * Default API route handler that acknowledges requests with a 200 OK.
             *
             * @param req {IncomingMessage} object created by http.Server.
             * @see http://nodejs.org/api/http.html#http_http_incomingmessage
             * @param res {ServerResponse} object created by http.Server.
             * @see http://nodejs.org/api/http.html#http_class_http_serverresponse
             * @param next {Function} middleware in the pipeline.
             * @return {Undefined}
             */
            function defaultApi(req, res, next) {
                res.statusCode = 200;
                return next();
            }

            /**
             * Default middleware handler that does nothing.
             *
             * @param req {IncomingMessage} object created by http.Server.
             * @see http://nodejs.org/api/http.html#http_http_incomingmessage
             * @param res {ServerResponse} object created by http.Server.
             * @see http://nodejs.org/api/http.html#http_class_http_serverresponse
             * @param next {Function} middleware in the pipeline.
             * @return {Undefined}
             */
            function defaultMid(req, res, next) {
                return next();
            }

            /**
             * Create API with middleware/route stack:
             * 1. Incoming Message CORS Middleware (Creates req.cors based on http.IncomingMessage.)
             * 2. a. Client User Agent API (Returns API client from GET /ua.)
             *    b. Custom api.json Middleware/APIs
             * 3. Outgoing Message Body Middleware (Modifies res.body to String.)
             * 4. Outgoing Message Hypermedia Middleware (Modifies res.body based on res.hype.)
             * 5. Outgoing Message CORS Middleware (Modifies http.ServerResponse based on req.cors.)
             * 6. Outgoing Message Final Middleware (Sends final res.body to client.)
             */
            app
                .disable('x-powered-by')
                .use(function (req, res, next) {
                    api.incomingMessageCors(req, res);
                    return next();
                })
                .get('/ua', function (req, res, next) {
                    res.statusCode = 200;
                    res.setHeader('content-type', 'application/javascript');
                    res.body = api.debug ? readClient : miniClient;
                    return next();
                });

            /**
             * Look for [routine.id].js in cwd.
             * Use custom middleware and APIs when found; default, otherwise.
             */
            api.each(function (routine, type) {
                var handler = requireFileByName(process.cwd(), routine.id + '.js'),
                    lostFile = typeof handler !== 'function';
                if (lostFile) {
                    lostMiddleware.push(routine.id);
                }
                if (type === 'mid') {
                    app.use(lostFile ? defaultMid : handler);
                }
                if (type === 'api') {
                    app[routine.method.toLowerCase()](routine.uri, lostFile ? defaultApi : handler);
                }
            });

            if (lostMiddleware.length > 0) {
                console.log('A handler file was not found for ' + lostMiddleware.join(', ') + '.');
            }

            app
                .use(function (req, res, next) {
                    api.outgoingMessageBody(req, res);
                    return next();
                })
                .use(function (req, res, next) {
                    api.outgoingMessageHypermedia(req, res);
                    return next();
                })
                .use(function (req, res, next) {
                    api.outgoingMessageCors(req, res);
                    return next();
                })
                .use(function (req, res) {
                    api.outgoingMessageFinal(req, res);
                })
                .listen(api.port, api.hostname, function () {
                    console.log('A server is accepting connections on ' + api.hostname + ':' + api.port + '.');
                });
        } else {
            console.log('A transfer protocol other than HTTP is not currently supported in api.json.');
        }
    }
});

if (lostFile) {
    console.log('A file called api.json was not found within the current working directory.');
}
