'use strict';
const MongoClient = require('mongodb').MongoClient;
const _ = require('underscore');
const should = require('should');
const MongodbSessionService = require('../../lib/sessionService/mongodbSessionService');

describe('MongodbSessionService use case test', () => {
    let sessionService;
    before(() => {
        sessionService = new MongodbSessionService();
    });
    describe('#add(session, callback)', () => {
        context('add a session', () => {
            it('return session info if add success', done => {
                let session = {
                    serverID: "server-id",
                    clientID: "client-id"
                };
                sessionService.add(session, (err, sessionInfo) => {
                    should.not.exist(err);
                    sessionInfo.serverID.should.eql("server-id");
                    sessionInfo.clientID.should.eql("client-id");
                    should.exist(sessionInfo.loginTime);
                    done();
                });
            });
        });
    });
    describe('#remove(serverID, clientID, callback)', () => {
        context('remove a session', () => {
            it('return session info if remove success', done => {
                let serverID = "server-id";
                let clientID = "client-id";
                sessionService.remove(serverID, clientID, (err, sessionInfo) => {
                    should.not.exist(err);
                    sessionInfo.serverID.should.eql("server-id");
                    sessionInfo.clientID.should.eql("client-id");
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
            db.collection('session').drop((err, response) => {
                if (err) {
                    done(err);
                }
                db.close();
                done();
            });
        });
    });
});