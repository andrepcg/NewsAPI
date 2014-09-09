var Noticias = require('../models/noticia');
var Users = require('../models/user');
var parsers = require("../parsers");
var async = require('async');
var utils = require("../utils");

var tfidf = require("../../app").tfidf;

exports.ultimas = function(req, res) {
	var limite = 40;
    var l = parseInt(req.params.qtd);

    Noticias.find()
        .sort("-timestamp")
        .select("-random -__v")
        .limit(isNaN(l) ? 10 : (l > limite) ? l = limite : l)
        .exec(function(err, data){if(err)
            if(err)
                res.json({status: "error", error: err});
            if(data)
                res.json({status: "ok", data: data});
        });
}

exports.random = function(req, res) {
    var limite = 20;
    var l = parseInt(req.params.qtd);
    l = isNaN(l) ? 1 : l;

        if(l > limite)
            l = limite;

        Noticias.findRandom().select("-random -__v").limit(l).exec(function (err, data) {
			if(err)
                res.json({status: "error", error: err});
            if(data)
                res.json({status: "ok", data: data});
		});


}

exports.jornal = function(req, res) {

    var l = parseInt(req.params.qtd);
	var limite = 40;

    var categoria = req.query.categoria;
    var s;

    if(categoria){
        var categoria = utils.limparPalavra(categoria);
        s = {"categoria": categoria, "jornalLowercase": req.params.nome.toLowerCase()};
    }
    else
        s = {"jornalLowercase": req.params.nome.toLowerCase()};

    Noticias.find(s)
        .sort("-timestamp")
        .select("-random")
        .limit(isNaN(l) ? 10 : (l > limite) ? l = limite : l)
        .exec(function(err, data){
            if(err)
                res.json({status: "error", data: null});

            if(data)
                res.json({status: "ok", data: data});
        });
}

var deleteRandomAndSend = function(res, n){
    var r = n.toObject();
    delete r.random;
    delete r.__v;
    res.json({status: "ok", data: r});
}

var options = {
    project: "-textoNoticia -imgURL -crawlTime -random -__v -alternateUrl -termFrequency"
    //, filter: { likes: { $gt: 1000000 }} // casts queries based on schema
    , limit: 5
    , language: 'portuguese',
    lean: true
}

var relatedv2 = function(pesquisa, req, res){
    Noticias.findOne(pesquisa)
        .select("titulo subtitulo textoNoticia")
        .exec(function(err, n){
            if(err)
                res.json({status: "error", data: null});
            if(n){
                var tf = tfidf.tfidf(n);

                var pesquisa = "";

                for(var i = 0; i < 4; i++)
                    pesquisa += tf[i][0] + " ";

                Noticias.textSearch(pesquisa, options, function (err, output) {
                    if(err)
                        res.json({status: "error", error: err});
                    if(output)
                        res.json({status: "ok", data: output.results});

                    //console.log(output.stats);
                });
            }
        });
}


var relatedv1 = function(pesquisa, res){
    Noticias.findOne(pesquisa)
        .select("titulo")
        .exec(function(err, n){
            if(n){

                var tokens = tfidf.filter(tfidf.tokenize(n.titulo));

                var pesquisa = "";
                for(var i = 0; i < 4 && i < tokens.length; i++){

                    if(tokens[i].length > 2)
                        pesquisa += tokens[i] + " ";
                }
                //console.log(pesquisa);

                Noticias.textSearch(pesquisa, options, function (err, output) {
                    if(err)
                        res.json({status: "error", data: null});
                    if(output)
                        res.json({status: "ok", data: output.results});

                    //console.log(output.stats);
                });

            }
        });
}

exports.related = function(req, res) {

    var version = req.query.v ? req.query.v : 2;

    if(version == 1){
        if(req.query.url){
            relatedv1({"url": req.query.url}, res);
        }
        else if(req.params.id){
            relatedv1({"_id": req.params.id}, res);
        }
    }
    else{
        if(req.query.url){
            relatedv2({"url": req.query.url}, req, res);
        }
        else if(req.params.id){
            relatedv2({"_id": req.params.id}, req, res);
        }
    }
}

