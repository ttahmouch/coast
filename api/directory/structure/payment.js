module.exports = function (env, next) {
    env.response.statusCode = 200;
    env.response.headers = env.response.headers || {};
    env.response.headers['content-type'] = 'application/json';
    env.response.headers['content-transfer-encoding'] = '8BIT';
    env.response.headers['x-custom'] = 'custom';
    env.response.body = JSON.stringify({
        id: env.route.params.id
    }, null, '    ');
    if (env.request.headers['accept'] === 'multipart/nav-data') {
        env.hypermedia = ['entry'];
    }
    next(env);
};
