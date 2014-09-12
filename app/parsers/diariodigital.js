var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils")

module.exports = {
    nome: "Diario Digital",
    hostname: "diariodigital.sapo.pt",
    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};

        r.titulo = utils.limparTexto($(".main_content .title").text());
        r.subtitulo = utils.limparTexto($(".main_content .txt h4:nth-of-type(1)").text());

        r.timestamp = new Date();
		var src = $(".main_content .commmentarios .photo img").attr("src")
        if(src !== undefined)
            r.imgURL = (src.indexOf("http://") >= 0) ? src : "http://diariodigital.sapo.pt" + src;

        r.textoNoticia = utils.limparTexto($(".main_content .txt p").text());
        r.categoria = $("#header .nav .active").text();

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

            if(a.match(/news.asp\?id_news=[0-9]+/)){
                r.push((a.indexOf("http") >= 0) ? "" : "http://diariodigital.sapo.pt/" + a);
            }
        });

        cb(r.filter(utils.onlyUnique));
    }

}
