// config.js
const config = require('./config.json');

console.log('                       ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄');
console.log('                       ██ ▄▄ █▄ ▄█▄▄ ▄▄█');
console.log('                       ██ ██ ██ ████ ███');
console.log('                       ██▄▄ ▀█▀ ▀███ ███');
console.log('                       ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀');
console.info('*************************** config ****************************');
console.info(`* debug_level : ${JSON.stringify(config.DEBUG_LEVEL)}`);
console.info(`* domain_ids : ${JSON.stringify(config.DOMAIN_ID)}`);
console.info(`* source_files : ${JSON.stringify(config.SOURCE_FILE)}`);

if (config.SAVE_PATH === '') {
    console.info(`* save_path : "${approot}/qit_result"`);
} else {
    console.info(`* save_path : ${JSON.stringify(config.SAVE_PATH)}`);
}

console.info('***************************************************************');

console.log('|￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣|');
console.log('|                     QIT Version 2.0.4                      |');
console.log('|     Copyright ⓒ 2020 IBRICKS Inc. All rights reserved.     |');
console.log('|____________________________________________________________|');
module.exports = config;
