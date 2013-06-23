#!/usr/bin/env node

/**
 * Module dependencies.
 */
var program = require('commander'),
    fs = require('fs'),
    path = require('path'),
    common = require('./lib/common.js'),
    xhn = require('../xhn');

/**
 * Safe instantiator methods for the various Constructor types.
 */
var generator = common.generator,
    method = common.method,
    relations = common.relations,
    resource = common.resource,
    resources = common.resources;

/**
 * Platform-agnostic file paths.
 * Get the path delimiter from Node.JS. This helps with differentiation of Windows and Unix path strings.
 * Create the strings necessary to create the api path and the api specification JSON file.
 */
var seperator = path.sep,
    folder = '.' + seperator + 'api' + seperator,
    file = 'api.json';

/**
 * Check if the serialized API specification file already exists (synchronously).
 * If it exists, then parse its JSON content to a live object (synchronously).
 * Else, create a new Resources instance representing the API specification.
 */
var api = resources((fs.existsSync(folder + file)) ? JSON.parse(fs.readFileSync(folder + file, 'utf8')) : undefined),
    affordances = api.getAffordances(true),
    rels = relations(),
    apigen = generator()
        .setAffordances(affordances)
        .setDelegate(function (resource, method, status, affordances) {
            /**
             * Get a stack frame reference to every XHN function we need so we don't have to prefix every
             * invocation with the exports object.
             * @type {Function}
             */
            var json = !!program.json,
                quiet = !program.debug,
                hfactors = xhn.affordances,
                control = xhn.hc,
                stringify = xhn.stringify;

            /**
             * Start cleansing the path names for the current scenario.
             * Convert all arguments passed to lower case strings, and replace all non-word characters with an
             * underscore character.
             * Create the path strings with the platform-agnostic path delimiters.
             * @type {String}
             */
            var nonWordCharacters = /\W+/g,
                underscore = '_',
                statusString = status.toString(),
                methodString = method._method.toString(),
                resourceString = resource._uri.toString(),
                normalizedStatus = statusString.toLowerCase().replace(nonWordCharacters, underscore),
                normalizedMethod = methodString.toLowerCase().replace(nonWordCharacters, underscore),
                normalizedResource = resourceString.toLowerCase().replace(nonWordCharacters, underscore),
                statusPath = folder + normalizedStatus + seperator,
                methodPath = statusPath + normalizedMethod + seperator,
                resourcePath = methodPath + normalizedResource + seperator,
                extension = ((json) ? 'json' : 'xml'),
                file = 'response.' + extension;

            /**
             * Log some information regarding where the file will be saved.
             */
            if (!quiet) {
                console.log('Will save to file: ' + resourcePath + file);
                console.log('Serialization format: ' + extension);
            }

            /**
             * Create a collection of hypermedia controls.
             */
            var hypermedia = hfactors(statusString);

            /**
             * Log some debug information regarding the current affordances available.
             */
            if (!quiet) {
                console.log('Affordances:');
                console.log(affordances);
            }

            function finish() {
                /**
                 * This is intentionally all or nothing. The file and paths should be created successfully together, or
                 * not at all.
                 */
                try {
                    /**
                     * If the API path does not exist, create it. Else, do nothing.
                     */
                    if (!fs.existsSync(folder)) {
                        fs.mkdirSync(folder);
                    }
                    /**
                     * If the status code path does not exist, create it. Else, do nothing.
                     */
                    if (!fs.existsSync(statusPath)) {
                        fs.mkdirSync(statusPath);
                    }
                    /**
                     * If the Method path does not exist, create it. Else, do nothing.
                     */
                    if (!fs.existsSync(methodPath)) {
                        fs.mkdirSync(methodPath);
                    }
                    /**
                     * If the Resource path does not exist, create it. Else, do nothing.
                     */
                    if (!fs.existsSync(resourcePath)) {
                        fs.mkdirSync(resourcePath);
                    }
                    /**
                     * Encode the hypermedia controls using whatever encoder plugin and syntax formatter was chosen with the
                     * CLI flags. The choices right now are: NavAL-JSON and NavAL-XML
                     *
                     * Proceed with saving the string content as a file in the resourcePath.
                     *
                     * These are media types I have created encoder plugins for already. More hypermedia-aware media types
                     * may be feasible down the road.
                     */
                    fs.writeFileSync(resourcePath + file, stringify(hypermedia));
                } catch (e) {
                    console.log('Attempting to create the Affordance file at its default path threw an exception.');
                    console.log(e);
                }

                /**
                 * Proceed to the next scenario if one exists.
                 */
                apigen.generate(quiet);
            }

            function chooseAction() {
                /**
                 * Log the choices to console, and accept user input. No validation needs to be done on user input.
                 * Commander gives us that logic for free.
                 *
                 * This also does not block the main thread. So any further invocations will be event driven by the
                 * user's action.
                 */
                console.log('Please choose an action possibility. Choose done to serialize to disk.');
                program.choose(affordances, function (action) {
                    /**
                     * Action 0 means the user is done selecting action possibilities for the current scenario.
                     * Follow-up with a serialization of the action choices using XHN, save them to disk, and start
                     * generating for the next scenario if there is one.
                     */
                    if (action === 0) {
                        finish();
                    } else {
                        /**
                         * Get a reference to an Affordance instance associated with the index in the Array.
                         */
                        action = affordances[action];

                        /**
                         * Get stack frame references to the values in the Affordance instance for convenience.
                         */
                        var method = action._method,
                            resource = action._resource,
                            arguments = action._arguments;
                        /**
                         * Create an instance of a hypermedia control, and add the instance to the collection.
                         */
                        var hfactor = control();
                        hypermedia.addAffordance(hfactor);
                        /**
                         * Set the relevant metadata of the Affordance instance chosen into the hypermedia control with
                         * the intention of serialization.
                         */
                        hfactor._method = method;
                        hfactor._uri = resource;
                        /**
                         * Eventually, create a CLI flag to denote which major transfer protocol is being used.
                         */
                        /**
                         * If arguments for the Affordance exist, then add them as metadata represented as a transfer
                         * protocol header in the hypermedia control.
                         */
                        if (!!arguments) {
                            hfactor._metadata.addField('Content-Type', arguments);
                        }
                        /**
                         * Log some debug information regarding the current affordance chosen.
                         */
                        if (!quiet) {
                            console.log('You chose: ' + action);
                            console.log('Affordance Method:');
                            console.log(method);
                            console.log('Affordance Resource:');
                            console.log(resource);
                            console.log('Affordance Arguments:');
                            console.log(arguments);
                        }
                        /**
                         * Get the hypermedia control's id and relation from the user since their are context-sensitive.
                         */
                        program.prompt('Enter a link relation: ', function (relation) {
                            hfactor._relation = relation;
                            program.prompt('Enter a link identifier: ', function (id) {
                                hfactor._id = id;
                                /**
                                 * Prompt them to choose another action possibility, or done.
                                 */
                                chooseAction();
                            });
                        });
                    }
                });
            }

            function start() {
                /**
                 * Log the scenario to console. Follow-up with allowing the user to choose an affordance.
                 */
                console.log('Generating: ' + method._method + ' --> ' + resource._uri + ' --> ' + status);
                chooseAction();
            }

            /**
             * Start inquiring.
             */
            start();
        });

