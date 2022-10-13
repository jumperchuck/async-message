import http from 'http';
import path from 'path';
import fs from 'fs';

export const createServer = (port: number) => {
  const server = http.createServer((req, res) => {
    if (!req.url) return;

    fs.readFile(path.join(__dirname, '../', req.url), (err, data) => {
      if (err) {
        res.end('<h1>404</h1>');
      } else {
        res.end(data);
      }
    });
  });

  server.listen(port);

  return server;
};
