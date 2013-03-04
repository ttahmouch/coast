var express = require('express'),
    http = require('http'),
    path = require('path'),
    app = module.exports = exports = express();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'static')));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(require('./middleware/middlewareResponseMethods.js'));
app.use(require('./middleware/middlewareResponseRemovePoweredBy.js'));
app.use(app.router);
app.use(require('./middleware/middlewareErrorLog'));
app.use(require('./middleware/middlewareError'));

app.all('/', require('./controllers/controllerIndex.js'));
app.all('*', require('./controllers/controller404.js'));

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server started in ' + app.get('env').toString() + ' mode.');
    console.log("Express server listening on port " + app.get('port'));
});
