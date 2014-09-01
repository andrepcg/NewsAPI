var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils");
var moment = require("moment");
moment.locale('pt');

module.exports = {
    nome: "PCGuia",
    hostname: "pcguia.pt",

    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};

        r.titulo = utils.limparTexto($(".main-content h1").text());
        //r.subtitulo = utils.limparTexto($("#tabelaNoticia table:nth-of-type(1) #introNoticiaDetalhe").text());

        r.timestamp = moment($(".main-content [itemprop=datePublished]").attr("content"),"DD MMMM, YYYY").toDate();

        if($(".main-content .featured-image-inner img").length > 0)
            r.imgURL = $(".main-content .featured-image-inner img").attr("src");
        r.textoNoticia = utils.limparTexto($(".main-content .the-content p").text());

        r.categoria = $(".category-list a:nth-of-type(1)").text();

        r.keywords = [];
        $(".postinfo-box-wrapper .post-tags a").each(function(i, item){
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

            if(a.match(/pcguia.pt\/[0-9]{4}\/[0-9]{2}\/[a-z\-]+/)){
                r.push(a);
            }
        });

        cb(r.filter(utils.onlyUnique));



    }

}
