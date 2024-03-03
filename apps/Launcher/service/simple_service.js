const WebSocketServer = require('ws');

const server = new WebSocket.Server({ port: 8081 });

server.on('connection', (ws) => {
    ws.on('message', (msg) => {
        ws.send(JSON.stringify({ hello: 'hello'}));
    });
});