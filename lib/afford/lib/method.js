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
 * @param returns is an Array of protocol-agnostic, status codes. For example, in HTTP this could look like
 * [200, 400, 500]. No validation is done on the elements of this Array in an effort to keep things protocol-agnostic.
 * However, an Array check is done.
 *
 * @return {*}
 * @constructor
 */
function Method(jsonObjectOrMethodString, arguments, returns) {
    this._class = 'method';
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
 * Convenience method to allow for type checking outside of the scope of this module.
 * @param object is a reference to an object you would like to test the prototypal inheritance chain on.
 * @return {Boolean}
 */
method.isPrototypeOf = function (object) {
    return object instanceof Method;
};

module.exports = exports = method;
