# ws-monitoring
A simple & lightweight realtime monitoring web UI + server in Node.js

![ws-monitoring animated gif](https://cdn.terasp.net/CDN/ws-monitoring.gif "ws-monitoring")

Features:
 - Super light real time monitoring tool / Small CPU/RAM Usage
 - Easy to run once or as a service
 - REST & Websocket APIs (soon)
 - Responsive design
 - Embeddable

&nbsp;

# Quickstart with Docker

Run once: 

    docker pull elestio/ws-monitoring
    docker run -p 3000:3000 -it elestio/ws-monitoring

or Run as a docker service:

    docker run --name ws-monitoring -d --restart always -p 3000:3000 -it elestio/ws-monitoring

Then open http://yourIP:3000/ in your browser

&nbsp;
# Requirements

- Linux, Windows or Mac OS
- Node 10+ for single-threaded mode, Node 12+ for multi-threaded mode

if you are on Node 10, you can activate multi-threading by executing this in your terminal:

    export NODE_OPTIONS=--experimental-worker


## Install Node.js 12
    sudo apt -y install curl dirmngr apt-transport-https lsb-release ca-certificates
    curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
    sudo apt -y install nodejs

## Clone this repository
Clone this repo then install NPM dependencies for ws-monitoring:

    git clone git@github.com:elestio/ws-monitoring.git
    cd ws-monitoring
    npm install


&nbsp;

## configure a security token in appconfig.json (Mandatory step)
To protect the access to the dashboard you have to configure a security token (any random string) in appconfig.json

    "websocketEndpoints": {
    "/monitoring" : {
      "src" : "./API/websocket/",
      "open": "Monitoring.open",
      "message": "Monitoring.message",
      "close": "Monitoring.close",
      "token": "XXXXXXXXXXXXXXXXXXXXXXXXXX"
    }

Replace XXXXXXXXXXXXXXXXXXXXXXXXXX by any random string (like a guid: https://www.guidgenerator.com/) then save the file.


# Run ws-monitoring

## Run directly

Finally we can start WS-MONITORING Server one-time:
    
    ./run.sh

or 

    npm run server

## Run with docker (local version for dev)
Run just once

    docker build -t ws-monitoring .
    docker run -p 3000:3000 -it ws-monitoring

Run as a docker service

    docker run --name ws-monitoring -d --restart always -p 3000:3000 -it ws-monitoring

## Run on Kubernetes
Run with helm

    helm upgrade --install ws-monitoring --namespace ws-monitoring helm/

&nbsp;
# Usage




