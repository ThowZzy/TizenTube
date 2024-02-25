# TizenTube

TizenTube is a NodeJS script that enhances your Tizen TV (2017 and newer) viewing experience by removing ads and adding support for Sponsorblock.

[Discord Server Invite](https://discord.gg/m2P7v8Y2qR)

# TizenTube-Legacy ?

This fork follows another development path than the original TizenTube, the original now uses TizenBrew. But I liked the TizenTube only project so I brought it back with the improvements I personally wanted.  
One of the main focus is to improve the ease of install and the ease of use in general, to make it more accessible.

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
2. Clone the repository. (``git clone https://github.com/ThowZzy/TizenTube-Legacy.git``)
3. Install modules by running `npm i` in the main folder of the repository.
4. Install mods modules by running `cd mods` and then running `npm i`.
5. Still in /mods folder, build mods by running `npm run build`.
6. Navigate back to the main folder of the repository by running `cd ..`.
7. Open `config.json` in your favorite text editor. Change `isTizen3` to true ONLY if your TV runs on Tizen 3. And change the default port from 3000 to something not in use if you already have something on port 3000 (Keeping default is recommended otherwise).
8. Still in config.json, change the launch_method to any number between 1 and 3. 1 = Basic method, 2 = Kill method, 3 = Retry method. Test which ever works best on your TV.
9. Ensure that SDB is not running by going to Tizen's device manager and disconnecting your TV.
10. Change the development IP address on the TV (if not already done from step 4 of Installation steps), to the IP of this PC that you'll run the node server on.
11. Start the node debugger/server using `node .`.

Once the server is up and running, you can access the Launcher app from your TV’s app menu. See "How to launch TizenTube ?".

### Option 2: Use The Android App

1. Download and install the latest APK compatible with your device's architecture from [here](https://github.com/ThowZzy/TizenTube-Legacy/releases/tag/apk) (if unsure, download armeabi-v7a).
2. After opening the app, change the configuration to suit your needs. Ensure that you set the `appID` to `Ad6NutHP8l.TizenTube` if it isn't already set. Change the IP to match that of your TV. Change `isTizen3` to true ONLY if your TV runs on Tizen 3.
3. Change the development IP address on the TV (if not already done from step 4 of Installation steps) to that of this Android device which you'll run the server on.
4. Press 'Run Server'.

And now you can launch TizenTube from your Android device! See "How to launch TizenTube ?".

# F.A.Q

## How to launch TizenTube ?
### Option #1 (node server on PC/SBC)
1. Pin the "Launcher" application with the modified youtube logo to your quick launch. (optionnal)
2. Start the launcher app.
3. Enter the IP of the server, hit finish.
4. Done  

Now, everytime you want to watch youtube, start the launcher and it will launch an ad-less youtube.  
### Option #2 (android app server)
1. Press 'Launch' whenever you want to launch TizenTube.
2. Please note that if the app crashes, you may have made an error, such as setting an incorrect IP or failing to change the Developer Mode's Host IP.  

Note that you also can use the Launcher app from the TV to launch TizenTube after you pressed 'Run Server'.
## The launcher cannot connect to the server ?  
- Check if you entered the right IP and that the node server is running.  
- Check if your server (raspberry pi for example) has the port 3000 opened (or the port you configured).  

## The launcher can connect to the server but TizenTube doesn't load ?  
- You might need to try with and without the "isTizen3" option of the server.  
- Check if the IP set in TV's developer option is the right IP of your server.  

## Your videos are stuttering every 1 second ?  
- First check if you have the latest version of the node server or the latest APK.  
- If you changed the video speed to "1x" you need to change it again to "1.0001x" to fix the stutters.

## How do I update the server and the Tizen applications ?
- To update the server on Windows/Linux/Mac : Run the command ``git pull`` from the root folder of the repository. And optionnally you should also run ``npm run build`` in /mods folder.
- To update the server on Android you just have to download the latest APK from the releases.
- To update the Tizen applications on the TV, you have to first uninstall one or both apps and run the installation script again (see step 3 of installation steps).

## My server (phone, pc, raspberry pi) or my TV changes their IPs, what can I do ?
- You should be able to reserve IP addresses in the DHCP options of your ISP router, so that you can keep the same IPs.  
  Note that only the android app server is impacted by the TV changing its IP.  
  If you use the regular node server (option #1), only a change of IP of this server would require you to put the new IP in the Launcher and TV's dev options, the TV can have any IP.
