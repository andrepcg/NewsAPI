//require('graphdat');
//require('newrelic');

/*
require('nodetime').profile({
    accountKey: '61800f4ee2e561efe86314bb98e3df42fa91181e',
    appName: 'NewsAPI'
});

*/
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var passport 	= require('passport');
var user_sessions = require("./app/user_sessions");

var utils = require("./app/utils");
var config = require("./config");

var tfidf = require("./tfidf");
tfidf.loadTerms("tfidf.json");
exports.tfidf = tfidf;

var express    = require('express');
var app        = express();
var compression = require('compression');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var routeApi   = require("./app/routes/api");
var apiRouter = express.Router();
var recomendacaoRouter = express.Router();




mongoose.connect(config.mongodb);

app.set('port', process.env.PORT || 8080);
app.set('view engine', 'ejs');


app.use(cookieParser());
app.use(session({ secret: 'jihu2378-f290_348', cookie: { expires: false }}));
app.use(passport.initialize());
app.use(passport.session());
app.use(utils.allowCrossDomain);
app.use(express.static(__dirname + '/public', {maxAge: 86400000 * 7}));

var env = process.env.NODE_ENV || 'development';
if (env == 'development') {
    app.use(morgan(':method :url :status :response-time ms - :res[content-length] (:remote-addr)'));
    app.set('json spaces', 20);
}
else {
    app.use(compression());
}


// API
apiRouter.get('/', function(req, res) {
    var j = [];
    require("./app/parsers").nomesJornais.forEach(function(item){
        j.push("/api/jornal/" + item);
    });
    res.send({"baseUrl": config.url, endpoints: j});
});

apiRouter.get('/jornal/:nome/:qtd', routeApi.jornal);
apiRouter.get('/jornal/:nome', routeApi.jornal);

apiRouter.get('/noticias/ultimas/:qtd', routeApi.ultimas);
apiRouter.get('/noticias/ultimas', routeApi.ultimas);

apiRouter.get('/noticias/random', routeApi.random);
apiRouter.get('/noticias/random/:qtd', routeApi.random);

apiRouter.get('/noticias/related', routeApi.related);
apiRouter.get('/noticias/:id/related', routeApi.related);

apiRouter.get('/noticias', routeApi.url);
apiRouter.get('/noticias/:id', routeApi.getNoticia);

apiRouter.get('/noticias/:id/:likeOrdislike', user_sessions.isLoggedIn, routeApi.userLikeDislike);

apiRouter.get("/logintest", user_sessions.isLoggedIn, user_sessions.logintest);

// 
// Pagina Recomendacao
//
app.get("/", user_sessions.isLoggedIn, function(req, res){
    res.render("classificador", {user: req.user});
});



app.use('/api', apiRouter);
//app.use("/research", user_sessions.isLoggedIn, recomendacaoRouter);


app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});


/*
Noticias.find()
    .exec(function(err, noticias){
        console.log(err);

        if(noticias){
            for(var i = 0; i < noticias.length; i++){
                tfidf.parseNoticia(noticias[i]);
            }
            tfidf.saveTerms("tfidf.json");
            console.log("saved");
        }
    });


var stream = Noticias.find().stream();
stream.on('data', function (doc) {
    tfidf.parseNoticia(doc);
}).on('error', function (err) {
    console.error(err.stack);
}).on('end', function () {
    tfidf.saveTerms("tfidf.json");
});
*/
