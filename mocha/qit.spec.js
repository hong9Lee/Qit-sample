require('../util/global');
const assert = require('assert');

describe('\x1b[30m\x1b[47m[[[[[[[[QIT MOCHA SPEC TEST]]]]]]]]', () => {
    before(() => { // 블록 범위 내 모든 테스트 전에 실행
        console.log('\x1b[34m', '=============Mocha Start=============');
    });

    after(() => { // 블록 범위 내 모든 테스트 후에 실행
        console.log('\x1b[34m', '=============Mocha End=============');
    });

    describe('elastic 관련 함수 테스트 입니다.', () => {
        it('elastic 연결 테스트', async () => {
            const result = await esService.setElasticClient();
            assert.equal(result, true);
        });

        it('elasticSentence 함수 테스트', async () => {
            const result = await elasticQuery.elasticSentence();
            assert.equal(result.length > 0, true);// list 갯수로 파악.
        });

        it('elasticIntent 함수 테스트', async () => {
            const result = await elasticQuery.elasticIntent();
            assert.equal(result.length > 0, true);// list 갯수로 파악.
        });

        it('collectSentenceElastic 함수 테스트', async () => {
            const result = await util.collectSentenceElastic();
            assert.equal(result.length > 0, true);// list 갯수로 파악.
        });
    });

    describe('QIT 기능 함수 테스트 입니다.', () => {
        it('dialogue 연결 테스트', async () => {
            const sendMessage = {
                domain_id: domainId,
                in_type: 'query',
                log_level: 'test',
                session_id: 'session_test',
                dialogue_id: '',
                channel_id: 0,
                parameters,
            };
            const result = await util.dialogue(sendMessage);
            assert.equal(result.status.code, 200);
        });

        it('readExcelFile 함수 테스트', async () => {
            const result = await util.readExcelFile(sourceFile);
            assert.equal(typeof (result), 'object');
        });

        it('matchResultTest 함수 테스트', async () => {
            const idx = 0;
            const intentNsentence = [['', '']];
            const result = await util.matchResultTest(idx, intentNsentence);
            assert.equal(result.numTotal.total, 1);
        });

        it('chatCheck 함수 테스트', async () => {
            const res = {
                status: {
                    code: 200,
                },
                data: {
                    in_str: '',
                    result: {
                        fulfillment: {
                            response_status: 'not_match',
                        },
                        meta: {
                            dialogue_status: 'E',
                        },
                    },
                },
            };

            const sendMessage = {
                domain_id: domainId,
                channel_id: 0,
                in_type: 'query',
                in_str: '',
                parameters,
                log_level: '0',
                session_id: 'mocha_test',
                dialogue_id: '',
            };

            const intent = '인텐트';
            const result = await util.chatCheck(res, intent, sendMessage);
            assert.equal(result.excelData.slice(-1)[0][2], intent); // 보내는 값의 여부로 확인
        });

        it('saveExcelFile 함수 테스트', async () => {
            const matchResult = {
                numTotal: {
                    matchNum: 0, notMatchNum: 0, multiNum: 0, notEqualNum: 0,
                },
                excelData:
                    [['DOMAIN',
                        'RESULT',
                        'REQUIRE INTENT',
                        'SENTENSE',
                        'RESPONSE INTENT1',
                        'RESPONSE INTENT2',
                        'RESPONSE INTENT3']],
            };
            const name = '/test_';

            const result = await util.saveExcelFile(matchResult, name);
            // 저장한 파일 조회 후 리턴
            assert.equal(result, `${name}${domainId}`);
        });
    });
});
