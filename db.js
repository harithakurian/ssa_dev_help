module.exports = function (db) {

    /*
     * args: user object (or array of user objects)
     * return: callback(err, isSuccess)
     */
    this.insertUser = function (user, callback) {
        var usersCollection = db.collection('users');

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
        var collection = db.collection('users');
        collection.find(filter).toArray(function (err, docs) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, docs);
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