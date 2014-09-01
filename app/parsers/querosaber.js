var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils")

var moment = require("moment");

module.exports = {
    nome: "Quero Saber",
    hostname: "querosaber.sapo.pt",
    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};

        if($(".contentor_multimedia").length == 0){
            r.titulo = utils.limparTexto($(".topic .title").text());

            r.timestamp = moment($(".date").text(), "MMM DD").toDate();

            var img = $(".topic .image img").attr("src");
            if(img !== undefined)
                r.imgURL = img;

            r.textoNoticia = utils.limparTexto($(".topic .text > p").text());
            r.categoria = $("span[class~='theme']").text();

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

        var links = $('channel item link');
        $(links).each(function(i, link){
            r.push($(link).text());
        });

        cb(r);

    }

}
