const qs = require('querystring');
const si = require('systeminformation');

var channelCache = {};
var sharedmem = null;
var curApp = null;
var curChannel = null; //TODO: improve, only 1 channel for now

exports.open = (event, context, callback) => {

    sharedmem = context.sharedmem;
    curApp = event.app;

    //callback(null, "Message from cloudgate backend: Websocket is open, echo service is started");
    
    if ( context.apiEndpoint.token == "XXXXXXXXXXXXXXXXXXXXXXXXXX" ){
        event.ws.send("token have not been configured in appconfig.json! Fix this first!\nAccess not authorized");
        return;
    }
    
    var params = qs.parse(event.query);
    if (params.channel && params.token != null && params.token == context.apiEndpoint.token){           
        
        event.ws.token = params.token;
        event.ws.subscribe(params.channel);
        event.ws.channel = params.channel;
        
        curChannel = params.channel;
        sharedmem.incInteger("connectedUsers", 1, "ws-monitoring");
        publishStats(); //force send updated stats immediately
        SendGlobalInformations(event.ws, sharedmem) //send to the user details about never changing data (os, disk, cpu, ...)

        callback(null, JSON.stringify({ "type": "subscription", "channel": params.channel, "status": "subscribed" }));
        

        //send cached messages
        /*
        if ( channelCache[params.channel] != null ){
            for (var i = 0; i < channelCache[params.channel].length; i++){
                var cur = channelCache[params.channel][i];
                if ( cur != null ){
                    event.ws.send(cur);
                }
            }
            //event.ws.send(channelCache[params.channel].length + " items");
        }
        */
    }
    else{
        event.ws.send("Unauthorized");
    }
    
};

var lastExecProcess = null;
exports.message = async (event, context, callback) => {

    sharedmem = context.sharedmem;
    curApp = event.app;

    if ( context.apiEndpoint.token == "XXXXXXXXXXXXXXXXXXXXXXXXXX" ){
        event.ws.send("token have not been configured in appconfig.json! Fix this first!\nAccess not authorized");
        return;
    }
    if ( event.ws.token != context.apiEndpoint.token ){
        event.ws.send("Unauthorized");
        return;
    }


    //When we receive a message from the builder thread, we publish it to all subscribers
    if ( event.body != null && event.body != "" && event.body != "[HEARTBEAT]"){
        //AddToChannelCache(event.ws.channel, event.body);
        event.app.publish(event.ws.channel, event.body);
    }

    //when we receive a client command
    if ( event.body != null && event.body != "" && event.body.indexOf("EXEC_CMD") > -1){

        //exec
        var obj = JSON.parse(event.body);
        var cmd = obj.EXEC_CMD;

        //console.log("CMD: " + cmd + "\n----------------------------");

        if ( cmd == "/services" ) {
            //SendServicesInformations(event.ws);
        }
        else if ( cmd == "/processes" ) {
            //SendProcessesInformations(event.ws);
        }
        else if ( cmd == "/docker" ) {
            //SendDockerAllInformations(event.ws);
        }       
        else if ( cmd == "/connections" ) {
            //SendConnectionsInformations(event.ws);
        }       
                
    }
};

exports.close = (event, context, callback) => {

    sharedmem = context.sharedmem;
    curApp = event.app;

    // Do something like decrement number of users, close session,  ...
    
    //here your response will be discarded because the websocket 
    //is already closed at clientside when we receive this event
    //callback(null, null);

    sharedmem.incInteger("connectedUsers", -1, "ws-monitoring");
    publishStats(); //send updated stats

};

function StartStats(){
    setInterval(function(){
        if ( sharedmem != null && curApp != null && curChannel != null ){
            publishStats();
        }
    }, 1000);
}


//400ms in total
async function SendGlobalInformations(ws, sharedmem){
    
    
    
    var begin = process.hrtime();
    
    var newEvent = await getCachedGlobalInfos(sharedmem);
       
    const nanoSeconds = process.hrtime(begin).reduce((sec, nano) => sec * 1e9 + nano);
    newEvent.processing = (nanoSeconds/1000000) + "ms";

    try{
        ws.send(JSON.stringify(newEvent));
    } catch(ex){}
    
}

var cacheGlobalContent = null;
var cacheGlobalDate = null;
async function getCachedGlobalInfos(sharedmem){

    var cachedContent = sharedmem.getString("cachedGlobalContent", "ws-monitoring");
    //if ( cacheGlobalContent != null && (cacheGlobalDate + 60000) > (+new Date()) ){
    if ( cachedContent != null && cachedContent != "" ){
        //console.log("global cached");
        return JSON.parse(cachedContent);
    }
    else
    {
        //console.log("global NOT cached");

        var newEvent = { 
            "type": "global"
        };
        
        //nearly free (<1ms)
        newEvent.time = si.time();
        newEvent.mem = await si.mem();
        newEvent.currentLoad = await si.currentLoad();

        //never changing data, should be sent only once
        newEvent.cpu = await si.cpu();
        newEvent.networkInterfaces = await si.networkInterfaces();
        newEvent.fsSize = await si.fsSize();
        newEvent.diskLayout = await si.diskLayout();
        newEvent.blockDevices = await si.blockDevices(); //20ms
        newEvent.dockerInfo = await si.dockerInfo(); //5ms
        newEvent.dockerContainers = await si.dockerContainers(); //3ms
        newEvent.osInfo = await si.osInfo(); //3ms

        cacheGlobalDate = (+new Date());
        //cacheGlobalContent = newEvent;
        sharedmem.setString("cachedGlobalContent", JSON.stringify(newEvent), "ws-monitoring");

        return newEvent;
    }

}

