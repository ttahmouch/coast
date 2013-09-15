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
var resources = require('./resources.js'),
    resource = require('./resource.js'),
    method = require('./method.js');

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
 * @param instance needs to be an instance of Resources
 * @return is a reference to the Generator instance
 */
Generator.method('setResources', function (instance) {
    this._resources = (resources.isPrototypeOf(instance)) ? instance : null;
    return this;
});

/**
 * A setter method designed to set the Resource field with an instance of Resource.
 *
 * @param instance needs to be an instance of Resource
 * @return is a reference to the Generator instance
 */
Generator.method('setResource', function (instance) {
    this._resource = (resource.isPrototypeOf(instance)) ? instance : null;
    return this;
});

/**
 * A setter method designed to set the Method field with an instance of Method.
 *
 * @param instance needs to be an instance of Method
 * @return is a reference to the Generator instance
 */
Generator.method('setMethod', function (instance) {
    this._method = (method.isPrototypeOf(instance)) ? instance : null;
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
 * 2 - gen [resource]
 * 3 - gen [resource] [method]
 * 4 - gen [resource] [method] --returns [returns]
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
 * Convenience method to allow for type checking outside of the scope of this module.
 * @param object is a reference to an object you would like to test the prototypal inheritance chain on.
 * @return {Boolean}
 */
generator.isPrototypeOf = function (object) {
    return object instanceof Generator;
};

module.exports = exports = generator;
