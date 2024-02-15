//Store IP once hitting the key "finish"
document.onkeydown = e => {
    if (e.keyCode == 65376) {
        var input = document.getElementById("ip");
        localStorage.setItem("ip", input.value);
        alert("Set IP to " + input.value);
        window.location.reload();
    }
};

function prompt_for_ip(previous_IP = "192.168.1.10") {
    document.getElementById("inputbox").innerHTML = `
    <h2 id="text2">Set Server IP which is running the node server.</h2>
    <label class="label">Server IP:</label>
    <input type="text" class="label" placeholder="IP Address" id="ip">
    `;
    // Focus on input
    const input = document.getElementById("ip");
    input.focus();

    //Pre-fill with the previous IP or the default one
    input.value = previous_IP;

    /*input.onblur = () => { //Not sure this is needed
        // Set IP
        localStorage.setItem("ip", input.value);
        alert("Set IP to " + input.value);
        // Reload page
        window.location.reload();
    }*/
}

function connect_to_server() {
    // Check if IP was set
    if (localStorage.getItem("ip") == null) {
        document.getElementById('text').innerText = 'Waiting for the IP of the server..';
        // Set IP by prompt
        prompt_for_ip();
        return;
    } else {
        var IP = localStorage.getItem('ip');
        var wsServer;
        try {
            wsServer = new WebSocket('ws://' + IP + ':3000');
        } catch (e) {
            document.getElementById('text').innerText = 'Could not connect to server.. Check if it is running and submit again its IP.';
            prompt_for_ip(IP);
            return;
        }
        wsServer.onmessage = function (message) {
            const msg = JSON.parse(message.data);
            if (msg.ok) { //Improve here: SDB connection can still fail here if TV Developer IP isn't right 
                          //-> Catch this and ask user to change it (can also happen if an sdb conn already exists)
                tizen.application.getCurrentApplication().exit();
                return;
            }
        }

        wsServer.onopen = function () {
            wsServer.send(JSON.stringify({
                e: 'launch'
            }));
        };

        setTimeout(function () {
            document.getElementById('text').innerText = 'Could not connect to server after 10 seconds.. Check if it is running and submit again its IP.';
            prompt_for_ip(IP);
            return;
        }, 10000);
    }
}

connect_to_server();