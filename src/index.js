const express = require('express');
const { streamLogs } = require('./stream-logs');
const { log } = require('./log');

const app = express();

app.get(
  '/logs/:namespace/:pod/:container',
  async (req, res) =>
    await streamLogs(req.params.namespace, req.params.pod, req.params.container, res),
);
log('listenning on 0.0.0.0:3000');
log(`fetching from bucket: ${process.env.BUCKET_NAME}`);
app.listen(3000, '0.0.0.0');
