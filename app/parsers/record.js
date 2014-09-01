var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils");
var moment = require("moment");
moment.locale('pt');

module.exports = {
    nome: "Record",
    hostname: "record.xl.pt",

    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};

        r.titulo = ($(".maincontain .titulo")).text();
        r.subtitulo = ($(".maincontain .sub").text());

        var d = $(".maincontain .data").text().split(",")[1];
        d = utils.limparTexto(d);
        r.timestamp = moment(d,"DD MMMM [de] YYYY | HH:mm").toDate();

        if($(".maincontain .texto").length > 1)
            r.textoNoticia = utils.limparTexto($($(".maincontain .texto").get(1)).text());
        else
            r.textoNoticia = utils.limparTexto($(".maincontain .texto").text());

        if($(".maincontain #mod_fv img").length > 0)
            r.imgURL = $(".maincontain #mod_fv img").attr("src");

        r.categoria = $(".modBreadcrum a").first().text();

        r.keywords = [];

        $(".modBreadcrum a:not(:nth-of-type(1))").each(function(i, item){
            r.keywords.push($(item).text());
        });

        r.alternateUrl = [];
        r.alternateUrl.push($($(".maincontain .socialcontain a.tags").get(0)).text());

        if(r.titulo == "")
            return null;
        else
            return r;

    },

    extractNoticiasFromPage: function(html, cb){
        $ = cheerio.load(html);
        var r = [];

        var links = $(".areaGeralNoticiasBox #pageContainer1 .detalheAgenda a[href]");
        $(links).each(function(i, link){
            var a = $(link).attr('href');

            if(!a.match(/(multimedia)|(premium)/gi)){
                r.push("http://record.xl.pt" + a);
            }
        });

        cb(r.filter(utils.onlyUnique));



    }

}
