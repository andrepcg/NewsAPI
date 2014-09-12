var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils");
var moment = require("moment");

module.exports = {
    nome: "Tek",
    hostname: "tek.sapo.pt",

    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};

        var content = $($(".content-main .box-artigo")[0]);

        r.titulo = content.children("h2").text();
        r.subtitulo = content.find("h3.artigo").text();

        r.timestamp = new Date(parseInt(content.find(".spc-p10").attr("datetime")*1000));


        //r.imgURL = $(".news-item .image img").attr("src");
        r.textoNoticia = utils.limparTexto(content.children(".spc-content").text());

        r.categoria = $($(".main-menu .sub-menu .active")[0]).text();

        r.keywords = [];
        content.find(".artigo-tags li").each(function(i, item){
            if(i != 0)
                r.keywords.push($(item).text().replace(/_/g," "));
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

            if(a.match(/\/noticias\/[a-z]+\/[a-z0-9_\-]+.html$/)){
                r.push((a.indexOf("http") >= 0) ? "" : "http://tek.sapo.pt" + a);
            }
        });

        cb(r.filter(utils.onlyUnique));



    }

}
