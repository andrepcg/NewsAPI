var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils");
var moment = require("moment");

module.exports = {
    nome: "Mais Futebol",
    hostname: "maisfutebol.iol.pt",

    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};

        r.titulo = utils.limparTexto($(".artigo_center > h1").text());
        r.subtitulo = utils.limparTexto($(".artigo_center > h2").text());

        //r.timestamp = moment($(".main-content [itemprop=datePublished]").attr("content"),"DD MMMM, YYYY").toDate();
        r.timestamp = new Date();

        if($(".artigo_center2 .imgArtigo img").length > 0)
            r.imgURL = $(".artigo_center2 .imgArtigo img").attr("src");

        r.textoNoticia = utils.limparTexto($(".artigo_center2 .txtArtigo").text());
        var cronicas_anteriores = r.textoNoticia.indexOf("Crónicas anteriores:");

        if(cronicas_anteriores > 0)
            r.textoNoticia = r.textoNoticia.substr(0, cronicas_anteriores);
        else
            r.textoNoticia = r.textoNoticia.substr(0, r.textoNoticia.indexOf("Mais artigos:"));

        //r.categoria = $(".category-list a:nth-of-type(1)").text();

        r.keywords = [];
        $(".artigo_center2 .tagsArtigo a").each(function(i, item){
            if(i == 0)
                r.categoria = $(item).text().trim();
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

            if(a.match(/\/[a-z\-0-9]+\/[a-f0-9]+.html/)){
                r.push((a.indexOf("http") >= 0) ? "" : "http://maisfutebol.iol.pt" + a);
            }
        });

        cb(r.filter(utils.onlyUnique));



    }

}
