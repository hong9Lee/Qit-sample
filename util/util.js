const { logger } = require('../config/log');
require('./global');

// teana dialogue.
const dialogue = async (sendMessage) => {
    const dialogueResult = await axios({
        method: 'post',
        url   : teanaDialogueUrl,
        data  : sendMessage,
        timeout: 10000,
        })
        .then((response) => {
            return response.data;
        }).catch((err) => {
            logger.error(`[err] : ${err}`);
        });

    return dialogueResult;
};

// 진행률 체크.
const loading = (length, num) => {
    const idx = num.numTotal.total;
    const thenTime = moment(new Date()).format('YYYYMMDDHHmmss');
    const difftime = moment(nowTime, 'YYYYMMDDHHmmss').diff(moment(thenTime, 'YYYYMMDDHHmmss'));
    const dTime = moment.duration(difftime);
    let m = -dTime.minutes();
    let s = -dTime.seconds();

    if (m < 10) m = `0${m}`;
    if (s < 10) s = `0${s}`;

    if (idx % 4 === 0) {
        process.stdout.write(`[경과시간] : ${m}m ${s}s | [진행률] : ${idx}/${length} (${Math.round(((idx) / length) * 100)}%) ◜\r`);
    } else if (idx % 4 === 1) {
        process.stdout.write(`[경과시간] : ${m}m ${s}s | [진행률] : ${idx}/${length} (${Math.round(((idx) / length) * 100)}%) ◝\r`);
    } else if (idx % 4 === 2) {
        process.stdout.write(`[경과시간] : ${m}m ${s}s | [진행률] : ${idx}/${length} (${Math.round(((idx) / length) * 100)}%) ◞\r`);
    } else if (idx % 4 === 3) {
        process.stdout.write(`[경과시간] : ${m}m ${s}s | [진행률] : ${idx}/${length} (${Math.round(((idx) / length) * 100)}%) ◟\r`);
    }

    if (idx === length) {
        logger.info(`[경과시간] : ${m}m ${s}s | [진행률] : ${idx}/${length}(${Math.round(((idx) / length) * 100)}%)   `);
    }
};

// sentence와 intent 매칭 함수.
let matchNum = 0;
let notMatchNum = 0;
let multiNum = 0;
let notEqualNum = 0;
let errorNum = 0;
let total = 0;
const chatCheck = async (res, intent) => {
    if (res.config === undefined && res.message === undefined) {
        if (res.status.code === 200) {
            const { result } = res.data;
            const messages = res.data.in_str;
            const responseStatus = result.fulfillment.response_status; // match, not_match, multi_intent.
            let resultStr = '';

            /**
             * teana dialogue response_status "not_match", "multi_intent", "match"
             */
            if (responseStatus === 'not_match') { // not_match 일 때.

                excelData.push([domainId, 'NOT MATCH', intent, messages]);
                notMatchNum++;

            } else if (responseStatus === 'multi_intent') { // multi 일 때.
                resultStr = [domainId, 'MULTI', intent, messages];

                const multiObj = result.fulfillment.messages[0].button;
                for (const i in multiObj) {
                    if (Object.prototype.hasOwnProperty.call(multiObj, i)) { // 객체가 특정 프로퍼티를 가지고 있는지를 나타내는 불리언 값을 반환.
                        resultStr.push(result.meta.multi_chatflow_data.data[i].name);
                    }
                }
                excelData.push(resultStr);
                multiNum++;

            } else if (responseStatus === 'match') { // match 일 때.

                if (intent !== result.meta.core[0].intent) { // match 이지만 인텐트가 다를 때.
                    excelData.push([domainId, 'INTENT MATCH BUT NOT EQUAL', intent, messages, result.meta.core[0].intent]);
                    notEqualNum++;
                } else { // match 이고 인텐트가 같을 때.
                    if (optionLevel === 0) {
                        excelData.push([domainId, 'INTENT MATCH', intent, messages, result.meta.core[0].intent]);
                    }
                    matchNum++;
                }

            }
        }
    } else {
        errorNum++;
        const result = JSON.parse(res.config.data);
        logger.info(`error 발견 : ${errorNum}개 - [error 질의어] : ${result.in_str} - [error 메세지] : ${res.message}`);
        excelData.push([domainId, 'ERROR', intent, result.in_str]);
    }
    total++;

    return {
        numTotal: {
            matchNum,
            notMatchNum,
            multiNum,
            notEqualNum,
            errorNum,
            total,
        },
        excelData,
    };
};

