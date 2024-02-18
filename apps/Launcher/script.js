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
    <h2 class="text2">Set Server IP which is running the node server. (Press OK to open the keyboard)</h2>
    <h2 class="text2">You can specify the port of the server but it is optionnal, by default it will use the port 3000. Examples : 192.168.1.10, 192.168.1.10:8080 ...</h2>
    <label class="label">Server IP:</label>
    <input type="text" class="input" placeholder="IP Address" id="ip">
    `;
    // Focus on input
    const input = document.getElementById("ip");
    input.blur();
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
        var IP_split = IP.split(":");
        var wsServer;
        try {
            if (IP_split.length > 1) {
                wsServer = new WebSocket('ws://' + IP_split[0] + ":" + IP_split[1]);
            } else {
                wsServer = new WebSocket('ws://' + IP_split[0] + ':3000');
            }
        } catch (e) {
            document.getElementById('text').innerText = 'Could not connect to server.. Check if it is running and submit again its IP.';
            prompt_for_ip(IP);
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
        }

        wsServer.onopen = function () {
            wsServer.send(JSON.stringify({
                e: 'launch'
            }));
        };

        setTimeout(function () {
            if (got_ok) {
                document.getElementById('text').innerText = "Connection with the server was successful but the ADB connection failed... You likely did not change the TV's developer IP to your server's. Or you still have an active connection to your TV with tizen device manager. Or you need to enable/disable the Tizen3 Compatibility.";
            } else{
                document.getElementById('text').innerText = 'Could not connect to server after 10 seconds.. Check if it is running and submit again its IP.';
            }
            prompt_for_ip(IP);
            return;
        }, 10000);
    }
}

document.addEventListener("DOMContentLoaded", connect_to_server);