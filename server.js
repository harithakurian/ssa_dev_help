var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    path = require('path'),
    mkdirp = require('mkdirp');

var MongoClient = require('mongodb').MongoClient;
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

app.post("/insertAnswer", function (req, res) {
    var answer = {
        userName: req.session.userName, 
        questionId: req.body.questionId, 
        content: req.body.content,
        dateTime: new Date()
    };

    db.insertAnswer(answer, (err,result)=> {
        if(err){
            console.log("Answer not inserted", err);
        }
        else
        {
            console.log("Answer inserted successfully", result);
            res.send(result);
        }
    })
});

app.post('/insertComment', function (req, res) {
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