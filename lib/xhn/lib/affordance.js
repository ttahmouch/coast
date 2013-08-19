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
var input = require('./input.js');

/**
 * Psychologist James J. Gibson originally introduced the term in his 1977 article "The Theory of Affordances"[1] and
 * explored it more fully in his book The Ecological Approach to Visual Perception[2] in 1979. He defined affordances
 * as all "action possibilities" latent in the environment, objectively measurable and independent of the individual's
 * ability to recognize them, but always in relation to agents and therefore dependent on their capabilities.
 * For instance, a set of steps which rises four feet high does not api the act of climbing if the actor is a
 * crawling infant. Gibson's is the prevalent definition in cognitive psychology.
 *
 * In the context of this application, an Affordance is an "action possibility" on a Resource-Oriented Architecture web
 * API.
 *
 * @param id should be a string representative of a globally-unique identifier for the respective Affordance instance
 * when serialized to a document using an encoder.
 * @param relation should be a string representative of an IANA relation.
 * @param method should be a string representative of a protocol method.
 * @param uri should be a string representative of a URI.
 * @param metadata should be an object representative of protocol headers.
 * Example: {'Content_Type':'application/json'}
 * @return {*}
 * @constructor
 */
function Affordance(id, relation, method, uri, metadata) {
    this._id = (typeof id === 'string') ? id : '';
    this._relation = (typeof relation === 'string') ? relation : '';
    this._method = (typeof method === 'string') ? method : '';
    this._uri = (typeof uri === 'string') ? uri : '';
    this._metadata = (!!metadata && (typeof metadata === 'object')) ? metadata : {};
    this._controls = [];
    return this;
}

/**
 * Accessor method to allow the setting of the id field.
 *
 * @param id should be a string representative of a globally-unique identifier for the respective Affordance instance
 * when serialized to a document using an encoder.
 * @return {*} for chaining.
 */
Affordance.method('setId', function (id) {
    this._id = (typeof id === 'string') ? id : this._id;
    return this;
});

/**
 * Accessor method to allow the setting of the relation field.
 *
 * @param relation should be a string representative of an IANA relation.
 * @return {*} for chaining.
 */
Affordance.method('setRelation', function (relation) {
    this._relation = (typeof relation === 'string') ? relation : this._relation;
    return this;
});

/**
 * Accessor method to allow the setting of the method field.
 *
 * @param method should be a string representative of a protocol method.
 * @return {*} for chaining.
 */
Affordance.method('setMethod', function (method) {
    this._method = (typeof method === 'string') ? method : this._method;
    return this;
});

/**
 * Accessor method to allow the setting of the uri field.
 *
 * @param uri should be a string representative of a URI.
 * @return {*} for chaining.
 */
Affordance.method('setUri', function (uri) {
    this._uri = (typeof uri === 'string') ? uri : this._uri;
    return this;
});

/**
 * Accessor method to allow the setting of the metadata field.
 *
 * @param metadata should be an object representative of protocol headers.
 * Example: {'Content_Type':'application/json'}
 * @return {*} for chaining.
 */
Affordance.method('setMetadata', function (metadata) {
    this._metadata = (!!metadata && (typeof metadata === 'object')) ? metadata : this._metadata;
    return this;
});

/**
 * Allows for the addition of an Input instance to the Affordance with the intention of treating the Affordance as a
 * "form."
 *
 * @param control should be an instance of Input.
 * @return {*} for chaining.
 */
Affordance.method('addInput', function (control) {
    if (input.isPrototypeOf(control) && (this._controls.lastIndexOf(control) === -1)) {
        this._controls.push(control);
    }
    return this;
});

/**
 * Convenience method to enforce safe method invocations without the use of the new operator.
 *
 * @param id should be a string representative of a globally-unique identifier for the respective Affordance instance
 * when serialized to a document using an encoder.
 * @param relation should be a string representative of an IANA relation.
 * @param method should be a string representative of a protocol method.
 * @param uri should be a string representative of a URI.
 * @param metadata should be an object representative of protocol headers.
 * Example: {'Content_Type':'application/json'}
 * @return {Affordance}
 */
function affordance(id, relation, method, uri, metadata) {
    return new Affordance(id, relation, method, uri, metadata);
}

/**
 * Convenience method to allow for type checking outside of the scope of this module.
 * @param object is a reference to an object you would like to test the prototypal inheritance chain on.
 * @return {Boolean}
 */
affordance.isPrototypeOf = function (object) {
    return object instanceof Affordance;
};

module.exports = exports = affordance;