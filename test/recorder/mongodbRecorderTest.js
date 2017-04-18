'use strict';
const MongoClient = require('mongodb').MongoClient;
const _ = require('underscore');
const should = require('should');
const MongodbRecorder = require('../../lib/recorder/mongodbRecorder');

describe('MongodbRecorder use case test', () => {
    let recorder;
    before(() => {
        recorder = new MongodbRecorder();
    });
    describe('#record(mqttPacket, callback)', () => {
        context('record a mqtt packet', () => {
            it('err is null if record success', done => {
                let mqttPacket = {
                    topic: "/test/topic",
                    payload: "test",
                    messageId: "Bkb00AtUag",
                    qos: 0,
                    retain: false,
                    timestamp: 1491668693558
                };
                recorder.record(mqttPacket, (err, isSuccess) => {
                    should.not.exist(err);
                    isSuccess.should.eql(1);
                    done();
                });
            });
        });
    });
    after(done => {
        let {MONGODB_SERVICE_HOST = "127.0.0.1", MONGODB_SERVICE_PORT = "27017"} = process.env;
        MongoClient.connect(`mongodb://${MONGODB_SERVICE_HOST}:${MONGODB_SERVICE_PORT}/GridvoMqtt`, (err, db) => {
            if (err) {
                done(err);
            }
            db.collection('mqttpacket').drop((err, response) => {
                if (err) {
                    done(err);
                }
                db.close();
                done();
            });
        });
    });
});