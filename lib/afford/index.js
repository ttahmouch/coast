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
 * A response generator that will employ the builder pattern in order to generate Affordance media type responses.
 * @return {*}
 * @constructor
 */
function Generator() {
    this._resources = null;
    this._resource = null;
    this._method = null;
    this._codes = null;
    this._affordances = null;
    this._delegate = null;
    /**
     * This state Array is used internally to persist the state of where we left off when generate was last invoked.
     * The first index represents the Resource, the second a Method, and the third a status code.
     * @type {Array}
     */
    this._state = [-1, -1, -1];
    return this;
}

/**
 * A setter method designed to set the Resources field with an instance of Resources.
 *
 * @param resources needs to be an instance of Resources
 * @return is a reference to the Generator instance
 */
Generator.method('setResources', function (resources) {
    this._resources = (resources instanceof Resources) ? resources : null;
    return this;
});

/**
 * A setter method designed to set the Resource field with an instance of Resource.
 *
 * @param resource needs to be an instance of Resource
 * @return is a reference to the Generator instance
 */
Generator.method('setResource', function (resource) {
    this._resource = (resource instanceof Resource) ? resource : null;
    return this;
});

/**
 * A setter method designed to set the Method field with an instance of Method.
 *
 * @param method needs to be an instance of Method
 * @return is a reference to the Generator instance
 */
Generator.method('setMethod', function (method) {
    this._method = (method instanceof Method) ? method : null;
    return this;
});

/**
 * A setter method designed to set the codes field with an Array of status codes.
 *
 * @param codes needs to be an Array of status codes
 * @return is a reference to the Generator instance
 */
Generator.method('setStatusCodes', function (codes) {
    this._codes = (Array.isArray(codes)) ? codes : null;
    return this;
});

/**
 * A setter method designed to set the affordances field with an Array of Affordances.
 *
 * @param affordances needs to be an Array of Affordances
 * @return is a reference to the Generator instance
 */
Generator.method('setAffordances', function (affordances) {
    this._affordances = (Array.isArray(affordances)) ? affordances : null;
    return this;
});

/**
 * A setter method designed to set the delegate field with a delegate, callback Function.
 *
 * @param delegate needs to be a Function
 * @return is a reference to the Generator instance
 */
Generator.method('setDelegate', function (delegate) {
    this._delegate = (typeof delegate === 'function') ? delegate : null;
    return this;
});

/**
 * generate allows you to generate a set of hypermedia responses encoded in the Affordance media type. The granularity
 * of the generation is dependent upon the fields set with the accessor methods of the Generator instance. The intention
 * of this method is to allow for the generation of an Affordance media type response for any possible "Affordance"
 * defined within your API specification. This implies that, if you have defined a Resource and a protocol-agnostic
 * Method that is responds to, you will be able to generate a hypermedia response for every possible status code that
 * could be returned from the invocation of the defined Method on that Resource.
 *
 * Invoking the gen command in the CLI can accept arguments as follows:
 * 1 - gen
 * 2 - gen resource
 * 3 - gen resource method
 * 4 - gen resource method returns
 *
 * Each of the argument sets will set the respective data using the accessor methods of the Generator instance.
 * Case 1 will set the Resources collection with the intention of generating for every Resource in the API.
 * Case 2 will set the specific Resource with the intention of generating for the specific Resource in the API.
 * Case 3 will set the specific Resource and Method with the intention of generating for the specific Method in the API.
 * Case 4 will augment Case 3 with a specific subset of status codes to generate over as opposed to just using every
 * possible status code in the indicated Method instance.
 *
 * Should eventually consider supporting multiple media type encodings since eXtensible Hypermedia Notation
 * is extensible by nature.
 *
 * @param quiet indicates whether debug logging should be displayed in the console.
 * @return undefined
 */
