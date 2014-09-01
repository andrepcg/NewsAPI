var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils");
var moment = require("moment");
moment.locale('pt');

module.exports = {
    nome: "Deco Proteste",
    hostname: "deco.proteste.pt",

    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};

        r.titulo = utils.limparTexto($(".titleholderContents h1").text());
        r.timestamp = moment($(".pager .date").text(), "DD MMMM YYYY").toDate();
        r.subtitulo = utils.limparTexto($(".contentHighlight p").text());
        r.imgURL = $(".imghighlight").attr("src");
        r.textoNoticia = utils.limparTexto($(".contentDetail p, .contentDetail ul").text());
        r.categoria = utils.limparTexto($(".main .breadcrumbs li:nth-of-type(3)").text());

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

            if(a.match(/[a-z0-9\-]+\/[a-z0-9\-]+\/noticia\/[a-z0-9\-]+/)){
                r.push((a.indexOf("http") >= 0) ? "" : "http://deco.proteste.pt" + a);
            }
        });

        cb(r.filter(utils.onlyUnique));
    }

}
