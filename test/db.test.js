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
        MongoClient.connect("mongodb://PC93:27017/ssa-dev-help-db", function (err, database) {
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
        userName: 'Ram-2',
        password: 'ram2',
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

    after(function(done) {
            db.close();
            done();
    });   
});