var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils");
var moment = require("moment");

module.exports = {
    nome: "Zerozero",
    hostname: "zerozero.pt",

    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};

        r.titulo = utils.limparTexto($(".news > h1").text());
        //r.subtitulo = utils.limparTexto($("#tabelaNoticia table:nth-of-type(1) #introNoticiaDetalhe").text());

        r.timestamp = moment($(".news > h2").text().split("|")[1],"YYYY-MM-DD HH:mm").toDate();


        r.textoNoticia = utils.limparTexto($(".texto_news p").text());

        r.categoria = "Futebol";

        r.keywords = [];
        var x = $(".news > h2").text().split("|")[0].split(",");
        for (var i = 0; i < x.length; i++)
            r.keywords.push(x[i].trim());

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

            if(a.match(/noticia.php\?id=[0-9]+/)){
                if(a.charAt(0) == "/")
                    a = a.substr(1, a.length);
                r.push("http://zerozero.pt/" + a);
            }
        });

        cb(r.filter(utils.onlyUnique));



    }

}
