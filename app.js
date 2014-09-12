//require('graphdat');
//require('newrelic');


require('nodetime').profile({
    accountKey: '61800f4ee2e561efe86314bb98e3df42fa91181e',
    appName: 'NewsAPI'
});


var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var passport 	= require('passport');

var fs = require("fs");
var utils = require("./app/utils");

var tfidf = require("./tfidf");
tfidf.loadTerms("tfidf.json");
exports.tfidf = tfidf;

var express    = require('express');
var app        = express();
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var routeApi   = require("./app/routes/api");
var api = express.Router();
var config = require("./config");

var User = require("./app/models/user");

var user_sessions = require("./app/user_sessions");

mongoose.connect("mongodb://andrepcg2:LvhzD0BY4vXz1FhVzVDr@ds045099.mongolab.com:45099/noticias_txt");

var port = process.env.PORT || 8080;

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    next();
}

app.use(morgan(':method :url :status :response-time ms - :res[content-length] (:remote-addr)'));
app.use(cookieParser());

app.use(session({ secret: 'jihu2378-f290_348', cookie: { expires: false }}));
app.use(passport.initialize());
app.use(passport.session());
app.use(allowCrossDomain);


app.set('json spaces', 20);


//app.all('*', user_sessions.generateNewUser);
api.get('/jornal/:nome/:qtd', routeApi.jornal);
api.get('/jornal/:nome', routeApi.jornal);

api.get('/noticias/ultimas/:qtd', routeApi.ultimas);
api.get('/noticias/ultimas', routeApi.ultimas);

api.get('/noticias/random', routeApi.random);
api.get('/noticias/random/:qtd', routeApi.random);

api.get('/noticias/related', routeApi.related);
api.get('/noticias/:id/related', routeApi.related);

api.get('/noticias', routeApi.url);
api.get('/noticias/:id', routeApi.getNoticia);

api.get('/noticias/:id/:likeOrdislike', user_sessions.isLoggedIn, routeApi.userLikeDislike);


app.use('/api', api);

var parsers = require("./app/parsers");

app.get('/', function(req, res) {
	var j = [];
	parsers.nomesJornais.forEach(function(item){
		j.push("/api/jornal/" + item);
	});
	res.send({"baseUrl": config.url, endpoints: j});	
});


app.listen(port);
console.log('Server running on port ' + port);


/*
var Noticias = require("./app/models/noticia");
Noticias.find()
    .exec(function(err, noticias){
        console.log(err);

        if(noticias){
            fd = fs.openSync(path.join(process.cwd(), 'noticias.csv'), 'a');
            fs.writeSync(fd, "categoria,titulo,subtitulo");
            for(var i = 0; i < noticias.length; i++){
                if(noticias[i].categoria != "" && noticias[i].categoria !== undefined)
                    fs.writeSync(fd, '"' + noticias[i].categoria.trim() + '","' + noticias[i].titulo.replace(/[\r\n"']/g,"") + '","' + noticias[i].subtitulo.replace(/[\r\n"']/g,"") + '"\n');
            }
            fs.closeSync(fd);
        }
    });

*/
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
*/

/*
var clusterfck = require("clusterfck");

var a = {id: "a", likes: [1,2,3,4], dislikes: [9,10]};
var e = {id: "e", likes: [1,2,3], dislikes: [9,10]};
var b = {id: "b", likes: [3,4], dislikes: [1,2]};
var c = {id: "c", likes: [9,10], dislikes: [1,2,3,4]};
var d = {id: "d", likes: [1,2,3], dislikes: [4]};

var clusters = clusterfck.kmeans([a,b,c,d, e], null, "jaccard");
//var clusters = clusterfck.hcluster([a,b,c,d,e], "jaccard");
for(i in clusters)
    console.log("Cluster " + i, clusters[i]);
*/