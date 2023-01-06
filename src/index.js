const express = require('express');
const { streamLogs } = require('./stream-logs');

const app = express();

app.get(
    '/logs/:namespace/:pod/:container',
    async (req, res) =>
      await streamLogs(
        req.params.namespace,
        req.params.pod,
        req.params.container,
        res
      )
  );
  app.listen(3000, '0.0.0.0');