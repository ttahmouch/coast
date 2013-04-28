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
 * @param method is the method representation in a String format.
 * @return {*}
 * @constructor
 */
function Method(method) {
    this._id = 'method';
    this._method = (typeof method === 'string') ? method : '';
    this._arguments = '';
    this._returns = [200];
    return this;
}

/**
 * Convenience method to enforce safe method invocations without the use of the new operator.
 * @param method is the method representation in a String format.
 * @return {Method}
 */
function method(method) {
    return new Method(method);
}

/**
 * A resource on any web API should be identifiable by it's URI whether it be a template or explicit.
 *
 * @param uri should be any String instance contained in the ABNF grammar specified in [RFC 3986]. No validation or
 * type-checking of any kind is done. I leave it up to you. Godspeed.
 *
 * Current URI: http://tools.ietf.org/html/rfc3986#appendix-A
 *
 * @return {*}
 * @constructor
 */
function Resource(uri) {
    /**
     * This field should normally just be inherited prototypally, but when serializing an instance of this Constructor
     * to JSON the field would be missed because JSON serialization doesn't traverse the inheritance ladder.
     */
    this._id = 'resource';
    this._uri = (typeof uri === 'string') ? uri : '';
    /**
     * A collection of Methods the resource will respond to if invoked. Method is a defined Constructor Function.
     */
    this._methods = [];
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
 * @param uri should be any String instance contained in the ABNF grammar specified in [RFC 3986]. No validation or
 * type-checking of any kind is done. I leave it up to you. Godspeed.
 * @return {Resource}
 */
function resource(uri) {
    return new Resource(uri);
}

/**
 * A collection of Resources that make up a web API.
 * @param resources should be an Array of Resource instances or undefined.
 * @return {*}
 * @constructor
 */
function Resources(resources) {
    /**
     * This field should normally just be inherited prototypally, but when serializing an instance of this Constructor
     * to JSON the field would be missed because JSON serialization doesn't traverse the inheritance ladder.
     */
    this._id = 'resources';
    this._resources = Array.isArray(resources) ? resources : [];
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
 * Convenience method to enforce safe method invocations without the use of the new operator.
 * @param resources should be an Array of Resource instances or undefined.
 * @return {Resources}
 */
function resources(resources) {
    return new Resources(resources);
}

/**
 * Temporary -----------------------------------------------------------------------------------------------------------
 */

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

/**
 * End Temporary -------------------------------------------------------------------------------------------------------
 */

/**
 * RFC 3986 - URI Generic Syntax
 * uriRegExp = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
 */

/**
 * Proposed example usages prior to implementation:
 *
 * afd put {resource}
 * afd get {resource}
 * afd del {resource}
 * afd put {resource} {method}
 * afd get {resource} {method}
 * afd del {resource} {method}
 * afd put {resource} {method} {return}
 * afd get {resource} {method} {return}
 * afd del {resource} {method} {return}
 * afd put {resource} {method} {argument}
 * afd get {resource} {method} {argument}
 * afd del {resource} {method} {argument}
 * afd gen
 * afd gen {resource}
 * afd gen {resource} {method}
 */

/**
 * Module dependencies.
 */

var program = require('commander'),
    fs = require('fs'),
    xhn = require('../xhn');

var api = resources(),
    commands = ['del', 'gen', 'get', 'put'],
    path = './api.json';

/**
 * Check if the file already exists synchronously.
 * If it does exist, then read it and parse its JSON content synchronously.
 * Else, create it with new JSON content representing the initialized API resources.
 */
if (fs.existsSync(path)) {
    api = JSON.parse(fs.readFileSync(path, 'utf8'));
} else {
    fs.writeFileSync(path, JSON.stringify(api, null, '    '));
}

program
    .command('gen [res] [met] [arg]')
    .description('GEN.')
    .action(function (res, met, arg) {
        console.log('Start gen.');
        console.log(res);
        console.log(met);
        console.log(arg);
    });

program
    .command('put [res] [met] [arg]')
    .description('PUT.')
    .action(function (res, met, arg) {
        console.log('Start put.');
        console.log(res);
        console.log(met);
        console.log(arg);
    });

program
    .command('get [res] [met] [arg]')
    .description('GET.')
    .action(function (res, met, arg) {
        console.log('Start get.');
        console.log(res);
        console.log(met);
        console.log(arg);
    });

program
    .command('del [res] [met] [arg]')
    .description('DELETE.')
    .action(function (res, met, arg) {
        console.log('Start del.');
        console.log(res);
        console.log(met);
        console.log(arg);
    });

program
    .version('0.0.1')
    .parse(process.argv);
