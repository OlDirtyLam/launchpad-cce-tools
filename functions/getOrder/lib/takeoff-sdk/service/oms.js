const Service = require('./base.js');

module.exports = class OmsService extends Service {
    constructor(args) {
        super({serviceName: 'oms', ...args});
    }

    async getOrder ({orderId}) {
        return this.req({
            method: 'GET',
            url: '/order/' + orderId,
        }).then((result) => {
            return result.response;
        });
    }

    async splitOrder ({ orderId }) {
        return await this.req({
            method: 'PUT',
            url: '/order/split/' + orderId,
        });
    }

    async placeOrder ({ order }) {
        return await this.req({
            method: 'post',
            url: '/order',
            data: order,
        });
    }

    async getCutoffLite ({ locationId }) {
        return await this.req({
            method: 'get',
            url: '/mfc-cutoff-lite',
            params: {'mfc-location-id': locationId },
        });
    }
}