// 결과 파일 저장 함수.
const saveExcelFile = (matchResult, name) => {
    const { numTotal } = matchResult;
    const numData = [];
    numData.push(['MATCH', `${numTotal.matchNum}개`], ['MATCH BUT NOT EQUAL', `${numTotal.notEqualNum}개`],
        ['MULTI', `${numTotal.multiNum}개`], ['NOT MATCH', `${numTotal.notMatchNum}개`], ['ERROR', `${numTotal.errorNum}개`], ['TOTAL', `${numTotal.total}개`]);
    const buffer = xlsx.build([{
        name: 'totalCount',
        data: numData
    }, {
        name: domainId,
        data: matchResult.excelData
    }]);

    let nameLevel = '';
    if (optionLevel === 0) nameLevel = '_Overall';
    else if (optionLevel === 1) nameLevel = '_Multi-NotMatch-NotEqual';

    // savePath를 지정 안했다면 현재경로로.
    if (savePath === undefined || savePath === '' || savePath === null) savePath = approot;

    try {
        fs.statSync(`${savePath}/qit_result`);
    } catch (err) {
        try {
            fs.mkdirSync(`${savePath}/qit_result`);
        } catch (error) {
            logger.error(`[IP]${ip.address()} [MakeDirectory] ${error}`);
        }
        logger.error(`[IP]${ip.address()} [checkDirectory] ${err}`);
    }

    savePath += '/qit_result';

    const thenTime = moment(new Date()).format('YYYYMMDDHHmmss');

    if (optionLevel === 0) {

        fs.writeFile(`${savePath + name + domainId}_${thenTime}${nameLevel}.xlsx`, buffer, (err) => {
        if (err) logger.error(`[IP]${ip.address()} [FileSave]${err}`);
        else logger.info(`[저장 경로] : ${savePath}${name}${domainId}_${thenTime}${nameLevel}.xlsx`);

        });
    } else if (optionLevel === 1 && numTotal.total !== numTotal.matchNum) {

        fs.writeFile(`${savePath + name + domainId}_${thenTime}${nameLevel}.xlsx`, buffer, (err) => {
        if (err) logger.error(`[IP]${ip.address()} [FileSave] ${err}`);
        else logger.info(`[저장 경로] : ${savePath}${name}${domainId}_${thenTime}${nameLevel}.xlsx`);

        });
    }

    logger.info(`[결과] : match : ${numTotal.matchNum}개 / match but not equal : ${numTotal.notEqualNum}개 / 
    multi : ${numTotal.multiNum}개 / not match : ${numTotal.notMatchNum}개 / error : ${numTotal.errorNum}개  `);
    return `${name}${domainId}`;
};

// 세션 생성.
function guid() {
    function s4() {
        return ((1 + Math.random()) * 0x10000 || 0)
            .toString(16)
            .substring(1);
    }

    return `${s4()}${s4()}`;
}

// 검수 메인 함수.
const matchResultTest = async (intentNsentence, count) => {
    const sentence = intentNsentence[1];
    const intent = intentNsentence[0];
    const sessionId = `qit_test_${count}${guid()}`;

    const sendMessage = {
        domain_id  : domainId,
        channel_id : 0,
        in_type    : 'query',
        in_str     : sentence,
        parameters,
        log_level  : '0',
        session_id : sessionId,
        dialogue_id: '',
    };

    const res = await dialogue(sendMessage, intent);
    const numTotalNexcelData = await chatCheck(res, intent);

    // chat 결과
    // match, multi, not_match check
    return numTotalNexcelData;
};

// excel 파일 읽기 함수.
const readExcelFile = async (sourceFile) => {

    if (sourceFile === []) filePath = `${approot}/sentenseInfo/${domainId}.xlsx`;
    else filePath = `${approot}/sentenseInfo/${sourceFile}`;

    try {
        let intentNsentence = await xlsx.parse(filePath);

        // [intent,sentence] 더미 배열 정리 함수.
        intentNsentence = intentNsentence[0].data;
        intentNsentence = intentNsentence.filter((item) => item[0] !== undefined);
        intentNsentence.shift();

        return intentNsentence;
    } catch (error) {
        logger.error(`[IP]${ip.address()} [readExcelFileFunction] ${error}`);
    }
};

// 도메인 intent sentence 취합 함수.
const collectSentenceElastic = async () => {
    // sentence 취합 부분.
    const sentenceAndIntent = [];
    try {
        const sentence = await elasticQuery.elasticSentence();
        const intent = await elasticQuery.elasticIntent();

        for (let i = 0; i < sentence.length; i++) {

            const intentResult = await intent.find((item) => item._source.id === sentence[i]._source.intent_id);
            if (intentResult !== undefined) {
                sentenceAndIntent.push([intentResult._source.name, sentence[i]._source.expression]);
            }
            process.stdout.write(`[테스트 질의어 갯수] : ${sentenceAndIntent.length}\r`);

        }
        logger.info(`[테스트 질의어 갯수] : ${sentenceAndIntent.length}`);
        return sentenceAndIntent;
    } catch (error) {
        logger.error(`[IP]${ip.address()} [collectSentenceElasticFunction] ::: ${error}`);
    }
};

const sleep = (delay) => {
    const start = new Date().getTime();
    while (new Date().getTime() < start + delay) ;
};

module.exports = {
    dialogue,
    loading,
    saveExcelFile,
    matchResultTest,
    readExcelFile,
    collectSentenceElastic,
    chatCheck,
    sleep,
};
