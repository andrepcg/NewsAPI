var utils = require("./utils");
var passport 	= require('passport');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

exports.isLoggedIn = function(req, res, next) {

    if (req.isAuthenticated()){
        console.log("user autenticado");
        return next();
    }
    else if(req.cookies.token && req.cookies.uid){
        console.log("a fazer login a partir dos cookies");
        User.findOne({"token": req.cookies.token, "uid": req.cookies.uid})
            .exec(function(err, user){
                if (err)
                    return next(err);

                if(user){
                    req.login(user, function(err) {
                        if (err)
                            return next(err);

                        next();
                    });
                }
            });
    }

}

exports.generateNewUser = function(req, res, next) {

    if(!req.cookies.token && !req.cookies.uid){
        var u = {uid: utils.generateUUID(), token: utils.generateRandom(64)};
        var user = new User(u);
        user.save(function(err){
            if(!err){
                console.log("generating user");
                res.cookie("token", u.token);
                res.cookie("uid", u.uid);

                req.login(user, function(err) {
                    if (err)
                        console.log("login err", err);

                    next();
                });
            }
        });
    }
    else
        next();
}