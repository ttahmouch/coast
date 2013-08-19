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
var affordance = require('./affordance.js');

/**
 * Represents a collection of Affordance instances.
 *
 * @param id should be a string representative of a globally-unique identifier for the respective Affordances instance
 * when serialized to a document using an encoder. This argument is optional.
 * @return {*}
 * @constructor
 */
function Affordances(id) {
    if (typeof id === 'string') {
        this._id = id;
    }
    this._affordances = [];
    return this;
}

/**
 * Accessor method to allow the setting of the id field.
 *
 * @param id should be a string representative of a globally-unique identifier for the respective Affordances instance
 * when serialized to a document using an encoder.  This field is optional.
 * @return {*} for chaining.
 */
Affordances.method('setId', function (id) {
    this._id = (typeof id === 'string') ? id : this._id;
    return this;
});

/**
 * Allows for the addition of an Affordance or Affordances instance to the Affordances collection.
 *
 * @param action should be an instance of Affordance or Affordances.
 * @return {*} for chaining.
 */
Affordances.method('addAffordance', function (action) {
    if ((affordance.isPrototypeOf(action) || action instanceof Affordances) &&
        (this._affordances.lastIndexOf(action) === -1)) {
        this._affordances.push(action);
    }
    return this;
});

/**
 * Convenience method to enforce safe method invocations without the use of the new operator.
 *
 * @return {Affordances}
 */
function affordances(id) {
    return new Affordances(id);
}

/**
 * Convenience method to allow for type checking outside of the scope of this module.
 * @param object is a reference to an object you would like to test the prototypal inheritance chain on.
 * @return {Boolean}
 */
affordances.isPrototypeOf = function (object) {
    return object instanceof Affordances;
};

module.exports = exports = affordances;