const Service = require('./base.js');

module.exports = class TomApiService extends Service {
    constructor(args) {
        super({serviceName: 'tom-api', ...args});
    }

    async getOrder ({ orderId, locationId }) {
        return await this.req({
            url: `/api/order/${orderId}/details`,
            headers: {
                'X-Location-Id': locationId,
            }
        });
    }

    async initBatchReceiving ({ locationId }) {
        return this.req({
            method: 'post',
            url: `/api/batch-receiving/init`,
            params: {
                'location-id': locationId,
            },
        });
    }

    async incompleteBatch ({ batchId }) {
        return this.req({
            method: 'post',
            url: `/api/batch-receiving/status`,
            data: {
                'order-id': batchId,
                'status': 'incomplete'
            },
        });
    }

    async getMfcCode ({ locationId }) {
        return this.req({
            method: 'get',
            url: '/api/location/tom-mfc-code',
            params: { 'location-id': locationId },
        });
    }

    async req ({url, method, headers, data, params}) {
        headers = {
            'X-Token': this.xToken,
            ...(headers || {})
        };
        return await super.req({url, method, headers, data, params});
    }
}
