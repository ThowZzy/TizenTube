# TizenTube

TizenTube is a NodeJS script that enhances your Tizen TV (2017 and newer) viewing experience by removing ads and adding support for Sponsorblock.

[Discord Server Invite](https://discord.gg/m2P7v8Y2qR)

# TizenTube-Legacy ?

This fork follows another development path than the original TizenTube, the original now uses TizenBrew. But I liked the TizenTube only project so I brought it back with the improvements I personally wanted.

## How it works

TizenTube operates by initiating a debugger session upon launching the app on your Tizen TV. This is achieved through the utilization of the `debug <app.id>` command, which establishes a connection between the server and the debugger. Once connected, the server is able to transmit JavaScript code that effectively removes video ads.

# TizenTube Installation Guide

## Prerequisites

- A PC capable of running Tizen Studio, which will be used to install TizenTube & the launcher onto your TV through SDB.
- A PC or Single Board Computer capable of running 24/7 (for ease of use) or the Android App.

## Installation Steps

1. [Download and install Tizen Studio](https://developer.tizen.org/development/tizen-studio/download) "CLI" or "GUI" version (CLI is good enough).
2. [Enable developer mode](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html) on the TV and put the IP of your PC in the developer settings. 
   <img src="https://github.com/ThowZzy/TizenTube-Legacy/blob/main/.github/images/tv-developer-settings.jpg" alt="drawing" width="500"/>  
3. Execute the installer script [[Windows](https://github.com/ThowZzy/TizenTube-Legacy/blob/main/install-wgt_WINDOWS.bat)/[Mac](https://github.com/ThowZzy/TizenTube-Legacy/blob/main/install-wgt_MAC.sh)]. Remember to edit the path of tizen studio if you didn't let it as default (``C:\tizen-studio`` for Windows or ``/Users/'username'/tizen-studio`` for Mac).  
4. Once both apps are installed to the TV, make sure to change the TV's Developer IP to your PC, Single Board Computer or your android phone's IP which will run the server.  

After completing these steps, installing apps is complete! You should be able to see the apps on your TV. Now comes the easier part, installing the server or the debugger. You have two options to do this:

### Option 1: Install on PC/SBC

1. Download [NodeJS](https://nodejs.org/en) if you haven't already. Check by running the command `npm -v`.
2. Clone the repository.
3. Install modules by running `npm i` in the main folder of the repository.
4. Install mods modules by running `cd mods` and then running `npm i`.
5. Build mods by running `npm run build`.
6. Navigate back to the main folder of the repository by running `cd ..`.
7. Open `config.json` in your favorite text editor. Make sure to leave the `appID` as it is (`Ad6NutHP8l.TizenTube`). Change `isTizen3` to true if your TV runs on Tizen 3.
8. Ensure that SDB is not running by going to Tizen's device manager and disconnecting your TV.
9. Change the development IP address on the TV (if not already done from step 5 of Installation steps), to the IP of this PC that you'll run the node server on.
10. Start the node debugger/server using `node .`.

Once the server is up and running, you can access the Launcher app from your TV’s app menu. See "How to launch TizenTube ?".

### Option 2: Use The Android App

1. Download and install the latest APK compatible with your device's architecture from [here](https://github.com/reisxd/TizenTube/releases/latest) (if unsure, download armeabi-v7a).
2. After opening the app, change the configuration to suit your needs. Ensure that you set the `appID` to `Ad6NutHP8l.TizenTube` if it isn't already set. Change the IP to match that of your TV.
3. Change the development IP address on the TV (if not already done from step 5 of Installation steps) to that of this Android device which you'll run the server on.
4. Press 'Run Server'.
5. Press 'Launch' whenever you want to launch TizenTube.
6. Please note that if the app crashes, you may have made an error, such as setting an incorrect IP or failing to change the Developer Mode's Host IP.

And now you can launch TizenTube from your Android device!

### How to launch TizenTube ?
1. Pin the "Launcher" application with the modified youtube logo to your quick launch. (optionnal)
2. Start the launcher app.
3. Enter the IP of the server, hit finish.
4. Done

Now, everytime you want to watch youtube, start the launcher and it will launch an ad-less youtube.
