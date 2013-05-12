#!/usr/bin/env node

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
 * A protocol agnostic method that could potentially be invoked on a resource of a Restful API. This could be a method
 * defined in various RFC documents. An example for this would be HTTP's GET, POST, PUT, DELETE, OPTIONS, TRACE, ...
 *
 * @param jsonObjectOrMethodString can be:
 *
 * - any protocol-agnostic, Method String.
 *
 * - a parsed JSON Object instance representing a Method instance.
 *
 * @param arguments is a String representing the Media Type the Method would accept as a payload. For example,
 * in HTTP this would be the Media Type specified with the Content-Type header. No validation is done to make sure
 * this is a legal MIME syntax.
 *
 * @param returns is an Array of status code integers. For example, in HTTP this could look like [200, 400, 500].
 * No validation is done to make sure this Array contains integers. However, an Array check is done.
 *
 * @return {*}
 * @constructor
 */
function Method(jsonObjectOrMethodString, arguments, returns) {
    this._id = 'method';
    this._arguments = (typeof arguments === 'string') ? arguments : '';
    this._returns = Array.isArray(returns) ? returns : [200];
    this._method = (typeof jsonObjectOrMethodString === 'string') ? jsonObjectOrMethodString : '';

    /**
     * If we are instantiating from a parsed JSON Object, then set all the fields directly since everything is
     * primitive and not constructed.
     */
    if (typeof jsonObjectOrMethodString === 'object') {
        /**
         * Get a reference to the arguments Media Type String.
         * @type {String}
         */
        this._arguments = jsonObjectOrMethodString._arguments;
        /**
         * Get a reference to the statuc codes Array.
         * @type {Array}
         */
        this._returns = jsonObjectOrMethodString._returns;
        /**
         * Get a reference to the Method String.
         * @type {String}
         */
        this._method = jsonObjectOrMethodString._method;
    }
    return this;
}

/**
 * Convenience method to enforce safe method invocations without the use of the new operator.
 *
 * @param jsonObjectOrMethodString can be:
 *
 * - any protocol-agnostic, Method String.
 *
 * - a parsed JSON Object instance representing a Method instance.
 *
 * @param arguments is a String representing the Media Type the Method would accept as a payload. For example,
 * in HTTP this would be the Media Type specified with the Content-Type header. No validation is done to make sure
 * this is a legal MIME syntax.
 *
 * @param returns is an Array of status code integers. For example, in HTTP this could look like [200, 400, 500].
 * No validation is done to make sure this Array contains integers. However, an Array check is done.
 *
 * @return {Method}
 */
function method(jsonObjectOrMethodString, arguments, returns) {
    return new Method(jsonObjectOrMethodString, arguments, returns);
}

/**
 * A resource on any web API should be identifiable by it's URI whether it be a template or explicit.
 *
 * @param jsonObjectOrUriString can be:
 *
 * - any String contained in the ABNF grammar specified in
 * [RFC 3986 - Uniform Resource Identifier (URI): Generic Syntax] or [RFC 6570 - URI Template]. No validation or
 * type-checking of any kind is done. I leave it up to you. Godspeed.
 *
 * - a parsed JSON Object instance representing a Resource instance.
 *
 * @return {*}
 * @constructor
 */
function Resource(jsonObjectOrUriString) {
    /**
     * This field should normally just be inherited prototypally, but when serializing an instance of this Constructor
     * to JSON the field would be missed because JSON serialization doesn't traverse the inheritance ladder.
     */
    this._id = 'resource';
    this._methods = [];
    this._uri = (typeof jsonObjectOrUriString === 'string') ? jsonObjectOrUriString : '';

    /**
     * If we are instantiating from a parsed JSON Object, then set the Uri from the object and
     * traverse the methods Array to make Method instances.
     */
    if (typeof jsonObjectOrUriString === 'object') {
        /**
         * Get a reference to the methods Array.
         * @type {Array}
         */
        var methods = jsonObjectOrUriString._methods;

        /**
         * Get a reference to the Uri String.
         * @type {String}
         */
        this._uri = jsonObjectOrUriString._uri;

        /**
         * Traverse the methods Array using fast enumeration.
         * Instantiate Method instances from the JSON Objects.
         * Put the Method instances in the Methods collection.
         */
        for (var met in methods) {
            met = methods[met];
            this.putMethod(method(met));
        }
    }
    return this;
}

/**
 * putMethod allows you to push a Method instance onto the Method Array. It treats it as an idempotent, PUT
 * operation. That means if the Method does not exist already (verified by method), it is created, otherwise it is
 * replaced.
 *
 * @param method is an instance of a Method
 * @return {*}
 */
