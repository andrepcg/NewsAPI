var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils");
var moment = require("moment");

module.exports = {
    nome: "O Jogo",
    hostname: "ojogo.pt",

    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};

        r.titulo = utils.limparTexto($(".ArtContainer_1 #NewsTitle").text());
        r.subtitulo = utils.limparTexto($(".ArtContainer_1 #NewsSummary").text());
        r.timestamp = new Date($(".date-issue2").attr("value"));
        r.textoNoticia = utils.limparTexto($(".ArtContainer_1 .ArtText_1").text());
        r.categoria = utils.limparTexto($(".MainMenu .MMLink_sel").text());
        r.keywords = [utils.limparTexto($(".ArtContainer_1 .Title_5").text())];

        var img = $(".ArtContainer_1 .ArtPic_1 img").attr("src");

        if(img !== undefined)
            r.imgURL = "http://cdn.controlinveste.pt" + img;


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

            if(a !== undefined && a.match(/\/([a-zA-Z]+\/)+interior.aspx/) && a.indexOf("#Comment") == -1)
                r.push((a.indexOf("http") >= 0) ? "" : "http://www.ojogo.pt" + a);
        });

        cb(r.filter(utils.onlyUnique));

    }

}
