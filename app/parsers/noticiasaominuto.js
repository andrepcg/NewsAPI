var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils");



module.exports = {
    nome: "Noticias ao Minuto",
    hostname: "noticiasaominuto.com",

    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};
        r.titulo = utils.limparTexto($("#newscontainer .title [itemprop=name]").text());
        r.subtitulo = $("#newscontainer .subtitle").text();

        r.timestamp = new Date($("#newscontainer [itemprop=datePublished]").attr("content"));

        r.imgURL = $("#newscontainer .pic [itemprop=image]").attr("src");
        r.textoNoticia = utils.limparTexto($("#newscontainer .newsfull").text());
        r.categoria = utils.limparTexto($("#newscontainer .pic .categorie").text());
        r.keywords = [utils.limparTexto($("#newscontainer .title .tag").text())];
        if(r.titulo == "")
            return null;
        else
            return r;
    },

    extractNoticiasFromPage: function(html, cb){
        $ = cheerio.load(html);
        var r = [];

        var links = $('a[href]');
        $(links).each(function(i, link){
            var a = $(link).attr('href');

            if(a !== undefined && a.match(/\/[a-z]+\/[0-9]+\/[a-z-]+/)){
                r.push((a.indexOf("http") >= 0) ? "" : "http://www.noticiasaominuto.com" + a);
            }
        });

        cb(r.filter(utils.onlyUnique));



    }

}
