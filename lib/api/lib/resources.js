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
 * Module Dependencies.
 */
var affordance = require('./affordance.js'),
    resource = require('./resource.js'),
    xhn = require('../../xhn');

/**
 * Module-scoped references to common object properties for convenience.
 */
var hypermediaAfforance = xhn.affordance,
    hypermediaCollection = xhn.affordances;

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
    this._class = 'resources';
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
 * @param instance is an instance of a Resource
 * @return {*}
 */
Resources.method('putResource', function (instance) {
    /**
     * If resource exists, update it.
     * Else, create it.
     */
    if (resource.isPrototypeOf(instance)) {
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
            if (resources[res]._uri === instance._uri) {
                /**
                 * Update it.
                 */
                exists = true;
                resources[res] = instance;
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
            resources.push(instance);
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
 * getMethod allows you to retrieve a Method from a Resource's Methods Array by the Method's identifier.
 * It treats it as an idempotent, GET operation. This means that if the Method exists by ID, it is returned,
 * else null is returned.
 *
 * @param id is a String representation of the Method identifier.
 * @return {Method} or null.
 */
Resources.method('getMethod', function (id) {
    if (typeof id === 'string') {
        /**
         * Get a reference to the Resource Array on the Resources instance.
         * @type {Array}
         */
        var resources = this._resources;

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
                 * Dereference each method by index and compare the id String passed in with each methods id if it exists.
                 * If a match is found, immediately return the method reference.
                 */
                if (methods[met]._id === id) {
                    /**
                     * Retrieve it.
                     */
                    return methods[met];
                }
            }
        }
    }
    /**
     * No method was found that matched the id.
     */
    return null;
});

/**
 * deleteMethod allows you to delete a Method from a Resource's Methods Array by the Method's identifier.
 * It treats it as an idempotent, DELETE operation. This means that if the Method exists, it is deleted, else nothing
 * happens.
 *
 * @param id is a String representation of the Method identifier.
 * @return {*}
 */
Resources.method('deleteMethod', function (id) {
    if (typeof id === 'string') {
        /**
         * Get a reference to the Resource Array on the Resources instance.
         * @type {Array}
         */
        var resources = this._resources;

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
                 * Dereference each method by index and compare the id String passed in with each methods id if it exists.
                 * If a match is found, immediately delete the method reference.
                 */
                if (methods[met]._id === id) {
                    /**
                     * Delete it.
                     */
                    methods.splice(met, 1);
                    break;
                }
            }
        }
    }
    /**
     * Allows chained DELETE operations.
     */
    return this;
});

/**
 * getResourceMethodPair allows you to retrieve a Resource and Method pair from an API specification with a Method
 * identifier. It treats it as an idempotent, GET operation. This means that if the Method exists by ID, it is returned
 * with it's parent Resource, else null is returned.
 *
 * @param id is a String representation of the Method identifier.
 * @return [Resource, Method] or null.
 */
Resources.method('getResourceMethodPair', function (id) {
    if (typeof id === 'string') {
        /**
         * Get a reference to the Resource Array on the Resources instance.
         * @type {Array}
         */
        var resources = this._resources;

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
                 * Compare the id String passed in with each methods id if it exists. If a match is found, immediately
                 * return the Resource and Method pair.
                 */
                if (met._id === id) {
                    /**
                     * Retrieve it.
                     */
                    return [res, met];
                }
            }
        }
    }
    /**
     * No method was found that matched the id.
     */
    return null;
});

/**
 * getAffordances returns an Array of all affordances (action possibilities) available in the API.
 *
 * @param quiet expects a truthy or falsy value to be passed. If the argument is truthy, then no logging will be done
 * to the console. Else, there will be logs.
 *
 * @return {Array} of Affordance instances. This array indicates all action possibilities
 * that may be taken within the API specification. That implies that an Affordance represents a method that
 * may be invoked on a resource so long as they are both specified in the API specification. This Array may be empty
 * if no Resources or Methods are defined.
 *
 * @deprecated
 */
Resources.method('getAffordances', function (quiet) {
    /**
     * Get a reference to the Resource Array on the Resources instance.
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
            var afford = affordance(met._method, res._uri, met._arguments, met._id);
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
 * getActionPossibilities returns an XHN Affordances collection of all affordances (action possibilities) available in
 * the API.
 *
 * @return {Affordances} may have zero to many HC instances contained in the Affordances instance.
 */
Resources.method('getActionPossibilities', function () {
    /**
     * Get a reference to the Resource Array on the Resources instance.
     * @type {Array}
     *
     * Get a reference to an instance of Affordances.
     * @type {Affordances}
     */
    var resources = this._resources,
        affordances = hypermediaCollection('affordances');

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
             * Method and Uri should always exist. Relation is not needed because it's context-sensitive.
             * @type {Affordance}
             */
            var affordance = hypermediaAfforance(met._id, null, met._method, res._uri);
            affordance._relation = undefined;
            /**
             * An ID on a Method instance may be either a string instance or undefined. If it's undefined, then it's
             * falsy. If it's falsy, then undefine it in the Affordance instance.
             */
            if (!met._id) {
                affordance._id = undefined;
            }
            /**
             * An arguments string on a Method instance may be an empty string instance. In the case that it is an
             * empty string, do not add a field to the Metadata instance in Affordances.
             */
            if (!!met._arguments) {
                affordance.setMetadata({
                    'Content-Type':met._arguments
                });
            }
            affordances.addAffordance(affordance);
        }
    }
    return affordances;
});

/**
 * getIds returns an Array of all Method IDs defined in the API specification. The intention of this method is to allow
 * for an introspective way to identify all IDs in the API specification when introducing a new ID into the
 * specification. The IDs must be globally unique. This assists with such a constraint.
 *
 * @param quiet expects a truthy or falsy value to be passed. If the argument is truthy, then no logging will be done
 * to the console. Else, there will be logs.
 *
 * @return {Array} of id strings. This array indicates all Method IDs that are defined in the API specification.
 * This Array may be empty if no Resources, Methods, or Method IDs are defined.
 */
Resources.method('getIds', function (quiet) {
    /**
     * Get a reference to the Resource Array on the Resources instance.
     * @type {Array}
     */
    var resources = this._resources,
        ids = [];

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
             * Get a reference to the ID of the Method instance if it exists.
             * Expectations of the dereference will be a valid String instance or undefined.
             */
            var id = met._id;

            if (typeof id === 'string') {
                /**
                 * Push the id onto an Array that will be returned.
                 */
                ids.push(id);

                /**
                 * If this should be quiet, then do not log the id to the console.
                 */
                if (!quiet) {
                    console.log(id);
                }
            }
        }
    }

    return ids;
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
 * Convenience method to allow for type checking outside of the scope of this module.
 * @param object is a reference to an object you would like to test the prototypal inheritance chain on.
 * @return {Boolean}
 */
resources.isPrototypeOf = function (object) {
    return object instanceof Resources;
};

module.exports = exports = resources;
