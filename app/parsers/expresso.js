var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils");

var moment = require("moment");


module.exports = {
    nome: "Expresso",
    hostname: "expresso.sapo.pt",

    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};

        r.titulo = utils.limparTexto($("#artigo header h1").text());
        r.subtitulo = utils.limparTexto($("#artigo header summary").text());

        r.timestamp = moment($("#artigo time").attr("datetime"),"YYYY-MM-DD HH:mm:ss").toDate();

        var img = $("#artigo #media img").attr("src");
        if(img !== undefined)
            r.imgURL = "http://expresso.sapo.pt" + $("#artigo #media img").attr("src");

        r.textoNoticia = utils.limparTexto($("#artigo #conteudo p").text());
        r.categoria = $(".levels .levelsAnchors:nth-child(2)").text().trim();

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

            if(a.match(/\/[a-z_\-0-9]+=f[0-9]+/)){
                if(a.length > 10)
                    r.push((a.indexOf("http") >= 0) ? "" : "http://expresso.sapo.pt" + a);
            }
        });

        cb(r.filter(utils.onlyUnique));
    }

}
