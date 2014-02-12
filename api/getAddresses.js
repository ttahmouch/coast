module.exports = exports = function (req, res) {
    res.statusCode = '200';
    res.headers = {
        'Content-Type': 'application/json'
    };
    res.body = '{}';
};
