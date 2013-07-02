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
 * @param id is a String representation of an identifier for a hypermedia control (affordance). This argument is
 * optional, but if provided must be globally unique within the system.
 *
 * @return {*}
 * @constructor
 */
function Affordance(method, resource, arguments, id) {
    this._method = (typeof method === 'string') ? method : '';
    this._resource = (typeof resource === 'string') ? resource : '';
    this._arguments = (typeof arguments === 'string') ? arguments : '';
    this._id = (typeof id === 'string') ? id : '';
    return this;
}

/**
 * Overridden with the intention of stringifying an Affordance instance in a more readable manner.
 */
Affordance.method('toString', function () {
    /**
     * Get a reference to all the fields of an Affordance instance.
     * These fields may either be populated String instances or empty String instances. In other words, truthy or falsy.
     */
    var method = this._method,
        resource = this._resource,
        arguments = this._arguments,
        id = this._id;

    /**
     * Avoid logging empty strings. Makes for easier reading.
     */
    method = !!method ? method : '[NO METHOD]';
    resource = !!resource ? resource : '[NO RESOURCE]';
    arguments = !!arguments ? arguments : '[NO ARGUMENTS]';
    id = !!id ? id : '[NO ID]';

    return method + ' ' + resource + ' ' + arguments + ' ' + id;
});

/**
 * Convenience method to enforce safe method invocations without the use of the new operator.
 *
 * @param method is a String representation of a protocol agnostic Method.
 * @param resource is a String representation of a Resource in Uri or Uri Template form.
 * @param arguments is a String representation of a Media Type using MIME standard convention.
 * @param id is a String representation of an identifier for a hypermedia control (affordance). This argument is
 * optional, but if provided must be globally unique within the system.
 * @return {Affordance}
 */
function affordance(method, resource, arguments, id) {
    return new Affordance(method, resource, arguments, id);
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
