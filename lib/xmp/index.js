var bChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'()+_,-./:=? ",
    crlf = '\r\n',
    hyphens = '--',
    usAscii8BitRegex = /^[\x00-\xFF]*$/,
    usAscii7BitRegex = /^[\x00-\x7F]*$/,
    crlfRegex = /(\r\n)/g;

Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

/**
 * Generates a String of all US-ASCII characters between 0 and 127. Yes, even non-printable characters.
 * @return {String}
 */
function us7BitAscii() {
    var ascii = '';
    for (var i = 0; i < 127; i++) {
        ascii += String.fromCharCode(i);
    }
    return ascii;
}

/**
 * Generates a String of all US-ASCII characters between 0 and 255. Yes, even non-printable characters.
 * @return {String}
 */
function us8BitAscii() {
    var ascii = '';
    for (var i = 0; i < 255; i++) {
        ascii += String.fromCharCode(i);
    }
    return ascii;
}

/**
 * Generates a count between 0 and 69. Math.random generates a random float [0, 1).
 * So the number can never be exactly 70.
 * @return {Number}
 */
function boundaryCount() {
    return Math.floor(Math.random() * 70);
}

/**
 * Generates a random MIME boundary-acceptable, US-ASCII character.
 * @return {String}
 */
function boundaryCharacter() {
    return bChars.charAt(Math.floor(Math.random() * bChars.length));
}

/**
 * Generates a full boundary based on the count generated and every random character generated.
 * @return {String}
 */
function boundary() {
    var count = boundaryCount(),
        tempString = '',
        notSpace = boundaryCharacter();

    for (var i = 0; i < count; i++) {
        tempString += boundaryCharacter();
    }

    while (notSpace === ' ') {
        notSpace = boundaryCharacter();
    }

    return tempString + notSpace;
}

/**
 * Prefixes a set of hyphens to be MIME compliant.
 * @param boundary is a generated boundary using boundary()
 * @return {String}
 */
function dashBoundary(boundary) {
    return hyphens + boundary.toString();
}

/**
 * Generates a mutlipart entity delimiter.
 * @param boundary is a generated boundary using boundary()
 * @return {String}
 */
function delimiter(boundary) {
    return crlf + dashBoundary(boundary);
}

/**
 * Generates an absolute, closing delimiter for the entire set of entities in a multipart body.
 * @param boundary is a generated boundary using boundary()
 * @return {String}
 */
function closeDelimiter(boundary) {
    return delimiter(boundary) + hyphens;
}

/**
 * Converts any crlf into a space.
 * @param text is the string anticipated to be used as a preamble or epilogue in a mutlipart body.
 * @return {String}
 */
function discardText(text) {
//    console.log('Your preamble or epilogue ' + ((usAscii7BitRegex.test(text)) ? 'is' : 'is not') +
//        ' compliant with the 7-bit ascii constraint.');
    return text.replace(crlfRegex, ' ');
}

/**
 * A constructor function that defines the semantics of a multipart body.
 * @param subtype should be a String indicating the subtype this instance of a Multipart media type will be.
 * @param preamble should be a String that will be concatenated before the body parts. It should ideally not contain
 * any CRLF sequences. They will be stripped anyways.
 * @param epilogue should be a String that will be concatenated after the body parts. It should ideally not contain
 * any CRLF sequences. They will be stripped anyways.
 * @return {*}
 * @constructor
 */
function Multipart(subtype, preamble, epilogue) {
    this._parts = [];
    this._boundary = boundary();
    this._subtype = ((typeof subtype === 'string') ? subtype : 'mixed');
    this._preamble = ((typeof preamble === 'string') ? discardText(preamble) + crlf : '');
    this._epilogue = ((typeof epilogue === 'string') ? crlf + discardText(epilogue) : '');
    return this;
}

/**
 * Accessor methods
 * addBodyPart allows you to add instances of BodyPart to the _parts field of a Multipart instance.
 * setSubtype allows you to provide the same String you could with the constructor.
 * setBoundary allows you to provide the same String you could with the constructor.
 * setPreamble allows you to provide the same String you could with the constructor.
 * setEpilogue allows you to provide the same String you could with the constructor.
 */
