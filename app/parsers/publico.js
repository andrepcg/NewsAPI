var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils");
var moment = require("moment");

module.exports = {
    nome: "Publico",
    hostname: "publico.pt",

    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};

        if($(".immersive-story-wrapper").length == 0){
            r.titulo = $('header h1.entry-title').text();
            r.subtitulo = $("header .entry-blurb p").text();

            //r.timestamp = data($(".meta-timestamp.published time").text());
            r.timestamp = moment($(".meta-timestamp.published time").text(), "DD/MM/YYYY - HH:mm").toDate();

            r.imgURL = $("article.hentry.article.single figure img").attr("src");
            r.textoNoticia = utils.limparTexto($("article.hentry.article.single .entry-body").text());

            r.keywords = [];

            $(".tag-list .module-content li").each(function(i, item){
                r.keywords.push($(item).text());
            });

            r.alternateUrl = [$(".entry-action-shortutl a").attr("href")];

            if(r.titulo == "")
                return null;
            else
                return r;
        }

        return null;
    },

    extractNoticiasFromPage: function(html, cb){
        $ = cheerio.load(html);
        var r = [];

        var links = $('a[href]');
        $(links).each(function(i, link){
            var a = $(link).attr('href');

            if(a.match(/publico.pt\/[a-zA-Z]+\/noticia/)){
                r.push(a);
            }
        });

        cb(r.filter(utils.onlyUnique));



    },

    categoriaFromUrl: function(url){
        url = url.replace("http://");
        var split = url.split("/");
        return split[1];
    }

}
