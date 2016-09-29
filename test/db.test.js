var db;
var assert = require('assert');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;

// var chai = require('chai');
// var expect = require("chai").expect;
// var chaiAsPromised = require("chai-as-promised");
// chai.use(chaiAsPromised); 
// chai.should(); 

describe('SSA DEV HELP DB tests', function () {

    before(function(done) {
        this.timeout(10000);
        MongoClient.connect("mongodb://10.140.4.76:27017/ssa-dev-help-db", function (err, database) {
            if (err) {
                //done(err);
            }
            var dbUtil = require('../db');
            db = new dbUtil(database);
            console.log(database);
            //db.close();
            done();
        });
    });

    // it('test if we are able to insert a user', function(done) {
    //     var user = {
    //         userName: 'Ram-100',
    //         password: 'ram100',
    //         lastLoggedIn: new Date()
    //     };

    //     db.insertUser(user,function(err, result){ 
    //     try{  
    //         assert.equal(true, result);
    //     }
    //     catch(ex)
    //     {
    //         done(ex);
    //         return;
    //     }
    //     done();
    //     })
    // });

    it('test if the user is invalid', function(done) {
        var login = {
            userName: 'bleh',
            password: 'blah',
        };

        db.findUsers(login,function(err, results){ 
        try{  
            assert.equal(0, results.length);
        }
        catch(ex)
        {
            done(ex);
            return;
        }
        done();
        })
    });

    it('test if the user is valid', function(done) {
    var login = {
        userName: 'ramsahota',
        password: 'ramsahota',
    };

        db.findUsers(login,function(err, results){ 
            try{  
                assert.equal(1, results.length);
            }
            catch(ex)
            {
                done(ex);
                return;
            }
            done();
            })
    });  

    it('test if we are able to get user profile info', function(done) {
        var user = {
            userName: 'ramsahota'
        };

        db.getUserProfileInfo(user,function(err, result){ 
        try{  
            assert.equal(1, result.length);
        }
        catch(ex)
        {
            done(ex);
            return;
        }
        done();
        })
    }); 

    
    it('test if we were not able to get user profile info', function(done) {
        var user = {
            userName: 'ram'
        };

        db.getUserProfileInfo(user,function(err, result){ 
        try{  
            assert.equal(0, result.length);
        }
        catch(ex)
        {
            done(ex);
            return;
        }
        done();
        })
    }); 

    it('test if we were able to get number of questions', function(done) {
        var user = {
            userName: 'ramsahota'
        };

        db.getNumberOfQuestions(user,function(err, result){ 
        try{  
            assert.equal(2, result);
        }
        catch(ex)
        {
            done(ex);
            return;
        }
        done();
        })
    }); 

    it('test if we were not able to get back number of questions for invalid user', function(done) {
        var user = {
            userName: 'ram'
        };

        db.getNumberOfQuestions(user,function(err, result){ 
        try{  
            assert.equal(0, result);
        }
        catch(ex)
        {
            done(ex);
            return;
        }
        done();
        })
    }); 

        it('test if we were able to get number of answers', function(done) {
        var user = {
            userName: 'ramsahota'
        };

        db.getNumberOfAnswers(user,function(err, result){ 
        try{  
            assert.equal(2, result);
        }
        catch(ex)
        {
            done(ex);
            return;
        }
        done();
        })
    }); 

    it('test if we were not able to get back number of answers for invalid user', function(done) {
        var user = {
            userName: 'ram'
        };

        db.getNumberOfAnswers(user,function(err, result){ 
        try{  
            assert.equal(0, result);
        }
        catch(ex)
        {
            done(ex);
            return;
        }
        done();
        })
    }); 

    it('test if we were able to update user Last Logged In Time', function(done) {
        var user = {
            userName: 'ramsahota'
        };

        var lastLoggedIn = {
            lastLoggedIn : new Date()
        }

        db.updateUser(user, lastLoggedIn, function(err, result){ 
        try{  
            assert.equal(true, result);
        }
        catch(ex)
        {
            done(ex);
            return;
        }
        done();
        })
    }); 

    it('test if we were not able to update user Last Logged In Time', function(done) {
        var user = {
            userName: 'ram'
        };

        var lastLoggedIn = {
            lastLoggedIn : new Date()
        }

        db.updateUser(user, lastLoggedIn, function(err, result){ 
        try{  
            assert.equal(true, result);
        }
        catch(ex)
        {
            done(ex);
            return;
        }
        done();
        })
    }); 

    // it('test if we are able to insert an answer', function(done) {
    //     var answer = {
    //     questionId: new mongo.ObjectId("57ec7c9e7dc1a41b1cb3fe86"),
    //     userName: "ramsahota",
    //     content: "<p>Mocha insertion of an answer.</p>",
    //     dateTime: new Date()
    // };
    //     db.insertAnswer(answer,function(err, result){ 
    //     try{  
    //         assert.ok(result);
    //     }
    //     catch(ex)
    //     {
    //         done(ex);
    //         return;
    //     }
    //     done();
    //     })
    // });

    after(function(done) {
            db.close();
            done();
    });   
});