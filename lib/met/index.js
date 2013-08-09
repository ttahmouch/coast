/**
 * Falsy Values: false, 0, "", null, undefined, NaN
 */

Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

/**
 * These methods should remain static.
 * The array literal should be altered as needed when new methods are
 * registered with the IETF with respective RFCs or when new protocols are created.
 *
 * Protocol methods can be added later for newer protocols should the need arise.
 * Currently, the only protocols this module is concerned with is HTTP and WebDAV.
 *
 * @return {*}
 * @constructor
 */
function Methods() {
    /**
     * RFC 2616
     * RFC 2518
     * RFC 3253
     * RFC 3648
     * RFC 3744
     * draft-dusseault-http-patch
     * draft-reschke-webdav-search
     */
    this._methods = [
        'ACL',
        'BASELINE-CONTROL',
        'CHECKIN',
        'CHECKOUT',
        'CONNECT',
        'COPY',
        'DELETE',
        'GET',
        'HEAD',
        'LABEL',
        'LOCK',
        'MERGE',
        'MKACTIVITY',
        'MKCOL',
        'MKWORKSPACE',
        'MOVE',
        'OPTIONS',
        'ORDERPATCH',
        'PATCH',
        'POST',
        'PROPFIND',
        'PROPPATCH',
        'PUT',
        'REPORT',
        'SEARCH',
        'TRACE',
        'UNCHECKOUT',
        'UNLOCK',
        'UPDATE',
        'VERSION-CONTROL'
    ];
    return this;
}

/**
 * Check if the method exists, and is acknowledged by various standards documents.
 *
 * @param met is a string literal representation of a method. Example: 'PUT'
 * @return true if the method does exist; false otherwise.
 */
Methods.method('exists', function (met) {
    var methods = this._methods;
    return (methods.lastIndexOf(met) !== -1);
});

/**
 * Convenience method to enforce safe method invocations without the use of the new operator.
 * @return {Methods}
 */
function methods() {
    return new Methods();
}

/**
 * Convenience method to allow for type checking outside of the scope of this module.
 * @param object is a reference to an object you would like to test the prototypal inheritance chain on.
 * @return {Boolean}
 */
methods.isPrototypeOf = function (object) {
    return object instanceof Methods;
};

module.exports = exports = methods;