exports.getNoticia = function(req, res) {
    Noticias.findOne({"_id": req.params.id})
        .select("-random")
        .exec(function(err, noticia){
            if(err)
                res.json({status: "error", data: null});
            else if(noticia){
                noticia = noticia.toObject();
                if(req.query.tfidf == 1)
                    noticia.termosimportantes = tfidf.tfidf(noticia).slice(0,20);

                res.json({status: "ok", data: noticia});
            }
        });
}

exports.url = function(req, res) {

    if(req.query.url){

        if(req.query.url.indexOf("http://") == 0){
            var www = (req.query.url.indexOf("http://www.") == 0) ? req.query.url : req.query.url.replace("http://","http://www.");
            var nowww = (req.query.url.indexOf("http://www.") == 0) ? req.query.url.replace("http://www.", "http://") : req.query.url;


                Noticias.findOne({$or: [{"alternateUrl": www}, {"url": www}, {"alternateUrl": nowww}, {"url": nowww}]})
                .select("-random")
                .exec(function(err, data){
                    // caso a noticia ja exista na BD, fazer parse na mesma para verificar se hash é a mesma, caso nao seja a noticia foi actualizada
                    if(!data){
                        parsers.parseNoticia(nowww, function (err1, notres) {
                            if (notres) {
                                tfidf.parseNoticia(notres);
                                var n = new Noticias(notres);

                                Noticias.findOne({'hash': notres.hash})
                                    .exec(function (err, noticiaByHash) {
                                        if(err)
                                            res.json({status: "error", data: null});
                                        else if(noticiaByHash){


                                            if(noticiaByHash.alternateUrl.length <= 10){
                                                if(noticiaByHash.alternateUrl.indexOf(req.query.url) == -1){
                                                    noticiaByHash.alternateUrl.push(req.query.url);
                                                    noticiaByHash.save(function(err){
                                                        if(err)
                                                            console.log(err);
                                                    });

                                                }

                                            }

                                            deleteRandomAndSend(res, noticiaByHash);

                                            //res.json({status: "ok", data: noticiaByHash});
                                        }
                                        else if(!noticiaByHash){
                                            n.save(function(err){
                                                if(err)
                                                    res.json({status: "error", data: null});
                                                else
                                                    deleteRandomAndSend(res, n);

                                            });
                                        }
                                    });


                            }
                            else{
                                res.json({status: "error", data: null});
                            }
                        });
                    }
                    else{
                        var currentTime = (new Date()).getTime();
                        var timePassed = currentTime - (data.crawlTime.getTime() + 3600000);
                        timePassed = (timePassed < 0) ? timePassed + 3600000 : timePassed;
                        console.log(timePassed)
                        // se a data de ultimo crawl é maior q 10 minutos e menor que 60 minutos
                        if(timePassed > 10 * 60 * 1000 && timePassed < 60 * 60 * 1000){
                            console.log("ja passaram 2 horas, buscar noticia novamente");
                            parsers.parseNoticia(req.query.url, function (err1, notres) {
                                if(err)
                                    return res.json({status: "error", err: err});

                                if (notres) {
                                    if(notres.hash != data.hash){
                                        console.log("hash diferente", notres.hash, data.hash);
                                        for (var attrname in notres) { data[attrname] = notres[attrname]; }

                                    }

                                    data.crawlTime = (new Date()).getTime();

                                    data.save(function(err){
                                        if(err)
                                            console.error("Error saving:", err);
                                    });

                                    deleteRandomAndSend(res, data);
                                }
                            });
                        }
                        else{
                            //console.log("ainda nao passou 1 hora");
                            deleteRandomAndSend(res, data);
                        }
                    }
                });
        }
        else
            res.json({status: "error", error: "URL must start with 'http://'"});
    }
    else
        res.json({status: "error", error: "No url specified (GET parameter 'url')"});
}

exports.userLikeDislike = function(req, res) {
    Noticias.findOne({"_id": req.params.id})
        .select("_id")
        .exec(function(err, noticia){
            if(err)
                res.json({status: "error", error: err});

            if(noticia){
                var obj = (req.params.likeOrdislike == "like") ? {newslikes: noticia._id} : {newsdislikes: noticia._id};

                    Users.findByIdAndUpdate(req.user._id, { $addToSet: obj })
                        .exec(function(err, user){
                            if(err)
                                res.json({status: "error", error: err});
                            else
                                res.json({status: "ok", user: user});

                        });
            }
            else{
                res.json({status: "error", error: "notfound"});
            }
        });
}