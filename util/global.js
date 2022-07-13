global.approot = require('app-root-path');
global.requestPromise = require('request-promise');
global.moment = require('moment');
global.xlsx = require('node-xlsx');
global.fs = require('fs');
global.esService = require('./elasticsearch.service');
global.config = require('../config/config.json');
global.elasticQuery = require('./elastic_query');
global.util = require('./util');
global.path = require('path');
global.approot = require('app-root-path');
global.axios = require('axios');
global.http = require('http');
global.ip = require('ip');

global.domainId = config.DOMAIN_ID;
global.optionLevel = config.OPTIONS.LEVEL;
global.optionSpeed = config.OPTIONS.SPEED;
global.sourceFile = config.SOURCE_FILE;
global.parameters = config.OPTIONS.PARAMS;
global.savePath = config.SAVE_PATH;
global.nowTime = moment(new Date()).format('YYYYMMDDHHmmss');

global.teanaDialogueUrl = `http://${config[domainId].TEANA_DIALOGUE[0].IP}:${config[domainId].TEANA_DIALOGUE[0].PORT}/chat`;
global.excelData = [['DOMAIN', 'RESULT', 'REQUIRE INTENT', 'SENTENSE', 'RESPONSE INTENT1', 'RESPONSE INTENT2', 'RESPONSE INTENT3']];
