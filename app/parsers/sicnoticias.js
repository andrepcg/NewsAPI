var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils");

var moment = require("moment");

var sicnoticias = {
    nome: "Sic Noticias",
    hostname: "sicnoticias.sapo.pt",

    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};

        r.titulo = utils.limparTexto($(".articleFullDetail .listContainer > div .titleContainer").text());
        r.subtitulo = utils.limparTexto($(".articleFullDetail .listContainer > div .leadContainer").text());
        r.timestamp = moment($(".articleFullDetail .listContainer > div .dateContainer").text(),"HH:mm DD.MM.YYYY").toDate();

        var img = $(".articleFullDetail .listContainer > div ").attr("data-thumbnail");
        if(img && img.indexOf("null") == -1)
            r.imgURL = $(".articleFullDetail .listContainer > div ").attr("data-thumbnail");

        var media = $(".articleFullDetail .listContainer > div ").attr("data-src");
        r.media = (media != "null") ? media : "";
        r.textoNoticia = utils.limparTexto($(".articleFullDetail .listContainer > div .bodyContainer").text());
        r.categoria = $(".articleFullDetail .listContainer > div .sectionNameContainer").text().trim();

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

            if((a.match(/\/[a-z_\-0-9]+\/[0-9]{4}[a-zA-Z_\-0-9]+/) || a.match(/\/especiais\/[a-zA-Z_\-0-9]+\/[a-zA-Z_\-0-9]+/)) && !a.match(/\/institucional\//) ){
                if(a.length > 10)
                    r.push((a.indexOf("http") >= 0) ? "" : "http://sicnoticias.sapo.pt" + a);
            }
        });

        cb(r.filter(utils.onlyUnique));
    }

}

module.exports = sicnoticias;