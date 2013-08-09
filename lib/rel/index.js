/**
 * Falsy Values: false, 0, "", null, undefined, NaN
 */

Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

/**
 * "In the simplest case, a link relation type identifies the semantics of a link.  For example, a link with the
 * relation type "copyright" indicates that the resource identified by the target IRI is a statement of the copyright
 * terms applying to the current context IRI.
 *
 * Link relation types can also be used to indicate that the target resource has particular attributes, or exhibits
 * particular behaviours; for example, a "service" link implies that the identified resource is part of a defined
 * protocol (in this case, a service description).
 *
 * Relation types are not to be confused with media types [RFC4288]; they do not identify the format of the
 * representation that results when the link is dereferenced.  Rather, they only describe how the current context is
 * related to another resource." -- RFC 5988
 *
 * These relations should remain static, and the array literal should be altered as needed when new relations are
 * registered with IANA.
 *
 * @constructor
 * @return {*}
 */
function Relations() {
    /**
     * Link Relation [RFC 5988]
     */
    this._relations = [
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
    ];
    return this;
}

/**
 * Check if the relation exists and is acknowledged in the set of relations defined in RFC 5988.
 *
 * @param rel is a string literal representation of a link relation. Example: 'up'
 * @return true if the relation does exist; false otherwise.
 */
Relations.method('exists', function (rel) {
    var relations = this._relations;
    return (relations.lastIndexOf(rel) !== -1);
});

/**
 * Convenience method to enforce safe method invocations without the use of the new operator.
 * @return {Relations}
 */
function relations() {
    return new Relations();
}

/**
 * Convenience method to allow for type checking outside of the scope of this module.
 * @param object is a reference to an object you would like to test the prototypal inheritance chain on.
 * @return {Boolean}
 */
relations.isPrototypeOf = function (object) {
    return object instanceof Relations;
};

module.exports = exports = relations;
