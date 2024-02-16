@echo off
::Make sure that the root directory is right, its the default one here.
set tizen-dir=C:\tizen-studio

cd %tizen-dir%\tools
sdb devices
echo:
echo If you can't see a device list above, open this : %tizen-dir%\tools\device-manager\bin\device-ui-3.0.jar and connect to your TV and rerun the script.
echo:
echo Important!!! Make sure you copied both WGT files into %tizen-dir%
echo:
set /p userInput="Copy the name of the TV and paste it HERE (example: UE43AU7090UXXN) : "

cd ide\bin
tizen install -n %tizen-dir%\Launcher.wgt -t %userInput%
tizen install -n %tizen-dir%\TizenTube.wgt -t %userInput%
pause
