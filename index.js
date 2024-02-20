import { WebSocketServer } from 'ws';
import adbhost from 'adbhost';
import startDebugging from './debuggerController.js';
import Config from './config.json' assert { type: 'json' };
import { log, log_error } from './utils.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));
let adb;

async function createAdbConnection(tv_ip) {
    if (adb?._stream) {
        adb._stream.end();
        await sleep(200)
        adb._stream.removeAllListeners('connect');
        adb._stream.removeAllListeners('error');
        adb._stream.removeAllListeners('close');
    }

    adb = adbhost.createConnection({ host: tv_ip, port: 26101 });

    adb._stream.on('connect', () => {
        log('ADB connection established');
        // Kill TizenTube and the Launcher
        const kill_job = adb.createStream(`shell:0 was_kill ${Config.appId}`);
        kill_job.on('data', data1 => {
            if (data1.toString().includes("spend time")) {
                const kill_job2 = adb.createStream(`shell:0 was_kill I80YHgsJe2.Launcher`);
                kill_job2.on('data', data2 => {
                    if (data2.toString().includes("spend time")) {
                        // Wait 200ms to prevent issue
                        setTimeout(() => {
                            // Launch TizenTube in debug mode
                            const shellCmd = adb.createStream(`shell:0 debug ${Config.appId}${Config.isTizen3 ? ' 0' : ''}`);
                            log("Launching TizenTube...");
                            shellCmd.on('data', data => {
                                const dataString = data.toString();
                                if (dataString.includes('debug')) {
                                    log("TizenTube launched.");
                                    const port = dataString.substr(dataString.indexOf(':') + 1, 6).replace(' ', '');
                                    startDebugging(port, adb, tv_ip);
                                }
                            });
                        }, 200);
                    }
                });
            }
        });
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
                createAdbConnection(ws._socket.remoteAddress);
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
