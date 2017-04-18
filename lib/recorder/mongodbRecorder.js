'use strict';
let MongoClient = require('mongodb').MongoClient;

class Recorder {
    constructor() {
        let {MONGODB_SERVICE_HOST = "127.0.0.1", MONGODB_SERVICE_PORT = "27017"} = process.env;
        this._dbURL = `mongodb://${MONGODB_SERVICE_HOST}:${MONGODB_SERVICE_PORT}/GridvoMqtt`;
    }

    record(mqttPacket, callback) {
        MongoClient.connect(this._dbURL, (err, db) => {
            if (err) {
                callback(err);
                return;
            }
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
                    callback(err);
                    db.close();
                    return;
                }
                callback(null, result.insertedCount);
                db.close();
            });
        });
    }
}

module.exports = Recorder;
