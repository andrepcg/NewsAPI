var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils")

var moment = require("moment");

module.exports = {
    nome: "Economico",
    hostname: "economico.sapo.pt",
    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};

        r.titulo = utils.limparTexto($(".article-content .module-content h1").text());
        r.subtitulo = utils.limparTexto($(".article-content .summary").text());

        r.timestamp = moment($(".article-content .module-content time").attr("datetime"),"DD/MM/YY HH:mm").toDate();
        r.imgURL = $(".article-content .module-content figure img").attr("src");
        r.textoNoticia = utils.limparTexto($(".article-content .module-content p:not([class])").text());
        r.categoria = $(".article-content header h1").text();

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

            if(a.match(/\/noticias\/[a-z_\-0-9]+.html/)){
                r.push((a.indexOf("http") >= 0) ? "" : "http://economico.sapo.pt" + a);
            }
        });

        cb(r.filter(utils.onlyUnique));
    }

}
