var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils")

var moment = require("moment");

module.exports = {
    nome: "P3",
    hostname: "p3.publico.pt",
    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};

        if($(".contentor_multimedia").length == 0){
            r.titulo = utils.limparTexto($(".blocotexto_titulo h3").text());
            r.subtitulo = utils.limparTexto($(".blocotexto_titulo h5").text());

            r.timestamp = moment($(".assinatura_autor").text().match(/\d+\/\d+\/\d+ \- \d+:\d+/)[0], "DD/MM/YYYY - hh:mm").toDate();

            var img = $(".blocotexto_foto img").attr("src");
            if(img !== undefined)
                r.imgURL = img;

            r.textoNoticia = utils.limparTexto($("#blocotexto > p").text());
            r.categoria = $(".blocotexto_titulo h4").text();

            r.keywords = [];
            $(".colfina_tags p").each(function(i, item){
                r.keywords.push($(item).text().trim());
            });

            //if($(".immersive-story-wrapper").length == 0){
            var link = $("fb\\:like").attr("href");

            //r.alternateUrl = ["http://p3.publico.pt" + ((a = link.indexOf("?")) >= 0) ? link.substr(0, a) : link];
            r.alternateUrl = ["http://p3.publico.pt" + link];

            if(r.titulo == "")
                return null;
            else
                return r;
        }
        else
            return null;
    },

    extractNoticiasFromPage: function(html, cb){
        $ = cheerio.load(html, {xmlMode: true});
        var r = [];

        var links = $('channel item feedburner\\:origLink');
        $(links).each(function(i, link){
            r.push($(link).text());
        });

        cb(r);

    }

}
