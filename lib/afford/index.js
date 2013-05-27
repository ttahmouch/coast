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
 * Module dependencies.
 */
var program = require('commander'),
    fs = require('fs'),
    xhn = require('../xhn');

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
 * Finds the next defined status code in the Method's own returns array given a start index and subset array as
 * arguments. To be defined, a status code presented in the subset array must exist in the method instance defined
 * in the API specification.
 *
 * @param start is the index to start from in the statuses array.
 * @param subsetArray is the array of statuses passed in as an argument of the parent function.
 * @return is the next valid status code, or null.
 */
Method.method('nextStatus', function (start, subsetArray) {
    var apiArray = this._returns;

    /**
     * If subsetArray is not a reference to an array, then return null.
     */
    if (!Array.isArray(subsetArray)) {
        return null;
    }

    /**
     * If the current index is outside the bounds of the statuses array, then return null.
     */
    if (start < 0 || start >= subsetArray.length) {
        return null;
    }

    /**
     * While the status code in the statuses array is not defined in the API, skip it.
     */
    while (apiArray.lastIndexOf(subsetArray[start]) === -1) {
        start += 1;

        /**
         * If the current status index equals the length of the array, then return null.
         */
        if (start === subsetArray.length) {
            return null;
        }
    }

    return subsetArray[start];
});

/**
 * generate allows you to generate a set of hypermedia responses, encoded in the Affordance media type, for every
 * Status Code defined in your Method or particular Status Codes passed as an argument.
 *
 * Should eventually consider supporting multiple media type encodings since eXtensible Hypermedia Notation
 * is extensible by nature.
 *
 * @param statuses is an Array of status code integers. For example, in HTTP this could look like [200, 400, 500].
 * No validation is done to make sure this Array contains integers. However, an Array check is done. This should
 * usually be a subset of the array of status codes that the Method already acknowledges in the specification.
 *
 * @param uri is a Uri String representation of a Resource. No check is done to make sure it is specified in the API.
 *
 * @param actionPossibilities is an Array of Affordances. This can be retrieved from any Resources instance by
 * invoking Resources.list.
 *
 * @return undefined
 */
