module.exports = exports = (function() {
    var status = require('../lib/status');

    return function(req, res, next) {
        return next(status(404));
    };
})();