Multipart.method('addBodyPart', function (part) {
    if (part instanceof BodyPart && this._parts.lastIndexOf(part) === -1) {
        this._parts.push(part);
    }
    return this;
});

Multipart.method('setSubtype', function (subtype) {
    this._subtype = ((typeof subtype === 'string') ? subtype : this._subtype);
    return this;
});

Multipart.method('setBoundary', function (delimiter) {
    this._boundary = (typeof delimiter === 'string') ? delimiter : this._boundary;
    return this;
});

Multipart.method('setPreamble', function (preamble) {
    this._preamble = ((typeof preamble === 'string') ? discardText(preamble) + crlf : this._preamble);
    return this;
});

Multipart.method('setEpilogue', function (epilogue) {
    this._epilogue = ((typeof epilogue === 'string') ? crlf + discardText(epilogue) : this._epilogue);
    return this;
});

/**
 * Utility method to serialize the Multipart body to String.
 * @return String representing the multipart body and its contained body parts
 */
Multipart.method('stringify', function () {
    var parts = this._parts,
        multipartBody = '',
        encapsulation = (delimiter(this._boundary) + crlf),
        hasMoreThanOnePart = (parts.length > 1);

    /**
     * Serialize the body parts in the parts array. Make sure there is an encapsulation boundary around the individual
     * body parts.
     */
    for (var part in parts) {
        multipartBody += parts[part].stringify();
        multipartBody += (hasMoreThanOnePart && part < parts.length - 1) ? encapsulation : '';
    }

    /**
     * Concatenate the preamble if it exists, first boundary delimiter, serialized body parts, closing delimiter, and
     * an epilogue if it exists.
     */
    return this._preamble +
        (dashBoundary(this._boundary) + crlf) +
        multipartBody +
        closeDelimiter(this._boundary) +
        this._epilogue;
});

/**
 * Convenience method for instantiating a Multipart without having to use the new operator.
 * @param subtype
 * @param preamble
 * @param epilogue
 * @return {Multipart}
 */
function multipart(subtype, preamble, epilogue) {
    return new Multipart(subtype, preamble, epilogue);
}

function BodyPart() {
    this['Content-Type'] = null;
    this['Content-Transfer-Encoding'] = null;
    this['Content-ID'] = null;
    this['Content-Description'] = null;
    this['Content-Location'] = null;
    this['Content-Disposition'] = null;
    this._payload = null;
    return Multipart.call(this);
}

/**
 * Extend Multipart since a BodyPart can also be multipart.
 * @type {Multipart}
 */
BodyPart.prototype = new Multipart();
BodyPart.prototype.constructor = BodyPart;

/**
 * Accessor methods.
 * setType allows you to set the Content-Type header field.
 * setTransferEncoding allows you to set the Content-Transfer-Encoding header field.
 * setId allows you to set the Content-ID header field.
 * setDescription allows you to set the Content-Description header field.
 * setLocation allows you to set the Content-Location header field.
 * setDisposition allows you to set the Content-Disposition header field.
 * setPayload allows you to set the *OCTET. This can be a string of an serialized media type including Multipart.
 */
BodyPart.method('setType', function (type) {
    this['Content-Type'] = (typeof type === 'string') ? type : this['Content-Type'];
    return this;
});

BodyPart.method('setTransferEncoding', function (encoding) {
    this['Content-Transfer-Encoding'] = (typeof encoding === 'string') ? encoding : this['Content-Transfer-Encoding'];
    return this;
});

BodyPart.method('setId', function (id) {
    this['Content-ID'] = (typeof id === 'string') ? id : this['Content-ID'];
    return this;
});

BodyPart.method('setDescription', function (description) {
    this['Content-Description'] = (typeof description === 'string') ? description : this['Content-Description'];
    return this;
});

BodyPart.method('setLocation', function (location) {
    this['Content-Location'] = (typeof location === 'string') ? location : this['Content-Location'];
    return this;
});

BodyPart.method('setDisposition', function (disposition) {
    this['Content-Disposition'] = (typeof disposition === 'string') ? disposition : this['Content-Disposition'];
    return this;
});

BodyPart.method('setPayload', function (payload) {
    this._payload = (typeof payload === 'string' || payload instanceof Multipart) ? payload : this._payload;
    return this;
});

/**
 * Utility method to serialize the BodyPart entity to String.
 * @return String representing the BodyPart entity and any potential nested Multipart instances.
 */
