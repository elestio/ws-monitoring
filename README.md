# ws-monitoring
A simple & lightweight realtime monitoring web UI + server in Node.js

![ws-monitoring animated gif](https://cdn.terasp.net/CDN/ws-monitoring-4.gif "ws-monitoring")

Features:
 - Super light real time monitoring tool, Small CPU/RAM Usage
 - Monitor core metrics + Connections/Processes/Services/Docker/Logs
 - Easy to run once or as a service
 - Click on tiles to enable or disable graphing for a metric
 - Responsive design & Embeddable, easy to modify and customize
 - Websocket API available

&nbsp;

## Quickstart for Linux (Binary version)
### Linux one line installer: stable binary (no requirements, recommended)

    wget -O - https://github.com/elestio/ws-monitoring/raw/main/binaries/install.sh | bash

Then you can run it with this command: 

    token=MyRandomString ws-monitoring

**This version includes Node.js V14 and all the dependencies in the binary, so it can run on any linux x64 without requirements**

&nbsp;
&nbsp;


# Requirements

- Linux, Windows or Mac OS
- Node 10+ for single-threaded mode, Node 12+ for multi-threaded mode

if you are on Node 10, you can activate multi-threading by executing this in your terminal:

```bash
export NODE_OPTIONS=--experimental-worker
```


## Install Node.js 12, NPM and GIT (Debian/Ubuntu)

    sudo apt -y install curl dirmngr apt-transport-https lsb-release ca-certificates
    curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
    sudo apt -y install nodejs npm git


## Install Node.js 12, NPM and GIT (Centos)
    curl -sL https://rpm.nodesource.com/setup_12.x | sudo bash -
    sudo yum -y update
    sudo yum -y install nodejs npm git


## Clone this repository
Clone this repo then install NPM dependencies for ws-monitoring:

    git clone https://github.com/elestio/ws-monitoring.git
    cd ws-monitoring
    npm install --ignore-scripts


&nbsp;

## configure a security token in appconfig.json (Mandatory step)
To protect the access to the dashboard you have to configure a security token (any random string) in appconfig.json

```json
"websocketEndpoints": {
  "/monitoring" : {
    "src" : "./API/websocket/",
    "open": "Monitoring.open",
    "message": "Monitoring.message",
    "close": "Monitoring.close",
    "token": "XXXXXXXXXXXXXXXXXXXXXXXXXX"
  }
}
```

Replace XXXXXXXXXXXXXXXXXXXXXXXXXX by any random string (like a guid: https://www.guidgenerator.com/) then save the file.

You can also pass the security token as an ENV variable, this way to need to modify a file, this is convenient as well for docker deployment
token=Your-random-string

Eg to run ws-monitoring with a security token passed as env variable:

    token=123456789 ./run.sh

# Run ws-monitoring

## Run directly

Finally we can start WS-MONITORING Server one-time:
    
    ./run.sh

or run as a service with pm2

    npm install -g pm2
    pm2 start run.sh --name ws-monitoring
    pm2 save


# Quickstart with Docker

    docker pull elestio/ws-monitoring
    docker run -p 3000:3000 -e token=MyRandomString -v /var/run/docker.sock:/var/run/docker.sock -it elestio/ws-monitoring

Then open http://yourIP:3000/ in your browser and use "MyRandomString" as a token to authenticate


## Run with docker (local version for dev)
Run just once

    docker build -t elestio/ws-monitoring .
    docker run -p 3000:3000 --rm -v /var/run/docker.sock:/var/run/docker.sock:ro -v /var/log/:/var/log/:ro -it elestio/ws-monitoring

You can also pass the security token as env variable like this:

    docker run -p 3000:3000 --rm -e token=123456789 -v /var/run/docker.sock:/var/run/docker.sock:ro -v /var/log/:/var/log/:ro -it elestio/ws-monitoring

Run as a docker service

    docker run --name ws-monitoring -d --restart always -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock:ro -v /var/log/:/var/log/:ro -it elestio/ws-monitoring

## Run on Kubernetes
Run with helm

    helm upgrade --install ws-monitoring --namespace ws-monitoring helm/


## Once running, open in your browser
    
    http://YOUR-SERVER-IP:3000/ws-monitoring.html?token=XXXXXXXXXXXXXXXXXXXXXXXXXX&channel=global

replace XXXXXXXXXXXXXXXXXXXXXXXXXX with the security token you have configured in appconfig.json

&nbsp;

# Websocket Usage in javascript

    var shouldReconnect = true;
    var globalWS = null;
    function connect(token, channel) {

        var protocolPrefix = (window.location.protocol === 'https:') ? 'wss:' : 'ws:';
        var rootURL = protocolPrefix + '//' + location.host;
        var ws = new WebSocket(rootURL + '/monitoring?channel=' + channel + "&token=" + token);
        var nbConnectRetry = 5;
        globalWS = ws;
        ws.onopen = function() {
            nbConnectRetry = 0;
        };
        ws.onclose = function(e) {
            console.log('Socket is closed. Reconnect will be attempted in ' + nbConnectRetry + ' seconds.', e.reason);
            if (shouldReconnect){
                setTimeout(function() {
                    connect();
                }, 1000*nbConnectRetry); //backoff mechanism
            }
        };

        ws.onerror = function(err) {
            console.error('Socket encountered error: ', err.message, 'Closing socket');
            ws.close();

            nbConnectRetry += 1;
        };

        ws.onmessage = function(e) {
            console.log('Message:', e.data);
            //TODO: here handle your messages
            //if your message is in JSON you can do this
            //var msg = JSON.parse(e.data);

            //then do something with the message like updating the screen
        }
    }

    connect("YOUR_TOKEN_HERE", "global");


Once subscribed you will receive every second the core metrics

<details>
  <summary>Click to view full JSON message</summary>
	
	{
		"type": "dynamic",
		"nbConnected": 1,
		"time": {
			"current": 1609926431169,
			"uptime": 5685950,
			"timezone": "GMT+0100",
			"timezoneName": "Central European Standard Time"
		},
		"mem": {
			"total": 67543736320,
			"free": 51889246208,
			"used": 15654490112,
			"active": 3942137856,
			"available": 63601598464,
			"buffers": 1815224320,
			"cached": 9403424768,
			"slab": 1462353920,
			"buffcache": 12681003008,
			"swaptotal": 4294963200,
			"swapused": 0,
			"swapfree": 4294963200
		},
		"currentLoad": {
			"avgload": 0.04,
			"currentload": 0.819672131147541,
			"currentload_user": 0.16393442622950818,
			"currentload_system": 0.6557377049180327,
			"currentload_nice": 0,
			"currentload_idle": 99.18032786885246,
			"currentload_irq": 0,
			"raw_currentload": 1000,
			"raw_currentload_user": 200,
			"raw_currentload_system": 800,
			"raw_currentload_nice": 0,
			"raw_currentload_idle": 121000,
			"raw_currentload_irq": 0,
			"cpus": [{
				"load": 0,
				"load_user": 0,
				"load_system": 0,
				"load_nice": 0,
				"load_idle": 100,
				"load_irq": 0,
				"raw_load": 0,
				"raw_load_user": 0,
				"raw_load_system": 0,
				"raw_load_nice": 0,
				"raw_load_idle": 10100,
				"raw_load_irq": 0
			}, {
				"load": 0.9803921568627451,
				"load_user": 0.9803921568627451,
				"load_system": 0,
				"load_nice": 0,
				"load_idle": 99.01960784313727,
				"load_irq": 0,
				"raw_load": 100,
				"raw_load_user": 100,
				"raw_load_system": 0,
				"raw_load_nice": 0,
				"raw_load_idle": 10100,
				"raw_load_irq": 0
			}, {
				"load": 0.9803921568627451,
				"load_user": 0,
				"load_system": 0.9803921568627451,
				"load_nice": 0,
				"load_idle": 99.01960784313727,
				"load_irq": 0,
				"raw_load": 100,
				"raw_load_user": 0,
				"raw_load_system": 100,
				"raw_load_nice": 0,
				"raw_load_idle": 10100,
				"raw_load_irq": 0
			}, {
				"load": 0,
				"load_user": 0,
				"load_system": 0,
				"load_nice": 0,
				"load_idle": 100,
				"load_irq": 0,
				"raw_load": 0,
				"raw_load_user": 0,
				"raw_load_system": 0,
				"raw_load_nice": 0,
				"raw_load_idle": 10100,
				"raw_load_irq": 0
			}, {
				"load": 0.9803921568627451,
				"load_user": 0,
				"load_system": 0.9803921568627451,
				"load_nice": 0,
				"load_idle": 99.01960784313727,
				"load_irq": 0,
				"raw_load": 100,
				"raw_load_user": 0,
				"raw_load_system": 100,
				"raw_load_nice": 0,
				"raw_load_idle": 10100,
				"raw_load_irq": 0
			}, {
				"load": 0.9803921568627451,
				"load_user": 0,
				"load_system": 0.9803921568627451,
				"load_nice": 0,
				"load_idle": 99.01960784313727,
				"load_irq": 0,
				"raw_load": 100,
				"raw_load_user": 0,
				"raw_load_system": 100,
				"raw_load_nice": 0,
				"raw_load_idle": 10100,
				"raw_load_irq": 0
			}, {
				"load": 0.9900990099009901,
				"load_user": 0,
				"load_system": 0.9900990099009901,
				"load_nice": 0,
				"load_idle": 99.00990099009901,
				"load_irq": 0,
				"raw_load": 100,
				"raw_load_user": 0,
				"raw_load_system": 100,
				"raw_load_nice": 0,
				"raw_load_idle": 10000,
				"raw_load_irq": 0
			}, {
				"load": 1.9417475728155338,
				"load_user": 0.9708737864077669,
				"load_system": 0.9708737864077669,
				"load_nice": 0,
				"load_idle": 98.05825242718447,
				"load_irq": 0,
				"raw_load": 200,
				"raw_load_user": 100,
				"raw_load_system": 100,
				"raw_load_nice": 0,
				"raw_load_idle": 10100,
				"raw_load_irq": 0
			}, {
				"load": 0,
				"load_user": 0,
				"load_system": 0,
				"load_nice": 0,
				"load_idle": 100,
				"load_irq": 0,
				"raw_load": 0,
				"raw_load_user": 0,
				"raw_load_system": 0,
				"raw_load_nice": 0,
				"raw_load_idle": 10000,
				"raw_load_irq": 0
			}, {
				"load": 0.9900990099009901,
				"load_user": 0,
				"load_system": 0.9900990099009901,
				"load_nice": 0,
				"load_idle": 99.00990099009901,
				"load_irq": 0,
				"raw_load": 100,
				"raw_load_user": 0,
				"raw_load_system": 100,
				"raw_load_nice": 0,
				"raw_load_idle": 10000,
				"raw_load_irq": 0
			}, {
				"load": 0.9803921568627451,
				"load_user": 0,
				"load_system": 0.9803921568627451,
				"load_nice": 0,
				"load_idle": 99.01960784313727,
				"load_irq": 0,
				"raw_load": 100,
				"raw_load_user": 0,
				"raw_load_system": 100,
				"raw_load_nice": 0,
				"raw_load_idle": 10100,
				"raw_load_irq": 0
			}, {
				"load": 0.9708737864077669,
				"load_user": 0,
				"load_system": 0.9708737864077669,
				"load_nice": 0,
				"load_idle": 99.02912621359224,
				"load_irq": 0,
				"raw_load": 100,
				"raw_load_user": 0,
				"raw_load_system": 100,
				"raw_load_nice": 0,
				"raw_load_idle": 10200,
				"raw_load_irq": 0
			}]
		},
		"dockerInfo": {
			"id": "NEQ7:RQVA:DVQX:FJXN:ESWG:OBOJ:GV74:ZNKE:THST:SWVH:MSZH:SRE7",
			"containers": 16,
			"containersRunning": 1,
			"containersPaused": 0,
			"containersStopped": 15,
			"images": 69,
			"driver": "overlay2",
			"memoryLimit": true,
			"swapLimit": false,
			"kernelMemory": true,
			"cpuCfsPeriod": true,
			"cpuCfsQuota": true,
			"cpuShares": true,
			"cpuSet": true,
			"ipv4Forwarding": true,
			"bridgeNfIptables": true,
			"bridgeNfIp6tables": true,
			"debug": false,
			"nfd": 27,
			"oomKillDisable": true,
			"ngoroutines": 40,
			"systemTime": "2021-01-06T10:47:11.189511063+01:00",
			"loggingDriver": "json-file",
			"cgroupDriver": "cgroupfs",
			"nEventsListener": 0,
			"kernelVersion": "4.15.0-122-generic",
			"operatingSystem": "Ubuntu 18.04.4 LTS",
			"osType": "linux",
			"architecture": "x86_64",
			"ncpu": 12,
			"memTotal": 67543736320,
			"dockerRootDir": "/var/lib/docker",
			"httpProxy": "",
			"httpsProxy": "",
			"noProxy": "",
			"name": "vms2",
			"labels": [],
			"experimentalBuild": false,
			"serverVersion": "19.03.6",
			"clusterStore": "",
			"clusterAdvertise": "",
			"defaultRuntime": "runc",
			"liveRestoreEnabled": false,
			"isolation": "",
			"initBinary": "docker-init"
		},
		"disksIO": {
			"rIO": 45251515,
			"wIO": 53981118,
			"tIO": 99232633,
			"rIO_sec": 0,
			"wIO_sec": 0,
			"tIO_sec": 0,
			"ms": 1020
		},
		"fsStats": {
			"rx": 13100032,
			"wx": 1072349184,
			"tx": 1085449216,
			"rx_sec": 0,
			"wx_sec": 0,
			"tx_sec": 0,
			"ms": 1020
		},
		"networkStats": [{
			"iface": "enp35s0",
			"operstate": "up",
			"rx_bytes": 243632978346,
			"rx_dropped": 0,
			"rx_errors": 0,
			"tx_bytes": 189716420224,
			"tx_dropped": 0,
			"tx_errors": 0,
			"rx_sec": 38669.28361138371,
			"tx_sec": 28597.644749754665,
			"ms": 1019
		}],
		"processing": "57.917427ms"
	}
</details>
&nbsp;

you can also send messages to get more detailed informations

    function Send(txt, param) {            
        if ( globalWS.readyState != 1 ){ return; }
        txt = JSON.stringify({ EXEC_CMD: txt,  param: param });
        globalWS.send( encodeURIComponent(txt) );
    }

    //Example usage
    Send("/services");
    Send("/processes");
    Send("/docker");
    Send("/connections");
    Send("/logs", "/var/log/syslog");

&nbsp;

## How to build a custom binary file

    ./buildBinary.sh

The output will be placed in `binaries` folder

&nbsp;


# TODO List
- Configurable data retention duration
- Alert system (email + browser push)
- plugin system with support for Progress
- search/filters for processes/services/connections
- PWA
