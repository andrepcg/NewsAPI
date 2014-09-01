var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils");

var moment = require("moment");
moment.locale('pt');

module.exports = {
    nome: "Jornal de Negocios",
    hostname: "jornaldenegocios.pt",

    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};
        r.titulo = $(".artigo .crete36").text();
        r.subtitulo = $(".artigo .lead.p20").text();
        r.timestamp = moment($(".artigo .p30.a12_preto").text(),"DD MMMM YYYY HH:mm").toDate();
        r.imgURL = $(".artigo .p30 > img").attr("src");

        if($(".artigo .txt_artigo") === undefined)
            console.log(r.titulo);
        if($(".artigo .txt_artigo") !== undefined)
            r.textoNoticia = utils.limparTexto($(".artigo .txt_artigo").text());
        //r.categoria = $(".main_menu .active .menu_item").text();

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
            var classe = $(link).attr('class');


            if(a !== undefined && a.match(/\/[a-z]+\/[a-z]+\//) && (classe !== undefined  && (classe.indexOf("crete13") >= 0 || classe.indexOf("crete18") >= 0 || classe.indexOf("crete36") >= 0))){
                r.push((a.indexOf("http") >= 0) ? "" : "http://www.jornaldenegocios.pt" + a);
            }
        });

        cb(r.filter(utils.onlyUnique));

    },

    categoriaFromUrl: function(url){
        url = url.replace("http://");
        var split = url.split("/");
        return split[1];
    }

}