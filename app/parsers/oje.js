var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils");
var moment = require("moment");

module.exports = {
    nome: "Oje",
    hostname: "oje.pt",

    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};

        if($(".mainCol .article-body").text().length > 10){
            r.titulo = utils.limparTexto($(".mainCol .title-main").text());
            r.subtitulo = utils.limparTexto($(".mainCol .article-description").text());

            r.timestamp = moment($(".mainCol .article-date").text(),"YYYY/MM/DD HH[h]mm").toDate();

            r.textoNoticia = utils.limparTexto($(".mainCol .article-body").text());

            r.imgURL = $(".mainCol .article-image img").attr("src");

            var metaKeys = $("meta[name=keywords]").attr("content").split(",");
            r.categoria = metaKeys[metaKeys.length - 1];
            
            if(r.titulo == "")
                return null;
            else
                return r;
        }
        return null;
    },

    extractNoticiasFromPage: function(html, cb){
        $ = cheerio.load(html);
        var r = [];

        var links = $('a[href].article-title-link');
        $(links).each(function(i, link){
            var a = $(link).attr('href');

            if(a.match(/oje.pt\/pt\/[a-z0-9\-,”“'´"]+/)){

                r.push(a);
            }
        });

        cb(r.filter(utils.onlyUnique));



    }

}
