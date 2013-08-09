/**
 * Falsy Values: false, 0, "", null, undefined, NaN
 */

Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

/**
 * These header field definitions should remain static.
 * The array literal should be altered as needed when new header field definitions are
 * registered with the IETF with respective RFCs or when new protocols are created.
 *
 * Protocol header field definitions can be added later for newer protocols should
 * the need arise. Currently, the only protocol this module is concerned with is HTTP.
 *
 * @return {*}
 * @constructor
 */
function Headers() {
    /**
     * RFC 4229
     */
    this._headers = [
        'A-IM',
        'Accept',
        'Accept-Additions',
        'Accept-Charset',
        'Accept-Encoding',
        'Accept-Features',
        'Accept-Language',
        'Accept-Ranges',
        'Age',
        'Allow',
        'Alternates',
        'Authentication-Info',
        'Authorization',
        'C-Ext',
        'C-Man',
        'C-Opt',
        'C-PEP',
        'C-PEP-Info',
        'Cache-Control',
        'Connection',
        'Content-Base',
        'Content-Disposition',
        'Content-Encoding',
        'Content-ID',
        'Content-Language',
        'Content-Length',
        'Content-Location',
        'Content-MD5',
        'Content-Range',
        'Content-Script-Type',
        'Content-Style-Type',
        'Content-Type',
        'Content-Version',
        'Cookie',
        'Cookie2',
        'DAV',
        'Date',
        'Default-Style',
        'Delta-Base',
        'Depth',
        'Derived-From',
        'Destination',
        'Differential-ID',
        'Digest',
        'ETag',
        'Expect',
        'Expires',
        'Ext',
        'From',
        'GetProfile',
        'Host',
        'IM',
        'If',
        'If-Match',
        'If-Modified-Since',
        'If-None-Match',
        'If-Range',
        'If-Unmodified-Since',
        'Keep-Alive',
        'Label',
        'Last-Modified',
        'Link',
        'Location',
        'Lock-Token',
        'MIME-Version',
        'Man',
        'Max-Forwards',
        'Meter',
        'Negotiate',
        'Opt',
        'Ordering-Type',
        'Overwrite',
        'P3P',
        'PEP',
        'PICS-Label',
        'Pep-Info',
        'Position',
        'Pragma',
        'ProfileObject',
        'Protocol',
        'Protocol-Info',
        'Protocol-Query',
        'Protocol-Request',
        'Proxy-Authenticate',
        'Proxy-Authentication-Info',
        'Proxy-Authorization',
        'Proxy-Features',
        'Proxy-Instruction',
        'Public',
        'Range',
        'Referer',
        'Retry-After',
        'Safe',
        'Security-Scheme',
        'Server',
        'Set-Cookie',
        'Set-Cookie2',
        'SetProfile',
        'SoapAction',
        'Status-URI',
        'Surrogate-Capability',
        'Surrogate-Control',
        'TCN',
        'TE',
        'Timeout',
        'Trailer',
        'Transfer-Encoding',
        'URI',
        'Upgrade',
        'User-Agent',
        'Variant-Vary',
        'Vary',
        'Via',
        'WWW-Authenticate',
        'Want-Digest',
        'Warning'
    ];
    return this;
}

/**
 * Check if the header field definition exists, and is acknowledged by various standards documents.
 *
 * @param header is a string literal representation of a header field defintion. Example: 'Accept'
 * @return true if the header field definition does exist; false otherwise.
 */
Headers.method('exists', function (header) {
    var headers = this._headers;
    return (headers.lastIndexOf(header) !== -1);
});

/**
 * Convenience method to enforce safe method invocations without the use of the new operator.
 * @return {Headers}
 */
function headers() {
    return new Headers();
}

/**
 * Convenience method to allow for type checking outside of the scope of this module.
 * @param object is a reference to an object you would like to test the prototypal inheritance chain on.
 * @return {Boolean}
 */
headers.isPrototypeOf = function (object) {
    return object instanceof Headers;
};

module.exports = exports = headers;
