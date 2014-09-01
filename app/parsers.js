var request = require('request');
var url = require('url');
var crypto = require('crypto-js');
var fs = require("fs");
var iconv = require('iconv-lite');
var jschardet = require("jschardet");

var Noticia = require('./models/noticia');

var p = {};
var nomesJornais = [];

fs.readdirSync("./app/parsers").forEach(function(file) {
    var f = require("./parsers/" + file);
    var hostname = f.hostname;
	nomesJornais.push(f.nome);
    p[hostname] = f;
    
});

var chooseProvider = function(url2, cb){
    var u = url.parse(url2);
    var hst = u.hostname.replace("www.","");

    if(p.hasOwnProperty(hst))
        cb(p[hst]);
    else
        cb(null);

}

var noticiaHash = function(noticia){
    return crypto.MD5(noticia.titulo + noticia.timestamp + noticia.jornal + noticia.textoNoticia) + '';
}

var user_agent = "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36";




var parsers = {

    parseNoticia: function(url2, cb){
        if(url2 != "")
            request({uri: encodeURI(url2), maxRedirects:1, headers: {'User-Agent': user_agent}, encoding: null, jar: request.jar() }, function (error, response, body) {

                //if(error || response.statusCode != 200)
                    //console.error(url2, error, (response != null) ? response.statusCode : null);

                if (!error && response.statusCode == 200) {

                    chooseProvider(url2, function(provider){

                        if(provider != null){

                            var charset = jschardet.detect(body);

                            //var content;
                            if (response.headers['content-type'].match(/ISO-8859-1/i))
                                content = iconv.decode(body, 'latin1');
                            else if(response.headers['content-type'].match(/utf-8/i))
                                content = iconv.decode(body, 'utf-8');
                            else if(response.headers['content-type'].match(/text-html/i))
                                content = iconv.decode(body, 'utf-8');
                            else{
                                //console.log(response.headers['content-type'], url2);
                                content = iconv.decode(body, charset.encoding);
                                //content = iconv.decode(body, 'latin1');
                            }


                            var res = provider.parseNoticiaHTML(content);

                            if(res){
                                res.url = url2;
                                res.jornal = provider.nome;
                                res.jornalLowercase = provider.nome.toLowerCase();
                                res.hash = noticiaHash(res);
                                if(res.categoria === undefined)
                                    res.categoria = provider.categoriaFromUrl(url2);

                                cb(null, res);
                            }
                            else{
                                //console.error("parser", url2);
                                cb(true, null);
                            }
                        }
                        else{
                            console.error("undefined provider");
                            cb(true, null);
                        }
                    });
                }
                else
                    cb(true, null);
            });
    },

    getURLsFromPage: function(url2, cb){

        if(typeof url2 === "string"){

            if(url2 != "")
                req(url2, null, cb);

        }
        else if(typeof url2 === "object"){
            // url2 = {url: "", site: ""};
            chooseProvider(url2.site, function(provider){
                req(url2.url, provider, cb);
            });
        }
    }

}

var req = function(url, provider, cb){
    request({uri: url, maxRedirects:1, headers: {'User-Agent': user_agent}, jar: request.jar() }, function (error, response, body) {
        //if(error || response.statusCode != 200)
            //console.error(url, error, (response != null) ? response.statusCode : null);

        if (!error && response.statusCode == 200) {

            if(provider == null){
                chooseProvider(url, function(provider){
                    if(provider != null){
                        provider.extractNoticiasFromPage(body, function(res){
                            return cb(null, res);
                        });
                    }
                    else
                        cb(error, null);
                });
            }
            else{
                provider.extractNoticiasFromPage(body, function(res){
                    return cb(null, res);
                });
            }
        }
        else
            cb(error, null);
    });
}

module.exports = parsers;