'use strict';
const mqtt = require('mqtt');
const _ = require('underscore');
const muk = require('muk');
const should = require('should');
const GMosca = require('../lib/gmosca');
const GMOSCA_EVENT = require('../lib/gmoscaEvent');

describe('gmosca use case test', () => {
    let gmosca;
    before(done => {
        gmosca = new GMosca({});
        gmosca.on(GMOSCA_EVENT.READY, () => {
            done();
        });
    });
    describe('gmosca record mqtt packet when a mqtt topic is published', () => {
        context('record mqtt packet', () => {
            let client;
            before(done => {
                // client = mqtt.connect('mqtt://127.0.0.1:1883');
                client = mqtt.connect('wss://www.gridvo.com');
                client.on('connect', () => {
                    done();
                });
            });
            it('emit "GMOSCA_EVENT.RECORD_ERR" when record mqtt packet is fail', done => {
                let mockRecorder = {};
                mockRecorder.record = (packet, callback) => {
                    if (packet.topic == "/test/topic") {
                        should.exist(packet.timestamp);
                        callback(new Error("error"));
                        return;
                    }
                    callback(null, 1);
                };
                muk(gmosca, "_recorder", mockRecorder);
                gmosca.on(GMOSCA_EVENT.RECORD_ERR, (err) => {
                    should.exist(err);
                    done();
                });
                client.publish('/test/topic', 'test');
            });
            it('record mqtt packet is ok', done => {
                let mockRecorder = {};
                mockRecorder.record = (packet, callback) => {
                    if (packet.topic == "/test/topic") {
                        callback(null, 1);
                        done();
                        return;
                    }
                    callback(null, 1);
                };
                mockRecorder.destroy = () => {
                };
                muk(gmosca, "_recorder", mockRecorder);
                client.publish('/test/topic', 'test');
            });
            after(done => {
                client.end(() => {
                    done();
                });
            });
        });
    });
    after(done => {
        gmosca.close(() => {
            done();
        });
    });
});