/**
 * Consider more strict argument validation later, if possible.
 * Consider more flexible argument list order later, if possible.
 */
program
    .command('put [res] [met]')
    .description('Create or Update a Resource or Method within your API specification.')
    .action(function (res, met) {
        var ret = (typeof program.returns === 'string') ? program.returns : null,
            arg = (typeof program.arguments === 'string') ? program.arguments : null,
            quiet = !program.debug;

        /**
         * Log some debug information regarding the resource, method, arguments and returns options.
         */
        if (!quiet) {
            console.log('Resource:');
            console.log(res);
            console.log('Method:');
            console.log(met);
            console.log('Method arguments:');
            console.log(arg);
            console.log('Method returns:');
            console.log(ret);
        }

        /**
         * If the method string was included as an argument in the command invocation, then a resource must have also
         * been included.
         */
        if (!!met) {
            /**
             * Attempt to query the API for the resource.
             */
            res = api.getResource(res);

            /**
             * If the comma-delimited returns argument was included in the command invocation, then a method must have
             * also been included.
             */
            if (!!ret) {
                try {
                    /**
                     * Attempt to convert the string to an Array.
                     * If the attempted conversion throws an exception, then a proper argument was not included
                     * and we should stop further execution.
                     * Else, the Array was created successfully, and a Method put should be attempted.
                     */
                    ret = JSON.parse('[' + ret + ']');
                    /**
                     * Consider eventually validating that all status codes are numeric. However, this probably
                     * isn't a good idea if the intention is to stay protocol-agnostic.
                     */
                    /**
                     * Trim the array to remove possible, duplicate status code instances.
                     * Filter creates a new array with all elements that pass the test implemented by the provided
                     * function.
                     */
                    ret = ret.filter(function (element, position) {
                        /**
                         * If the first occurrence of the status code represented by this element in the array is not
                         * the status code in the current position, then return false to make sure it's not included in
                         * the new array instance.
                         */
                        /**
                         * IndexOf in this case returns the first occurrence index in the status codes array.
                         */
                        return ret.indexOf(element) === position;
                    });
                } catch (e) {
                    console.log('A valid, comma-delimited set of status codes must be entered for your transfer protocol. ' +
                        'An (HTTP) example: 200,300,400,500');
                    return;
                }
            }

            /**
             * Consider eventually including some Media Type validation to make sure the syntax is correct.
             */

            /**
             * If the resource returned from the query successfully, then attempt the put of the Method.
             */
            if (!!res) {
                /**
                 * Consider eventually validating that the Method is a protocol method. This may be a large task
                 * because multiple, prevalent protocols would need to be supported as to not limit to HTTP.
                 */
                res.putMethod(method(met, arg, ret));
            } else {
                console.log('A valid, existent resource from your API should be entered. An example: /uri');
            }
        } else if (!!res) {
            api.putResource(resource(res));
        }
    });

