var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils");
var moment = require("moment");

module.exports = {

    nome: "Diario Noticias",
    hostname: "dn.pt",

    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};

        var content = $("#ctl00_ctl00_bcr_maincontent_ThisContent");
        r.titulo = utils.limparTexto(content.find("#NewsTitle").text());
        r.subtitulo = utils.limparTexto(content.find(".artigo-intro").text());

        r.timestamp = moment(content.find(".date-issue").attr("value"),"YYYY-MM-DD").toDate();

        if(content.find(".cx-img-flutuante img").length > 0)
            r.imgURL = "http://cdn.controlinveste.pt" + content.find(".cx-img-flutuante img").attr("src");

        r.textoNoticia = utils.limparTexto(content.find("#Article").text());


        r.keywords = [];
        content.find(".tagsLis a").each(function(i, item){
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

            if(a.match(/^(\/[a-z]+\/)([a-z]+\/)?interior.aspx\?content_id=[0-9]+/) && a.indexOf("#AreaComentarios") == -1){
                r.push("http://dn.pt" + a);
            }
        });

        cb(r.filter(utils.onlyUnique));

    },

    categoriaFromUrl: function(url){
        url = url.replace("http://");
        var split = url.split("/");

        return (split[1] == "inicio" ) ? split[2] : split[1];
    }

}
