const CONSTANTS = require("../config/constants");
const SECRETS = require("../secret");
const bodyParser = require('body-parser');
const manager = require("../helpers/manager");

module.exports = function(app, client, config) {

    /**
     * Queries database and
     * return server running status
     * 
     * Method: GET
     * 
     * res {
     *      error
     *      status
     * }
     */
    app.get(CONSTANTS.ROUTES.INDEX, function(req, res, next) {
        client.db(config.name).collection(CONSTANTS.COLLECTION.STATUS).findOne({
            name: "status"
        }, function(err, doc) {
            if (err) { manager.handleError(err, res); }
            else {
                res.status(200).json({
                    error: "",
                    status: doc['running']
                });
            }
        });
    });
    
    /**
     * Shuts down server
     * 
     * Method: POST
     * 
     * res {
     *      error
     *      status
     * }
     */
    app.post(CONSTANTS.ROUTES.SHUTDOWN, bodyParser.json(), function(req, res, next) {
        if (req.body.password !== SECRETS.password) {
            res.status(401).json({ error: "Password incorrect" });
            return;
        }

        client.db(config.name).collection(CONSTANTS.COLLECTION.STATUS).updateOne({
            name: "status"
        }, {
            $set: { running: false }
        }, {
            upsert: true
        }, function(err, result) {
            if (err) { manager.handleError(err, res); return; };
            
            res.status(200).json({
                error: "",
                status: false
            });
        });
    });

    /**
     * Turn on server
     * 
     * Method: POST
     * 
     * res {
     *      error
     *      status
     * }
     */
    app.post(CONSTANTS.ROUTES.TURNON, bodyParser.json(), function(req, res, next) {
        if (req.body.password !== SECRETS.password) {
            res.status(401).json({ error: "Password incorrect" });
            return;
        }

        client.db(config.name).collection(CONSTANTS.COLLECTION.STATUS).updateOne({
            name: "status"
        }, {
            $set: { running: true }
        }, {
            upsert: true
        }, function(err, result) {
            if (err) { manager.handleError(err, res); return; };
            
            res.status(200).json({
                error: "",
                status: true
            });
        });
    });
}