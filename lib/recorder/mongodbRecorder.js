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

    record(mqttPacket, callback) {
        function saveMqttPacket(db) {
            return new Promise((resolve, reject) => {
                let {topic, payload, messageId, qos, retain, timestamp} = mqttPacket;
                timestamp = new Date(timestamp);
                let insertOperations = {
                    topic,
                    payload,
                    messageId,
                    qos,
                    retain,
                    timestamp
                };
                db.collection('mqttpacket').insertOne(insertOperations, (err, result) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(result);
                });
            });
        }

        let self = this;

        async function record() {
            let db = await self._db;
            let result = await saveMqttPacket(db);
            let resultJSON = result.insertedCount;
            return resultJSON;
        }

        record().then(resultJSON => {
            callback(null, resultJSON);
        }).catch(err => {
            callback(err);
        })
    }

    destroy(callback) {
        this._db.close(callback);
    }
}

module.exports = Recorder;
