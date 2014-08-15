module.exports = function (env, next) {
    env.response.statusCode = 200;
    if (env.request.headers['accept'] === 'multipart/nav-data') {
        env.hypermedia = ['entry', 'payment'];
    }
    next(env);
};
