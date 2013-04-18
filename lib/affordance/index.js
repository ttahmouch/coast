#!/usr/bin/env node

Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

/**
 * A collection of Resources that make up a web API.
 * @param resources should be an Array of Resource instances or undefined.
 * @return {*}
 * @constructor
 */
function Resources(resources) {
    this._id = 'resources';
    this._resources = Array.isArray(resources) ? resources : [];
    return this;
}

Resources.method('putResource', function (uri) {
    /**
     * If resource exists, update it.
     * Else, create it.
     */
    if (typeof uri === 'string') {
        var resources = this._resources,
            exists = false;
        /**
         * Iterate over the entire resources array
         */
        for (var res in resources) {
            /**
             * Dereference each resource by index and compare the uri String passed in with each resources uri.
             * If a match is found, flag that it exists, update the resource with a new instance,
             * and break the iteration.
             */
            if (resources[res]._uri === uri) {
                exists = true;
                resources[res] = resource(uri);
                break;
            }
        }
        /**
         * If it did not exist, create a new Resource instance with the passed in uri and push it
         * on the Resources array.
         */
        if (!exists) {
            resources.push(resource(uri));
        }
    }
    return this;
});

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
                return resources[res];
            }
        }
    }
    return null;
});

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
 * Temporary
 */

var testResources = resources()
    .putResource('/')
    .putResource('/users')
    .putResource('/merchants')
    .putResource('/venues')
    .putResource('/users/{user}')
    .putResource('/merchants/{merchant}')
    .putResource('/venues/{venue}')
    .putResource('/')
    .putResource('/users')
    .putResource('/merchants')
    .putResource('/venues')
    .putResource('/users/{user}')
    .putResource('/merchants/{merchant}')
    .putResource('/venues/{venue}')
    .putResource('/craves/{crave}');
console.dir(testResources);
console.dir(testResources.getResource('/'));
console.dir(testResources.getResource('/users'));
console.dir(testResources.getResource('/merchants'));
console.dir(testResources.getResource('/venues'));
console.dir(testResources.getResource('/users/{user}'));
console.dir(testResources.getResource('/merchants/{merchant}'));
console.dir(testResources.getResource('/venues/{venue}'));
console.dir(testResources.getResource('/craves/{crave}'));
console.dir(testResources.getResource('/venues/{venu}'));
console.dir(testResources
    .deleteResource('/')
    .deleteResource('/users')
    .deleteResource('/merchants')
    .deleteResource('/venues')
    .deleteResource('/users/{user}')
    .deleteResource('/merchants/{merchant}')
    .deleteResource('/venues/{venue}')
    .deleteResource('/craves/{crave}'));

/**
 * A resource on any web API should be identifiable by it's URI whether it be a template or explicit.
 *
 * @param uri should be any String instance contained in the ABNF grammar specified in [RFC 3986]. No validation or
 * type-checking of any kind is done. I leave it up to you.
 *
 * Current URI: http://tools.ietf.org/html/rfc3986#appendix-A
 *
 * @return {*}
 * @constructor
 */
function Resource(uri) {
    this._id = 'resource';
    this._uri = uri.toString();
    this._methods = [];
    return this;
}

Resource.method('putMethod', function (method) {
    /**
     * If method exists, update it.
     * Else, create it.
     */
    return this;
});

Resource.method('getMethod', function (method) {
    /**
     * If method exists, retrieve it.
     * Else, do nothing.
     */
    return this;
});

Resource.method('deleteMethod', function (method) {
    /**
     * If method exists, delete it.
     * Else, do nothing.
     */
    return this;
});

/**
 * Convenience method to enforce safe method invocations without the use of the new operator.
 * @param uri
 * @return {Resource}
 */
function resource(uri) {
    return new Resource(uri);
}


function Method(method) {
    this._id = 'method';
    this._method = method.toString();
    this._arguments = '';
    this._returns = [200];
    return this;
}

/**
 * Convenience method to enforce safe method invocations without the use of the new operator.
 * @return {Method}
 */
function method() {
    return new Method();
}

/**
 * Module dependencies.
 */

var program = require('commander'),
    fs = require('fs'),
    xhn = require('../xhn'),
    resources = [],
    resourceCommandOne = 'resource',
    resourceCommandTwo = 'res',
    methodCommandOne = 'method',
    methodCommandTwo = 'met',
    relationCommandOne = 'relation',
    relationCommandTwo = 'rel',
    subcommands = [
        resourceCommandOne,
        resourceCommandTwo,
        methodCommandOne,
        methodCommandTwo,
        relationCommandOne,
        relationCommandTwo
    ],
    /**
     * RFC 3986 - URI Generic Syntax
     */
        uriRegExp = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;

/**
 * Unit test these.
 */

function isSubcommand(command) {
    return (subcommands.lastIndexOf(command) !== -1);
}

function isResourceSubcommand(command) {
    return isSubcommand(command) && (command === resourceCommandOne || command === resourceCommandTwo);
}

function isMethodSubcommand(command) {
    return isSubcommand(command) && (command === methodCommandOne || command === methodCommandTwo);
}

function isResource(uri) {
    for (var resource in resources) {
        resource = resources[resource];
        if (resource._uri === uri) {
            return true;
        }
    }
    return false;
}

/**
 * Finish this.
 */
function isMethod(method) {
    resources.forEach(function (element) {
        element._methods.forEach(function (element) {
            if (element._id === method) {
                exists = true;
            }
        });
    });
    for (var resource in resources) {
        resource = resources[resource];
        if (resource._uri === uri) {
            return true;
        }
    }
    return false;
}

/**
 * If the file already exists, then read the file synchronously in a UTF8 String encoding.
 * Parse the JSON String into an Object, and set the Object to the resources reference.
 * Else, write the existing resources Array to the file as stringified JSON.
 */
if (fs.existsSync('./artifacts/api.json')) {
    resources = JSON.parse(fs.readFileSync('./artifacts/api.json', 'utf8'));
} else {
    fs.writeFileSync('./artifacts/api.json', JSON.stringify(resources, null, ' '));
}

/**
 * Temporary
 */
console.log(isResource('test'));
console.log(isResource('/users/{user}'));

/**
 * Add a resource or method to your Hypermedia API specification.
 */
program
    .command('put [subcommand] [argumentOne]')
    .description('Add a resource or method to your Hypermedia API specification.')
    .action(function (subcommand, argumentOne) {
        if (isResourceSubcommand(subcommand)) {
            console.log('Added Resource.');
        } else if (isMethodSubcommand(subcommand)) {
            console.log('Added Method.');
        } else {
            console.log('\'' + subcommands.join(', ') + '\' are legal commands.')
        }
    });

program
    .command('get [subcommand] [argumentOne]')
    .description('Add a resource or method to your Hypermedia API specification.')
    .action(function (subcommand, argumentOne) {
        if (isResourceSubcommand(subcommand)) {
            console.log('Added Resource.');
        } else if (isMethodSubcommand(subcommand)) {
            console.log('Added Method.');
        } else {
            console.log('\'' + subcommands.join(', ') + '\' are legal commands.')
        }
    });

program
    .command('del [subcommand] [argumentOne]')
    .description('Add a resource or method to your Hypermedia API specification.')
    .action(function (subcommand, argumentOne) {
        if (isResourceSubcommand(subcommand)) {
            console.log('Added Resource.');
        } else if (isMethodSubcommand(subcommand)) {
            console.log('Added Method.');
        } else {
            console.log('\'' + subcommands.join(', ') + '\' are legal commands.')
        }
    });

program
    .version('0.0.1')
    .parse(process.argv);
