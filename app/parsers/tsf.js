var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils")

var moment = require("moment");

module.exports = {
    nome: "TSF",
    hostname: "tsf.pt",
    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};

        r.titulo = utils.limparTexto($(".Artigo #NewsTitle").text());
        r.subtitulo = utils.limparTexto($(".Artigo #NewsSummary").text());

        r.timestamp = new Date($(".Artigo #TitleArticle .date-issue2").attr("value"));
        if($(".Artigo #TitleArticle img").attr("src") === undefined){
            if($(".Artigo #Article img").attr("src") !== undefined){
                r.imgURL = "http://tsf.pt" + $(".Artigo #Article img").attr("src");
            }
        }
        else
            r.imgURL = "http://tsf.pt" + $(".Artigo #TitleArticle img").attr("src");

        r.textoNoticia = utils.limparTexto($(".Artigo #Article div").text());
        r.categoria = utils.limparTexto($(".BoxHeaderBigNew").text());

        r.keywords = [];
        $(".listTags .TagsLL a").each(function(i, item){
            r.keywords.push($(item).text());
        });

        if(r.titulo == "")
            return null;
        else
            return r;
    },

    // TODO
    extractNoticiasFromPage: function(html, cb){
        $ = cheerio.load(html);
        var r = [];

        var links = $('a[href]');
        $(links).each(function(i, link){
            var a = $(link).attr('href');

            if(a.match(/\/PaginaInicial\/[a-zA-Z0-9\-]+\/Interior.aspx\?content_id=[0-9]+/)){
                r.push((a.indexOf("http") >= 0) ? "" : "http://tsf.pt/" + a);
            }
        });

        cb(r.filter(utils.onlyUnique));
    }

}
