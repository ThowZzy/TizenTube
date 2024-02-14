import { WebSocketServer } from 'ws';
import adbhost from 'adbhost';
import startDebugging from './debuggerController.js';
import Config from './config.json' assert { type: 'json' };
// const sleep = ms => new Promise(r => setTimeout(r, ms)); **uncomment if launching issue
let adb;

function createAdbConnection(tv_ip) {
    if (adb?._stream) {
        //adb._stream.end();
        //await sleep(1000) **uncomment if launching issue
        adb._stream.removeAllListeners('connect');
        adb._stream.removeAllListeners('error');
        adb._stream.removeAllListeners('close');
    }

    adb = adbhost.createConnection({ host: tv_ip, port: 26101 });

    adb._stream.on('connect', () => {
        console.log('ADB connection established');
        //Launch app
        const shellCmd = adb.createStream(`shell:0 debug ${tv_ip}${Config.isTizen3 ? ' 0' : ''}`);
        shellCmd.on('data', data => {
            const dataString = data.toString();
            if (dataString.includes('debug')) {
                const port = dataString.substr(dataString.indexOf(':') + 1, 6).replace(' ', '');
                startDebugging(port, adb, tv_ip);
            }
        });
    });

    adb._stream.on('error', () => {
        console.log('ADB connection error.');
    });
    adb._stream.on('close', () => {
        console.log('ADB connection closed.');
    });

}

const wss = new WebSocketServer({ host: '0.0.0.0', port: 3000 });
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
                const tv_ip = ws._socket.remoteAddress;
                createAdbConnection(tv_ip);

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