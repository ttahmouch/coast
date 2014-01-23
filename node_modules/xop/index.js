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
 * Simple, command line options parser that expects the Node.JS arguments vector.
 *
 * @return {*} for chaining.
 * @constructor
 */
function Options() {
    this._style = /^--?([^-=]+)(?:=(.+))?$/;
    this._values = {};
    return this;
}

/**
 * Accessor method that allows for setting a style of options to look for in the arguments vector.
 * The style should be represented by a Regular Expression.
 *
 * A style should include one capturing group indicative of the option.
 *
 * Default:
 *  -[-]option[=value]
 *
 * Optional:
 * - the second hyphen
 * - the equals value pair
 *
 * Example:
 *  -port=80 --host=127.0.0.1 --debug
 *
 * @param style should be an instance of {RegExp}.
 * @return {*} for chaining.
 */
Options.method('setStyle', function (style) {
    this._style = style instanceof RegExp ? style : this._style;
    return this;
});

/**
 * Parse expects the Node.JS arguments vector (process.argv) as an argument.
 * Parse enumerates an Array, and checks if each item conforms to an options style specified by a Regular Expression.
 *
 * Default:
 * If an argument conforms,
 * Then the option and value are tracked on a values Object.
 * Else, the argument is ignored.
 *
 * @param argv should be the Node.JS arguments vector, or any [{string}].
 * @return {*} for chaining.
 */
Options.method('parse', function (argv) {
    var style = this._style,
        values = this._values;

    /**
     * If argv is a non-empty [{string}],
     * Then attempt to check arguments for conformance to an options style.
     * Else, do nothing.
     */
    if (Array.isArray(argv)) {
        for (var arg in argv) {
            arg = argv[arg];
            if (typeof arg === 'string') {
                /**
                 * Is each argument an option?
                 *
                 * RegExp.exec() documentation:
                 * If the match succeeds,
                 * Then an Array is returned.
                 * Else, null is returned.
                 *
                 * The Array:
                 * 1st item is the matched text
                 * 2nd - Nth items are any captured groups
                 *
                 * Default:
                 * If the argument is an option,
                 * Then at least one group was captured.
                 * If a group was captured,
                 * Then it is a non-empty {string}.
                 * Else, it is {undefined}.
                 */
                var pair = style.exec(arg),
                    match = Array.isArray(pair),
                    option = match ? pair[1] : false,
                    value = match ? pair[2] : false;

                /**
                 * If the argument is NOT an option,
                 * Then do nothing.
                 * If the argument is an option,
                 * Then check the captured groups.
                 * If a single group was captured,
                 * Then an option is tracked with the value {boolean} true.
                 * If two groups were captured,
                 * Then an option is tracked with the value non-empty {string}.
                 */
                if (!!option) {
                    values[option] = !!value ? value : true;
                }
            }
        }
    }
    return this;
});

/**
 * Has is an introspective method that allows for checking if an option exists after parsing the arguments vector.
 *
 * @param option should be a {string} indicative of the name of the option.
 * @return {boolean} true if the option exists; {boolean} false, otherwise.
 */
Options.method('has', function (option) {
    return !!this._values[option];
});

/**
 * Get is an introspective method that allows for retrieving the value of an option after parsing the arguments vector.
 *
 * @param option should be a {string} indicative of the name of the option.
 * @return a non-empty {string}, or {boolean} true, if the value exists; {undefined}, otherwise.
 */
Options.method('get', function (option) {
    return this._values[option];
});

/**
 * Convenience method to enforce safe method invocations without the use of the new operator.
 *
 * @return {Options}
 */
function options() {
    return new Options();
}

/**
 * Convenience method to allow for type checking outside of the scope of this module.
 *
 * @param object is a reference to an object you would like to test the prototypal inheritance chain on.
 * @return {Boolean}
 */
options.isPrototypeOf = function (object) {
    return object instanceof Options;
};

module.exports = exports = options;
