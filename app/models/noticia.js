var mongoose = require('mongoose');
var random = require('mongoose-random');
var textSearch = require('mongoose-text-search');

var noticiaSchema = mongoose.Schema({

    titulo: 	    String,
    subtitulo:	    String,
    timestamp:	    Date,
    textoNoticia:   String,
    imgURL:         String,
    url:            String,
    jornal:         String,
    jornalLowercase:String,
    categoria:      String,
    crawlTime:      { type: Date, default: Date.now },

    alternateUrl:   [String],

    // hash = md5(titulo + dataPub + jornal)
    hash:          String,

    keywords: [String]
});

noticiaSchema.plugin(random);
noticiaSchema.plugin(textSearch);


module.exports = mongoose.model('Noticia', noticiaSchema, 'noticias');