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
        await sleep(300);
        adb._stream.removeAllListeners('connect');
        adb._stream.removeAllListeners('error');
        adb._stream.removeAllListeners('close');
    } else
        await sleep(300);

    adb = adbhost.createConnection({ host: tv_ip, port: 26101 });

    adb._stream.on('connect', () => {
        log('ADB connection established');
        switch (Config.launch_method) {
            case 1: {
                log("Launching TizenTube... [Using basic method]");
                basic_method(adb, tv_ip, ws);
                break;
            }
            case 2: {
                log("Launching TizenTube... [Using kill method]");
                kill_method(adb, tv_ip);
                break;
            }
            case 3: {
                log("Launching TizenTube... [Using retry method]");
                retry_method(adb, tv_ip, ws);
                break;
            }
            default: {
                log("Launch method not found, defaulting to method 1.");
                basic_method(adb, tv_ip, ws);
                break;
            }
        }
    });

    adb._stream.on('error', (error) => {
        log_error(`ADB connection error. (${error.message})`);
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

function basic_method(adb_conn, tv_ip, ws) {
    // Launch TizenTube in debug mode
    const shellCmd = adb_conn.createStream(`shell:0 debug Ad6NutHP8l.TizenTube${Config.isTizen3 ? ' 0' : ''}`);
    shellCmd.on('data', data => {
        const dataString = data.toString();
        if (dataString.includes('debug')) {
            log("TizenTube launched.");
            if (ws) {
                ws.send(JSON.stringify({
                    exit: true
                }));
            }
            const port = dataString.substr(dataString.indexOf(':') + 1, 6).replace(' ', '');
            startDebugging(port, adb_conn, tv_ip);
        }
    });
}

function kill_method(adb_conn, tv_ip) {
    // Kill TizenTube and the Launcher
    const kill_job = adb_conn.createStream(`shell:0 was_kill Ad6NutHP8l.TizenTube`);
    kill_job.on('data', data1 => {
        if (data1.toString().includes("spend time")) {
            const kill_job2 = adb_conn.createStream(`shell:0 was_kill I80YHgsJe2.Launcher`);
            kill_job2.on('data', data2 => {
                if (data2.toString().includes("spend time")) {
                    // Wait 200ms to prevent issue
                    setTimeout(() => {
                        // Launch TizenTube in debug mode
                        const shellCmd = adb_conn.createStream(`shell:0 debug Ad6NutHP8l.TizenTube${Config.isTizen3 ? ' 0' : ''}`);
                        shellCmd.on('data', data => {
                            const dataString = data.toString();
                            if (dataString.includes('debug')) {
                                log("TizenTube launched.");
                                const port = dataString.substr(dataString.indexOf(':') + 1, 6).replace(' ', '');
                                startDebugging(port, adb_conn, tv_ip);
                            }
                        });
                    }, 200);
                } else if (data2.toString().replace(/[\s\r\n]/g, '') != "")
                    log(data2.toString().replace(/[\r\n]/g, '')); //Log non empty data from kill command
            });
        } else if (data1.toString().replace(/[\s\r\n]/g, '') != "")
            log(data1.toString().replace(/[\r\n]/g, '')); //Log non empty data from kill command
    });
}

function retry_method(adb_conn, tv_ip, ws) {
    //Launch TizenTube in debug mode
    let shellCmd = adb_conn.createStream(`shell:0 debug Ad6NutHP8l.TizenTube${Config.isTizen3 ? ' 0' : ''}`);

    let retry_count = 0;
    //If we don't get any response, we try again (max 2 times)
    let reconnectInterval = setInterval(() => {
        shellCmd.removeAllListeners("data");
        if (retry_count >= 2) {
            clearInterval(reconnectInterval);
            log("Failed to launch TizenTube.");
            adb._stream.end();
            return;
        }
        retry_count++;
        //Re-Launch TizenTube in debug mode
        shellCmd = adb_conn.createStream(`shell:0 debug Ad6NutHP8l.TizenTube${Config.isTizen3 ? ' 0' : ''}`);
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
    }, 4000);

    shellCmd.on('data', data => {
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
            startDebugging(port, adb_conn, tv_ip);
        }
    });
}

// If the server is running on Android and the CWD is /, change it (required for the Android app)
if (process.cwd() === '/' && process.platform === 'android') {
    process.chdir('/data/user/0/io.gh.reisxd.tizentube/files/tizentube');
}
