require('../util/global');
const { logger } = require('../config/log');
const util = require('../util/util');

(async () => {
    // elastic 설정.
    await esService.setElasticClient(domainId);

    console.log(`process argv : ${process.argv}`);
    let name = '';
    let intentNsentence = [];
    if (process.argv[2] === 'file') {
        name = '/file_';

        // 엑셀 파일로 [intent,sentence] 취합.
        intentNsentence = await util.readExcelFile(sourceFile, domainId);

        logger.info(`[테스트 질의어 갯수] : ${intentNsentence.length}`);
    } else if (process.argv[2] === 'all') {
        name = '/all_';

        // elastic으로 [intent,sentence] 취합.
        intentNsentence = await util.collectSentenceElastic();
    }

    if (optionLevel === 0) logger.info('[MATCH, MULTI, NOT_MATCH, NOT_EQUAL] 진행중...');
    else if (optionLevel === 1) logger.info('[MULTI, NOT_MATCH, NOT_EQUAL] 진행중...');

    // 검수과정.
    let matchResult = {};
    let count = 1;
    for (const item of intentNsentence) {
        await Promise.all(item.map(async (element) => {
            matchResult = await util.matchResultTest(element, count);

            await util.loading(intentNsentence.length, matchResult);
            count++;
        }));
    }

    // excel 파일 저장.
    util.saveExcelFile(matchResult, name);
})();
