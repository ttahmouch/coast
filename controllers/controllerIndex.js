module.exports = exports = (function () {
    return function (req, res, next) {
        res.format({
            'application/json': function() {
                res.type('application/json');
                res.send(200, {
                    'status': {
                        'code': 200,
                        'message': 'OK'
                    },
                    'payload':'Oh for the love of god, please use hypermedia.'
                });
            },
            'application/xml': function() {
                res.type('application/xml');
                res.send(200, '<?xml version="1.0"?><response code="200" message="OK"><payload>Oh for the love of god, please use hypermedia.</payload></response>');
            }
        });
    };
})();
