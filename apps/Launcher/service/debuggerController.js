const WebSocket = require('ws');
const nodeFetch = require('node-fetch');
const { readFileSync } = require('node:fs');
const Config = require('./config.json');
const { log, log_error } = require('./utils.js');

async function startDebugging(port, adb_conn, tv_ip) {
    try {
        const debuggerJsonReq = await nodeFetch(`http://${tv_ip}:${port}/json`);
        const debuggerJson = await debuggerJsonReq.json();
        return attachDebugger(debuggerJson[0].webSocketDebuggerUrl, adb_conn);
    } catch (error) {
        log_error('Could not load scripts to TizenTube:', error.message);
        adb_conn._stream.end();
    }
}

async function attachDebugger(wsUrl, adb_conn) {
    const client = await new WebSocket(wsUrl);
    //We don't need the adb connection at this point
    adb_conn._stream.end();
    let id = 12;
    let modFile;
    try {
        modFile = readFileSync('mods/dist/userScript.js', 'utf-8');
    } catch {
        log_error('Could not find the built mod file. Did you build it?');
        client.close();
        return;
    }
    client.onmessage = (message) => {
        const msg = JSON.parse(message.data);

        // Future-proof it just incase the page reloads/something happens.
        if (msg.method && msg.method == 'Runtime.executionContextCreated' && msg.params.context.origin=="https://www.youtube.com") {
            client.send(JSON.stringify({ "id": id, "method": "Runtime.evaluate", "params": { "expression": modFile, "objectGroup": "console", "includeCommandLineAPI": true, "doNotPauseOnExceptionsAndMuteConsole": false, "contextId": msg.params.context.id, "returnByValue": false, "generatePreview": true } }));
            id++;
            log("Injected scripts to TizenTube successfully!");
        }

        if (Config.debug) {
            if (msg.method == 'Console.messageAdded') {
                log(msg.params.message.text, msg.params.message.parameters);
            } else if (msg?.result?.result?.wasThrown) {
                log_error(msg.result.result.description);
            }
        }
    }
    client.onopen = () => {
        if (Config.debug) {
            client.send(JSON.stringify({ "id": 2, "method": "Console.enable" }));
        }

        client.send(JSON.stringify({ "id": 7, "method": "Debugger.enable" }));
        client.send(JSON.stringify({ "id": 11, "method": "Runtime.enable" }));
    }
}

module.exports = startDebugging;