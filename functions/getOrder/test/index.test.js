// Copyright 2017 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const assert = require('assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();


// const stubConsole = function () {
//   sinon.stub(console, `error`);
//   sinon.stub(console, `log`);
// };

// //Restore console
// const restoreConsole = function () {
//   console.log.restore();
//   console.error.restore();
// };
// beforeEach(stubConsole);
// afterEach(restoreConsole);

const getTestContext = ({ req = {}, res = {} } = {}) => {

  const axiosMock = {
    request: sinon.stub().callsFake(async (config) => {
      return {
        data: { response: config }
      };
    }),
    '@global': true,
  };
  const app = proxyquire('../', {
    axios: axiosMock,
  });

  const getReqMock = ({ body = {}, query = {}, headers = {}, method = 'GET' } = {}) => {
    const req = {
      headers,
      query,
      body,
      method,
      get: function (header) {
        return this.headers[header];
      },
    };
    sinon.spy(req, 'get');

    return req
  }


  const getResMock = ({ headers = {} } = {}) => {
    const res = {
      headers,
      send: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
      end: sinon.stub().returnsThis(),
      status: function (statusCode) {
        this.statusCode = statusCode;
        return this;
      },
      set: function (header, value) {
        this.headers[header] = value;
        return this;
      },
    };
    sinon.spy(res, 'status');
    sinon.spy(res, 'set');

    return res;
  }


  return {
    axiosMock,
    app,
    reqMock: getReqMock(req),
    resMock: getResMock(res),
  };
}




const stubConsole = function () {
  sinon.stub(console, `error`);
  sinon.stub(console, `log`);
};

//Restore console
const restoreConsole = function () {
  console.log.restore();
  console.error.restore();
};
// beforeEach(stubConsole);
// afterEach(restoreConsole);

describe('functions_get_order', () => {
  it('Send fails if not a POST request', async () => {
    const error = new Error('Only POST requests are accepted');
    error.code = 405;

    const { app, reqMock, resMock } = getTestContext();

    try {
      await app.getOrder(reqMock, resMock);
    } catch (err) {
      assert.deepStrictEqual(err, error);
      assert.strictEqual(resMock.status.callCount, 1);
      assert.deepStrictEqual(resMock.status.firstCall.args, [error.code]);
      assert.strictEqual(resMock.send.callCount, 1);
      assert.deepStrictEqual(resMock.send.firstCall.args, [error]);
      // assert.strictEqual(console.error.callCount, 1);
      // assert.deepStrictEqual(console.error.firstCall.args, [error]);
    }
  });

  it('Calls OMS', async () => {
    const { app, axiosMock, reqMock, resMock, expectedReqConfig } = getTestContext({
      req: {
        headers: {abc: 123},
        body: {
          orderId: 'platypus_1',
          env: 'tangerine-gdelta'
        },
        method: 'POST',
      },
    });

    const expectedAxiosArgs = {
      baseURL: "https://co-tangerine-gdelta.tom.takeoff.com",
      data: undefined,
      headers: {},
      method: 'GET',
      params: undefined,
      url: "/order/platypus_1",
    }

    await app.getOrder(reqMock, resMock);
    assert.strictEqual(resMock.json.callCount, 1);
    assert.deepStrictEqual(resMock.json.firstCall.args, [{}]);

    assert.strictEqual(axiosMock.request.callCount, 1);
    assert.deepStrictEqual(axiosMock.request.firstCall.args, [expectedAxiosArgs]);
  })

  it('Calls OMS with a token', async () => {
    const { app, axiosMock, reqMock, resMock, expectedReqConfig } = getTestContext({
      req: {
        headers: {
          abc: 123,
          'X-Token': 'secret'
        },
        body: {
          orderId: 'platypus_1',
          env: 'tasmania'
        },
        method: 'POST',
      },
    });

    const expectedAxiosArgs = {
      baseURL: "https://co-tasmania.tom.takeoff.com",
      data: undefined,
      headers: {'X-Token': 'secret'},
      method: 'GET',
      params: undefined,
      url: "/order/platypus_1",
    }

    await app.getOrder(reqMock, resMock);
    assert.strictEqual(resMock.json.callCount, 1);
    assert.deepStrictEqual(resMock.json.firstCall.args, [{}]);

    assert.strictEqual(axiosMock.request.callCount, 1);
    assert.deepStrictEqual(axiosMock.request.firstCall.args, [expectedAxiosArgs]);
  })
});
