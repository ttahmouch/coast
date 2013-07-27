/**
 * At the expense of having to rewrite every bit of code that uses my old validate module,
 * I'm going to just include the contents of the module here.
 */
// Module: validate ---------------------------------------------------------------------------------------------------
// Falsy Values: false, 0, "", null, undefined, NaN

var validate = {};

validate.isObject = function (field) {
    return (!!field && typeof field === 'object');
};

validate.isArray = function (field) {
    return (Array.isArray(field));
};

validate.isFunction = function (field) {
    return (typeof field === 'function');
};

validate.isString = function (field) {
    return (typeof field === 'string');
};

validate.isNumber = function (field) {
    return (typeof field === 'number');
};

validate.isBoolean = function (field) {
    return (typeof field === 'boolean');
};

validate.isUndefined = function (field) {
    return (typeof field === 'undefined');
};

validate.isNull = function (field) {
    return (field === null);
};

validate.isPrimitive = function (field) {
    return (this.isNull(field)) ||
        (this.isString(field)) ||
        (this.isNumber(field)) ||
        (this.isBoolean(field));
};

validate.isEmpty = (function () {
    var isEmpty = function (field) {
        for (var key in field) {
            if (field.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    };

    return function (field) {
        return (this.isObject(field) && isEmpty(field));
    };
})();

//---------------------------------------------------------------------------------------------------------------------

/**
 * Link Relation [RFC 5988]
 */
var relations = [
        'alternate', 'appendix', 'archives', 'author', 'bookmark', 'canonical', 'chapter', 'collection', 'contents', 'copyright', 'create-form', 'current', 'describedby', 'disclosure', 'duplicate', 'edit', 'edit-form', 'edit-media', 'enclosure', 'first', 'glossary', 'help', 'hosts', 'hub', 'icon', 'index', 'item', 'last', 'latest-version', 'license', 'lrdd', 'monitor', 'monitor-group', 'next', 'next-archive', 'nofollow', 'noreferrer', 'payment', 'predecessor-version', 'prefetch', 'prev', 'previous', 'prev-archive', 'related', 'replies', 'search', 'section', 'self', 'service', 'start', 'stylesheet', 'subsection', 'successor-version', 'tag', 'up', 'version-history', 'via', 'working-copy', 'working-copy-of'
    ],
    /**
     * HTTP Header Field Registrations [RFC 4229]
     */
        fields = [
        'A-IM', 'Accept', 'Accept-Additions', 'Accept-Charset', 'Accept-Encoding', 'Accept-Features', 'Accept-Language', 'Accept-Ranges', 'Age', 'Allow', 'Alternates', 'Authentication-Info', 'Authorization', 'C-Ext', 'C-Man', 'C-Opt', 'C-PEP', 'C-PEP-Info', 'Cache-Control', 'Connection', 'Content-Base', 'Content-Disposition', 'Content-Encoding', 'Content-ID', 'Content-Language', 'Content-Length', 'Content-Location', 'Content-MD5', 'Content-Range', 'Content-Script-Type', 'Content-Style-Type', 'Content-Type', 'Content-Version', 'Cookie', 'Cookie2', 'DAV', 'Date', 'Default-Style', 'Delta-Base', 'Depth', 'Derived-From', 'Destination', 'Differential-ID', 'Digest', 'ETag', 'Expect', 'Expires', 'Ext', 'From', 'GetProfile', 'Host', 'IM', 'If', 'If-Match', 'If-Modified-Since', 'If-None-Match', 'If-Range', 'If-Unmodified-Since', 'Keep-Alive', 'Label', 'Last-Modified', 'Link', 'Location', 'Lock-Token', 'MIME-Version', 'Man', 'Max-Forwards', 'Meter', 'Negotiate', 'Opt', 'Ordering-Type', 'Overwrite', 'P3P', 'PEP', 'PICS-Label', 'Pep-Info', 'Position', 'Pragma', 'ProfileObject', 'Protocol', 'Protocol-Info', 'Protocol-Query', 'Protocol-Request', 'Proxy-Authenticate', 'Proxy-Authentication-Info', 'Proxy-Authorization', 'Proxy-Features', 'Proxy-Instruction', 'Public', 'Range', 'Referer', 'Retry-After', 'Safe', 'Security-Scheme', 'Server', 'Set-Cookie', 'Set-Cookie2', 'SetProfile', 'SoapAction', 'Status-URI', 'Surrogate-Capability', 'Surrogate-Control', 'TCN', 'TE', 'Timeout', 'Trailer', 'Transfer-Encoding', 'URI', 'Upgrade', 'User-Agent', 'Variant-Vary', 'Vary', 'Via', 'WWW-Authenticate', 'Want-Digest', 'Warning'
    ],
    /**
     * HTTP/1.1 [RFC 2616]
     * WebDAV [RFC 4918]
     */
        methods = [
        'CONNECT', 'COPY', 'DELETE', 'GET', 'HEAD', 'LOCK', 'MKCOL', 'MOVE', 'OPTIONS', 'POST', 'PROPFIND', 'PROPPATCH', 'PUT', 'TRACE', 'UNLOCK'
    ];

Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

function isLinkRelation(relation) {
    return (relations.lastIndexOf(relation) !== -1);
}

function isHeaderField(field) {
    return (fields.lastIndexOf(field) !== -1);
}

function isMethod(method) {
    return (methods.lastIndexOf(method) !== -1);
}

function setLinkRelation(relation) {
    if (validate.isString(relation) && !isLinkRelation(relation)) {
        relations.push(relation);
    }
    return this;
}

function setHeaderField(field) {
    if (validate.isString(field) && !isHeaderField(field)) {
        fields.push(field);
    }
    return this;
}

function setMethod(method) {
    if (validate.isString(method) && !isMethod(method)) {
        methods.push(method);
    }
    return this;
}

function Metadata() {
    return this;
}

Metadata.method('addField', function (field, value) {
    if (validate.isString(field) &&
        validate.isString(value) &&
        isHeaderField(field)) {
        this[field] = value;
    }
    return this;
});

function metadata() {
    return new Metadata();
}

function InputControl(id, value, accept, required) {
    this._id = (validate.isString(id)) ? id : '';
    this._value = (!validate.isUndefined(value)) ? value : '';
    this._accept = (validate.isArray(accept) && accept.length > 0) ? accept : ['text/plain'];
    this._required = (!!required);
    return this;
}

InputControl.method('setLabel', function (label) {
    this._label = (validate.isString(label)) ? label : this._label;
    return this;
});

InputControl.method('setHidden', function (hidden) {
    this._hidden = (validate.isBoolean(hidden)) ? hidden : this._hidden;
    return this;
});

InputControl.method('setReadonly', function (readonly) {
    this._readonly = (validate.isBoolean(readonly)) ? readonly : this._readonly;
    return this;
});

InputControl.method('setValueOptions', function (options) {
    this._options = (validate.isArray(options) && options.length > 0) ? options : this._options;
    return this;
});

InputControl.method('setRegExp', function (regexp) {
    this._regexp = (validate.isString(regexp)) ? regexp : this._regexp;
    return this;
});

function inputControl(id, value, accept, required) {
    return new InputControl(id, value, accept, required);
}

function HC(method, id, uri, relation, metadata) {
    this._method = isMethod(method) ? method : '';
    this._id = validate.isString(id) ? id : '';
    this._uri = validate.isString(uri) ? uri : '';
    this._relation = isLinkRelation(relation) ? relation : '';
    this._metadata = validate.isObject(metadata) ? metadata : new Metadata();
    return this;
}

function hc(method, id, uri, relation, metadata) {
    return new HC(method, id, uri, relation, metadata);
}

function LHC(method, id, uri, relation, metadata) {
    return HC.call(this, method, id, uri, relation, metadata);
}

LHC.prototype = new HC();
LHC.prototype.constructor = LHC;

function FHC(method, id, uri, relation, metadata) {
    this._controls = [];
    return HC.call(this, method, id, uri, relation, metadata);
}

FHC.prototype = new HC();
FHC.prototype.constructor = FHC;

FHC.method('addInputControl', function (inputControl) {
    if ((inputControl instanceof InputControl) &&
        (this._controls.lastIndexOf(inputControl) === -1)) {
        this._controls.push(inputControl);
    }
    return this;
});

function LO(id, uri, relation, metadata) {
    return LHC.call(this, 'GET', id, uri, relation, metadata);
}

LO.prototype = new LHC();
LO.prototype.constructor = LO;

function lo(id, uri, relation, metadata) {
    return new LO(id, uri, relation, metadata);
}

function LE(id, uri, relation, metadata) {
    return LHC.call(this, 'GET', id, uri, relation, metadata);
}

LE.prototype = new LHC();
LE.prototype.constructor = LE;

function le(id, uri, relation, metadata) {
    return new LE(id, uri, relation, metadata);
}

function LT(id, uri, relation, metadata) {
    return FHC.call(this, 'GET', id, uri, relation, metadata);
}

LT.prototype = new FHC();
LT.prototype.constructor = LT;

function lt(id, uri, relation, metadata) {
    return new LT(id, uri, relation, metadata);
}

function LIU(id, uri, relation, metadata) {
    return FHC.call(this, 'PUT', id, uri, relation, metadata);
}

LIU.prototype = new FHC();
LIU.prototype.constructor = LIU;

function liu(id, uri, relation, metadata) {
    return new LIU(id, uri, relation, metadata);
}

function LID(id, uri, relation, metadata) {
    return FHC.call(this, 'DELETE', id, uri, relation, metadata);
}

LID.prototype = new FHC();
LID.prototype.constructor = LID;

function lid(id, uri, relation, metadata) {
    return new LID(id, uri, relation, metadata);
}

function LN(id, uri, relation, metadata) {
    return FHC.call(this, 'POST', id, uri, relation, metadata);
}

LN.prototype = new FHC();
LN.prototype.constructor = LN;

function ln(id, uri, relation, metadata) {
    return new LN(id, uri, relation, metadata);
}

function Affordances(id) {
    this._id = (validate.isString(id)) ? id : '';
    this._affordances = [];
    return this;
}

Affordances.method('addAffordance', function (affordance) {
    if ((affordance instanceof HC || affordance instanceof Affordances) &&
        (this._affordances.lastIndexOf(affordance) === -1)) {
        this._affordances.push(affordance);
    }
    return this;
});

function affordances(id) {
    return new Affordances(id);
}

var HypermediaNotationDelegate = (function () {
        var callback = function () {
            return null;
        };

        return function HypermediaNotationDelegate(metadata, input, affordances, lo, le, lt, ln, lid, liu) {
            this._metadata = (validate.isFunction(metadata)) ? metadata : callback;
            this._input = (validate.isFunction(input)) ? input : callback;
            this._affordances = (validate.isFunction(affordances)) ? affordances : callback;
            this._lo = (validate.isFunction(lo)) ? lo : callback;
            this._le = (validate.isFunction(le)) ? le : callback;
            this._lt = (validate.isFunction(lt)) ? lt : callback;
            this._ln = (validate.isFunction(ln)) ? ln : callback;
            this._lid = (validate.isFunction(lid)) ? lid : callback;
            this._liu = (validate.isFunction(liu)) ? liu : callback;
            return this;
        }
    })(),
    template = new HypermediaNotationDelegate(),
    prettifier = '',
    shouldBeQuiet = false;

function define(metadata, input, affordances, lo, le, lt, ln, lid, liu) {
    return new HypermediaNotationDelegate(metadata, input, affordances, lo, le, lt, ln, lid, liu);
}

function plugin(plugin) {
    if (validate.isObject(plugin)) {
        for (var key in plugin) {
            if ((plugin.hasOwnProperty(key)) &&
                (template.hasOwnProperty(key))) {
                template[key] = plugin[key];
            }
        }
    }
    return this;
}

var stringify = (function () {
    var prettyData = require('pretty-data').pd;

    return function stringify(affordances) {
        var stringified = (affordances instanceof Affordances) ? template._affordances(affordances) : null,
            prettified = null;

        if (!validate.isString(stringified)) {
            return '';
        }

        if (validate.isString(prettifier)) {
            switch (prettifier) {
                case 'json':
                    prettified = prettyData.json(stringified);
                    break;
                case 'xml':
                    prettified = prettyData.xml(stringified);
                    break;
                default:
                    break;
            }
        } else if (validate.isFunction(prettifier)) {
            prettified = prettifier(stringified);
        }

        if (!shouldBeQuiet) {
            console.log((!!prettified ? prettified : stringified));
        }

        return (!!prettified) ? prettified : stringified;
    };
})();

function prettify(prettifierType) {
    if (validate.isString(prettifierType)) {
        switch (prettifierType) {
            case 'json':
            case 'xml':
                prettifier = prettifierType;
                break;
            default:
                prettifier = '';
                break;
        }
    } else if (validate.isFunction(prettifierType)) {
        prettifier = prettifierType;
    } else {
        prettifier = '';
    }
    return this;
}

function quiet(mode) {
    shouldBeQuiet = (!!mode);
    return this;
}

var NavAL_XML = (function () {
    var key = /%k/g,
        value = /%v/g,
        pairs = /%f/g,
        body = /%b/g,
        amp = /&/g,
        lt = /</g,
        gt = />/g,
        quot = /"/g,
        apos = /'/g,
        metaTag = '<meta id="%k" value="%v"/>',
        inputTag = '<input%f/>',
        linkTag = '<link%f>%b</link>',
        affordancesTag = '<affordances id="%v">%f</affordances>',
        field = ' %k="%v"';

    function escapeXml(unsafe) {
        return unsafe
            .toString()
            .replace(amp, '&amp;')
            .replace(lt, '&lt;')
            .replace(gt, '&gt;')
            .replace(quot, '&quot;')
            .replace(apos, '&apos;');
    }

    function metadataCallback(metadata) {
        var fields = '';

        if (validate.isObject(metadata)) {
            for (var property in metadata) {
                if (metadata.hasOwnProperty(property)) {
                    fields += metaTag
                        .replace(key, escapeXml(property))
                        .replace(value, escapeXml(metadata[property]));
                }
            }
        }

        return fields;
    }

    function inputCallback(input) {
        var fields = '';

        if (validate.isObject(input)) {
            for (var property in input) {
                if (input.hasOwnProperty(property)) {
                    fields += field
                        .replace(key, escapeXml(property.slice(1)))
                        .replace(value, escapeXml(input[property]));
                }
            }
        }

        return inputTag.replace(pairs, fields);
    }

    function linkCallback(link) {
        var fields = '',
            metadata = '',
            controls = '';

        if (validate.isObject(link)) {
            for (var property in link) {
                if (link.hasOwnProperty(property)) {
                    switch (property) {
                        case '_metadata':
                            metadata = metadataCallback(link[property]);
                            break;
                        case '_controls':
                            if (validate.isArray(link[property])) {
                                property = link[property];
                                for (var control in property) {
                                    control = property[control];
                                    controls += inputCallback(control);
                                }
                            }
                            break;
                        default:
                            fields += field
                                .replace(key, escapeXml(property.slice(1)))
                                .replace(value, escapeXml(link[property]));
                            break;
                    }
                }
            }
        }

        return linkTag.replace(pairs, fields).replace(body, metadata + controls);
    }

    function affordancesCallback(affordances) {
        var fields = '',
            id = '';

        if (validate.isObject(affordances)) {
            for (var property in affordances) {
                if (affordances.hasOwnProperty(property)) {
                    switch (property) {
                        case '_id':
                            id = escapeXml(affordances[property]);
                            break;
                        case '_affordances':
                            affordances = affordances[property];
                            if (validate.isArray(affordances)) {
                                for (var link in affordances) {
                                    link = affordances[link];
                                    fields += (link.hasOwnProperty('_affordances'))
                                        ? affordancesCallback(link)
                                        : linkCallback(link);
                                }
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
        }

        return affordancesTag.replace(value, id).replace(pairs, fields);
    }

    return define(
        metadataCallback,
        inputCallback,
        affordancesCallback,
        linkCallback,
        linkCallback,
        linkCallback,
        linkCallback,
        linkCallback,
        linkCallback
    );
})();

var NavAL_JSON = (function () {
    return define(
        JSON.stringify,
        JSON.stringify,
        JSON.stringify,
        JSON.stringify,
        JSON.stringify,
        JSON.stringify,
        JSON.stringify,
        JSON.stringify,
        JSON.stringify
    );
})();

/**
 * Consider proposing Input Control type names to IANA.
 * Consider proposing Method OPTIONS link relation to IANA. This helps with dynamic introspection of a resource.
 */

/**
 * Create resource behavior patterns that are governed by the affordances represented in an instance of a Link
 * Container.
 *
 * Also, need to consider what link semantics are available in languages I decide to support with the plugin interface.
 */

module.exports.isLinkRelation = exports.isLinkRelation = isLinkRelation;
module.exports.isHeaderField = exports.isHeaderField = isHeaderField;
module.exports.isMethod = exports.isMethod = isMethod;
module.exports.setLinkRelation = exports.setLinkRelation = setLinkRelation;
module.exports.setHeaderField = exports.setHeaderField = setHeaderField;
module.exports.setMethod = exports.setMethod = setMethod;

module.exports.metadata = exports.metadata = metadata;
module.exports.inputControl = exports.inputControl = inputControl;
module.exports.affordances = exports.affordances = affordances;
module.exports.hc = exports.hc = hc;
module.exports.lo = exports.lo = lo;
module.exports.le = exports.le = le;
module.exports.lt = exports.lt = lt;
module.exports.ln = exports.ln = ln;
module.exports.lid = exports.lid = lid;
module.exports.liu = exports.liu = liu;

module.exports.define = exports.define = define;
module.exports.plugin = exports.plugin = plugin;
module.exports.stringify = exports.stringify = stringify;
module.exports.prettify = exports.prettify = prettify;
module.exports.quiet = exports.quiet = quiet;
module.exports.NavAL_XML = exports.NavAL_XML = NavAL_XML;
module.exports.NavAL_JSON = exports.NavAL_JSON = NavAL_JSON;