Generator.method('generate', function (quiet) {
    var resources = this._resources,
        resource = this._resource,
        method = this._method,
        codes = this._codes,
        affordances = this._affordances,
        delegate = this._delegate,
        state = this._state;

    if (!quiet) {
        console.log('Resources:');
        console.dir(resources);
        console.log('Resource:');
        console.dir(resource);
        console.log('Method:');
        console.dir(method);
        console.log('Codes:');
        console.dir(codes);
        console.log('Affordances:');
        console.dir(affordances);
        console.log('Delegate:');
        console.log(delegate);
        console.log('State:');
        console.log(state);
    }

    /**
     * If affordances do not exist, then we have no action possibilities on the API to generate a hypermedia response
     * with. So just return.
     * Else, prefix the Array with an "Affordance." This is not actually an Affordance instance. This is a signal
     * in the CLI that the user wishes to not choose another Affordance. Currently, the value is just the string literal
     * "Done".
     *
     * The affordances variable can only be two possible values if the Generator is being used correctly:
     * null or {Array}.
     */
    if (affordances === null || affordances.length <= 0) {
        console.log('A valid Array of Affordances was not provided in an attempt to generate an Affordance response.');
        return;
    } else {
        /**
         * We are guaranteed that affordances is an Array of length greater than zero.
         * Make a copy of the Array object with the slice call. Then proceed to prefix the array with the 'Done' choice.
         * I chose to prefix the array as opposed to suffix the array with the 'Done' choice because it would be easy
         * to check the static index as opposed to a variable index.
         */
        affordances = affordances.slice(0);
        affordances.unshift('Done');
        if (!quiet) {
            console.log('Affordances copied?');
            console.log(affordances !== this._affordances);
            console.log('Affordances:');
            console.dir(affordances);
        }
    }
    /**
     * If we do not at a minimum have a Resource or collection of Resources to generate for, then we cannot carry out
     * any of the commands from the CLI.
     */
    if (resources === null && resource === null) {
        console.log('A Resource or Resources collection was not provided in an attempt to generate an Affordance response.');
        return;
    }

    /**
     * If the Resources collection was set, then it is assumed that we need to generate over the entire API.
     * Else if a Resource, Method, and array of status codes are set, then it is assumed that we will generate responses
     * for the particular status codes.
     * Else if a Resource and Method are set, then it is assumed that we will generate responses for all status codes on
     * that particular Method.
     * Else if a Resource is set, then it is assumed that we will generate responses for all Method and statis code
     * combinations within that particular Resource.
     */
    if (resources !== null) {
        console.log('Currently, generating for all resources defined in an API is not supported.');
    } else if (resource !== null && method !== null) {
        /**
         * If a status codes array subset was included with the accessor method, then attempt to use those status codes
         * during the generation. Else, generate the hypermedia responses for all possible status codes defined in the
         * Method.
         */
        codes = (codes !== null) ? codes : method._returns;
        /**
         * Filter out any status codes that are not already defined by the Method in the API specification. These need
         * to be filtered out because there is no need to generate for status codes you do not plan to account for.
         */
        codes = codes.filter(function (element) {
            /**
             * If the status code in the codes array has a corresponding index in the method._returns array, then it
             * exists in the API specification and should be included in the new filtered array.
             */
            return method._returns.lastIndexOf(element) !== -1;
        });
        /**
         * If there are no status codes to generate for, then immediately return.
         * This case does not currently seem possible because every Method defined in an API specification has at least
         * a 200 status code by default, and it is also not possible to enter a custom subset of status codes with a
         * length of zero. This is just an exhaustive state check.
         */
        if (codes.length <= 0) {
            console.log('A valid Array of status codes was not provided. ' +
                'The Array needs to be at least one element large and contain elements that are defined in the API specification.');
            return;
        }

        if (!quiet) {
            console.log('Codes:');
            console.dir(codes);
        }

        /**
         * Increment the status code index in the state Array by one, and check to see if it still yields a status code.
         */
        var position = state[2];
        position += 1;

        /**
         * There are no cases left to generate. Terminate the process with a success code returned to the shell.
         */
        if (position === codes.length) {
            console.log('There is nothing left to generate.');
            return process.exit();
        }

        /**
         * At this point, we still yield a status code since the position is less than the length of the status codes
         * Array. So we can set the state to the incremented position.
         */
        state[2] = position;

        if (!quiet) {
            console.log('State:');
            console.log(state);
        }

        if (delegate !== null) {
            delegate(resource, method, codes[position], affordances);
        } else {
            console.log('A valid, delegate callback Function was not provided in an attempt to generate an Affordance response.');
        }
    } else if (resource !== null) {
        console.log('Currently, generating for all methods defined in a resource is not supported.');
    }
});

