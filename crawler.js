//require('graphdat');
//require('newrelic');

var async = require('async');
var CronJob = require('cron').CronJob;
var Noticia = require('./app/models/noticia');
var parsers = require("./app/parsers.js");

function Crawler(sites, crontime, tfidf) {
    var self = this;
    console.log("Crawler started");

/*
    parsers.getURLsFromPage({url: "http://feeds.controlinveste.pt/DV-ultimas", site: "http://dinheirovivo.pt"}, function(err, data){console.log(data);});
    parsers.getURLsFromPage("http://feeds.controlinveste.pt/DV-ultimas", function(err, data){console.log(data);});
    parsers.parseNoticia("http://www.dinheirovivo.pt/Economia/interior.aspx?content_id=4083851", function(err, data){console.log(data);});
 */

    var newsParsed;

    var processUrl = function(link, callback){
        //if(link.indexOf("noticiasaominuto" ) >= 0)
            //console.log(link);
        Noticia.findOne({$or: [{"alternateUrl": link}, {"url": link}]})
            .exec(function (err, noticia) {
                if (err)
                    callback(err);

                else {
                    if (!noticia) {

                        parsers.parseNoticia(link, function (err1, notres) {
                            if (!err1 && notres) {

                                tfidf.parseNoticia(notres);

                                var n = new Noticia(notres);
                                newsParsed++;

                                n.save(function(err){
                                    // se ja exister noticia com a mesma hash, adiciona link ao alternateUrl
                                    if(err && err.code == 11000){
                                        console.log("duplicate found", notres.url);
                                        Noticia.findOne({'hash': notres.hash})
                                            .exec(function (err, nhash) {

                                                if(nhash){
                                                    if(nhash.alternateUrl.indexOf(link) == -1){
                                                        nhash.alternateUrl.push(link);
                                                        nhash.save(callback);
                                                    }
                                                    else
                                                        callback();
                                                }
                                                else
                                                    callback();
                                            });

                                    }
                                    else
                                        callback();
                                });
                            }

                            if (err1) {
                                callback();
                            }

                        });
                    }
                    else
                        callback();
                }
            });
    };

    function ensureExecution(func, timeout) {
        var timer, run, called = false;

        run = function() {
            if(!called) {
                clearTimeout(timer);
                called = true;
                func.apply(this, arguments);
            }
        };

        timer = setTimeout(run, timeout);
        return run;
    }

    var crawler = new CronJob(crontime, function () {
        console.log("Starting cron " + Date());
        newsParsed = 0;
        async.each(sites, function (site, callback1) {
            //console.log("Parsing " + site);

                //TODO implementar timeout


                parsers.getURLsFromPage(site, function (err, urls) {
                    if(err)
                        callback1(err);

                    if (urls) {
                        async.eachLimit(urls, 10, processUrl, function(err){
                            if(err) console.log(err);
                            callback1();
                        });
                    }
                    /*else{
                        console.log("Sem links - ", site);
                        callback1();
                    }*/
                });

            },

            function (err) {
                if (err)
                    console.error(err);

                //if (!err)
                console.log("Finished cron", Date(), "- noticias encontradas: " + newsParsed);

                //console.log("A guardar TFIDF");
                tfidf.saveTerms("tfidf.json");
            });
    }, null, true);
}

module.exports = Crawler;