async function SendServicesInformations(ws){
    
    var newEvent = { 
        "type": "services"
    };
    
    var begin = process.hrtime();
   
    newEvent.services = await si.services("*"); //900ms
    
    const nanoSeconds = process.hrtime(begin).reduce((sec, nano) => sec * 1e9 + nano);
    newEvent.processing = (nanoSeconds/1000000) + "ms";
    
    try{
        ws.send(JSON.stringify(newEvent));
    } catch(ex){}

}

async function SendProcessesInformations(ws){
    
    var newEvent = { 
        "type": "processes"
    };
    
    var begin = process.hrtime();
   
    newEvent.processes = await si.processes(""); //170ms
    
    const nanoSeconds = process.hrtime(begin).reduce((sec, nano) => sec * 1e9 + nano);
    newEvent.processing = (nanoSeconds/1000000) + "ms";
    
    try{
        ws.send(JSON.stringify(newEvent));
    } catch(ex){}

}

async function SendDockerAllInformations(ws){
    
    var newEvent = { 
        "type": "dockerAll"
    };
    
    var begin = process.hrtime();
   
    newEvent.dockerAll = await si.dockerAll(); //2000ms!! contains details and stats for all containers
    
    const nanoSeconds = process.hrtime(begin).reduce((sec, nano) => sec * 1e9 + nano);
    newEvent.processing = (nanoSeconds/1000000) + "ms";
    
    try{
        ws.send(JSON.stringify(newEvent));
    } catch(ex){}

}

async function SendConnectionsInformations(ws){
    
    var newEvent = { 
        "type": "networkConnections"
    };
    
    var begin = process.hrtime();
   
    newEvent.networkConnections = await si.networkConnections(); //20ms
    
    const nanoSeconds = process.hrtime(begin).reduce((sec, nano) => sec * 1e9 + nano);
    newEvent.processing = (nanoSeconds/1000000) + "ms";
    
    try{
        ws.send(JSON.stringify(newEvent));
    } catch(ex){}

}



async function publishStats(){

    if ( sharedmem.getInteger("IntervalStarted", "ws-monitoring") != 1 ){
        sharedmem.setInteger("IntervalStarted", 1, "ws-monitoring");
        StartStats();
    }

    var newEvent = { 
        "type": "dynamic",
        "nbConnected": sharedmem.getInteger("connectedUsers", "ws-monitoring")
    };
    
    var begin = process.hrtime();
    
    //nearly free (<1ms)
    newEvent.time = si.time();
    newEvent.mem = await si.mem();
    newEvent.currentLoad = await si.currentLoad();
    newEvent.dockerInfo = await si.dockerInfo(); //5ms
    //newEvent.dockerContainers = await si.dockerContainers(); //3ms

    //semi expensive, take more time, do it less often 
    newEvent.disksIO = await si.disksIO(); //20ms
    newEvent.fsStats = await si.fsStats(); //20ms
    newEvent.networkStats = await si.networkStats(); //35ms
    //newEvent.networkConnections = await si.networkConnections(); //20ms
    
    //should be used only when you are inside a sub about docker and without auto refresh
    //newEvent.processes = await si.processes(); //170ms
    //newEvent.services = await si.services("*"); //900ms
    //newEvent.dockerContainerStats = await si.dockerContainerStats("14da1429fbc34b739d72500a9091dd73d487feb82963a74ba91300ed7e28d6f2"); //1800ms
    //newEvent.dockerAll = await si.dockerAll(); //2000ms!! contains details and stats for all containers
    

    const nanoSeconds = process.hrtime(begin).reduce((sec, nano) => sec * 1e9 + nano);
    newEvent.processing = (nanoSeconds/1000000) + "ms";
    
    curApp.publish(curChannel + "", JSON.stringify(newEvent) );
}

var deduplication = {};
function AddToChannelCache(channel, body)
{
    if ( channelCache[channel] == null ){
        channelCache[channel] = [body];
    }
    else{
        if ( deduplication[channel] == null ){
            channelCache[channel].push(body);
            deduplication[channel] = {};
            deduplication[channel][body] = 1
        }
        else if ( deduplication[channel] != null && deduplication[channel][body] == null ){
            channelCache[channel].push(body);
            deduplication[channel][body] = 1
        }
    }
}