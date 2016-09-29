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

var mockDbJs = {
            
            user : {
                userName: 'User-2',
                password: 'user2',
                profileName: 'User-1 Profile'
                } ,

            question : {                
                title: 'Test case user title',
                content:'Test case user question content',                
                }                   
}

describe('SSA_DEV_HELP App Tests', function () {

    describe('Test Server.js', function () {
        it('View All questions', function testViewAllQuestions(done) {                 
            request(serverObj)
            .get('/viewAllQuestions/')
            .expect(200, done);
        });


        //works but commenting as it will insert same user.
        // it('Insert new User', function testInsertUser(done) {
        // request(serverObj)
        //     .post('/insertUser/')
        //     .send(mockDbJs.user)
        //     .expect(302, done);
        // }); 
        
    });     

    after(function () {
        serverObj.close();
    });  

});