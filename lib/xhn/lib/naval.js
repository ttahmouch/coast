/**
 * Falsy Values: false, 0, "", null, undefined, NaN
 */

/**
 * Module Dependencies.
 */
var plugin = require('./plugin.js');
/**
 * NavAL is an instance of Plugin. It will encode Affordance or Affordances instances into a NavAL JSON representation,
 * and return the encoded string immediately.
 */
var naval = plugin();

/**
 * Set the delegate callback function that handles the encoding for this particular media type (NavAL JSON in this case.)
 * @param affordances should be an instance of Affordance or Affordances.
 * @return should be an encoded string representation of the Affordance or Affordances.
 */
naval.setShouldEncodeDelegate(function (hypermedia) {
    /**
     * Remove the prettifier eventually to keep the encodings more terse.
     */
    return JSON.stringify(hypermedia, null, ' ');
});

module.exports = exports = naval;