Resource.method('putMethod', function (method) {
    /**
     * If method exists, update it.
     * Else, create it.
     */
    if (method instanceof Method) {
        var methods = this._methods,
            exists = false;
        /**
         * Iterate over the entire Method Array
         */
        for (var met in methods) {
            /**
             * Dereference each Method by index, and compare the Method argument passed.
             * If a match is found, flag that it exists, update the Method,
             * and break the iteration.
             */
            if (methods[met]._method === method._method) {
                /**
                 * Update it.
                 */
                exists = true;
                methods[met] = method;
                break;
            }
        }
        /**
         * If it did not exist, push the instance of the Method passed in onto the methods array.
         */
        if (!exists) {
            /**
             * Create it.
             */
            methods.push(method);
        }
    }
    /**
     * Allows chained PUT operations.
     */
    return this;
});

/**
 * getMethod allows you to retrieve a Method from the Method Array. It treats it as an idempotent, GET
 * operation. This means that if the Method exists by method String, it is returned, else null is returned.
 *
 * @param method is a method String representing the protocol method that the Method instance encapsulates.
 * @return {Method} or null.
 */
Resource.method('getMethod', function (method) {
    /**
     * If method exists, retrieve it.
     * Else, do nothing.
     */
    if (typeof method === 'string') {
        var methods = this._methods;
        /**
         * Iterate over the entire Method Array
         */
        for (var met in methods) {
            /**
             * Dereference each Method by index, and compare the method String argument passed.
             * If a match is found, immediately return the Method reference.
             */
            if (methods[met]._method === method) {
                /**
                 * Retrieve it.
                 */
                return methods[met];
            }
        }
    }
    /**
     * No method was found that matched the method string.
     */
    return null;
});

/**
 * deleteMethod allows you to delete a Method from the Method Array. It treats it as an idempotent, DELETE
 * operation. This means that if the Method exists, it is deleted, else nothing happens.
 *
 * @param method is a method String representing the protocol method that the Method instance encapsulates.
 * @return {*}
 */
Resource.method('deleteMethod', function (method) {
    /**
     * If method exists, delete it.
     * Else, do nothing.
     */
    if (typeof method === 'string') {
        var methods = this._methods;
        /**
         * Iterate over the entire Method Array
         */
        for (var met in methods) {
            /**
             * Dereference each Method by index, and compare the method String argument passed.
             * If a match is found, immediately delete the Method reference.
             */
            if (methods[met]._method === method) {
                /**
                 * Delete it.
                 */
                methods.splice(met, 1);
                break;
            }
        }
    }
    /**
     * Allows chained DELETE operations.
     */
    return this;
});

/**
 * Convenience method to enforce safe method invocations without the use of the new operator.
 * @param jsonObjectOrUriString can be:
 *
 * - any String contained in the ABNF grammar specified in
 * [RFC 3986 - Uniform Resource Identifier (URI): Generic Syntax] or [RFC 6570 - URI Template]. No validation or
 * type-checking of any kind is done. I leave it up to you. Godspeed.
 *
 * - a parsed JSON Object instance representing a Resource instance.
 * @return {Resource}
 */
function resource(jsonObjectOrUriString) {
    return new Resource(jsonObjectOrUriString);
}

/**
 * A collection of Resources that make up a web API.
 * @param jsonObject should be a parsed JSON Object instance representing a Resources instance.
 * @return {*}
 * @constructor
 */
function Resources(jsonObject) {
    /**
     * This field should normally just be inherited prototypally, but when serializing an instance of this Constructor
     * to JSON the field would be missed because JSON serialization doesn't traverse the inheritance ladder.
     */
    this._id = 'resources';
    this._resources = [];

    /**
     * If we are instantiating from a parsed JSON Object, then traverse the resources Array to make Resource instances.
     */
    if (typeof jsonObject === 'object') {
        /**
         * Get a reference to the resources Array.
         * @type {Array}
         */
        var resources = jsonObject._resources;

        /**
         * Traverse the resources Array using fast enumeration.
         * Instantiate Resource instances from the JSON Objects.
         * Put the Resource instances in the Resources collection.
         */
        for (var res in resources) {
            res = resources[res];
            this.putResource(resource(res));
        }
    }
    return this;
}

/**
 * putResource allows you to push a Resource instance onto the Resources Array. It treats it as an idempotent, PUT
 * operation. That means if the resource does not exist already (verified by Uri), it is created, otherwise it is
 * replaced.
 *
 * @param resource is an instance of a Resource
 * @return {*}
 */
