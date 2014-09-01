var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils")

var moment = require("moment");

module.exports = {
    nome: "Lifestyle",
    hostname: "lifestyle.publico.pt",
    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};

        r.titulo = utils.limparTexto($("article .entry-title").text());
        r.subtitulo = utils.limparTexto($("article .entry-summary.lead").text());

        r.timestamp = new Date($("article .entry-meta time").attr("datetime"));
        r.imgURL = $("article .entry-content-asset img").attr("src");
        r.textoNoticia = utils.limparTexto($("article .entry-content > p").text());
        r.categoria = $("article .category-title").text();

        if(r.titulo == "")
            return null;
        else
            return r;
    },

    extractNoticiasFromPage: function(html, cb){
        $ = cheerio.load(html, {xmlMode: true});
        var r = [];

        var links = $('channel item link');
        $(links).each(function(i, link){
            r.push($(link).text());
        });

        cb(r);

    }

}
