'use strict';

const OmsService = require('./lib/takeoff-sdk/service/oms');
const TomApiService = require('./lib/takeoff-sdk/service/tom-api');

const generateSwagger = ({ staticFilesBaseUrl }) => {
  staticFilesBaseUrl = process.env.STATIC_FILES_BASE_URL;
  // https://storage.googleapis.com/storage/v1/b/ln-sandbox-static-files/o
  const swaggerSpecUrl = `${staticFilesBaseUrl}/cce-tools/swagger.yaml?alt=media`;

  var header = `
    <meta charset="UTF-8">
    <title>Swagger UI</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3/swagger-ui.css" >
    <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@3/favicon-32x32.png" sizes="32x32" />
    <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@3/favicon-16x16.png" sizes="16x16" />
    <style>
      html
      {
        box-sizing: border-box;
        overflow: -moz-scrollbars-vertical;
        overflow-y: scroll;
      }

      *,
      *:before,
      *:after
      {
        box-sizing: inherit;
      }

      body
      {
        margin:0;
        background: #fafafa;
      }
    </style>

    <script src="https://unpkg.com/swagger-ui-dist@3/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@3/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function() {
        // Begin Swagger UI call region
        var ui = SwaggerUIBundle({
          url: "${swaggerSpecUrl}",
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          layout: "StandaloneLayout",
          plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
          ],
        })
        // End Swagger UI call region

        window.ui = ui
      }
    </script>
  `;

  var body = `<div id="swagger-ui"></div>`;

  return `
    <!DOCTYPE html>
      <html>
        <head>${header}</head>
        <body>${body}</body>
      </html>
  `;
}

// [START functions_get_order]
/**
 * Get an order's info via a POST request. Using a GET request returns the swagger.
 *
 * @param {object} req Cloud Function request object.
 * @param {object} req.body The request payload.
 * @param {object} res Cloud Function response object.
 */
exports.getOrder = async (req, res) => {
  try {
    const args = req.body
    if (req.method === 'GET') {
      // res.set('Access-Control-Allow-Origin', '*');
      // res.set('Access-Control-Allow-Headers', '*');
      // res.vary('Origin');
      res.send(generateSwagger());
      return Promise.resolve();
    }
    else if (req.method !== 'POST') {
      const error = new Error('Only POST or GET requests are accepted');
      error.code = 405;
      throw error;
    }

    const { env, orderId, locationId } = req.body;
    const xToken = req.get('X-Token');
    const oms = new OmsService({env, xToken});
    const tomApi = new TomApiService({env, xToken});

    const result = {
      oms: await oms.getOrder({ orderId }),
      tomApi: await tomApi.getOrder({ orderId, locationId }),
    };

    res.json(result);

    return Promise.resolve();
  }
  catch (err) {

    res.status(err.code || 500).send({...err, message: err.toString()});
    return Promise.reject(err);
  }
};
// [END functions_get_order]
