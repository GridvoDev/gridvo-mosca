'use strict';
let MongoClient = require('mongodb').MongoClient;

class Recorder {
    constructor() {
        let {MONGODB_SERVICE_HOST = "127.0.0.1", MONGODB_SERVICE_PORT = "27017"} = process.env;
        this._dbURL = `mongodb://${MONGODB_SERVICE_HOST}:${MONGODB_SERVICE_PORT}/GridvoMqtt`;
        this._db = this._connect();
        this.isInited = false;
        function createIndex(db) {
            return db.collection('mqttpacket').createIndex({topic: 1, timestamp: 1});
        }

        let self = this;

        async function initCollection() {
            let db = await self._db;
            await createIndex(db);
            return true;
        }

        initCollection().then(result => {
        }).catch(err => {
            throw err;
        });
    }

    _connect() {
        return MongoClient.connect(this._dbURL);
    }

    record(mqttPacket, callback) {
        function saveMqttPacket(db) {
            let
                {
                    topic, payload, messageId, qos, retain, timestamp
                } = mqttPacket;
            timestamp = new Date(timestamp);
            let insertOperations = {
                topic,
                payload,
                messageId,
                qos,
                retain,
                timestamp
            };
            return db.collection('mqttpacket').insertOne(insertOperations);
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
        });
    }

    destroy(callback) {
        this._db.close(callback);
    }
}

module.exports = Recorder;
