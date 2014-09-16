var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils")

var moment = require("moment");

module.exports = {
    nome: "Fugas",
    hostname: "fugas.publico.pt",
    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};

        r.titulo = utils.limparTexto($("#content .news-item > h2").text());
        r.subtitulo = utils.limparTexto($("#content .news-item .lead").text());

        r.timestamp = new Date($("#content .news-item .time time").attr("datetime"));

        var img = $("#content .image-wrapper img").attr("src");
        if(img !== undefined)
            r.imgURL = img;

        r.textoNoticia = utils.limparTexto($("#content .news-item .entry-content p").text());
        r.categoria = $(".news-item p.subtitle").attr("class").split("-")[1];


        if(r.titulo == "")
            return null;
        else
            return r;

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
