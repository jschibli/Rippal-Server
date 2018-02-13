const CONSTANTS = require("../config/constants");
const SECRETS = require("../secret");
const bodyParser = require('body-parser');
const manager = require("../helpers/manager");

module.exports = function(app, client, config) {
    
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
        manager.findUserByEmail(client, email, config, function(err, user) {
            // internal error
            if (err) manager.handleError(err, res);
            else {
                // user exists
                if (user) {
                    console.log("User exists");
                    res.status(403).json({ error: "User already exists" });
                } else {
                    manager.createUser(client, email, password, config, function(err, createdUser) {
                        if (err) manager.handleError(err, res);
                        else {
                            if (!createdUser) {
                                res.status(500).json({ error: "Unknown error" });
                            } else {
                                manager.sendVerificationEmail(createdUser, null);
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