var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    path = require('path'),
    mkdirp = require('mkdirp');

var http = require('http').createServer(app);
var io = require("socket.io")(http);

var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var db;

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
        password: req.body.password,
    };

    db.findUsers(login, (err, results) => {
        if (err || results.length !== 1) {
            res.status(500).send("no user is found");
        } else {
            req.session.currentUser = {

                userName: login.userName,
                lastLoggedIn: results[0].lastLoggedIn
            };

            res.send(login.userName);
        }
    });
});

app.post('/updateUserLastLoggedIn/', function(req, res) {
    db.updateUser({userName: req.body.userName}, {lastLoggedIn: new Date()}, function (err, isSuccess) {
        if (err) {
            res.status(500).send(err);
        }
        else {
            res.send(isSuccess);
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
        profileName: req.body.profileName,
        lastLoggedIn: new Date()
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
    
    db.insertAnswer(answer, (err, result) => {
        if (err) {
            console.log("Answer not inserted", err);
            res.status(500).send(err.errmsg);
        } else {
            res.json(result);
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

app.get("/getSessionUser/", function (req, res) {
    res.send(req.session.currentUser.userName);
});

app.get("/api/getUserInfo/", checkAuth, function (req, res) {
    var userName = req.session.currentUser.userName;
    db.findUsers({ userName: userName }, function (err, docs) {
        if (docs) {
            res.json(docs[0]);
        } else {
            res.status(500).send(err);
        }
    });
});

app.get("/api/getNewAnswers", checkAuth, function (req, res) {
    var userName = req.session.currentUser.userName;
    db.findQuestions({userName: userName, $where: "this.lastAccessedDate < this.lastAnsweredDate"}, (err, docs) => {
        if (docs) {
            res.json(docs);
        } else {
            res.status(500).send(err);
        }
    });
});

 app.post("/getUserProfileInfo/", function (req, res) {
     var userName = {userName: req.body.userName};
     db.getUserProfileInfo(userName, (err, result) => {
         if (err || result.length !== 1) {
             res.status(500).send("User is not found in the system!");
         } else {
                 result[0].lastLoggedIn = req.session.currentUser.lastLoggedIn;
                 res.json(result);
             };
         });
     });

app.post("/getNumberOfQuestions/", function (req, res) {
     var userName = {userName: req.body.userName};
     db.getNumberOfQuestions(userName, (err, result) => {
         if (err) {
             res.status(500).send("User doesn't have any questions in the system!");
         } else {
                 res.json(result);
             };
         });
     });

app.post("/getNumberOfAnswers/", function (req, res) {
     var userName = {userName: req.body.userName};
     db.getNumberOfAnswers(userName, (err, result) => {
         if (err) {
             res.status(500).send("User doesn't have any answers in the system!");
         } else {
                 res.json(result);
             };
         });
     });

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

app.get('/api/getAnswer/:id', function (req, res) {
    var filter = {
        _id: new mongo.ObjectId(req.params.id)
    };
    db.findAnswers(filter, function(err, result) {
        if (err) {
            res.status(500).send(err);
        } else if (result.length === 0) {
            res.status(500).send("no document is found");
        } else {
            res.json(result[0]);
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
            //console.log(results);
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
            //console.log(results);
            res.json(results);
        }
    })

    // @TODO
});

app.post('/insertQuestion/', function (req, res) {
    var question = {
        userName: req.session.currentUser.userName,
        title: req.body.title,
        content: req.body.content,
        dateTime: new Date(),
        bestAnswerId: null,
        lastAccessedDate: new Date(),
        lastAnsweredDate: null
    };

    //console.dir(question);
    db.insertQuestion(question, (err, doc) => {
        if (err) {
            res.status(500).send(err);
        } else {
            io.sockets.emit("new-question", doc.ops[0]);
            res.json(doc);
        }
    });
});

app.post('/api/update', function (req, res) {
    if (req.body.collection === "question") {
        db.updateQuestion({_id: new mongo.ObjectId(req.body.id)}, req.body.update, 
        function (err, isSuccess) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.send(req.body.id);
            }
        });
    } else if (req.body.collection === "answer") {
        db.findAndUpdateAnswer({_id: new mongo.ObjectId(req.body.id)}, req.body.update, 
        function (err, result) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.send(result.value.questionId);
            }
        });
    } else {
        res.status(500).send("unknown collection");
    }
});

app.post('/updateQuestion/', function (req, res) {
    var bestAnswerId = null;
    if (req.body.answerId != null) {
        bestAnswerId = new mongo.ObjectId(req.body.answerId);
    }
    db.updateQuestion({_id: new mongo.ObjectId(req.body.questionId)}, {bestAnswerId: bestAnswerId}, 
    function (err, isSuccess) {
        if (err) {
            res.status(500).send(err);
        } else {
            //console.log("Update Question user Name is: " + req.session.currentUser.userName);
            res.send(req.session.currentUser.userName);
        }
    });
});

app.post("/api/updateQuestionLastAccessedDate", checkAuth, function (req, res) {
    var userName = req.session.currentUser.userName;
    
    db.updateQuestion({_id: new mongo.ObjectId(req.body.questionId), userName: userName}, { lastAccessedDate: new Date() }, 
    function (err, isSuccess) {
        if (err) {
            res.status(500).send(err);
        } else {
            //console.log("Update Question user Name is: " + req.session.currentUser.userName);
            res.send(req.session.currentUser.userName);
        }
    });
});

app.post("/api/updateQuestionLastAnsweredDate", checkAuth, function (req, res) {
    db.updateQuestion({_id: new mongo.ObjectId(req.body.questionId) }, { lastAnsweredDate: new Date() }, 
    function (err, isSuccess) {
        if (err) {
            res.status(500).send(err);
        } else {
            //console.log("Update Question user Name is: " + req.session.currentUser.userName);
            res.send(req.session.currentUser.userName);
        }
    });
});

app.post('/api/searchQuestions/', function (req, res) {
    var filter = {
         title: {$regex : new RegExp(req.body.title.toLowerCase(), "i")}
    };    
    db.findQuestions(filter, function(err, results) {
        if (err) {
            res.status(500).send(err);
        } else {
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

var connectedUsers = new Object();
io.on("connection", function (socket) {
    var waitTime = 1000;
    var monitorVar;

    socket.on("initial", function (userName) {
        socket.userName = userName;
        var user = {
            socketId: socket.id,
            lastNotifiedNumber: -1
        };
        connectedUsers[userName] = user;

        if (connectedUsers.numberOfUser) {
            connectedUsers.numberOfUser++;
        } else {
            connectedUsers.numberOfUser = 1;
        }

        monitorVar = setTimeout(monitor, waitTime);
        //console.log("connected users: ", connectedUsers);
    });

    socket.on("disconnect", function () {
        if (connectedUsers[socket.userName]) {
            delete(connectedUsers[socket.userName]);
            connectedUsers.numberOfUser--;
            clearTimeout(monitorVar);
            //console.log("Disconnected user: ", socket.userName);
            //console.log("connected users: ", connectedUsers);
        }
    });

    function monitor () {
        if (connectedUsers.numberOfUser && connectedUsers.numberOfUser > 0) {
            db.findQuestions({ $and: [ { userName : socket.userName }, { $where: "this.lastAccessedDate < this.lastAnsweredDate" } ] }, function (err, docs) {
                if (docs && connectedUsers[socket.userName]) {
                    var user = connectedUsers[socket.userName];
                    if (docs.length != user.lastNotifiedNumber) {
                        if (user.lastNotifiedNumber === 0 && docs.length === 0) {
                            socket.emit("new-answered-questions", []);
                            user.lastNotifiedNumber = -1;
                        } else if (user.lastNotifiedNumber === -1 && docs.length === 0) {
                            //console.log("ignore this scenario");
                        } else {
                            socket.emit("new-answered-questions", docs);
                            user.lastNotifiedNumber = docs.length;
                        }
                    }
                }
            });
        }
        monitorVar = setTimeout(monitor, waitTime);
    }
});

var serverObj = http.listen(8080, function () {
    console.log('Listening on port 8080...');

    MongoClient.connect("mongodb://10.140.4.76:27017/ssa-dev-help-db", function (err, database) {
    if (err) {
        throw err;
    }

    var mod = require('./db');
    db = new mod(database);    
    });
});

module.exports = serverObj;