Method.method('generate', function (statuses, uri, actionPossibilities) {
    /**
     * Check the statuses argument to decide whether we should iterate over all possible statuses or a custom subset.
     */
    statuses = Array.isArray(statuses) ? statuses : this._returns;

    /**
     * Get the count of statuses to verify that there are indeed status codes to generate for.
     * Get the first, legal status code from the subset array if one was passed in the statuses argument.
     * Get the index of the legal status code returned from Method.nextStatus().
     * Get the current Method string.
     * Keep top-level, lexically scoped references to an affordances collection or any current hypermedia control being
     * worked on from XHN.
     */
    var method = this._method,
        status = this.nextStatus(0, statuses),
        count = statuses.length,
        index = statuses.lastIndexOf(status),
        currentAffordances = null,
        currentAffordance = null;

    /**
     * If the uri argument passed is not a String,
     * then don't bother generating because the Resource was not valid.
     */
    if (typeof uri !== 'string') {
        console.log('A valid Uri string was not provided when attempting to generate a method response.');
        return;
    }

    /**
     * If there are no returns to iterate over, then return immediately.
     */
    if (count <= 0) {
        console.log('There are no valid status codes specified in your method. Please put some status codes.');
        return;
    }

    /**
     * If the status is equal to null, then there were no valid statuses in the array passed as an argument.
     * If the index is -1, then it means the returned status was null. This is just to be thorough.
     * So just return.
     */
    if (status === null || index === -1) {
        console.log('There are no valid status codes specified in your arguments. Please enter some defined status codes.');
        return;
    }

    /**
     * If actionPossibilities is not an Array, or
     * If actionPossibilities is an empty Array,
     * then don't bother generating because there are no other affordances.
     */
    if (!Array.isArray(actionPossibilities) || actionPossibilities.length <= 0) {
        console.log('There are no valid affordances specified in your API. Please put some resources and methods.');
        return;
    }

    /**
     * Ugly code:
     * Add a choice to the first index of the action possibilities array that allows the user to choose no
     * action. This signifies the end of choices for this particular status code, and the generator will proceed to the
     * next status code if one exists, or finish generation.
     *
     * I chose to prefix the array as opposed to suffix the array with the 'Done.' choice because it would be easy to
     * code for a static index check as opposed to a variable index check.
     *
     * At this point, I've already verified that this argument was an array of length greater than zero. This means
     * that there are indeed action possibilities defined in the API specification. In other words, there are other
     * possible states in this state machine.
     */
    actionPossibilities.unshift('Done');

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
    xhn.quiet(!program.debug);

    /**
     * Eventually figure out a way to decouple the module-scoped references from this method since this is a prototype
     * method for the Method constructor. These references include xhn and program.
     */

    function beginCase(method, uri, status) {
        /**
         * A case is analogous to the yielding of a status code from the invocation of any defined method on it's
         * respective resource in the API specification. In other words, a possible response from any API transaction.
         */
        console.log('Case: ' + method + ' --> ' + uri + ' --> ' + status);

        /**
         * Every possible response will be encoded in the serialization format specified in the XHN module. In order to
         * stringify the affordances within the response we need an instance of Affordances from XHN.
         */
        currentAffordances = xhn.affordances();
        chooseActionPossibility();
    }

    function chooseActionPossibility() {
        console.log('Choose an action possibility at this state. Please select done to begin serializing this response to disk.');
        program.choose(actionPossibilities, onChoseActionPossibility);
    }

    function onChoseLinkId(id) {
        currentAffordance._id = id;
        chooseActionPossibility();
    }

    function onChoseLinkRelation(rel) {
        currentAffordance._relation = rel;
        program.prompt('Enter link id: ', onChoseLinkId);
    }

    function onChoseActionPossibility(action) {
        /**
         * This method will not even get invoked unless the case chosen is a legal case. By this I mean, program.choose
         * is smart enough to not invoke this callback method unless the user specifies a real choice.
         *
         * This allows you to infer that the only two possible choices are either the terminating choice 'Done,' or an
         * actual action possibility.
         */
        /**
         * Dereference the possible Affordance instance from the array of affordances, and set the reference to the
         * existing action argument.
         */
        action = actionPossibilities[action];
        console.log('You chose ' + action);

        /**
         * If the user chose the 'Done' argument, do nothing (for now).
         * Else, the user chose a legal affordance specified within the API specification.
         */
        if (action === 'Done') {
            /**
             * If there are no new status codes to proceed to, then terminate the generator.
             * Else, proceed to the next status code.
             */
            xhn.stringify(currentAffordances);
            /**
             * Take the stringified collection and save it to a file.
             * Then proceed to the next possible status code, and beginCase().
             * If there are no possible status codes left, terminate.
             */
            return;
        } else {
            /**
             * Create an instance of a HypermediaControl that represents your affordance, and immediately add it to
             * your collection of affordances. The proceed to set the respective semantics of the HypermediaControl.
             */
            currentAffordance = xhn.hc();
            currentAffordances.addAffordance(currentAffordance);
            currentAffordance._method = action._method;
            currentAffordance._uri = action._resource;
            /**
             * If arguments is truthy, then set it as a header field in the Metadata instance within the hypermedia
             * control. This can be any protocol agnostic header field, but for now it's limited to HTTP's Content-Type.
             *
             * Being truthy in this case just means being a populated string instance and not any empty string.
             */
            /**
             * Consider eventually including a CLI flag to denote which major transfer protocol is being used.
             */
            if (!!action._arguments) {
                currentAffordance._metadata.addField('Content-Type', action._arguments);
            }
            program.prompt('Enter link relation: ', onChoseLinkRelation);
        }
    }

    /**
     * Start generating for the first possible scenario.
     */
    beginCase(method, uri, status);
});

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
 * generate allows you to generate a set of hypermedia responses, encoded in the Affordance media type, for every
 * combination of Method and Status Code defined in your Resource.
 *
 * Should eventually consider supporting multiple media type encodings since eXtensible Hypermedia Notation
 * is extensible by nature.
 *
 * @param actionPossibilities is an Array of Affordances. This can be retrieved from any Resources instance by
 * invoking Resources.list.
 *
 * @return undefined
 */
