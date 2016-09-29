module.exports = function (db) {
    var MongoId = require("mongodb").ObjectID;
    var usersCollection = db.collection('users');
    var questionsCollection = db.collection('questions');
    var answersCollection = db.collection('answers');
    var commentsCollection = db.collection('comments');
    
    /*
     * args: user object (or array of user objects)
     * return: callback(err, isSuccess)
     */
    this.insertUser = function (user, callback) {
        usersCollection.insert(user, function (err, result) {
            if (err) {
                callback(err, false);
            } else {
                console.log('Inserted documents with:', result);
                callback(null, true);
            }
        });
    }

    /*
     * arg: filter
     * return: callback(err, results)
     */
    this.findUsers = function (filter, callback) {
        usersCollection.find(filter).toArray(function (err, docs) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, docs);
            }
        });
    }

    this.getUserProfileInfo = function (filter, callback) {
        usersCollection.find(filter).toArray(function (err, docs) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, docs);
            }
        });
    }

    this.getNumberOfQuestions = function (filter, callback) {
        questionsCollection.count(filter, function (err, num) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, num);
            }
        });
    }

    this.getNumberOfAnswers = function (filter, callback) {
        answersCollection.count(filter, function (err, num) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, num);
            }
        });
    }

    this.updateUser = function (filter, update, callback) {
        usersCollection.updateOne(filter, { $set: update }, function (err, results) {
            if (err) {
                callback(err, false);
            } else {
                callback(null, true);
            }
        });
    }

    
    this.insertAnswer = function(answer, callback){
        answersCollection.insert(answer, function(err, result){
            if(err){
                callback(err, null);
            }
            else
            {
                //console.log("Inserted answer :", result);
                callback(null, result);
            }
        })
    } 

    this.insertComment = function(comment){
        return new Promise(function(resolve, reject){
            commentsCollection.insert(comment, function(err,row){
                if(err){
                    reject(err);
                    return;
                }
                resolve(row);
            })
        })
    } 
    /*
     * args: question object (or array of question objects)
     * return: callback(err, isSuccess)
     */
    this.insertQuestion = function (question, callback) {
        questionsCollection.insert(question, function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                //console.log('Inserted Questions with:', result);
                callback(null, result);
            }
        });
    }

    /*
     * arg: filter
     * return: callback(err, results)
     */
    this.findQuestions = function (filter, callback) {
        questionsCollection.find(filter).toArray(function (err, docs) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, docs);
            }
        });
    }

    this.updateQuestion = function (filter, update, callback) {
        //console.log(update);
        questionsCollection.updateOne(filter, { $set: update }, function (err, results) {
            if (err) {
                callback(err, false);
            } else {
                callback(null, true);
            }
        });
    }

    this.findAnswers = function (filter, callback) {
        answersCollection.find(filter).toArray(function (err, docs) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, docs);
            }
        });
    }

    this.findAndUpdateAnswer = function (filter, update, callback) {
        //console.log(update);
        answersCollection.findOneAndUpdate(filter, { $set: update }, { returnNewDocument: true }, function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    }

    this.updateAnswer = function (filter, update, callback) {
        //console.log(update);
        answersCollection.updateOne(filter, { $set: update }, function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    }

    this.findQuestion = function (filter, callback) {
        //console.log(filter);
        questionsCollection.findOne(filter, function (err, doc) {
            if (err) {
                callback(err, null);
            } else {               
                callback(null, doc);
                
            }
        });
    }

    /*
     * Close database
     */
    this.close = function () {
        db.close();
    }

    return this;
}