module.exports = exports = function (err, req, res, next) {
    res.format({
        'application/json':function () {
            res.type('application/json');
            res.send(err.code || 500, {
                'status':{
                    'code':err.code || 500,
                    'message':err.message || 'Internal Server Error'
                }
            });
        },
        'application/xml':function () {
            res.type('application/xml');
            res.send(err.code || 500, '<?xml version="1.0"?><response code="' + (err.code || 500) + '" message="' + (err.message || 'Internal Server Error') + '"></response>');
        }
    });
};
