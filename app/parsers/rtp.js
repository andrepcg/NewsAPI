var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils");
var moment = require("moment");

module.exports = {
    nome: "RTP",
    hostname: "rtp.pt",

    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};
        var article = $("article");
        var video_detail = $("#video_detail");
        var content;

        content = (video_detail.length > 0) ? video_detail : article;

        var t = content.find("[itemprop=name]");
        var st = content.find("[itemprop=description]");

        r.titulo = utils.limparTexto((t.length > 0) ? t.text() : content.find("header > h1").text());
        r.subtitulo = utils.limparTexto((st.length > 0) ? st.text() : "");

        r.timestamp = new Date(content.find("header time").attr("datetime"));
        r.categoria = $("nav .selected > a").text();

        if(video_detail.length == 0){
            r.textoNoticia = utils.limparTexto(content.find("p:not([class])").text());
            r.imgURL = content.find(".Img img").attr("src");
            r.keywords = [];
            content.find(".Tags a").each(function(i, item){
                r.keywords.push($(item).text().trim());
            });
        }
        else
            r.textoNoticia = content.find("header > h2").text();



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

            if(a.match(/rtp.pt\/noticias\/index.php\?article=/)){
                //r.push((a.indexOf("http") >= 0) ? "" : "http://www.rtp.pt" + a);
                r.push(a);
            }
        });

        cb(r.filter(utils.onlyUnique));



    }

}
