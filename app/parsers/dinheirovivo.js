var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils")

var moment = require("moment");

module.exports = {
    nome: "Dinheiro Vivo",
    hostname: "dinheirovivo.pt",
    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};

        r.titulo = utils.limparTexto($(".mainContainer .tituloNews").text());
        r.subtitulo = utils.limparTexto($(".mainContainer .antetitulo").text());

        r.timestamp = moment($(".mainContainer .meta").text().replace(/\u00a0/g, " "), "DD/MM/YYYY | HH:mm |").toDate();
        var img = $(".mainContainer .newsMainPic img").attr("src");
        if(img !== undefined)
            r.imgURL = "http://www.dinheirovivo.pt" + img;

        r.textoNoticia = utils.limparTexto($(".mainContainer #article").text());
        r.categoria = utils.limparTexto($(".breadcrumbs li:nth-of-type(2)").text());

        if(r.titulo == "")
            return null;
        else
            return r;
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
