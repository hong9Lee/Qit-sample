require('./config.js');
require('../util/global');
const winston = require('winston'); // 로그처리 모듈
const WinstonDaily = require('winston-daily-rotate-file');// 로그 일별 처리 모듈
const config = require('./config.json');

const {
    combine, timestamp, label, printf,
} = winston.format;

function timeStampFormat() {
    return moment().format('YYYY-MM-DD HH:mm:ss'); // '2016-05-01 20:14:28.500'
}

const myFormat = printf(({ message, level }) => `${timeStampFormat()} [${level}] : ${message}`); // log 출력 포맷 정의

// 로그 설정
const logger = winston.createLogger({
    transports: [
        new (WinstonDaily)({
            name: 'file',
            level: config.DEBUG_LEVEL,
            filename: './log/%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            colorize: true,
            maxsize: 10485760,
            maxFiles: 5,
            showlevel: true,
            zippedArchive: true, // 압축여부
            json: false,
            timestamp: timeStampFormat,
            format: combine(
                label({ label: 'qit_log' }),
                timestamp(),
                myFormat, // log 출력 포맷
            ),
        }),
        new (winston.transports.Console)({
            name: 'console',
            colorize: true,
            level: config.DEBUG_LEVEL,
            showLevel: false,
            json: false,
            timestamp: timeStampFormat,
            format: winston.format.printf(
                (info) => info.message,
            ),
        }),
    ],
});

// 30일 초과되는 로그 삭제
const filePath = `${approot}/log`;
fs.readdir(filePath, (err, files) => {
    if (err) {
        logger.error(`[LOG_DELETE]${err}`);
        throw err;
    }

    for (const file of files) {
        const agoFile = moment().add(-30, 'days').format('YYYY-MM-DD');
        const fileData = file.split('.')[0];
        if (fileData !== '' && fileData < agoFile) {
            fs.unlink(path.join(filePath, file), (errer) => {
                if (errer) {
                    logger.error(`[LOG_DELETE]${errer}`);
                    throw errer;
                }
            });
        }
    }
});
module.exports = {
    logger,
};
