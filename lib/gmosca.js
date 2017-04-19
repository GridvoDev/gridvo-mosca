'use strict';
const EventEmitter = require('events');
const fs = require('fs');
const https = require('https');
const _ = require('underscore');
const mosca = require('mosca');
const GMOSCA_EVENT = require('./gmoscaEvent');
const {logger} = require('./util');

class GMosca extends EventEmitter {
    constructor({moscaSetting = {}, recorder = null}) {
        super();
        this._recorder = recorder;
        const {
            SSL_KEY_PATH = `${__dirname }/keys/gridvocomrsa.key`,
            SSL_CA_PATH = `${__dirname }/keys/1_root_bundle.crt`,
            SSL_CERT_PATH = `${__dirname }/keys/1_www.gridvo.com_bundle.crt`,
            MONGODB_SERVICE_HOST = "127.0.0.1",
            MONGODB_SERVICE_PORT = "27017"
        } = process.env;
        this._ssl = {
            key: fs.readFileSync(SSL_KEY_PATH),
            ca: [fs.readFileSync(SSL_CA_PATH)],
            cert: fs.readFileSync(SSL_CERT_PATH)

        };
        let {
            interfaces = [{type: "mqtt", port: 1883}],
            stats = false,
            logger = {name: 'GMoscaServer', level: 'fatal'},
            persistence = {
                factory: mosca.persistence.Mongo,
                url: `mongodb://${MONGODB_SERVICE_HOST}:${MONGODB_SERVICE_PORT}/GMosca`
            },
            backend = {
                type: 'mongo',
                url: `mongodb://${MONGODB_SERVICE_HOST}:${MONGODB_SERVICE_PORT}/GMoscaPubSub`,
                pubsubCollection: 'ascoltatori',
                mongo: {}
            }
        } = moscaSetting;
        this._moscaSetting = {interfaces, stats, logger, persistence, backend};
        this._setupMosca();
    }

    _setupMosca() {
        let self = this;
        let httpsServer = https.createServer(this._ssl, (req, res) => {
            res.writeHead(403);
            res.end("this is gmosca mqtt on websocket server!\n");
        });
        let mqttServer = new mosca.Server(this._moscaSetting);
        this._mosca = mqttServer;
        mqttServer.attachHttpServer(httpsServer);
        httpsServer.listen(443);
        mqttServer.on('ready', () => {
            let authenticate = (client, username, password, callback) => {
                callback(null, true);
            }
            let authorizePublish = (client, topic, payload, callback) => {
                callback(null, true);
            }
            let authorizeSubscribe = (client, topic, callback) => {
                callback(null, true);

            }
            mqttServer.authenticate = authenticate;
            mqttServer.authorizePublish = authorizePublish;
            mqttServer.authorizeSubscribe = authorizeSubscribe;
            mqttServer.on("error", (err) => {
                logger.error(err.stack);
            });
            mqttServer.on('clientConnected', (client) => {
                logger.info(`client:${client.id} is connected`);
            });
            mqttServer.on('published', (packet, client) => {
                if (packet.payload && (packet.payload instanceof Buffer)) {
                    packet.payload = packet.payload.toString();
                }
                packet.timestamp = (new Date()).getTime();
                if (this._recorder) {
                    this._recorder.record(packet, (err, isSuccess) => {
                        if (err) {
                            self.emit(GMOSCA_EVENT.RECORD_ERR, err);
                        }
                        // logger.debug(JSON.stringify(packet));
                    });
                }
            });
            mqttServer.on('subscribed', (topic, client) => {
                logger.info(`subscribed: ${topic}`);
            });
            mqttServer.on('unsubscribed', (topic, client) => {
                logger.info(`unsubscribed: ${topic}`);
            });
            mqttServer.on('clientDisconnecting', (client) => {
                logger.info(`client:${client.id} is disconnecting`);
            });
            mqttServer.on('clientDisconnected', (client) => {
                logger.info(`client:${client.id} is disconnected`);
            });
            self._id = mqttServer.id;
            self.emit(GMOSCA_EVENT.READY);
        });
    }

    get id() {
        return this._id;
    }

    close(callback) {
        this._recorder.destroy();
        this._mosca.close(callback);
    }
}

module.exports = GMosca;