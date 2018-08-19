// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat';

// Port where we'll run the websocket server
var webSocketsServerPort = 1337;

// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');
var fs = require('fs');
const util = require('util');
const spawn = require('child_process').spawn;
const python = spawn('python', ['random_data.py']);
 
var inputFile='./MOCK_DATA.csv';
var data_raw = fs.readFileSync(inputFile).toString();
var data_array = [];
var data = data_raw.replace(/,/g , " ").split(/\n?\s+/);
data.forEach((e) => {
    if(!isNaN(parseInt(e)))
    {
        data_array.push(e);
    }
});

var clients = [ ];

var stream = fs.createWriteStream("./MOCK_DATA.csv", {flags:'a'});
/**
 * Global variables
 */
// list of currently connected clients (users)
var clients = [ ];

var http_files = {};
[
    ["/jquery.min.js","application/javascript"],
    ["/frontend.js", "application/javascript"],
    ["/d3.min.js", "application/javascript"],
    ["/frontend.html","text/html"]
].forEach(function(fn){
    http_files[fn[0]]={
        content : fs.readFileSync('.'+fn[0]).toString(),
        contentType : fn[1]
    };
});

http_files["/"]=http_files["/frontend.html"];
http_files["/index.html"]=http_files["/frontend.html"];

/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
    
/**
 * HTTP server
 */
var server = http.createServer(function(request, response) {
    // this doubles as a way to serve the fies, and a connection for websocket to use
    var file = http_files[request.url];
    if (file) {
        response.writeHeader(200,{"content-type" : file.contentType});
        response.write(file.content);
        return response.end();
    }
    response.writeHeader(404,{"content-type" : "text/plain"});
    response.write("not found");
    return response.end();

});

server.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

/**
 * WebSocket server
 */
var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: server
});

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    var connection = request.accept(null, request.origin); 
    var index = clients.push(connection) - 1;

    console.log((new Date()) + ' Connection accepted.');
    console.log('Sending data');

    connection.sendUTF(JSON.stringify(data_array));

    // user sent some message
    connection.on('message', function(message) {

    });

    // user disconnected
    connection.on('close', function(connection) {
        console.log((new Date()) + " Peer "
            + connection.remoteAddress + " disconnected.");
        // remove user from the list of connected clients
        clients.splice(index, 1);
    });
});    


python.stdout.on('data', (data_raw) => {
    stream.write(data_raw);
    var data = data_raw.toString().replace(/,/g, " ").split(/\n?\s+/);
    for(var i = 0; i < data.length - 1; i += 2) {
        var send;
        if(i === 0){
            send = JSON.stringify([data_array[data_array.length-2], data_array[data_array.length-1], data[0], data[1]]);
        }
        else{
            send = JSON.stringify([data[i-2], data[i-1], data[i], data[i+1]]);
        }
        
        clients.forEach((e) => {
            e.sendUTF(send);
        });

        data_array.push(data[i]);
        data_array.push(data[i+1]);
    }
});

python.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

python.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
