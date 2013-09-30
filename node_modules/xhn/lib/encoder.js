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
 * Module Dependencies.
 */
var plugin = require('./plugin.js'),
    affordances = require('./affordances.js'),
    affordance = require('./affordance.js');

/**
 * An Encoder allows a user to encode instances of Affordance or Affordances to various different media types
 * with the support of Plugin extensions.
 *
 * @param extension should be an instance of Plugin. This argument is optional, and the field will be initialized
 * to null.
 * @return {*}
 * @constructor
 */
function Encoder(extension) {
    this._plugin = (plugin.isPrototypeOf(extension)) ? extension : null;
    return this;
}

/**
 * Accessor method to allow the setting of the Plugin extension.
 *
 * @param extension should be an instance of Plugin.
 * @return {*} for chaining.
 */
Encoder.method('setPlugin', function (extension) {
    this._plugin = (plugin.isPrototypeOf(extension)) ? extension : this._plugin;
    return this;
});

/**
 * Encodes an instance of Affordance or Affordances using the Plugin extension.
 *
 * @param hypermedia should be an instance of Affordance or Affordances.
 * @return {String} representation of the Affordance or Affordances in a media type handled by the Plugin.
 */
Encoder.method('encode', function (hypermedia) {
    /**
     * Get a stack frame reference to the Plugin instance. This may only be null or an instance of Plugin. There are no
     * other possibilities.
     */
    var extension = this._plugin;
    /**
     * If the hypermedia argument is an instance of Affordance or Affordances, and extension is an instance of Plugin
     * capable of encoding, then we have hypermedia to serialize, and a syntax encoder to decide the appropriate syntax
     * for the encoding.
     *
     * Return the serialized string.
     */
    if ((affordance.isPrototypeOf(hypermedia) || affordances.isPrototypeOf(hypermedia)) &&
        plugin.isPrototypeOf(extension) && extension.canEncode()) {
        return extension._onShouldEncode(hypermedia);
    }
    /**
     * Else, all the criteria failed. Return an empty string.
     */
    return '';
});

/**
 * Convenience method to enforce safe method invocations without the use of the new operator.
 *
 * @return {Encoder}
 */
function encoder(extension) {
    return new Encoder(extension);
}

/**
 * Convenience method to allow for type checking outside of the scope of this module.
 * @param object is a reference to an object you would like to test the prototypal inheritance chain on.
 * @return {Boolean}
 */
encoder.isPrototypeOf = function (object) {
    return object instanceof Encoder;
};

module.exports = exports = encoder;