BodyPart.method('stringify', function () {
    var entityHeaders = '',
        payload = this._payload,
        payloadExists = !!(payload),
        payloadIsMultipart = (payload instanceof Multipart);

    /**
     * If the payload of this body part is an instance of Multipart, then set the Content-Type explicitly with
     * the subtype specified in the Multipart instance and the boundary generated in this BodyPart instance.
     * @type {String}
     */
    this['Content-Type'] = ((payloadIsMultipart) ?
        ('multipart/' + payload._subtype + '; boundary="' + this._boundary + '"') : this['Content-Type']);

    /**
     * Serialize the Content- headers. Any other headers are ignored.
     */
    for (var header in this) {
        if (header.lastIndexOf('Content-') !== -1 && this[header]) {
            entityHeaders += header + ': ' + this[header] + crlf;
        }
    }

    /**
     * Concatenate the *OCTET payload to the serialized Content- headers. The *OCTET may be an instance of Multipart, or
     * a payload of a different media type altogether.
     */
    return entityHeaders + ((payloadExists) ? crlf +
        ((payloadIsMultipart) ? payload.setBoundary(this._boundary).stringify() : payload) : '');
});

function bodyPart() {
    return new BodyPart();
}

module.exports.bp = exports.bp = bodyPart;
module.exports.mp = exports.mp = multipart;

// Finished -----------------------------------------------------------------------------------------------------------
// boundary          := 0*69<bchars> bcharsnospace

// bchars            := bcharsnospace / " "

// bcharsnospace     := DIGIT / ALPHA / "'" / "(" / ")" / "+" / "_" / "," / "-" / "." / "/" / ":" / "=" / "?"

// dash-boundary     := "--" boundary
//  ; boundary taken from the value of
//  ; boundary parameter of the Content-Type field.

// transport-padding := *LWSP-char
//  ; Composers MUST NOT generate non-zero
//  ; length transport padding, but receivers
//  ; MUST be able to handle padding added by message transports.

// delimiter         := CRLF dash-boundary

// close-delimiter   := delimiter "--"

// preamble          := discard-text

// epilogue          := discard-text

// discard-text      := *(*text CRLF) *text
//  ; May be ignored or discarded.

// entity-headers    := [ content CRLF ]
//                      [ encoding CRLF ]
//                      [ id CRLF ]
//                      [ description CRLF ]
//                      *( MIME-extension-field CRLF )

// Example
// entity-headers    := Content-Type: text/plain; charset=us-ascii <CRLF>
//                      Content-Transfer-Encoding: 7bit <CRLF>
//                      Content-Description: very simple MIME message <CRLF>
//                      Content-ID: <part00909@roguewave.example> <CRLF>
//                      Content-Location: http://roguewave.example/simple.txt <CRLF>
//                      Content-Disposition: inline <CRLF>

// MIME-part-headers := entity-headers
//                      [ fields ]
//  ; Any field not beginning with "content-" can have no defined
//  ; meaning and may be ignored. The ordering of the header
//  ; fields implied by this BNF definition should be ignored.

// body-part         := MIME-part-headers [CRLF *OCTET]
//  ; Lines in a body-part must not start with the specified
//  ; dash-boundary and the delimiter must not appear anywhere
//  ; in the body part.  Note that the semantics of a body-part
//  ; differ from the semantics of a message, as described in the text.

// encapsulation     := delimiter transport-padding CRLF body-part

// multipart-body    := [preamble CRLF]
//                      dash-boundary
//                      transport-padding
//                      CRLF
//                      body-part
//                      *encapsulation
//                      close-delimiter
//                      transport-padding
//                      [CRLF epilogue]

// text              := <any CHAR, including bare CR & bare LF, but NOT including CRLF>

// CHAR              := <any 7-bit ASCII character>
//  ; (  0-177 Octal,  0.-127. Decimal)
// LWSP-char         := SP / HT
// SP                := %x20
// SP                := " "
// HT                := "\t"
// ALPHA             := %x41-5A / %x61-7A
// ALPHA             := A-Z / a-z
// DIGIT             := %x30-39
// DIGIT             := "0" / "1" / "2" / "3" / "4" / "5" / "6" / "7" / "8" / "9"
// OCTET             := %x00-FF
// CRLF              := %x0D %x0A
// CRLF              := "\r" / "\n"

