module.exports = exports = (function () {
    var validate = require('../lib/validate'),
        status = require('../lib/status');

    return function (req, res, next) {
        if (!res.methods) {
            res.methods = function (methods) {
                if ((validate.isObject(methods)) &&
                    (methods.hasOwnProperty(req.method)) &&
                    (validate.isFunction(methods[req.method]))) {
                    return methods[req.method]();
                }
                if (validate.isObject(methods)) {
                    var keys = Object.keys(methods);
                    if (validate.isArray(keys)) {
                        res.set('Allow', keys.join());
                    }
                }
                return next(status(405));
            };
        }
        next();
    };
})();
