var mongoose = require('mongoose');
var random = require('mongoose-random');
var bcrypt   = require('bcrypt-nodejs');

var generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

var userSchema = mongoose.Schema({

    username:       String,
    password:       {type: String, set: generateHash},
    token:          String,
    uid:            String,

    catlikes:     [String],
    catdislike:  [String],

    newslikes:           [{type: mongoose.Schema.Types.ObjectId, ref: 'Noticia'}],
    newsdislikes:        [{type: mongoose.Schema.Types.ObjectId, ref: 'Noticia'}],

    classificadas: {type: Number, default: 0},

    anoNascimento: {type: Number, default: (new Date()).getFullYear()},
    sexo: {type: String, default: "m"},
    horasNoticias: {type: Number, default: 0}
});

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema, 'users');