#!/bin/bash
# To run this script on your Mac, run in a terminal "chmod +x install-wgt_MAC.sh" and then "./install-wgt_MAC.sh"
# Make sure that the root directory is right, it's the default one here.
tizen_dir="${HOME}/tizen-studio"

# URL to download wgt files
url="https://github.com/ThowZzy/TizenTube-Legacy/releases/latest/download"

echo "=================== WGT Download ====================="
echo "Downloading wgt files from releases..."
echo ""
curl -L "${url}/Launcher.wgt" -o "${tizen_dir}/Launcher.wgt"
curl -L "${url}/TizenTube.wgt" -o "${tizen_dir}/TizenTube.wgt"
echo "======================================================="

echo ""
echo "Type here the IP of your TV (make sure you did step 2 before) : "
read userInput
echo ""

echo ""
echo "================= Connecting to the TV ================"
cd "${tizen_dir}/tools"
./sdb connect $userInput
./sdb devices
echo "======================================================="

echo ""
echo "=========== Installing applications to the TV =========="
cd "ide/bin"
./tizen install -n "${tizen_dir}/Launcher.wgt"
./tizen install -n "${tizen_dir}/TizenTube.wgt"
echo "========================================================"

cd ../..
./sdb disconnect $userInput

echo ""
echo "The installation process is over. If all went well, you should have the Launcher and TizenTube installed on your TV."
echo ""
