#!/usr/bin/env node

/**
 * Falsy Values: false, 0, "", null, undefined, NaN
 */

(function () {
    var fs = require('fs'),
        path = require('path'),
        hypermedia = require('hypermedia'),
        slop = require('slop'),
        globalObjects = 'global,process,console,setTimeout,clearTimeout,setInterval,clearInterval,Buffer',
        moduleObjects = 'require,__filename,__dirname,module,exports',
        body = 'var ' + globalObjects + ',' + moduleObjects + ';\r\nreturn ',
        hypermediator = hypermedia.hypermediator,
        plugin = hypermedia.plugin,
        argo = hypermedia.argo;

    /**
     * Process.argv will be an array.
     * Array:
     *  1st element will be 'node'
     *  2nd element will be '/path/to/this/JavaScript/file'
     *  3rd - Nth elements will be additional command line arguments
     *
     * Introspect Node arguments vector for:
     * - path to the hapi dsl file
     * - optional port to begin accepting connections
     * - optional host to begin accepting connections
     * - optional HTTP router library
     *
     * Options.get() values may yield:
     * - {undefined}
     * - {boolean} true
     * - {string} (non-empty)
     *
     * Options.has() values may yield:
     * - {boolean} true
     * - {boolean} false
     */
    var options = slop().parse(process.argv),
        hapi = options.get('hapi'),
        port = options.get('port'),
        host = options.get('host'),
        lib = options.get('lib'),
        debug = options.has('debug');

    if (debug) {
        console.log();
        console.log('-------------------------');
        console.log('Before Hosting Attempt:');
        console.log('Pwd:\r\n' + JSON.stringify(process.cwd()));
        console.log('Hapi:\r\n' + JSON.stringify(hapi));
        console.log('Port:\r\n' + JSON.stringify(port));
        console.log('Host:\r\n' + JSON.stringify(host));
        console.log('Lib:\r\n' + JSON.stringify(lib));
        console.log('-------------------------');
        console.log('During Hosting Attempt:');
    }

    if (typeof hapi === 'string') {
        /**
         * Resolves a relative path to an absolute path.
         *
         * Path.resolve() documentation:
         * PWD (Directory of Node binary execution) is used to resolve.
         * Resulting paths are normalized.
         * Trailing slashes are removed unless the path is '/'.
         */
        hapi = path.resolve(hapi);

        if (debug) {
            console.log('Hapi:\r\n' + JSON.stringify(hapi));
        }

        /**
         * Results:
         * {string} (empty)
         * {string} (non-empty)
         */
        hapi = fs.existsSync(hapi) && fs.statSync(hapi).isFile() ? fs.readFileSync(hapi, 'utf8') : '';

        if (debug) {
            console.log('Input Hapi:\r\n' + JSON.stringify(hapi));
        }

        /**
         * If the string is non-empty,
         * Then attempt to execute it as literal JavaScript dynamically at runtime.
         */
        if (!!hapi) {
            /**
             * Hide all global and module scoped Objects in the execution context to mitigate security issues.
             *
             * Dynamically created Function Objects:
             * - do not create closures to their creation contexts
             * - are created in the global scope
             * - can access their local variables and globals
             * - are marginally safer than eval
             *
             * TODO: Change to higher-level, external Domain Specific Language that can be tokenized.
             */
            try {
                hapi = new Function('hapi', body + hapi)(hypermedia.hapi);
            } catch (e) {
                hapi = null;
                console.log(e);
            }

            /**
             * Only mediate if an instance of HypermediaApi was created above.
             * Library defaults to Argo.
             * Supporting routers like ExpressJS will need new Plugins.
             */
            if (hypermedia.hapi.isPrototypeOf(hapi)) {
                hypermediator(plugin.isPrototypeOf(hypermedia[lib]) ? hypermedia[lib] : argo)
                    .setPort(port)
                    .setHost(host)
                    .mediate(hapi);
            }
        }

        if (debug) {
            console.log('Output Hapi:\r\n' + JSON.stringify(hapi));
        }
    }
})();
