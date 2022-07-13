require('./global');
const { logger } = require('../config/log');

// 도메인의 모든 인텐트 조회.
const elasticIntent = async () => {
    const indexName = 'tr_intent';
    const docType = 'doc';
    const payload = {
        size: 10000,
        query: {
            bool: {
                must: [
                    {
                        match: {
                            'domain_id.keyword': domainId,
                        },
                    },
                ],
                must_not: [
                    {
                        query_string: {
                            query: 'promp*',
                            fields: [
                                'name',
                            ],
                        },
                    },
                ],
            },
        },
        _source: ['id', 'name']
    };
    try {
        const result = await esService.search(indexName, docType, payload);
        if (result.hits.hits.length !== 0) return result.hits.hits;
    } catch (err) {
        logger.error(`[IP]${ip.address()} [elasticSearch] ${err}`);
    }
};

// 도메인의 모든 센텐스 조회.
const elasticSentence = async () => {
    const indexName = 'tr_sentence';
    const docType = 'doc';
    const payload = {
        size: 10000,
        query: {
            match: {
                'domain_id.keyword': domainId,
            },
        },
        sort: [
            {
                'id.keyword': {
                    order: 'desc',
                },
            },
        ],
    };
    const scrollTime = '1m';
    const total = [];
    try {
        const result = await esService.scrollSearch(indexName, docType, payload, scrollTime);

        for (let i = 0; i < result.hits.hits.length; i++) {
            total.push(result.hits.hits[i]);
        }

        // scroll api를 사용하여 데이터를 10000건씩 가져온다
        if (total.length < result.hits.total) {
            const scrollResult = await esService.scroll(scrollTime, result._scroll_id);
            for (let i = 0; i < scrollResult.hits.hits.length; i++) {
                total.push(scrollResult.hits.hits[i]);
            }
        }

        return total;
    } catch (err) {
        logger.error(`[IP]${ip.address()} [elasticSearch] ${err}`);
    }
};

module.exports = {
    elasticIntent,
    elasticSentence
};
