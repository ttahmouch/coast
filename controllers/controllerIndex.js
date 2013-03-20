module.exports = exports = (function () {
    return function (req, res, next) {
        var onGetAndOptions = function () {
            res.format({
                'multipart/nav-data':function () {
                    res.end('');
                }
            });
        };
        res.methods({
            'GET':onGetAndOptions,
            'OPTIONS':onGetAndOptions
        });
    };
})();