/**
 Example MIME Headers

 MIME-Version: 1.0
 Content-Type: text/plain; charset=us-ascii
 Content-Transfer-Encoding: 7bit
 Content-Description: very simple MIME message
 Content-ID: <part00909@roguewave.example>
 Content-Location: http://roguewave.example/simple.txt
 Content-Disposition: inline

 This is the body of the message.
 */

/**
 POST /enlighten/calais.asmx/Enlighten HTTP/1.1
 Host: api.opencalais.com
 Content-Type: application/x-www-form-urlencoded
 Content-Length: length

 licenseID=string&content=string&paramsXML=string

 HTTP/1.1 200 OK
 Content-Type: text/xml; charset=utf-8
 Content-Length: length

 <?xml version="1.0" encoding="utf-8"?>
 <string xmlns="http://clearforest.com/">string</string>
 */

/**
 As a very simple example, the following multipart message has two parts, both of them plain text, one of them explicitly typed and one of them implicitly typed:

 From: Nathaniel Borenstein <nsb@bellcore.com>
 To:  Ned Freed <ned@innosoft.com>
 Subject: Sample message
 MIME-Version: 1.0
 Content-type: multipart/mixed; boundary="simple boundary"

 This is the preamble.  It is to be ignored, though it
 is a handy place for mail composers to include an
 explanatory note to non-MIME compliant readers.
 --simple boundary

 This is implicitly typed plain ASCII text.
 It does NOT end with a linebreak.
 --simple boundary
 Content-type: text/plain; charset=us-ascii

 This is explicitly typed plain ASCII text.
 It DOES end with a linebreak.

 --simple boundary--
 This is the epilogue.  It is also to be ignored.
 */

/**
 Appendix A -- A Complex Multipart Example

 What follows is the outline of a complex multipart message.  This
 message contains five parts that are to be displayed serially:  two
 introductory plain text objects, an embedded multipart message, a
 text/enriched object, and a closing encapsulated text message in a
 non-ASCII character set.  The embedded multipart message itself
 contains two objects to be displayed in parallel, a picture and an
 audio fragment.

 MIME-Version: 1.0
 From: Nathaniel Borenstein <nsb@nsb.fv.com>
 To: Ned Freed <ned@innosoft.com>
 Date: Fri, 07 Oct 1994 16:15:05 -0700 (PDT)
 Subject: A multipart example
 Content-Type: multipart/mixed; boundary=unique-boundary-1

 This is the preamble area of a multipart message.
 Mail readers that understand multipart format
 should ignore this preamble.

 If you are reading this text, you might want to
 consider changing to a mail reader that understands
 how to properly display multipart messages.

 --unique-boundary-1

 ... Some text appears here ...

 [Note that the blank between the boundary and the start
 of the text in this part means no header fields were
 given and this is text in the US-ASCII character set.
 It could have been done with explicit typing as in the
 next part.]

 --unique-boundary-1
 Content-type: text/plain; charset=US-ASCII

 This could have been part of the previous part, but
 illustrates explicit versus implicit typing of body
 parts.

 --unique-boundary-1
 Content-Type: multipart/parallel; boundary=unique-boundary-2

 --unique-boundary-2
 Content-Type: audio/basic
 Content-Transfer-Encoding: base64

 ... base64-encoded 8000 Hz single-channel
 mu-law-format audio data goes here ...

 --unique-boundary-2
 Content-Type: image/jpeg
 Content-Transfer-Encoding: base64

 ... base64-encoded image data goes here ...

 --unique-boundary-2--

 --unique-boundary-1
 Content-type: text/enriched

 This is <bold><italic>enriched.</italic></bold>
 <smaller>as defined in RFC 1896</smaller>

 Isn't it
 <bigger><bigger>cool?</bigger></bigger>

 --unique-boundary-1
 Content-Type: message/rfc822

 From: (mailbox in US-ASCII)
 To: (address in US-ASCII)
 Subject: (subject in US-ASCII)
 Content-Type: Text/plain; charset=ISO-8859-1
 Content-Transfer-Encoding: Quoted-printable

 ... Additional text in ISO-8859-1 goes here ...

 --unique-boundary-1--
 */
