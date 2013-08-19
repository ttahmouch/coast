/**
 * Falsy Values: false, 0, "", null, undefined, NaN
 */

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
 * Plugins should be treated as delegates to decide on how to encode certain hypermedia semantics into a particular
 * syntax (media type). The encoder extended by this plugin will invoke onShouldEncode with either an instance of
 * Affordance or Affordances. The expectation is that the method invoked will encode the object to string, and return
 * the string immediately to the encoder.
 *
 * @return {*}
 * @constructor
 */
function Plugin() {
    this._onShouldEncode = null;
    return this;
}

/**
 * Accessor method to allow the setting of the encoder delegate function.
 *
 * @param delegate should be a delegate function that accepts one argument {Affordance} or {Affordances} and returns
 * the encoded string.
 * @return {*} for chaining.
 */
Plugin.method('setShouldEncodeDelegate', function (delegate) {
    this._onShouldEncode = (typeof delegate === 'function') ? delegate : this._onShouldEncode;
    return this;
});

/**
 * Convenience method to enforce safe method invocations without the use of the new operator.
 *
 * @return {Plugin}
 */
function plugin() {
    return new Plugin();
}

/**
 * Convenience method to allow for type checking outside of the scope of this module.
 * @param object is a reference to an object you would like to test the prototypal inheritance chain on.
 * @return {Boolean}
 */
plugin.isPrototypeOf = function (object) {
    return object instanceof Plugin;
};

module.exports = exports = plugin;
