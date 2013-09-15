// Falsy Values: false, 0, "", null, undefined, NaN

module.exports.isObject = exports.isObject = function(field) {
    return (!!field && typeof field === 'object');
};

module.exports.isArray = exports.isArray = function(field) {
    return (Array.isArray(field));
};

module.exports.isFunction = exports.isFunction = function(field) {
    return (typeof field === 'function');
};

module.exports.isString = exports.isString = function(field) {
    return (typeof field === 'string');
};

module.exports.isNumber = exports.isNumber = function(field) {
    return (typeof field === 'number');
};

module.exports.isBoolean = exports.isBoolean = function(field) {
    return (typeof field === 'boolean');
};

module.exports.isUndefined = exports.isUndefined = function(field) {
    return (typeof field === 'undefined');
};

module.exports.isNull = exports.isNull = function(field) {
    return (field === null);
};

module.exports.isPrimitive = exports.isPrimitive = function(field) {
    return (this.isNull(field)) ||
           (this.isString(field)) ||
           (this.isNumber(field)) ||
           (this.isBoolean(field));
};

module.exports.isEmpty = exports.isEmpty = (function() {
    var isEmpty = function(field) {
        for(var key in field) {
            if(field.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    };

    return function(field) {
        return (this.isObject(field) && isEmpty(field));
    };
})();