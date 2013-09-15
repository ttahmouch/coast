/**
 * Invoking this method allows you to synthesize a property with the name (String) specified in the arguments list.
 *
 * @param that is a reference to the object you would like to have accessors synthesized on.
 * @param attribute is a string indicating the type of accessor methods you would like to have synthesized
 * at runtime. Must be explicitly 'readonly' or 'readwrite.' If 'readonly,' you must specify a value for the
 * field to be set ONCE. A setter will not be synthesized. If 'readwrite,' you may pass null for
 * field, or you may also pass an initial value. A setter and getter will be synthesized.
 * @param name is the String name to be used in the dynamic creation of the accessor methods. The generated
 * accessor methods will be name (getter) and setName (setter), respectively.
 * @param field is the variable that will be referenced lexically by the accessor methods.
 * @param func is optional, but if provided must be a function object that accepts one argument
 * and returns true or false depending on whether the argument passed to the set accessor method was valid. Truthy
 * or falsy values will not be accepted. The use for this argument comes into play when you need a simple means of
 * type-checking or even higher level semantic checking for things such as URI validation, MIME media type
 * validation, amongst a seemingly infinite set of other things. Also, this field is ignored if the
 * attribute is 'readonly.'
 *
 * @throws TypeError if the attribute isn't 'readonly' or 'readwrite.'
 * @throws TypeError if the name is not explicitly a string object.
 * @throws TypeError if the func is not explicitly a function object or undefined (due to not passing
 * the argument since it's optional).
 * @throws TypeError if the func was a function that did not return an explicit true or false value.
 * Truthy and falsy values will not be accepted.
 * @throws TypeError if the invocation of the provided function func on the provided field initializer value returned
 * false. This should always return true, especially if you plan to synthesize 'readonly,' otherwise there is no means
 * of altering the private field later.
 */
module.exports = exports = function (that, attribute, name, field, func) {
    var isFunction = (typeof func === 'function'),
        isUndefined = (typeof func === 'undefined'),
        isString = (typeof name === 'string'),
        isBoolean = (isFunction) ? (typeof func(field) === 'boolean') : false,
        isValid = (isBoolean) ? func(field) : true,
        isReadOnly = (attribute === 'readonly'),
        isReadWrite = (attribute === 'readwrite'),
        getName = (isString) ? name.charAt(0).toLowerCase() + name.slice(1) : '',
        setName = (isString) ? 'set' + name.charAt(0).toUpperCase() + name.slice(1) : '';

    if (!isReadOnly && !isReadWrite) {
        throw new TypeError('Expected the attribute to be a string of readonly or readwrite.');
    } else if (!isString) {
        throw new TypeError('Expected a string object for the name, but instead received ' + name + '.');
    } else if (!isUndefined && !isFunction) {
        throw new TypeError('Expected a function object for the func, but instead received ' + func + '.');
    } else if (isFunction && !isBoolean) {
        throw new TypeError('Expected a boolean return for the invocation of ' + func + '.');
    } else if (!isValid) {
        throw new TypeError('Invocation of your validator function ' + func + ' on your field initializer '
            + field + ' returned false. This is especially not good if you are only synthesizing a getter method.');
    }

    that[getName] = function () {
        return field;
    };

    if (isReadWrite) {
        that[setName] = function (argument) {
            field = (!func || func(argument)) ? argument : field;
            return this;
        };
    }
};
