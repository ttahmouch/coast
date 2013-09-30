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
var plugin = require('./plugin.js');

/**
 * A Decoder allows a user to decode various different media type serializations of Affordance or Affordances instances
 * with the support of Plugin extensions.
 *
 * @param extension should be an instance of Plugin. This argument is optional, and the field will be initialized
 * to null.
 * @return {*}
 * @constructor
 */
function Decoder(extension) {
    this._plugin = (plugin.isPrototypeOf(extension)) ? extension : null;
    return this;
}

/**
 * Accessor method to allow the setting of the Plugin extension.
 *
 * @param extension should be an instance of Plugin.
 * @return {*} for chaining.
 */
Decoder.method('setPlugin', function (extension) {
    this._plugin = (plugin.isPrototypeOf(extension)) ? extension : this._plugin;
    return this;
});

/**
 * Decodes a string representation of Affordance or Affordances using the Plugin extension.
 *
 * @param string should be a string instance representative of a media type serialization of an Affordance or
 * Affordances instance encoded by an Encoder instance.
 * @return {Affordance} or {Affordances} if succeeded. Else, null.
 */
Decoder.method('decode', function (string) {
    /**
     * Get a stack frame reference to the Plugin instance. This may only be null or an instance of Plugin. There are no
     * other possibilities.
     */
    var extension = this._plugin;
    /**
     * If the string argument is an instance of string, and extension is an instance of Plugin capable of decoding,
     * then we have a hypermedia-aware, media type to deserialize.
     *
     * Return the instance of Affordance or Affordances.
     */
    if (typeof string === 'string' && plugin.isPrototypeOf(extension) && extension.canDecode()) {
        return extension._onShouldDecode(string);
    }
    /**
     * Else, all the criteria failed. Return null.
     */
    return null;
});

/**
 * Convenience method to enforce safe method invocations without the use of the new operator.
 *
 * @return {Decoder}
 */
function decoder(extension) {
    return new Decoder(extension);
}

/**
 * Convenience method to allow for type checking outside of the scope of this module.
 * @param object is a reference to an object you would like to test the prototypal inheritance chain on.
 * @return {Boolean}
 */
decoder.isPrototypeOf = function (object) {
    return object instanceof Decoder;
};

module.exports = exports = decoder;
