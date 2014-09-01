var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils");
var moment = require("moment");

module.exports = {
    nome: "A Bola",
    hostname: "abola.pt",

    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};

        r.titulo = utils.limparTexto($("#a5g2").text());
        r.timestamp = moment($("#a5x").text(), "hh:mm - DD-MM-YYYY").toDate();
        r.imgURL = $("#a5g1 img").attr("src");
        r.textoNoticia = utils.limparTexto($("#noticiatext").text());
        r.categoria = "Desporto";

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

            if(a.match(/ver.aspx?id=[0-9]+/)){
                r.push((a.indexOf("http") >= 0) ? "" : "http://www.abola.pt/nnh/" + a);
            }
        });

        cb(r.filter(utils.onlyUnique));
    }

}
