var request = require('request');
var cheerio = require('cheerio');
var utils = require("../utils");

var moment = require("moment");

module.exports = {
    nome: "Exame Informatica",
    hostname: "exameinformatica.sapo.pt",

    parseNoticiaHTML: function(html){
        $ = cheerio.load(html);
        var r = {};

        r.titulo = utils.limparTexto($(".articleStructure .listContainer .article .titleContainer").text());
        r.subtitulo = utils.limparTexto($(".articleStructure .listContainer .article .leadContainer").text());
        r.timestamp = moment($(".articleStructure .listContainer .article .dateContainer").text(),"DD/MM/YYYY HH:mm").toDate();
        r.imgURL = $(".articleStructure .listContainer .article ").attr("data-thumbnail");
        r.textoNoticia = utils.limparTexto($(".articleStructure .listContainer .article .bodyContainer").text());
        r.categoria = $(".articleStructure .listContainer .article .sectionNameContainer").text().trim();

        if(r.titulo == "")
            return null;
        else
            return r;
    },

    // TODO
    extractNoticiasFromPage: function(html, cb){
        $ = cheerio.load(html);
        var r = [];

        var links = $('a[href]');
        $(links).each(function(i, link){
            var a = $(link).attr('href');

            if(a.match(/\/noticias\/[a-z_\-0-9]+\/[a-zA-Z_\-0-9]+/)){
                r.push((a.indexOf("http") >= 0) ? "" : "http://exameinformatica.sapo.pt" + a);
            }
        });

        cb(r.filter(utils.onlyUnique));
    }

}
