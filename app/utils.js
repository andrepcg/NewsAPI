var sanitize = require('sanitize-html');
var crypto = require('crypto');

exports.generateRandom = function(len){
    len = len || 30;
    var buf = [],
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        charlen = chars.length;

    for (var i = 0; i < len; ++i)
        buf.push(chars[exports.getRandomInt(0, charlen - 1)]);

    return buf.join('');
}

exports.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.onlyUnique = function(value, index, self) {
    if(value == "") return false;
    return self.indexOf(value) === index;
}

exports.limparTexto = function(texto){
    texto = sanitize(texto, {
        allowedTags: [],
        allowedAttributes: {}
    });

    texto = texto.replace(/[\r\n]/g,"");
    texto = texto.replace(/\s+/g," ");
    return texto.trim();
}

exports.limparPalavra = function(str){

    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    var from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
    var to   = "aaaaaeeeeeiiiiooooouuuunc------";
    for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    return str;
}

exports.generateUUID = function(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};

exports.meses = function(mes){
    switch (mes){
        case "Janeiro":
            return 1;
        case "Fevereiro":
            return 2;
        case "Março":
            return 3;
        case "Abril":
            return 4;
        case "Maio":
            return 5;
        case "Junho":
            return 6;
        case "Julho":
            return 7;
        case "Agosto":
            return 8;
        case "Setembro":
            return 9;
        case "Outubro":
            return 10;
        case "Novembro":
            return 11;
        case "Dezembro":
            return 12;
    }
}

exports.allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    next();
}