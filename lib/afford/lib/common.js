/**
 * Instantiate my own in-line exports object. This may be redundant, but it makes things verbose.
 * @type {Object}
 */
module.exports = exports = {};

/**
 * Every returned exports object from the require invocations should return a convenience instantiation method for the
 * respective module-scoped constructor function.
 */
module.exports.affordance = exports.affordance = require('./affordance.js');
module.exports.generator = exports.generator = require('./generator.js');
module.exports.method = exports.method = require('./method.js');
module.exports.relations = exports.relations = require('./relations.js');
module.exports.resource = exports.resource = require('./resource.js');
module.exports.resources = exports.resources = require('./resources.js');
