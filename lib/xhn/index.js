/**
 * Falsy Values: false, 0, "", null, undefined, NaN
 */

/**
 * - This module needs some heavy rework given what pieces of it actually got utilized in the development of the generator.
 * - Relation, protocol header, and protocol method code could stand to be removed since it instills coupling with
 * particular protocol preferences. If it doesn't get removed entirely, it should not be imposed on the user.
 * - Metadata seems unnecessary as a constructor instead of just allowing the user to proceed with any inlined object
 * that has properties and values representing protocol header fields.
 * - The HFactor definitions seem useless as well. Just allow the user to indicate the protocol method in the
 * constructor invocation of HC. They are purely convenience constructors for the actual HFactors, but the make the
 * codebase huge for seemingly no good reason.
 * - Cleanup unit tests whenever this work is finished.
 * - Also need to make this browser-compliant.
 */
Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

/**
 * Link Relation [RFC 5988]
 * HTTP Header Field Registrations [RFC 4229]
 * HTTP/1.1 [RFC 2616]
 * WebDAV [RFC 4918]
 */
var relations = [
        'alternate',
        'appendix',
        'archives',
        'author',
        'bookmark',
        'canonical',
        'chapter',
        'collection',
        'contents',
        'copyright',
        'create-form',
        'current',
        'describedby',
        'disclosure',
        'duplicate',
        'edit',
        'edit-form',
        'edit-media',
        'enclosure',
        'first',
        'glossary',
        'help',
        'hosts',
        'hub',
        'icon',
        'index',
        'item',
        'last',
        'latest-version',
        'license',
        'lrdd',
        'monitor',
        'monitor-group',
        'next',
        'next-archive',
        'nofollow',
        'noreferrer',
        'payment',
        'predecessor-version',
        'prefetch',
        'prev',
        'previous',
        'prev-archive',
        'related',
        'replies',
        'search',
        'section',
        'self',
        'service',
        'start',
        'stylesheet',
        'subsection',
        'successor-version',
        'tag',
        'up',
        'version-history',
        'via',
        'working-copy',
        'working-copy-of'
    ],
    fields = [
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
    ],
    methods = [
        'CONNECT',
        'COPY',
        'DELETE',
        'GET',
        'HEAD',
        'LOCK',
        'MKCOL',
        'MOVE',
        'OPTIONS',
        'POST',
        'PROPFIND',
        'PROPPATCH',
        'PUT',
        'TRACE',
        'UNLOCK'
    ];

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
    if ((typeof relation === 'string') && !isLinkRelation(relation)) {
        relations.push(relation);
    }
    return this;
}

function setHeaderField(field) {
    if ((typeof field === 'string') && !isHeaderField(field)) {
        fields.push(field);
    }
    return this;
}

function setMethod(method) {
    if ((typeof method === 'string') && !isMethod(method)) {
        methods.push(method);
    }
    return this;
}

function Metadata() {
    return this;
}

Metadata.method('addField', function (field, value) {
    if ((typeof field === 'string') && (typeof value === 'string') && isHeaderField(field)) {
        this[field] = value;
    }
    return this;
});

function metadata() {
    return new Metadata();
}

function InputControl(id, value, accept, required) {
    this._id = (typeof id === 'string') ? id : '';
    this._value = (typeof value !== 'undefined') ? value : '';
    this._accept = (Array.isArray(accept) && accept.length > 0) ? accept : ['text/plain'];
    this._required = (!!required);
    return this;
}

InputControl.method('setLabel', function (label) {
    this._label = (typeof label === 'string') ? label : this._label;
    return this;
});

InputControl.method('setHidden', function (hidden) {
    this._hidden = (typeof hidden === 'boolean') ? hidden : this._hidden;
    return this;
});

InputControl.method('setReadonly', function (readonly) {
    this._readonly = (typeof readonly === 'boolean') ? readonly : this._readonly;
    return this;
});

InputControl.method('setValueOptions', function (options) {
    this._options = (Array.isArray(options) && options.length > 0) ? options : this._options;
    return this;
});

InputControl.method('setRegExp', function (regexp) {
    this._regexp = (typeof regexp === 'string') ? regexp : this._regexp;
    return this;
});

function inputControl(id, value, accept, required) {
    return new InputControl(id, value, accept, required);
}

function HC(method, id, uri, relation, metadata) {
    this._method = isMethod(method) ? method : '';
    this._id = (typeof id === 'string') ? id : '';
    this._uri = (typeof uri === 'string') ? uri : '';
    this._relation = isLinkRelation(relation) ? relation : '';
    this._metadata = (!!metadata && (typeof metadata === 'object')) ? metadata : new Metadata();
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
    this._id = (typeof id === 'string') ? id : '';
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
            this._metadata = (typeof metadata === 'function') ? metadata : callback;
            this._input = (typeof input === 'function') ? input : callback;
            this._affordances = (typeof affordances === 'function') ? affordances : callback;
            this._lo = (typeof lo === 'function') ? lo : callback;
            this._le = (typeof le === 'function') ? le : callback;
            this._lt = (typeof lt === 'function') ? lt : callback;
            this._ln = (typeof ln === 'function') ? ln : callback;
            this._lid = (typeof lid === 'function') ? lid : callback;
            this._liu = (typeof liu === 'function') ? liu : callback;
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
    if (!!plugin && (typeof plugin === 'object')) {
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

        if (typeof stringified !== 'string') {
            return '';
        }

        if (typeof prettifier === 'string') {
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
        } else if (typeof prettifier === 'function') {
            prettified = prettifier(stringified);
        }

        if (!shouldBeQuiet) {
            console.log((!!prettified ? prettified : stringified));
        }

        return (!!prettified) ? prettified : stringified;
    };
})();

function prettify(prettifierType) {
    if (typeof prettifierType === 'string') {
        switch (prettifierType) {
            case 'json':
            case 'xml':
                prettifier = prettifierType;
                break;
            default:
                prettifier = '';
                break;
        }
    } else if (typeof prettifierType === 'function') {
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
        xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>',
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

        if (!!metadata && (typeof metadata === 'object')) {
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

        if (!!input && (typeof input === 'object')) {
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

        if (!!link && (typeof link === 'object')) {
            for (var property in link) {
                if (link.hasOwnProperty(property)) {
                    switch (property) {
                        case '_metadata':
                            metadata = metadataCallback(link[property]);
                            break;
                        case '_controls':
                            if (Array.isArray(link[property])) {
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

        if (!!affordances && (typeof affordances === 'object')) {
            for (var property in affordances) {
                if (affordances.hasOwnProperty(property)) {
                    switch (property) {
                        case '_id':
                            id = escapeXml(affordances[property]);
                            break;
                        case '_affordances':
                            affordances = affordances[property];
                            if (Array.isArray(affordances)) {
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

    function rootCallback(affordances) {
        return xmlDeclaration + affordancesCallback(affordances);
    }

    return define(
        metadataCallback,
        inputCallback,
        rootCallback,
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
