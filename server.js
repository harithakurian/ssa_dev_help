var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    db = require('./db'),
    path = require('path'),
    mkdirp = require('mkdirp');

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

    var p = db.getUser(login.userName);
    p.then(
        (val) => {

            if (login.password === val.Password) {
                req.session.currentUser = {
                    userName: login.userName
                };

            } else {
                throw 'Username or password issue!';
            }
            res.redirect('/');
        }
    ).catch(
        (err) => {
            res.status(500);
            console.log(err);
            res.send(err);
        }
    )
});

app.post('/insertUser/', function (req, res) {
    var user = {
        userName: req.body.userName,
        password: req.body.password,
        profileName: req.body.profileName
    };


    var p = db.insertUser(user);
    p.then(
        (val) => {
            var dirPath = '/public/photos/' + user.userName;
            mkdirp(dirPath, function (err) {
                if (err) {
                    console.log(err);
                }
            });
            res.send('User ' + user.userName + ' is added successfully!');
        }
    ).catch(
        (err) => {
            console.log(err);
            res.send(err);
        }
    )
});

app.post('/insertPicture/', multer({dest: './public/photos/'}).single('dropzone'), function (req, res) {

    //var time = new Date();

    var user = {
        userName: req.body.userName
    };

    var file = {
        actualFileName: req.file.originalname,
        systemFileName: req.file.filename,
        filePath: req.file.path

    };


    var insertPic = db.insertPicture(user.userName, file.actualFileName, file.systemFileName);

    fs.move('./public/photos/' + req.file.filename, './public/photos/' + user.userName + '/' + file.systemFileName, function (err) {
        if (err) return console.error(err)

    })

    insertPic.then((val) => {
        res.send('Picture for ' + user.userName + ' is added successfully!');
    }).catch(
        (err) => {
            console.log(err);
            res.send(err);
        }
    );

});

//app.get('/getPictures/:userName', function (req, res) {
app.get('/getPictures/', function (req, res) {
    var picture = {
        userName: req.session.currentUser,
    };


    var thePictures = db.getPictures(picture.userName);

    thePictures.then(
        (pictures) => {
            console.dir(pictures);
            res.send(pictures);
        }
    ).catch(
        (err) => {
            res.status(500);
            res.send('output app.get getPictures error: issue getting Pictures');
        }
    );
})

app.post('/insertComment/', function (req, res) {

    var picture = {
        pictureId: req.body.pictureId,
        userName: req.body.userName,
        message: req.body.comment
    };


    var insertPic = db.insertComment(picture.pictureId, picture.userName, picture.message);

    insertPic.then((val) => {
        res.send('Comment for ' + picture.pictureId + ' is added successfully!');
    }).catch(
        (err) => {
            console.log(err);
            res.send(err);
        }
    )

});

app.get('/getPictureComments/', function (req, res) {

    var picture = {
        pictureId: req.body.pictureId,
    };


    var thePictureComments = db.getPictureComments(picture.pictureId);

    thePictureComments.then(
        (pictureComments) => {

            res.send(pictureComments);
        }
    ).catch(
        (err) => {
            res.status(500);
            res.send('output app.get getPictureComments error: issue getting comments');
        }
    );
})


app.get('/angular', function (req, res) {
    res.sendFile(__dirname + '/angularIndex.html');
});

app.get('/', checkAuth, function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/mainApp', function (req, res) {
    res.send('logged in');
})

app.get('/adduser', function (req, res) {

    var user = {
        userid: req.query.userid,
        password: req.query.password,
        firstname: req.query.firstname,
        lastname: req.query.lastname,
        email: req.query.email

    };
    var p = dbInsertUser(user);
    p.then(
        (val) => {
            res.send('User Added');
        }
    ).catch(
        (err) => {
            res.send(err);
        }
    )
});


app.listen(8080, function () {
    console.log('Example app listening on port 8080!');
});