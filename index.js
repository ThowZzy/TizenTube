import { WebSocketServer } from 'ws';
import adbhost from 'adbhost';
import startDebugging from './debuggerController.js';
import Config from './config.json' assert { type: 'json' };
import { log, log_error } from './utils.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));
let adb;

async function createAdbConnection(tv_ip, ws = null) {
    if (adb?._stream) {
        adb._stream.end();
        await sleep(500);
        adb._stream.removeAllListeners('connect');
        adb._stream.removeAllListeners('error');
        adb._stream.removeAllListeners('close');
    } else
        await sleep(500);

    adb = adbhost.createConnection({ host: tv_ip, port: 26101 });

    adb._stream.on('connect', () => {
        log('ADB connection established');
        //Launch TizenTube in debug mode
        let shellCmd = adb.createStream(`shell:0 debug ${Config.appId}${Config.isTizen3 ? ' 0' : ''}`);
        log("Launching TizenTube...");
        shellCmd.on('data', data => {
            if (typeof reconnectInterval !== 'undefined')
                clearInterval(reconnectInterval); //Cancel retries if we got a response
            const dataString = data.toString();
            if (dataString.includes('debug')) {
                log("TizenTube launched.");
                if (ws) {
                    ws.send(JSON.stringify({
                        exit: true
                    }));
                }
                const port = dataString.substr(dataString.indexOf(':') + 1, 6).replace(' ', '');
                startDebugging(port, adb, tv_ip);
            }
        });

        let retry_count = 0;
        //If we don't get any response, we try again (max 3 times)
        let reconnectInterval = setInterval(() => {
            shellCmd.removeAllListeners("data");
            if (retry_count >= 3) {
                clearInterval(reconnectInterval);
                log("Failed to launch TizenTube.");
                adb._stream.end();
                return;
            }
            retry_count++;
            //Re-Launch TizenTube in debug mode
            shellCmd = adb.createStream(`shell:0 debug ${Config.appId}${Config.isTizen3 ? ' 0' : ''}`);
            log("Retry launching TizenTube...");
            shellCmd.on('data', data => {
                const dataString = data.toString();
                if (dataString.includes('debug')) {
                    log("TizenTube launched.");
                    clearInterval(reconnectInterval);
                    //Tell launcher to close itself
                    if (ws) {
                        ws.send(JSON.stringify({
                            exit: true
                        }));
                    }
                    const port = dataString.substr(dataString.indexOf(':') + 1, 6).replace(' ', '');
                    startDebugging(port, adb, tv_ip);
                }
            });
        }, 3000);
    });

    adb._stream.on('error', () => {
        log_error('ADB connection error.');
    });
    adb._stream.on('close', () => {
        log('ADB connection closed.');
    });

}

const wss = new WebSocketServer({ host: '0.0.0.0', port: Config?.serverPort ?? 3000 });

wss.on('listening', () => {
    const address = wss.address();
    log(`Server listening for the launcher on ${address.address}:${address.port}`);
});

wss.on('connection', ws => {
    ws.on('message', message => {
        let msg;
        try {
            msg = JSON.parse(message.toString());
        } catch {
            ws.send(JSON.stringify({
                error: 'Invalid data'
            }));
            return;
        }
        switch (msg.e) {
            case 'launch': {
                ws.send(JSON.stringify({
                    ok: true
                }));
                createAdbConnection(ws._socket.remoteAddress, ws);
                break;
            }
            case 'android': {
                ws.send(JSON.stringify({
                    ok: true
                }));
                createAdbConnection(msg.tv_ip);
                break;
            }
            default: {
                ws.send(JSON.stringify({
                    error: 'Unknown event'
                }));
                break;
            }
        }
    });
});

// If the server is running on Android and the CWD is /, change it (required for the Android app)
if (process.cwd() === '/' && process.platform === 'android') {
    process.chdir('/data/user/0/io.gh.reisxd.tizentube/files/tizentube');
}