Resource.method('generate', function (actionPossibilities) {
    var methods = this._methods;

    /**
     * If there are no methods to iterate over, then return immediately.
     */
    if (methods.length <= 0) {
        console.log('There are no valid methods specified in your resource, ' + this._uri + '. Please put some methods.');
        return;
    }

    /**
     * If actionPossibilities is not an Array, or
     * If actionPossibilities is an empty Array,
     * then don't bother generating because there are no other affordances.
     */
    if (!Array.isArray(actionPossibilities) || actionPossibilities.length <= 0) {
        console.log('There are no valid affordances specified in your API. Please put some resources and methods.');
        return;
    }

    /**
     * Iterate over the entire methods array
     */
    for (var met in methods) {
        /**
         * Dereference with the index, and augment the met variable with a reference to the Method instance.
         */
        met = methods[met];
        /**
         * Generate a hypermedia response using every Method in your Resource.
         */
        met.generate(null, this._uri, actionPossibilities);
    }
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
    return 'Affordance: ' + this._method + ' ' + this._resource + ' ' + this._arguments;
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
 * generate allows you to generate a set of hypermedia responses, encoded in the Affordance media type, for every
 * combination of Resource, Method, and Status Code defined in your API specification.
 *
 * Should eventually consider supporting multiple media type encodings since eXtensible Hypermedia Notation
 * is extensible by nature.
 *
 * @param actionPossibilities is an Array of Affordances. This can be retrieved from any Resources instance by
 * invoking Resources.list.
 *
 * @return undefined
 */
Resources.method('generate', function (actionPossibilities) {
    var resources = this._resources;

    /**
     * If there are no resources to iterate over, then return immediately.
     */
    if (resources.length <= 0) {
        console.log('There are no valid resources specified in your API. Please put some resources.');
        return;
    }

    /**
     * If actionPossibilities is not an Array, or
     * If actionPossibilities is an empty Array,
     * then don't bother generating because there are no other affordances.
     */
    if (!Array.isArray(actionPossibilities) || actionPossibilities.length <= 0) {
        console.log('There are no valid affordances specified in your API. Please put some resources and methods.');
        return;
    }

    /**
     * Iterate over the entire resources array
     */
    for (var res in resources) {
        /**
         * Dereference with the index, and augment the res variable with a reference to the Resource instance.
         */
        res = resources[res];
        /**
         * Generate a hypermedia response using every Resource in your API specification.
         */
        res.generate(actionPossibilities);
    }
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
 * Check if the serialized API specification file already exists (synchronously).
 * If it exists, then parse its JSON content to a live object (synchronously).
 * Else, create a new Resources instance representing the API specification.
 */
var path = './api.json',
    api = resources((fs.existsSync(path)) ? JSON.parse(fs.readFileSync(path, 'utf8')) : undefined),
    affordances = api.list(true);

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

/**
 * Consider more strict argument validation later, if possible.
 * Consider more flexible argument list order later, if possible.
 */
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
                /**
                 * Attempt to query the Resource for the Method.
                 */
                met = res.getMethod(met);

                if (!!met) {
                    /**
                     * Generate responses for a particular Method specification. This may be more specific with an
                     * array of status codes.
                     */
                    met.generate(ret, res._uri, affordances);
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
                console.log('Currently, generating for all methods defined in a resource is not supported.');
            } else {
                console.log('A valid, existent resource from your API should be entered. An example: /uri');
            }
        } else {
            /**
             * Generate responses for the entire API specification.
             */
            console.log('Currently, generating for all resources defined in an API is not supported.');
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
    .option('-m, --multipart', 'Use this flag when generating to ensure the output is multipart.')
    .option('-x, --xml', 'Use this flag when generating to ensure the output is xml.')
    .option('-j, --json', 'Use this flag when generating to ensure the output is json.')
    .option('-d, --debug', 'Use this flag when you would like to see debug logs in the console.')
    .parse(process.argv);

/**
 * Regardless of the success of a command invocation, serialize the contents of the Resources instance to the JSON file.
 */
fs.writeFileSync(path, JSON.stringify(api, null, '    '));
