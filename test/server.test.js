var db = require('../db');
var request = require('supertest');
var chai = require('chai');
var assert = chai.assert;
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;

var express = require('express');
var app = express();
var http = require('http').createServer(app);

var serverObj = require('../server');


describe('SSA_DEV_HELP App Tests', function () {

    describe('Test Server.js', function () {
        it('View All questions', function testViewAllQuestions(done) {                 
            request(serverObj)
            .get('/viewAllQuestions/')
            .expect(200, done);
        });

    });     

    after(function () {
        serverObj.close();
    });  

});