const CONSTANTS = require("../config/constants");
const SECRETS = require("../secret");
const mongo = require('mongodb');

/**
 * Handle general server internal error
 * 
 * res {
 *      error
 * }
 */
function handleError(err, res) {
    console.log(err.message);
    if (res) {
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
}

/**
 * Find user in database by email
 */
function findUserByEmail(client, email, config, callback) {
    client.db(config.name).collection(CONSTANTS.COLLECTION.USER).findOne({
        email: email
    }, function(err, doc) {
        if (err) callback(err, null);
        else if (!doc) callback(null, null);
        else callback(null, getUserFromBsonWithPassword(doc));
    });
}

/**
 * Find user in databse by user ID
 */
function findUserById(client, id, config, callback) {
    client.db(config.name).collection(CONSTANTS.COLLECTION.USER).findOne({
        _id: id
    }, function(err, doc) {
        if (err) callback(err, null);
        else if (!doc) callback(null, null);
        else callback(null, getUserFromBsonWithPassword(doc));
    });
}

/**
 * Find all users in databse
 */
function findAllUsers(client, config, callback) {
    client.db(config.name).collection(CONSTANTS.COLLECTION.USER).find({}, function(err, cursor) {
        if (err) {
			callback(err, null);
		}
        else if (!cursor){ 
			callback(null, null);
		}
        else{
			//callback(null, getUserFromBsonWithPassword(doc));
			//console.log(cursor.toArray());
			cursor.toArray().then(function(users){
				callback(null, users);
			})
			.catch(function(err){
				callback(err, null);
			});
		}
    });
}



function updateUserInfo(client, email, firstName, lastName, userId, location, position, config, callback) {
    client.db(config.name).collection(CONSTANTS.COLLECTION.USER).updateOne({
        email: email
    }, {
        $set: {
            firstName: firstName,
            lastName: lastName,
            userId: userId,
            location: location,
            position: position
        }
    }, {
        upsert: false
    }, function(err, doc) {
        callback(err);
    });
}

/*
 * Update the Location (latitude and longitude) of a user
 */
function updateUserCoordinates(client, email, latitude, longitude, config, callback){
	client.db(config.name).collection(CONSTANTS.COLLECTION.USER).updateOne({
		email: email
	}, {
		$set: { 
			latitude: latitude,
			longitude: longitude,
		}
	}, {
		upsert: false
	}, function(err, doc) {
		callback(err);
	});
}

/**
 * Create user in database
 */
function createUser(client, email, password, firstName, lastName, userId, config, callback) {
    client.db(config.name).collection(CONSTANTS.COLLECTION.USER).insertOne({
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        userId: userId
    }, function(err, result) {
        if (err) callback(err, null);       // back to router for handling
        else {
            findUserByEmail(client, email, config, function(err, user) {
                if (err) callback(err, null);
                else callback(err, getUserFromBson(user));
            });
        }
    });
}

/**
 * Turns bson user into json
 */
function getUserFromBson(doc) {
    let user = {};
    user['email'] = doc.email;
    user['userId'] = doc.userId;
    user['firstName'] = doc.firstName;
    user['lastName'] = doc.lastName;
    user['latitude'] = doc.latitude;
    user['longitude'] = doc.longitude;
    user['position'] = doc.position;
    user['cell'] = doc.cell;
    return user;
}

/**
 * Turns bson user into json with password field
 */
function getUserFromBsonWithPassword(doc) {
    let user = {};
    user['email'] = doc.email;
    user['password'] = doc.password;
    user['userId'] = doc.userId;
    user['firstName'] = doc.firstName;
    user['lastName'] = doc.lastName;
    user['latitude'] = doc.latitude;
    user['longitude'] = doc.longitude;
    user['position'] = doc.position;
    user['cell'] = doc.cell;
    return user;
}

/**
 * Get mongodb formatted _id
 */
function getObjectId(id) {
    return new mongo.ObjectID(id);
}

module.exports = {
    handleError,
    findUserByEmail,
    findUserById,
	findAllUsers,
    updateUserInfo,
	updateUserCoordinates,
    createUser,
    getObjectId,
}
