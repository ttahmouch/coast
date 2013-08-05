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

function ObjectNotation(container, value, array, object, emptyArray, emptyObject, arrayField, objectField, fieldDelimiter, hyperlink) {
    this.CONTAINER = container;
    this.VALUE = value;
    this.ARRAY = array;
    this.OBJECT = object;
    this.EMPTY_ARRAY = emptyArray;
    this.EMPTY_OBJECT = emptyObject;
    this.ARRAY_FIELD = arrayField;
    this.OBJECT_FIELD = objectField;
    this.FIELD_DELIMITER = fieldDelimiter;
    this.HYPERLINK = hyperlink;
    return this;
}

var define = function (container, value, array, object, emptyArray, emptyObject, arrayField, objectField, fieldDelimiter, hyperlink) {
        return new ObjectNotation(container, value, array, object, emptyArray, emptyObject, arrayField, objectField, fieldDelimiter, hyperlink);
    },
    template = define('', '', '', '', '', '', '', '', '', ''),
    prettify = '',
    linkify = false,
    quiet = true,
    linkProperty = 'href';

module.exports.define = exports.define = define;

/*
 * Accepts 'json', 'xml', or a prettifier function.
 * If 'json' or 'xml' is passed in, it uses an existing prettifier module.
 * If a prettifier function is passed in, it uses that.
 * Anything else passed in defaults to an empty string.
 * The arity of the function should be one, and the argument should be a string (stringified object).
 * The return value of the function should be prettified string.
 */
module.exports.prettify = exports.prettify = function (mediaType) {
    if (validate.isString(mediaType)) {
        switch (mediaType) {
            case 'json':
            case 'xml':
                prettify = mediaType;
                break;
            default:
                prettify = '';
                break;
        }
    } else if (validate.isFunction(mediaType)) {
        prettify = mediaType;
    } else {
        prettify = '';
    }
    return this;
};

module.exports.linkify = exports.linkify = function (should) {
    linkify = (!!should);
    return this;
};

module.exports.quiet = exports.quiet = function (mode) {
    quiet = (!!mode);
    return this;
};

module.exports.plugin = exports.plugin = function (plugin) {
    if (validate.isObject(plugin)) {
        for (var key in plugin) {
            if ((plugin.hasOwnProperty(key)) &&
                (template.hasOwnProperty(key))) {
                template[key] = plugin[key];
            }
        }
    }
    return this;
};

module.exports.stringify = exports.stringify = (function () {
    var prettyData = require('pretty-data').pd,
        delimiter = new RegExp(template.FIELD_DELIMITER + '$'),
        property = /%k/g,
        value = /%v/g,
        body = /%b/;

    var nullify = function (data) {
        return (validate.isNull(data)) ||
            (validate.isUndefined(data)) ||
            (validate.isFunction(data)) ? null : data;
    };

    var chomp = function (data) {
        return (delimiter.test(data)) ? data.slice(0, -1)
            : data;
    };

    var quote = function (data) {
        return (validate.isString(data)) ? ('"' + data + '"')
            : data;
    };

    var anchor = function (data, link) {
        return (linkify && (!!link) && (validate.isString(data))) ? template.HYPERLINK.replace(value, data)
            : data;
    };

    var expand = function (data, link) {
        var fields = '',
            structure = '',
            field = '',
            empty = false;

        data = anchor(quote(nullify(data)), link);

        if (validate.isPrimitive(data)) {
            return template.VALUE.replace(value, data);
        }
        if (validate.isEmpty(data)) {
            empty = true;
        }
        if (validate.isArray(data)) {
            structure = (empty) ? template.EMPTY_ARRAY
                : template.ARRAY;
            field = template.ARRAY_FIELD;
        } else if (validate.isObject(data)) {
            structure = (empty) ? template.EMPTY_OBJECT
                : template.OBJECT;
            field = template.OBJECT_FIELD;
        }
        if (!empty) {
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    fields += (field.replace(value, expand(data[key], (key === linkProperty)))
                        .replace(property, quote(key)) + template.FIELD_DELIMITER);
                }
            }
        }
        return (!empty) ? structure.replace(body, chomp(fields))
            : structure.slice(0);
    };

    return function (value) {
        var stringified = template.CONTAINER.replace(body, expand(value));
        var prettified = null;
        if (validate.isString(prettify)) {
            switch (prettify) {
                case 'json':
                    prettified = prettyData.json(stringified);
                    break;
                case 'xml':
                    prettified = prettyData.xml(stringified);
                    break;
                default:
                    break;
            }
        } else if (validate.isFunction(prettify)) {
            prettified = prettify(stringified);
        }
        if (!quiet) {
            console.log((!!prettified ? prettified : stringified));
        }
        return (!!prettified) ? prettified
            : stringified;
    };
})();

/*
 <?xml version="1.0" encoding="UTF-8"?>
 <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
 <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
 <head>
 <title>%t</title>
 </head>
 <body>%b</body>
 </html>
 */

/*
 <?xml version="1.0" encoding="UTF-8"?>
 <!DOCTYPE html>
 <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
 <head>
 <meta charset="UTF-8"></meta>
 <title>%t</title>
 <link href="css/bootstrap.min.css" rel="stylesheet"></link>
 <link href="css/crave.css" rel="stylesheet"></link>
 </head>
 <body>
 %b
 <script src="http://code.jquery.com/jquery-latest.js"></script>
 <script src="js/bootstrap.min.js"></script>
 </body>
 </html>
 */

module.exports.XHTML = exports.XHTML = exports.define(
    '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en"><head><title>%t</title></head><body>%b</body></html>',
    '<p class="value">%v</p>',
    '<ol class="array">%b</ol>',
    '<dl class="object">%b</dl>',
    '',
    '',
    '<li>%v</li>',
    '<dt>%k</dt><dd title=%k>%v</dd>',
    '\n',
    '<a href=%v>%v</a>'
);

module.exports.XHTML5 = exports.XHTML5 = exports.define(
    '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en"><head><meta charset="UTF-8"></meta><title>%t</title><link href="css/bootstrap.min.css" rel="stylesheet"></link><link href="css/crave.css" rel="stylesheet"></link></head><body>%b<script src="http://code.jquery.com/jquery-latest.js"></script><script src="js/bootstrap.min.js"></script></body></html>',
    '<p class="value">%v</p>',
    '<ol class="array">%b</ol>',
    '<dl class="object">%b</dl>',
    '<ol class="array" />',
    '<dl class="object" />',
    '<li>%v</li>',
    '<dt>%k</dt><dd title=%k>%v</dd>',
    '\n',
    '<a href=%v>%v</a>'
);

module.exports.JSON = exports.JSON = exports.define(
    '%b',
    '%v',
    '[%b]',
    '{%b}',
    '[]',
    '{}',
    '%v',
    '%k:%v',
    ',',
    '%v'
);
