var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils")
var moment = require("moment");
moment.locale('pt');

module.exports = {
    nome: "Visao",
    hostname: "visao.sapo.pt",

    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};

        r.titulo = utils.limparTexto($("#detalheArtigoDefault .article-title").text());
        r.subtitulo = utils.limparTexto($("#detalheArtigoDefault .article-intro").text());

        r.timestamp = moment($("#detalheArtigoDefault .article-date").text(), "HH:mm dddd, D [de] MMMM [de] YYYY").toDate();

        var img = $("#detalheArtigoDefault .mancheteImageVis img").attr("src");
        r.imgURL = "http://visao.sapo.pt" + img;
        if(img === undefined)
            delete r.imgURL;

        r.textoNoticia = utils.limparTexto($("#detalheArtigoDefault #bodyText").text());

        r.categoria = $(".hMenuThirdLineItemOtherSel").text().trim();

        if(r.titulo == "")
            return null;
        else
            return r;
    },

    // TODO
    extractNoticiasFromPage: function(html, cb){
        $ = cheerio.load(html);
        var r = [];

        var links = $('article h1 a');
        $(links).each(function(i, link){
            var a = $(link).attr('href');

            //if(a.match(/publico.pt\/[a-zA-Z]+\/noticia/)){
                r.push((a.indexOf("http") >= 0) ? "" : "http://visao.sapo.pt" +a);
            //}
        });

        //console.log(links);

        cb(r.filter(utils.onlyUnique));
    },

    categoriaFromUrl: function(url){
        return "";
    }

}
