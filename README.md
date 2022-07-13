# qit-sample
(node.js) 챗봇 데이터 탑재 완료 후 정상적인 동작을 검증하여 발생할 수 있는 오류를 식별하는 데이터 검증 툴
- 프로토 타입을 개발하였으며 수정 보완을 통해 솔루션 내 기능으로 탑재
- node.js, mocha, elasticsearch

## 1. 설정 파일의 site name 설정을 통해 도메인 변경
```
-- config.json
"DOMAIN_ID": "ys_severance",

"keit_rcms":{
    "TEANA_DIALOGUE": [{"IP": "192.168.0.5","PORT": "5001"}],
    "ELASTICSEARCH_HOST": [{"IP": "192.168.0.5","PORT": "5500"}]
},
"ys_severance":{
    "TEANA_DIALOGUE": [{"IP": "192.168.0.5","PORT": "5002"}],
    "ELASTICSEARCH_HOST": [{"IP": "192.168.0.5","PORT": "5600"}]
},
...
```


## 2. 데이터 검증  
CommandLine Argument를 받아 Excel 파일 또는 db 데이터를 대상으로 검증  
Excel File : npm run file  
DB data : npm run all
  
- 챗봇 탑재 데이터의 not_match, match, multi_match 여부 파악
```
if (responseStatus === 'not_match') { // not_match 일 때.

  excelData.push([domainId, 'NOT MATCH', intent, messages]);
  notMatchNum++;
  ...

} else if (responseStatus === 'multi_intent') { // multi 일 때.

  resultStr = [domainId, 'MULTI', intent, messages];
  const multiObj = result.fulfillment.messages[0].button;
  for (const i in multiObj) {
    if (Object.prototype.hasOwnProperty.call(multiObj, i)) {
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
```


## 3. 검증 데이터 엑셀 파일로 저장
```
const buffer = xlsx.build([{
    name: 'totalCount',
    data: numData
}, {
    name: domainId,
    data: matchResult.excelData
}]);

// 파일로 저장
fs.writeFile(`${savePath + name + domainId}_${thenTime}${nameLevel}.xlsx`, buffer, (err) => {
  ...
})

```


## 4. Mocha 모듈을 사용하여 로직 테스트
```
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

...
});
```

