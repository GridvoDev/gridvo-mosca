'use strict';
const GMosca = require('./lib/gmosca');
const GMOSCA_EVENT = require('./lib/gmoscaEvent');
const {MongodbRecorder} = require('./lib/recorder');
const {logger} = require('./lib/util');

let moscaSetting = {
    stats: true
};
let recorder = new MongodbRecorder();
let gmosca = new GMosca({moscaSetting, recorder});
gmosca.on(GMOSCA_EVENT.READY, () => {
    gmosca.on(GMOSCA_EVENT.RECORD_ERR, (err) => {
        logger.error(`record packet err:${err.message}`)
    });
    logger.info(`gmosca server:${gmosca.id} is starting`);
});