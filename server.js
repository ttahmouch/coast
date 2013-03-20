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
app.all('/badges', require('./controllers/controllerBadges.js'));
app.all('/campaigns', require('./controllers/controllerCampaigns.js'));
app.all('/categories', require('./controllers/controllerCategories.js'));
app.all('/craves', require('./controllers/controllerCraves.js'));
app.all('/events', require('./controllers/controllerEvents.js'));
app.all('/leaders', require('./controllers/controllerLeaders.js'));
app.all('/merchants', require('./controllers/controllerMerchants.js'));
app.all('/questions', require('./controllers/controllerQuestions.js'));
app.all('/raves', require('./controllers/controllerRaves.js'));
app.all('/saves', require('./controllers/controllerSaves.js'));
app.all('/users', require('./controllers/controllerUsers.js'));
app.all('/venues', require('./controllers/controllerVenues.js'));
app.all('*', require('./controllers/controller404.js'));

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server started in ' + app.get('env').toString() + ' mode.');
    console.log("Express server listening on port " + app.get('port'));
});
