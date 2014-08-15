module.exports = function (env, next) {
    var fs = require('fs');
    env.response.statusCode = 200;
    env.response.headers = env.response.headers || {};
    env.response.headers['content-type'] = 'application/javascript';
    env.response.body = fs.createReadStream(require.resolve('hypermedia'));
    next(env);
};
