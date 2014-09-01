var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils");


module.exports = {
    nome: "Jornali",
    hostname: "ionline.pt",

    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};
        r.titulo = $("#zona_central #container #titulo_text").text();
        r.subtitulo = $("#zona_central #container #inner b").text();
        //r.autor;
        r.timestamp = new Date($("#zona_central #container #creditos span").attr("content"));
        r.imgURL = $("#zona_central #container #banner img").attr("src");
        r.textoNoticia = utils.limparTexto($("#zona_central #container #inner #content_container .field-name-body").text());
        r.categoria = $("#zona_central #container #titulo .field-item a").text();

        if(r.titulo == "")
            return null;
        else
            return r;
    },

    extractNoticiasFromPage: function(html, cb){
        $ = cheerio.load(html);
        var r = [];

        var links = $('a');
        $(links).each(function(i, link){
            var a = $(link).attr('href');

            if(a.match(/\/artigos\//)){
                r.push("http://www.ionline.pt" + a);
            }
        });

        cb(r.filter(utils.onlyUnique));



    }

}