/**
 * Consider more strict argument validation later, if possible.
 * Consider more flexible argument list order later, if possible.
 */
program
    .command('get [res] [met]')
    .description('Retrieve an existing Resource or Method within your API specification.')
    .action(function (res, met) {
        /**
         * If the method string was included as an argument in the command invocation, then a resource must have also
         * been included.
         */
        if (!!met) {
            /**
             * Attempt to query the API for the resource.
             */
            res = api.getResource(res);

            /**
             * If the resource returned from the query successfully, then attempt to query the Resource for the Method.
             */
            if (!!res) {
                /**
                 * Consider eventually validating that the Method is a protocol method. This may be a large task
                 * because multiple, prevalent protocols would need to be supported as to not limit to HTTP.
                 */
                console.log(JSON.stringify(res.getMethod(met), null, '    '));
            } else {
                console.log('A valid, existent resource from your API should be entered. An example: /uri');
            }
        } else if (!!res) {
            console.log(JSON.stringify(api.getResource(res), null, '    '));
        } else {
            console.log(JSON.stringify(api, null, '    '));
        }
    });

/**
 * Consider more strict argument validation later, if possible.
 * Consider more flexible argument list order later, if possible.
 */
program
    .command('del [res] [met]')
    .description('Delete an existing Resource or Method within your API specification.')
    .action(function (res, met) {
        /**
         * If the method string was included as an argument in the command invocation, then a resource must have also
         * been included.
         */
        if (!!met) {
            /**
             * Attempt to query the API for the resource.
             */
            res = api.getResource(res);

            /**
             * If the resource returned from the query successfully, then attempt to delete the Method
             * from the Resource.
             */
            if (!!res) {
                /**
                 * Consider eventually validating that the Method is a protocol method. This may be a large task
                 * because multiple, prevalent protocols would need to be supported as to not limit to HTTP.
                 */
                res.deleteMethod(met);
            } else {
                console.log('A valid, existent resource from your API should be entered. An example: /uri');
            }
        } else if (!!res) {
            api.deleteResource(res);
        }
    });

/**
 * Consider more strict argument validation later, if possible.
 * Consider more flexible argument list order later, if possible.
 */
