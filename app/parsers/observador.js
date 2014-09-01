var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils");

module.exports = {
    nome: "Observador",
    hostname: "observador.pt",

    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};

        r.titulo = utils.limparTexto($(".news-item h1").text());
        r.subtitulo = utils.limparTexto($(".news-item .lead").text());

        if($(".news-item .meta time").length > 0)
            r.timestamp = new Date($(".news-item .meta time").attr("datetime"));


        r.imgURL = $(".news-item .image img").attr("src");
        r.textoNoticia = utils.limparTexto($(".news-item .content p").text());

        r.categoria = $(".top-bar-menu .current-menu-parent").text();

        r.keywords = [];
        $(".news-item .assets .tags li").each(function(i, item){
            r.keywords.push($(item).text());
        });

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

            if(a.match(/observador.pt\/[0-9]{4}\/[0-9]{2}\/[0-9]{2}\/[a-z\-_]+/)){
                r.push(a);
            }
        });

        cb(r.filter(utils.onlyUnique));



    }

}
