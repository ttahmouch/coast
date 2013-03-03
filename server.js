var express = require('express'),
    http = require('http'),
    path = require('path'),
    app = module.exports = exports = express();

/**
 * Set properties on the app object.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

/**
 * Set middleware to use before and after routing.
 */
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'static')));

/**
 * Set middleware that's only applicable when running the application in development mode.
 */
app.configure('development', function () {
    app.use(express.errorHandler());
});

/**
 * Set up the routes to be iterated in the router.
 */
app.get('/', require('./controllers/controllerIndex.js'));
app.get();

/**
 * Create an instance of a Node Server, and pass in the Express App as a RequestListener.
 * Have the server start listening on the port specified as an Environment Variable (or 3000).
 */
http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
