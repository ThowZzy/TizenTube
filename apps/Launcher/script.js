document.onkeydown = e => {
    switch (e.keyCode) {
        case 404:
            window.location.reload();
            break;
    }
};

function connect_to_server() {
    const isTizen3 = navigator.userAgent.includes('Tizen 3.0');
    var wsServer;
    try {
        wsServer = new WebSocket('ws://127.0.0.1:3000');
    } catch (e) {
        document.getElementById('text').innerText = 'Could not connect to server..';
        return;
    }
    var got_ok = false;
    wsServer.onmessage = function (message) {
        const msg = JSON.parse(message.data);
        if (msg.ok) { //Improve here: SDB connection can still fail here if TV Developer IP isn't right 
            //-> Catch this and ask user to change it (can also happen if an sdb conn already exists)
            //tizen.application.getCurrentApplication().exit();
            //return;
            got_ok = true;
            //Experimental code to address the issue
        }
        if (msg.exit) {
            tizen.application.getCurrentApplication().exit();
        }
    }

    wsServer.onopen = function () {
        wsServer.send(JSON.stringify({
            e: 'launch',
            version: isTizen3
        }));
    };

    setTimeout(function () {
        if (got_ok) {
            document.getElementById('text').innerText = "Connection with the server was successful but the ADB connection failed... You likely did not change the TV's developer IP to your server's. Or you still have an active connection to your TV with tizen device manager. Or you need to enable/disable the Tizen3 Compatibility.";
        } else {
            document.getElementById('text').innerText = 'Could not connect to server after 10 seconds.. There is a problem with the service..';
        }
        return;
    }, 10000);
}

function start_service(){
    var testWS = new WebSocket(`ws://127.0.0.1:3000`);
    testWS.onerror = () => {
        var pkg_id = tizen.application.getCurrentApplication().appInfo.packageId;
        var service_id = pkg_id + ".LauncherService";
        tizen.application.launchAppControl(new tizen.ApplicationControl('http://tizen.org/appcontrol/operation/service'), service_id, function () {
            document.getElementById('text').innerText = "Service started.";
            connect_to_server();
        }, function (e) {
            alert('Launch Service failed: ' + e.message);
        });
    };

    testWS.onopen = () => {
        document.getElementById('text').innerText = "Service is already running.";
        testWS.close();
        connect_to_server();
    };
}

document.addEventListener("DOMContentLoaded", start_service);