Resources.method('putResource', function (resource) {
    /**
     * If resource exists, update it.
     * Else, create it.
     */
    if (resource instanceof Resource) {
        var resources = this._resources,
            exists = false;
        /**
         * Iterate over the entire resources array
         */
        for (var res in resources) {
            /**
             * Dereference each resource by index and compare the Resource argument passed in.
             * If a match is found, flag that it exists, update the resource with the Resource argument passed,
             * and break the iteration.
             */
            if (resources[res]._uri === resource._uri) {
                /**
                 * Update it.
                 */
                exists = true;
                resources[res] = resource;
                break;
            }
        }
        /**
         * If it did not exist, push the new Resource instance passed in as an argument onto the Resources Array.
         */
        if (!exists) {
            /**
             * Create it.
             */
            resources.push(resource);
        }
    }
    /**
     * Allows chained PUT operations.
     */
    return this;
});

/**
 * getResource allows you to retrieve a resource from the Resources Array. It treats it as an idempotent, GET
 * operation. This means that if the Resource exists by Uri, it is returned, else null is returned.
 *
 * @param uri is a Uri String representing within the Resource instance.
 * @return {Resource} or null.
 */
Resources.method('getResource', function (uri) {
    /**
     * If resource exists, retrieve it.
     * Else, do nothing.
     */
    if (typeof uri === 'string') {
        var resources = this._resources;
        /**
         * Iterate over the entire resources array
         */
        for (var res in resources) {
            /**
             * Dereference each resource by index and compare the uri String passed in with each resources uri.
             * If a match is found, immediately return the resource reference.
             */
            if (resources[res]._uri === uri) {
                /**
                 * Retrieve it.
                 */
                return resources[res];
            }
        }
    }
    /**
     * No resource was found that matched the Uri.
     */
    return null;
});

/**
 * deleteResource allows you to delete a resource from the Resources Array. It treats it as an idempotent, DELETE
 * operation. This means that if the Resource exists, it is deleted, else nothing happens.
 *
 * @param uri is a Uri String representing within the Resource instance.
 * @return {*}
 */
Resources.method('deleteResource', function (uri) {
    /**
     * If resource exists, delete it.
     * Else, do nothing.
     */
    if (typeof uri === 'string') {
        var resources = this._resources;
        /**
         * Iterate over the entire resources array
         */
        for (var res in resources) {
            /**
             * Dereference each resource by index and compare the uri String passed in with each resources uri.
             * If a match is found, immediately delete the resource reference.
             */
            if (resources[res]._uri === uri) {
                /**
                 * Delete it.
                 */
                resources.splice(res, 1);
                break;
            }
        }
    }
    /**
     * Allows chained DELETE operations.
     */
    return this;
});

/**
 * getUris allows you to retrieve an Array of all Uris defined within your API specification. The Uris
 * are in String representation. If no resources exist, then an empty Array will be returned.
 *
 * @return Array of Uri strings
 */
Resources.method('getUris', function () {
    var resources = this._resources,
        uris = [];
    /**
     * Iterate over the entire resources array
     */
    for (var res in resources) {
        /**
         * Dereference each resource by index and push the Uri onto the new uris Array.
         */
        uris.push(resources[res]._uri);
    }
    return uris;
});

/**
 * Convenience method to enforce safe method invocations without the use of the new operator.
 * @param jsonObject should be a parsed JSON Object instance representing a Resources instance.
 * @return {Resources}
 */
function resources(jsonObject) {
    return new Resources(jsonObject);
}

/**
 * RFC 3986 - URI Generic Syntax
 * uriRegExp = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
 */

/**
 * Proposed example usages prior to implementation:
 *
 * afd gen
 * afd put {resource}
 * afd get {resource}
 * afd del {resource}
 * afd gen {resource}
 * afd put {resource} {method}
 * afd get {resource} {method}
 * afd del {resource} {method}
 * afd gen {resource} {method}
 * afd put {resource} {method} {return}
 * afd get {resource} {method} {return}
 * afd del {resource} {method} {return}
 * afd put {resource} {method} {argument}
 * afd get {resource} {method} {argument}
 * afd del {resource} {method} {argument}
 */

/**
 * Module dependencies.
 */

var program = require('commander'),
    fs = require('fs'),
    xhn = require('../xhn');

/**
 * Check if the serialized API specification file already exists (synchronously).
 * If it exists, then parse its JSON content to a live object (synchronously).
 * Else, create a new Resources instance representing the API specification.
 */
var path = './api.json',
    api = resources((fs.existsSync(path)) ? JSON.parse(fs.readFileSync(path, 'utf8')) : undefined),
    commands = ['del', 'gen', 'get', 'put'];

/**
 * Consider more strict argument validation later, if possible.
 * Consider more flexible argument list order later, if possible.
 */
