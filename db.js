module.exports = function (db) {
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

    
    this.insertAnswer = function(answer, callback){
        answersCollection.insert(answer, function(err, result){
            if(err){
                callback(err,false);
            }
            else
            {
                console.log("Inserted answer :", result);
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
                callback(err, false);
            } else {
                console.log('Inserted Questions with:', result);
                callback(null, true);
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

    this.findQuestion = function (filter, callback) {
        questionsCollection.findOne(filter)(function (err, doc) {
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