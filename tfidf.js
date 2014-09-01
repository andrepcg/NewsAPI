// Dependencies
var crypto = require("crypto");
var fs = require("fs");

globaltf = {};
var N = 0;

exports.loadTerms = function(filename){
    var p;
    try{
        p = fs.readFileSync(filename);
        p = JSON.parse(p);
        globaltf = p.data;
        N = p.N;
    }catch (e){

    }
}

exports.saveTerms = function(filename){
    fs.writeFile(filename, JSON.stringify({data: globaltf, N: N}), function(err){
        if (err) throw err;
    });
}

// Switch for adjusted / unadjusted TF-IDF
// Adjusted   : |D| = # of documents + 1, {t, d} = # of documents with term + 1
// Unadjusted : |D| = # of documents,     {t, d} = # of documents with term
exports.adjusted = false;

// English stop words borrowed from Natural.js

exports.stopWords = ["the", "é", "de", "a", "o", "que", "e", "do", "da", "em", "um", "para", "com", "não", "uma", "os", "no", "se", "na", "por", "mais", "as", "dos", "como", "mas", "ao", "ele", "das", "à", "seu", "sua", "ou", "quando", "muito", "nos", "já", "eu", "também", "só", "pelo", "pela", "até", "isso", "ela", "entre", "depois", "sem", "mesmo", "aos", "seus", "quem", "nas", "me", "esse", "eles", "você", "essa", "num", "nem", "suas", "meu", "às", "minha", "numa", "pelos", "elas", "qual", "nós", "lhe", "deles", "essas", "esses", "pelas", "este", "dele", "tu", "te", "vocês", "vos", "lhes", "meus", "minhas", "teu", "tua", "teus", "tuas", "nosso", "nossa", "nossos", "nossas", "dela", "delas", "esta", "estes", "estas", "aquele", "aquela", "aqueles", "aquelas", "isto", "aquilo", "estou", "está", "estamos", "estão", "estive", "esteve", "estivemos", "estiveram", "estava", "estávamos", "estavam", "estivera", "estivéramos", "esteja", "estejamos", "estejam", "estivesse", "estivéssemos", "estivessem", "estiver", "estivermos", "estiverem", "hei", "há", "havemos", "hão", "houve", "houvemos", "houveram", "houvera", "houvéramos", "haja", "hajamos", "hajam", "houvesse", "houvéssemos", "houvessem", "houver", "houvermos", "houverem", "houverei", "houverá", "houveremos", "houverão", "houveria", "houveríamos", "houveriam", "sou", "somos", "são", "era", "éramos", "eram", "fui", "foi", "fomos", "foram", "fora", "fôramos", "seja", "sejamos", "sejam", "fosse", "fôssemos", "fossem", "for", "formos", "forem", "serei", "será", "seremos", "serão", "seria", "seríamos", "seriam", "tenho", "tem", "temos", "tém", "tinha", "tínhamos", "tinham", "tive", "teve", "tivemos", "tiveram", "tivera", "tivéramos", "tenha", "tenhamos", "tenham", "tivesse", "tivéssemos", "tivessem", "tiver", "tivermos", "tiverem", "terei", "terá", "teremos", "terão", "teria", "teríamos", "teriam"];


// Normalize a word
exports.normalize = function normalize(word) {
    return word.toLowerCase().replace(/['"”“\]\[<>#$%&’‘\+\*]/g,"").trim();
};

// Tokenize a doc
exports.tokenize = function tokenize(doc) {
    return doc.split(/[\s\-_():.!\?,;\n]+/);
};

exports.reduce = function(previous, current, index, array) {
    if(!(current in previous)) {
        previous[current] = 1;
    } else {
        previous[current] += 1;
    }
    return previous;
};



exports.filter = function(words){
    return words
        .map(exports.normalize)
        .filter(function(word) {
            return word.length > 2 && (!exports.stopWords || !~exports.stopWords.indexOf(word)) && !word.match(/\d/g);

        });
}

// Text frequency
exports.tf = function(words) {
    return exports.filter(words)
        .reduce(exports.reduce, {});
};

// Inverse document frequency
exports.idf = function idf(D, dted) {
	if(exports.adjusted) {
		return Math.log((D+1) / (dted+1)) / Math.log(10);
	} else {
		return Math.log(D / dted) / Math.log(10);
	}
};

exports.tfNoticia = function(noticia){

    if(noticia.subtitulo === undefined)
        noticia.subtitulo = "";

    if(noticia.textoNoticia === undefined)
        noticia.textoNoticia = "";

    return exports.tf(exports.tokenize(noticia.titulo + " " + noticia.subtitulo + " " + noticia.textoNoticia));

}

exports.parseNoticia = function(noticia){
    N++;
    var f = exports.tfNoticia(noticia);
    for(term in f) {
        if(!(term in globaltf))
            globaltf[term] = 0;
        globaltf[term]++;
    }
}

exports.parseText = function(texto, save){
    N++;
    var f = exports.tf(exports.tokenize(texto));
    for(term in f) {
        if(!(term in globaltf))
            globaltf[term] = 0;
        globaltf[term]++;
    }

    if(save)
        exports.saveTerms("tfidf.json");

    return f;
};

exports.tfidf = function(noticia){
    var docfreq = exports.tfNoticia(noticia);
    var sortable = [];

    for(term in docfreq){

        sortable.push([term, (docfreq[term] / Object.keys(docfreq).length) * exports.idf(N, globaltf[term])]);
    }

    sortable.sort(function(a, b) {return b[1] - a[1]})
    return sortable;
}

exports.analyze = function analyze(corpus, _stopWords) {
    var
        // Total number of (unique) documents
        D = 0,
        // Number of documents containing the term
        dted = {},
        // Keep our calculated text frequencies
        docs = {},
        // Normalized stop words
        stopWords;
    
    if(_stopWords) stopWords = _stopWords.map(exports.normalize);

    // Key the corpus on their md5 hash
    function hash(doc) {
        return crypto.createHash("md5").update(doc).digest("base64");
    }

    function add(h, doc) {
        // One more document
        D++;
        // Calculate and store the term frequency
        docs[h] = exports.tf(exports.tokenize(doc), stopWords);
        // Update number of documents with term
        for(term in docs[h]) {
            if(!(term in dted)) dted[term] = 0;
            dted[term]++;
        }
    }

    if(!(corpus instanceof Array)) {
        // They are loading a previously analyzed corpus
        var data = corpus instanceof Object ? corpus : JSON.parse(corpus);
        D = data.D;
        dted = data.dted;
        docs = data.docs;
    } else {
        // They are loading a term and a corpus
        for(var i = 0, l = corpus.length; i < l; i++) {
            var doc = corpus[i],
                h = hash(doc);

            // Add the document if it's new to us
            if(!(h in docs)) {
                add(h, doc);
            }
        }
    }

    // Return a function which calculates the tfidf for this document
    return {
        tfidf: function(t, doc) {
            var h = hash(doc),
                term = exports.normalize(t);

            // If it's a new document, add it
            if(!(h in docs)) {
                add(h, doc);
            }
            
            // Return the tfidf
            if(term in docs[h])
                return docs[h][term] * exports.idf(D, dted[term]);
            else
                return 0;
        },
        asJSON: function() {
            return JSON.stringify({
                version: 1,
                D: D,
                dted: dted,
                docs: docs
            });
        }
    };
};
