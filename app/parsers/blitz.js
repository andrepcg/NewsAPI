var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils");
var moment = require("moment");

module.exports = {
    nome: "Blitz",
    hostname: "blitz.sapo.pt",

    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};

        r.titulo = utils.limparTexto($("#tabelaNoticia table:nth-of-type(1) #tdTituloGeralBig").text());
        r.subtitulo = utils.limparTexto($("#tabelaNoticia table:nth-of-type(1) #introNoticiaDetalhe").text());

        r.timestamp = new Date();


        r.imgURL = "http://blitz.sapo.pt/" + $("#tabelaNoticia .fotoGuia img").attr("src");
        r.textoNoticia = utils.limparTexto($("#tabelaNoticia table:nth-of-type(1) #bodyNoticiaDetalhe p").text());

        r.categoria = "Musica";

        r.keywords = [];
        $("#tabelaNoticia table:nth-of-type(1) #bodyNoticiaDetalhe div:nth-of-type(3) a").each(function(i, item){
            r.keywords.push($(item).text());
        });


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
                    r.push((a.indexOf("http") >= 0) ? "" : "http://blitz.sapo.pt" + a);
            }
        });

        cb(r.filter(utils.onlyUnique));



    }

}