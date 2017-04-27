'use strict';
let MongoClient = require('mongodb').MongoClient;

class Recorder {
    constructor() {
        let {MONGODB_SERVICE_HOST = "127.0.0.1", MONGODB_SERVICE_PORT = "27017"} = process.env;
        this._dbURL = `mongodb://${MONGODB_SERVICE_HOST}:${MONGODB_SERVICE_PORT}/GridvoMqtt`;
        this._db = this._connect();
    }

    _connect() {
        return new Promise((resolve, reject) => {
            MongoClient.connect(this._dbURL, (err, db) => {
                if (err) {
                    reject(err);
                }
                resolve(db);
            });
        });
    }

    add(session, callback) {
        let {serverID, clientID} = session;
        let loginTime = new Date();

        function saveSession(db) {
            return new Promise((resolve, reject) => {
                let insertOperations = {
                    serverID,
                    clientID,
                    loginTime
                };
                db.collection('session').insertOne(insertOperations, (err, result) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(result);
                });
            });
        }

        let self = this;

        async function add() {
            let db = await self._db;
            let result = await saveSession(db);
            if (result.insertedCount) {
                return {
                    serverID,
                    clientID,
                    loginTime
                };
            }
            else {
                return null;
            }
        }

        add().then(sessionInfo => {
            callback(null, sessionInfo);
        }).catch(err => {
            callback(err);
        })
    }

    remove(serverID, clientID, callback) {
        function delSession(db) {
            return new Promise((resolve, reject) => {
                let deleteOperations = {
                    serverID,
                    clientID
                };
                db.collection('session').deleteOne(deleteOperations, {limit: 1}, (err, result) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(result);
                });
            });
        }

        let self = this;

        async function remove() {
            let db = await self._db;
            let result = await delSession(db);
            if (result.result.n) {
                return {
                    serverID,
                    clientID
                };
            }
            else {
                return null;
            }
        }

        remove().then(sessionInfo => {
            callback(null, sessionInfo);
        }).catch(err => {
            callback(err);
        })
    }

    destroy(callback) {
        this._db.close(callback);
    }
}

module.exports = Recorder;
