require('./global');
const elasticsearch = require('elasticsearch');
const config = require('../config/config.json');
const { logger } = require('../config/log');

let elasticClient;

module.exports = {
    setElasticClient: () => {
        const elasticSet = config[domainId].ELASTICSEARCH_HOST;
        const elasticUrl = [];
        logger.info(`[IP] : ${ip.address()} | [ELASTIC_HOST] : ${elasticSet[0].IP}:${elasticSet[0].PORT} | [DIALOGUE_HOST] : ${config[domainId].TEANA_DIALOGUE[0].IP}:${config[domainId].TEANA_DIALOGUE[0].PORT}`);
        elasticSet.forEach((item) => {
            elasticUrl.push(`${item.IP}:${item.PORT}`);
        });
        elasticClient = new elasticsearch.Client({
            hosts: elasticUrl,
        });

        return elasticClient.ping();
    },

    ping: (req, res) => {
        elasticClient.ping({
            requestTimeout: 3000,
        }, (error) => {
            if (error) {
                res.status(500);
                return res.json({ status: false, msg: 'Elasticsearch cluster is down!' });
            }
            res.status(200);
            return res.json({ status: true, msg: 'Success! Elasticsearch cluster is up!' });
        });
    },

    search: async (indexName, docType, payload) => elasticClient.search({
        index: indexName,
        type: docType,
        body: payload,
    }).catch((err) => {
        throw err;
    }),

    /** 8. Scroll-Search */
    scrollSearch: async (indexName, docType, payload, scrollTime) => elasticClient.search({
        index: indexName,
        type: docType,
        body: payload,
        scroll: scrollTime,
    }).catch((err) => {
        console.log(err);
        throw err;
    }),

    /** 9. Scroll */
    scroll: async (scroll, scrollId) => elasticClient.scroll({
        scrollId,
        scroll,
    }).catch((err) => {
        console.log(err);
        throw err;
    }),
};