/**
 * Convenience method to enforce safe method invocations without the use of the new operator.
 * @return {Generator}
 */
function generator() {
    return new Generator();
}

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
 * @param returns is an Array of protocol-agnostic, status codes. For example, in HTTP this could look like
 * [200, 400, 500]. No validation is done on the elements of this Array in an effort to keep things protocol-agnostic.
 * However, an Array check is done.
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
 * @param returns is an Array of protocol-agnostic, status codes. For example, in HTTP this could look like
 * [200, 400, 500]. No validation is done on the elements of this Array in an effort to keep things protocol-agnostic.
 * However, an Array check is done.
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
 * Psychologist James J. Gibson originally introduced the term in his 1977 article "The Theory of Affordances"[1] and
 * explored it more fully in his book The Ecological Approach to Visual Perception[2] in 1979. He defined affordances
 * as all "action possibilities" latent in the environment, objectively measurable and independent of the individual's
 * ability to recognize them, but always in relation to agents and therefore dependent on their capabilities.
 * For instance, a set of steps which rises four feet high does not afford the act of climbing if the actor is a
 * crawling infant. Gibson's is the prevalent definition in cognitive psychology.
 *
 * In the context of this application, an Affordance is an "action possibility" on the API the user of this application
 * intends on defining in their specification. All action possibilities in a specification are limited to being
 * invokable Methods on defined Resources. So the environment is a collection of Resources (nouns), and the actions
 * possible are Methods (verbs). Methods also exhibit a property in that they may require an optional set of arguments
 * for invocation (Media Type or Content-Type).
 *
 * @param method is a String representation of a protocol agnostic Method.
 * @param resource is a String representation of a Resource in Uri or Uri Template form.
 * @param arguments is a String representation of a Media Type using MIME standard convention.
 *
 * @return {*}
 * @constructor
 */
function Affordance(method, resource, arguments) {
    this._method = (typeof method === 'string') ? method : '';
    this._resource = (typeof resource === 'string') ? resource : '';
    this._arguments = (typeof arguments === 'string') ? arguments : '';
    return this;
}

Affordance.method('toString', function () {
    return this._method + ' ' + this._resource + ' ' + this._arguments;
});

/**
 * Convenience method to enforce safe method invocations without the use of the new operator.
 *
 * @param method is a String representation of a protocol agnostic Method.
 * @param resource is a String representation of a Resource in Uri or Uri Template form.
 * @param arguments is a String representation of a Media Type using MIME standard convention.
 * @return {Affordance}
 */
