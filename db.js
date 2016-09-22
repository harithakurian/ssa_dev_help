module.exports = function (db) {
    var usersCollection = db.collection('users');
    var answersCollection = db.collection('answers');

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
    /*
     * Close database
     */
    this.close = function () {
        db.close();
    }

    return this;
}