var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils");

module.exports = {
    nome: "JN",
    hostname: "jn.pt",

    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};
        r.titulo = utils.limparTexto($('.Artigo #NewsTitle').text());
        r.subtitulo = utils.limparTexto($('.Artigo #Article #NewsSummary').text());
        //r.autor;
        r.timestamp = new Date($(".Artigo input").attr("value"));

        var img = $(".Artigo img").first();
        if($(img).attr("alt") != "fechar")
            r.imgURL = "http://cdn.controlinveste.pt" + $(img).attr("src");
        r.textoNoticia = utils.limparTexto($('.Artigo #Article div p').text());

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

            if(a !== undefined && a.match(/\/PaginaInicial\/([a-zA-Z]+\/)([a-zA-Z]+\/)?Interior.aspx/) && a.indexOf("#AreaComentarios") == -1)
                r.push((a.indexOf("http") >= 0) ? "" : "http://www.jn.pt" + a);
        });

        cb(r.filter(utils.onlyUnique));

    },

    categoriaFromUrl: function(url){
        url = url.replace("http://");
        var split = url.split("/");
        return split[2];
    }
}
