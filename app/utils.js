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
