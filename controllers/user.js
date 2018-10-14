const CONSTANTS = require("../config/constants");
const SECRETS = require("../secret");
const bodyParser = require('body-parser');
const manager = require("../helpers/manager");
const geolib = require('geolib');

module.exports = function(app, client, config) {
    
    /**
     * Check if a certain user exists
     * 
     * Method: GET
     * 
     * res {
     *      error
     *      exists
     * }
     */
    app.get(CONSTANTS.ROUTES.EXISTS, function(req, res, next) {
        let email = req.query.email;
        manager.findUserByEmail(client, email, config, function(err, user) {
            if (err) manager.handleError(err, res);
            else {
                // user not found
                if (!user) {
                    console.log("User not found");
                    res.status(404).json({
                        error: "User not found",
                        exists: false
                    });
                } else {
                    console.log("Found user");
                    res.status(200).json({
                        error: "",
                        exists: true
                    })
                }
            }
        });
    });

	app.get(CONSTANTS.ROUTES.GET_ALL_USERS, function(req, res, next){
		manager.findAllUsers(client, config, function(err,users){
			if(err){
				manager.handleError(err, res);
			}
			else{
				console.log(users);
			}
		});
	});

	app.get(CONSTANTS.ROUTES.FIND_NEARBY_USERS, function(req, res, next){
		let email = req.query.email;
		let distance = req.query.distance;

		console.log(email);
		manager.findUserByEmail(client, email, config, function(err, user){
			if(err){
				manager.handleError(err, res);
			}
			else{
				console.log(user);
				var latitude = user.latitude;
				var longitude = user.longitude;

				manager.findAllUsers(client, config, function(err,users){
					if(err){
						manager.handleError(err, res);
					}
					else{
						//console.log(users);
						var nearby = [];

						for(i = 0; i < users.length; i++){
							var u = users[i];
							if (u.email != email){
								if(u.latitude && u.longitude && u.latitude != '' && u.longitude != ''){
									var d = geolib.getDistance(
										{latitude: latitude, longitude:longitude}, 
										{latitude: u.latitude, longitude: u.longitude}
									);
									if(d <= distance){
										u['distance'] = d;
										nearby.push(u);
									}
								}
							}
						}
						console.log(nearby);
						res.status(200).json({error: "", users: nearby});
					}
				});
			}
		});
	});


    /**
     * Update basic user information
     * 
     * Method: POST
     * 
     * res {
     *      error
     *      exists
     * }
     */
    app.post(CONSTANTS.ROUTES.UPDATE, bodyParser.urlencoded({ extended: true }), function(req, res, next) {
        let email = req.body.email;
        let firstName = req.body.firstName;
        let lastName = req.body.lastName;
        let userId = req.body.userId;
        let location = req.body.location;
        let position = req.body.position;
        manager.findUserByEmail(client, email, config, function(err, user) {
            if (err) manager.handleError(err, res);
            else {
                // user not found
                if (!user) {
                    console.log("User not found");
                    res.status(404).json({
                        error: "User not found",
                        exists: false,
                    });
                } else {
                    manager.updateUserInfo(client, email, firstName, lastName, userId, location, position, config, function(err) {
                        if (!err) {
                            res.status(200).json({
                                error: "",
                            })
                        } else {
                            res.status(500).json({
                                error: err,
                            })
                        }
                    });
                }
            }
        });
    });

	app.post(CONSTANTS.ROUTES.UPDATE_COORDINATES, bodyParser.urlencoded({ extended: true }), function(req, res, next) {
        let email = req.body.email;
        let latitude = req.body.latitude;
        let longitude = req.body.longitude;

        manager.findUserByEmail(client, email, config, function(err, user) {
            if(err) {
				manager.handleError(err, res);
			}
            else {
                // user doesn't exist
                if (!user) {
                    console.log("User not found");
                    res.status(404).json({ 
						error: "User not found",
						exists: false,
					});
                } 
				else {
					manager.updateUserCoordinates(client, email, latitude, longitude, config, function(err){
                        if(err) {
							manager.handleError(err, res);
						}
                        else {
							res.status(200).json({ error: "" });
						}
                    });
                }
            }
        });
    });


    app.put(CONSTANTS.ROUTES.UPDATE_TOKEN, bodyParser.urlencoded({ extended: true }), function(req, res, next) {
        let fbToken = req.body.fbToken;
        let liToken = req.body.liToken;

        console.log(fbToken);
        console.log(liToken);

        res.status(200).json({
            error: null,
        });
    });

    /**
     * Log into server
     * 
     * Method: POST
     * 
     * res {
     *      error
     *      status
     * }
     */
    app.post(CONSTANTS.ROUTES.LOGIN, bodyParser.urlencoded({ extended: true }), function(req, res, next) {
        let email = req.body.email;
        let password = req.body.password;
        manager.findUserByEmail(client, email, config, function(err, user) {
            // internal error
            if (err) manager.handleError(err, res); 
            else {
                // user not found
                if (!user) {
                    console.log("User not found");
                    res.status(404).json({ error: "User not found" });
                }
                // password incorrect
                else if (user.password !== password) {
                    res.status(401).json({
                        error: "Password incorrect",
                        user: ""
                    });
                // all good
                } else {
                    delete user.password;
                    res.status(200).json({
                        error: "",
                        user: user
                    });
                }
            }
        });
    });

    /**
     * Register new user
     * 
     * Method: POST
     * 
     * res {
     *      error
     *      status
     * }
     */
    app.post(CONSTANTS.ROUTES.REGISTER, bodyParser.urlencoded({ extended: true }), function(req, res, next) {
        let email = req.body.email;
        let password = req.body.password;
        let firstName = req.body.firstName;
        let lastName = req.body.lastName;
        let userId = req.body.userId;
        let location = req.body.location;
        let position = req.body.position;
        manager.findUserByEmail(client, email, config, function(err, user) {
            // internal error
            if (err) manager.handleError(err, res);
            else {
                // user exists
                if (user) {
                    console.log("User exists");
                    res.status(403).json({ error: "User already exists" });
                } else {
                    manager.createUser(client, email, password, firstName, lastName, userId, config, function(err, createdUser) {
                        if (err) manager.handleError(err, res);
                        else {
                            if (!createdUser) {
                                res.status(500).json({ error: "Unknown error" });
                            } else {
                                res.status(200).json({
                                    error: "",
                                    user: createdUser
                                });
                            }
                        }
                    });
                }
            }
        });
    });

    /**
     * Change password
     * 
     * Method: POST
     * 
     * res {
     *      error
     * }
     */
    app.post(CONSTANTS.ROUTES.CHANGE_PASSWORD, bodyParser.urlencoded({ extended: true }), function(req, res, next) {
        let email = req.body.email;
        let oldPassword = req.body.oldPassword;
        let newPassword = req.body.newPassword;

        manager.findUserByEmail(client, email, config, function(err, user) {
            // internal error
            if (err) manager.handleError(err, res);
            else {
                // user doesn't exist
                if (!user) {
                    console.log("User not found");
                    res.status(404).json({ error: "User not found" });
                } else if (user.password !== oldPassword) {
                    console.log("Wrong old password");
                    res.status(401).json({ error: "Password incorrect" });
                } else {
                    client.db(config.name).collection(CONSTANTS.COLLECTION.USER).updateOne({
                        email: email
                    }, {
                        $set: { password: newPassword }
                    }, function(err, result) {
                        if (err) manager.handleError(err, res);
                        else res.status(200).json({ error: "" });
                    });
                }
            }
        });
    });
}
