var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils");
var moment = require("moment");
moment.locale('pt');

module.exports = {
    nome: "T3",
    hostname: "t3.sapo.pt",

    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};
        var content = $(".noticia_individual");

        r.titulo = utils.limparTexto(content.find(".noticia_individual_titulo").text());
        r.subtitulo = utils.limparTexto(content.find(".noticia_individual_entrada").text());

        r.timestamp = moment(content.find(".last_news_data").text(),"HH:mm - DD MMM YYYY").toDate();


        //if($(".artigo_center2 .imgArtigo img").length > 0)
            r.imgURL = content.find(".noticia_destaque_foto img").attr("src");

        r.textoNoticia = utils.limparTexto(content.find(".noticia_individual_corpo_noticias p").slice(0,-2).text());


        r.categoria = "";

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

            if(a.match(/t3.sapo.pt\/noticias\/[a-z\-0-9]+/)){
                r.push(/*(a.indexOf("http") >= 0) ? "" : "http://maisfutebol.iol.pt" + */a);
            }
        });

        cb(r.filter(utils.onlyUnique));



    }

}
