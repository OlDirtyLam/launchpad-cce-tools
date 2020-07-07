const axios = require('axios');

module.exports = class Service {
    constructor({env, serviceName, xToken}) {
        this.env = env;
        this.serviceName = serviceName;
        this.xToken = xToken;
    }

    getBaseUrl () {
        const { env, serviceName, urlPrefix } = this;
        return getServiceBaseURL({
            env,
            serviceName,
            urlPrefix,
        });
    }
    async req ({url, method, headers, data, params}) {
        let reqPromise;

        // always add our token if there is one
        headers = {...headers};
        if (this.xToken) {
            headers['X-Token'] = this.xToken
        }

        if (method == 'delete') {
            reqPromise = axios.delete(url, {
                baseURL: this.getBaseUrl(),
                method: method,
                headers: headers,
                data: data,
                params: params,
            })
        }
        else {
            reqPromise = axios.request({
                baseURL: this.getBaseUrl(),
                method: method,
                url: url,
                headers: headers,
                data: data,
                params: params,
            })
        }

        try {
            const result = await reqPromise;
            return result.data;
        }
        catch ({ response, config }) {
            const { status, statusText, data } = response;

            const message = `Request to ${this.serviceName} failed [${status} - ${statusText}]`;
            const error = new Error(message);
            error.code = status;
            error.config = config;
            error.data = data;

            throw error;
        };
    }
}

const getServiceBaseURL = ({ env, serviceName, urlPrefix = '' }) => {

    const servicePrefixs = {
        'oms': 'co',
        'ops-api': 'ops-api',
        'tom-api': 'api',
        'couch': 'couchdb'
    };

    if(servicePrefixs[serviceName]) {
        return `https://${urlPrefix}${servicePrefixs[serviceName]}-${env}.tom.takeoff.com`;
    }
    else {
        throw Error(`Unknow service ${serviceName}`);
    }
}