program
    .command('put [res] [met] [ret] [arg]')
    .description('Create or Update a Resource, Method, Media Type, or Status Codes within your API specification.')
    .action(function (res, met, ret, arg) {
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
                } catch (e) {
                    console.log('A valid, comma-delimited set of integers must be entered for the status codes. ' +
                        'An example: 200,300,400,500');
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

program
    .command('gen [res] [met] [ret]')
    .description('Generate a hypermedia response for every possible request outcome in your API specification.')
    .action(function (res, met, ret) {
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
                    console.log('Gen was invoked with three arguments. Generate the method\'s specific status codes.');
                } catch (e) {
                    console.log('A valid, comma-delimited set of integers must be entered for the status codes. ' +
                        'An example: 200,300,400,500');
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
                met = res.getMethod(met);
                console.log('Gen was invoked with two arguments. Generate the whole method.');
            } else {
                console.log('A valid, existent resource from your API should be entered. An example: /uri');
            }
        } else if (!!res) {
            console.log('Gen was invoked with one argument. Generate the whole resource.');
        } else {
            console.log('Gen was invoked with no arguments. Generate the whole API.');
        }
    });

program
    .command('test')
    .description('Unit Tests.')
    .action(function () {
        /**
         * Create an instance of Resources and attempt putting various resource URIs
         * including duplicates to verify they are overwritten.
         */
        console.log('Creating a Resources instance and PUTing various Resource instances to it.');
        var testResources =
            resources()
                .putResource(resource())
                .putResource(
                resource('/')
                    .putMethod(method())
                    .putMethod(method('GET'))
                    .putMethod(method('POST'))
                    .putMethod(method())
                    .putMethod(method('GET'))
                    .putMethod(method('POST')))
                .putResource(resource('/users'))
                .putResource(resource('/merchants'))
                .putResource(resource('/venues'))
                .putResource(resource('/users/{user}'))
                .putResource(resource('/merchants/{merchant}'))
                .putResource(resource('/venues/{venue}'))
                .putResource(
                resource('/')
                    .putMethod(method())
                    .putMethod(method('GET'))
                    .putMethod(method('POST'))
                    .putMethod(method())
                    .putMethod(method('GET'))
                    .putMethod(method('POST')))
                .putResource(resource('/users'))
                .putResource(resource('/merchants'))
                .putResource(resource('/venues'))
                .putResource(resource('/users/{user}'))
                .putResource(resource('/merchants/{merchant}'))
                .putResource(resource('/venues/{venue}'))
                .putResource(resource('/craves/{crave}'));

        /**
         * Log the instance of all API Resources, and proceed with an attmept to log references to each individual resource
         * including one we know does not exist.
         */
        console.log('Logging the Resources instance after all the idempotent PUT operations were conducted.');
        console.log(JSON.stringify(testResources, null, '  '));
        console.log('Logging various Resource instances.');
        console.log(JSON.stringify(testResources.getResource(''), null, '  '));
        console.log(JSON.stringify(testResources.getResource('/'), null, '  '));
        console.log(JSON.stringify(testResources.getResource('/users'), null, '  '));
        console.log(JSON.stringify(testResources.getResource('/merchants'), null, '  '));
        console.log(JSON.stringify(testResources.getResource('/venues'), null, '  '));
        console.log(JSON.stringify(testResources.getResource('/users/{user}'), null, '  '));
        console.log(JSON.stringify(testResources.getResource('/merchants/{merchant}'), null, '  '));
        console.log(JSON.stringify(testResources.getResource('/venues/{venue}'), null, '  '));
        console.log(JSON.stringify(testResources.getResource('/craves/{crave}'), null, '  '));
        console.log(JSON.stringify(testResources.getResource('/venues/{venu}'), null, '  '));

        /**
         * Attempt to retrieve the various methods that exist in the entry point resource.
         */
        console.log('Logging the retrieved methods from the entry point resource.')
        console.log(JSON.stringify(testResources.getResource('/').getMethod(''), null, '  '));
        console.log(JSON.stringify(testResources.getResource('/').getMethod('GET'), null, '  '));
        console.log(JSON.stringify(testResources.getResource('/').getMethod('POST'), null, '  '));

        /**
         * Attempt the deletion of all resources including the same resource we already know does not exist.
         */
        console.log('Logging the Resources instance after an attempted deletion of every created Resource.');
        console.log(JSON.stringify(testResources
            .deleteResource('')
            .deleteResource('/')
            .deleteResource('/users')
            .deleteResource('/merchants')
            .deleteResource('/venues')
            .deleteResource('/users/{user}')
            .deleteResource('/merchants/{merchant}')
            .deleteResource('/venues/{venue}')
            .deleteResource('/craves/{crave}')
            .deleteResource('/venues/{venu}'), null, '  '));
    });

program
    .version('0.0.1')
    .parse(process.argv);

/**
 * Regardless of the success of a command invocation, serialize the contents of the Resources instance to the JSON file.
 */
fs.writeFileSync(path, JSON.stringify(api, null, '    '));
