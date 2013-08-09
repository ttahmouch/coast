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
var method = require('./method.js');

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
    this._class = 'resource';
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
 * @param instance is an instance of a Method
 * @return {*}
 */
Resource.method('putMethod', function (instance) {
    /**
     * If method exists, update it.
     * Else, create it.
     */
    if (method.isPrototypeOf(instance)) {
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
            if (methods[met]._method === instance._method) {
                /**
                 * Update it.
                 */
                exists = true;
                methods[met] = instance;
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
            methods.push(instance);
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
 * Convenience method to allow for type checking outside of the scope of this module.
 * @param object is a reference to an object you would like to test the prototypal inheritance chain on.
 * @return {Boolean}
 */
resource.isPrototypeOf = function (object) {
    return object instanceof Resource;
};

module.exports = exports = resource;