program
    .command('gen [res] [met]')
    .description('Generate a hypermedia response for any possible affordance within your API specification.')
    .action(function (res, met) {
        var ret = (typeof program.returns === 'string') ? program.returns : null,
            quiet = !program.debug;
        /**
         * Use the serialization format chosen by the media type flag in the CLI.
         * Use the respective prettifier for the chosen media type serialization format.
         * If no flag is indicated, then fall back to XML serialization format since it's more terse.
         */
        if (!!program.json) {
            xhn.plugin(xhn.NavAL_JSON);
            xhn.prettify('json');
        } else {
            xhn.plugin(xhn.NavAL_XML);
            xhn.prettify('xml');
        }

        /**
         * Use the debug flag present from the CLI to determine whether the serialized affordances are logged to
         * console.
         */
        xhn.quiet(quiet);

        /**
         * Log some debug information regarding the resource, method, and returns options.
         */
        if (!quiet) {
            console.log('Resource:');
            console.log(res);
            console.log('Method:');
            console.log(met);
            console.log('Method returns:');
            console.log(ret);
        }

        /**
         * If the method string was included as an argument in the command invocation, then a resource must have also
         * been included.
         */
        if (!!met) {
            /**
             * Attempt to query the API for the resource.
             */
            res = api.getResource(res);

            /**
             * If the comma-delimited returns argument was included in the command invocation, then a method must have
             * also been included.
             */
            if (!!ret) {
                try {
                    /**
                     * Attempt to convert the string to an Array.
                     * If the attempted conversion throws an exception, then a proper argument was not included
                     * and we should stop further execution.
                     * Else, the Array was created successfully, and a hypermedia response generation should be
                     * attempted.
                     */
                    ret = JSON.parse('[' + ret + ']');
                    /**
                     * Consider eventually validating that all status codes are numeric. However, this probably
                     * isn't a good idea if the intention is to stay protocol-agnostic.
                     */
                    /**
                     * Trim the array to remove possible, duplicate status code instances.
                     * Filter creates a new array with all elements that pass the test implemented by the provided
                     * function.
                     */
                    ret = ret.filter(function (element, position) {
                        /**
                         * If the first occurrence of the status code represented by this element in the array is not
                         * the status code in the current position, then return false to make sure it's not included in
                         * the new array instance.
                         */
                        /**
                         * IndexOf in this case returns the first occurrence index in the status codes array.
                         */
                        return ret.indexOf(element) === position;
                    });
                } catch (e) {
                    console.log('A valid, comma-delimited set of status codes must be entered for your transfer protocol. ' +
                        'An (HTTP) example: 200,300,400,500');
                    return;
                }
            }

            /**
             * If the resource returned from the query successfully, then attempt the generation of the hypermedia
             * responses for the whole method or the specified status codes from that method.
             */
            if (!!res) {
                /**
                 * Consider eventually validating that the Method is a protocol method. This may be a large task
                 * because multiple, prevalent protocols would need to be supported as to not limit to HTTP.
                 */
                /**
                 * Attempt to query the Resource for the Method.
                 */
                met = res.getMethod(met);

                if (!!met) {
                    /**
                     * Generate responses for a particular Method specification. This may be more specific with an
                     * array of status codes.
                     */
                    apigen
                        .setResource(res)
                        .setMethod(met)
                        .setStatusCodes(ret)
                        .generate(quiet);
                } else {
                    console.log('A valid, existent method for your resource should be entered. An example: DELETE');
                }
            } else {
                console.log('A valid, existent resource from your API should be entered. An example: /uri');
            }
        } else if (!!res) {
            /**
             * Attempt to query the API for the resource.
             */
            res = api.getResource(res);

            /**
             * If the resource returned from the query successfully, then attempt the generation of the hypermedia
             * responses for all Method and status code combinations under this particular resource.
             */
            if (!!res) {
                /**
                 * Generate responses for a particular Resource specification.
                 */
                apigen
                    .setResource(res)
                    .generate(quiet);
            } else {
                console.log('A valid, existent resource from your API should be entered. An example: /uri');
            }
        } else {
            /**
             * Generate responses for the entire API specification.
             */
            apigen
                .setResources(api)
                .generate(quiet);
        }
    });

program
    .command('ls')
    .description('List all affordances available within your API specification.')
    .action(function () {
        /**
         * Call the list method on the Resources collection, and pass in false explicitly for the quiet flag.
         * The quiet flag indicates whether console logging should occur within the method.
         */
        api.getAffordances(false);
    });

program
    .command('test')
    .description('Unit Tests.')
    .action(function () {
    });

program
    .version('0.0.1')
    .option('-a, --arguments [arg]', 'Use this flag when putting a method to specify a media type argument that method may accept.')
    .option('-d, --debug', 'Use this flag when you would like to see debug logs in the console.')
    .option('-i, --id', 'Use this flag when putting a method to specify a unique identifier for that method.')
    .option('-j, --json', 'Use this flag when generating to ensure the output is json.')
    .option('-r, --returns [ret]', 'Use this flag when putting or generating to specify a comma-separated set of status codes.')
    .option('-x, --xml', 'Use this flag when generating to ensure the output is xml.')
    .parse(process.argv);

/**
 * If the API path does not exist, create it. Else, do nothing.
 */
if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
}

/**
 * Regardless of the success of a command invocation, serialize the contents of the Resources instance to the JSON file.
 */
fs.writeFileSync(folder + file, JSON.stringify(api, null, '    '));
