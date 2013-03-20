module.exports = exports = (function () {
    return function (req, res, next) {
        var onGetAndOptions = function () {
            res.format({
                'multipart/nav-data':function () {
                    console.dir(req.headers);
                    console.dir(res._headers);
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