function affordance(method, resource, arguments) {
    return new Affordance(method, resource, arguments);
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
 * @param quiet expects a truthy or falsy value to be passed. If the argument is truthy, then no logging will be done
 * to the console. Else, there will be logs.
 *
 * @return {Array} of Affordance instances. This array indicates all action possibilities
 * that may be taken within the API specification. That implies that an Affordance represents a method that
 * may be invoked on a resource so long as they are both specified in the API specification. This Array may be empty
 * if no Resources or Methods are defined.
 */
Resources.method('list', function (quiet) {
    /**
     * Get a reference to the Resouce Array on the Resources instance.
     * @type {Array}
     */
    var resources = this._resources,
        affordances = [];

    /**
     * Iterate over the entire resources array
     */
    for (var res in resources) {
        /**
         * Dereference with the index, and augment the res variable with a reference to the Resource instance.
         */
        res = resources[res];
        /**
         * Get a reference to the Methods Array on the Resource instance.
         * @type {Array}
         */
        var methods = res._methods;

        /**
         * Iterate over the entire methods array
         */
        for (var met in methods) {
            /**
             * Dereference with the index, and augment the met variable with a reference to the Method instance.
             */
            met = methods[met];
            /**
             * Create an instance of an Affordance with the respective information from the method and resource.
             * @type {Affordance}
             */
            var afford = affordance(met._method, res._uri, met._arguments);
            /**
             * Push the affordance onto an Array that will be returned.
             */
            affordances.push(afford);
            /**
             * If this should be quiet, then do not log the affordances to the console.
             */
            if (!quiet) {
                console.log(afford.toString());
            }
        }
    }

    return affordances;
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
 * Module dependencies.
 */
var program = require('commander'),
    fs = require('fs'),
    path = require('path'),
    xhn = require('../xhn');

/**
 * Check if the serialized API specification file already exists (synchronously).
 * If it exists, then parse its JSON content to a live object (synchronously).
 * Else, create a new Resources instance representing the API specification.
 */
var pathSeperator = path.sep,
    folderPath = '.' + pathSeperator + 'api' + pathSeperator,
    filePath = 'api.json',
    api = resources((fs.existsSync(folderPath + filePath)) ? JSON.parse(fs.readFileSync(folderPath + filePath, 'utf8')) : undefined),
    affordances = api.list(true),
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
             * Create a collection of hypermedia controls.
             */
            var hypermedia = hfactors(resource._uri);

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
                     * Start cleansing the path names for the current scenario.
                     * The cleansing consists of converting the data to a string if it wasn't when it was passed in as
                     * an argument, converting all alphabet characters to lower case for normalization, and replacing
                     * all URI forward slash characters with a hyphen since they could be mistaken for path delimiters
                     * in Unix.
                     * @type {String}
                     */
                    var statusPath = folderPath + status.toString().toLowerCase().replace('/', '-') + pathSeperator,
                        methodPath = statusPath + method._method.toLowerCase().replace('/', '-') + pathSeperator,
                        resourcePath = methodPath + resource._uri.toLowerCase().replace('/', '-') + pathSeperator,
                        fileExtension = ((json) ? 'json' : 'xml'),
                        filePath = 'response.' + fileExtension;
                    /**
                     * Log some information regarding where the file will be saved.
                     */
                    if (!quiet) {
                        console.log('Saving to file: ' + resourcePath + filePath);
                        console.log('Serialization format: ' + fileExtension);
                    }
                    /**
                     * If the API path does not exist, create it. Else, do nothing.
                     */
                    if (!fs.existsSync(folderPath)) {
                        fs.mkdirSync(folderPath);
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
                    fs.writeFileSync(resourcePath + filePath, stringify(hypermedia));
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
    .description('List all affordances available in the API specification.')
    .action(function () {
        /**
         * Call the list method on the Resources collection, and pass in false explicitly for the quiet flag.
         * The quiet flag indicates whether console logging should occur within the method.
         */
        api.list(false);
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
    .option('-a, --arguments [arg]', 'Use this flag when putting a method to specify a media type argument that method may accept.')
    .option('-d, --debug', 'Use this flag when you would like to see debug logs in the console.')
    .option('-j, --json', 'Use this flag when generating to ensure the output is json.')
    .option('-r, --returns [ret]', 'Use this flag when putting or generating to specify a comma-separated set of status codes.')
    .option('-x, --xml', 'Use this flag when generating to ensure the output is xml.')
    .parse(process.argv);

/**
 * If the API path does not exist, create it. Else, do nothing.
 */
if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
}

/**
 * Regardless of the success of a command invocation, serialize the contents of the Resources instance to the JSON file.
 */
fs.writeFileSync(folderPath + filePath, JSON.stringify(api, null, '    '));
