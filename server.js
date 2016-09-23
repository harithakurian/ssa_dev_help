var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    path = require('path'),
    mkdirp = require('mkdirp');

var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var db;

var multer = require('multer'),
    bodyParser = require('body-parser'),
    path = require('path');

var fs = require('fs-extra');

var session = require('express-session');


app.use(session({
    secret: 'currentUser',
    resave: false,
    saveUninitialized: false
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//
app.use('/static', express.static(__dirname + '/public'));

function checkAuth(req, res, next) {

    if (!req.session.currentUser) {
        res.sendFile(path.join(__dirname + '/login.html'));
    } else {
        next();
    }
}


app.post('/login/', function (req, res) {
    var login = {
        userName: req.body.userName,
        password: req.body.password
    };

    console.log('login UserName is: ' + login.userName);
    console.log('password is: ' + login.password);
    console.dir(login);

    db.findUsers(login, (err, results) => {
        if (err || results.length !== 1) {
            console.log("something is wrong");
            res.send("no user is found");
        } else {
            req.session.currentUser = {
                userName: login.userName
            };
            console.log("user found");
            res.send("user found");

            // @TODO set session
        }
    });
});

app.post('/logout/', function (req, res) {
    req.session.destroy(function(err) {

        res.redirect("/");
    });

});

app.post('/insertUser/', function (req, res) {
    var user = {
        userName: req.body.userName,
        password: req.body.password,
        profileName: req.body.profileName
    };

    db.insertUser(user, (err, success) => {
        if (err) {
            res.status(500).send(err);
        } else {
            req.session.currentUser = {
                userName: user.userName
            };
            res.redirect("/");
        }
    });
});

app.post("/api/postAnswer/", function (req, res) {
    var answer = {
        questionId: new mongo.ObjectId(req.body.questionId),
        userName: req.session.currentUser.userName,
        content: req.body.content,
        dateTime: req.body.dateTime
    }
    
    db.insertAnswer(answer, (err,result) => {
        if (err) {
            console.log("Answer not inserted", err);
            res.status(500).send(err.errmsg);
        } else {
            res.send(result);
        }
    })
});

app.post('/insertComment/', function (req, res) {
    var comment = {
        userName: req.session.userName,
        questionId: req.body.questionId, 
        answerId: req.body.answerId, 
        content: req.body.content
    }

    db.insertComment(comment).then(
        (row) => {
            res.send(row);
        }
    ).catch(
        (err) => {
            res.status(500);
            res.send(err.errMsg);
        }
    )    
})

app.get('/api/getQuestion/:questionId', function (req, res) {
    var filter = {
        _id: new mongo.ObjectId(req.params.questionId)
    };
    db.findQuestion(filter, function(err, result) {
        if (err) {
            res.status(500).send(err);
        } else {                        
            res.json(result);
        }
    });
});

app.get("/api/getAnswersByQuestion/:questionId", function (req, res) {
    var filter = {
        questionId: new mongo.ObjectId(req.params.questionId)
    };

    db.findAnswers(filter, function(err, results) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
});

app.get('/getQuestions/:userName?', function (req, res) {
    var who = req.session.currentUser.userName;
    if (req.params.userName) {
        who = req.params.userName;
    }
    var filter = {
        userName: who
    };
    
    db.findQuestions(filter, function(err, results) {
        if (err) {
            res.status(500).send(err);
        } else {
            console.log(results);
            res.json(results);
        }
    })

    // @TODO
});

app.get('/viewAllQuestions/', function (req, res) {
    var filter = {};
    
    db.findQuestions(filter, function(err, results) {
        if (err) {
            res.status(500).send(err);
        } else {
            console.log(results);
            res.json(results);
        }
    })

    // @TODO
});

app.post('/insertQuestion/', function (req, res) {
    var question = {
        userName: req.session.currentUser.userName,
        title: req.body.title,
        content:req.body.content,
        dateTime: new Date()
    };

    console.dir(question);
    db.insertQuestion(question, (err, success) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send("success");
    }
    // @TODO
    });
});

app.post('/updateQuestion/', function (req, res) {
    var question = {
        questionId: req.body.questionId,
        answerId:req.body.answerId,
    };

    console.dir(question);
    db.updateQuestion({_id: new mongo.ObjectId(questionId)}, {bestAnswerId: new mongo.ObjectId(answerId)}, 
    function (err, isSuccess) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send("success");
        }
    });
});


app.get('/api/searchQuestions/:title', function (req, res) {
    var filter = {
        title: new mongo.ObjectId(req.params.title)
    };
    db.findQuestions(filter, function(err, results) {
        if (err) {
            res.status(500).send(err);
        } else {
            console.log(results);
            res.json(results);
        }
    })
});

app.get('/', checkAuth, function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/register', function (req, res) {
    res.sendFile(__dirname + '/register.html');
});

// Initialize connection once
MongoClient.connect("mongodb://PC93:27017/ssa-dev-help-db", function (err, database) {
    if (err) {
        throw err;
    }

    db = require("./db")(database);

    // Start the application after the database connection is ready
    app.listen(8080);
    console.log("Listening on port 8080");
});