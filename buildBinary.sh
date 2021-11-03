if ! command -v node &> /dev/null
then
    echo "node is required to build, try: apt install nodejs"
    exit
fi

if ! command -v pkg &> /dev/null
then
    echo "Installing PKG"
    npm install -g pkg
fi

rm -rf /tmp/ws-monitoring/
mkdir -p /tmp/ws-monitoring/
cp -r * /tmp/ws-monitoring/
rm -rf /tmp/ws-monitoring/helm/
rm -rf /tmp/ws-monitoring/binaries/

mkdir -p ./binaries;
rm ./binaries/cloudgate_linux_x64_93.node
rm ./binaries/ws-monitoring
rm ./binaries/ws-monitoring-linux.tar.gz

cd ./binaries;

#package cloudgate as binaries for win/osx/linux
#pkg /tmp/cloudgate/ --options max_old_space_size=4096 --targets node14-linux-x64,node14-win-x64,node14-macos-x64;
pkg /tmp/ws-monitoring/ --options max_old_space_size=4096 --targets node16-linux-x64;

#Copy cloudgate binaries for Node 13
#cp ../bin/cloudgate_win32_x64_83.node .
#cp ../bin/cloudgate_darwin_x64_83.node .
cp ../node_modules/@elestio/cloudgate/bin/cloudgate_linux_x64_93.node .

#create tar.gz
#tar -czvf cloudgate-win.tar.gz cloudgate-win.exe cloudgate_win32_x64_83.node
#tar -czvf cloudgate-osx.tar.gz cloudgate-macos cloudgate_darwin_x64_83.node
tar -czvf ws-monitoring-linux.tar.gz ws-monitoring cloudgate_linux_x64_93.node