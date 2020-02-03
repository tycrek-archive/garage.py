const accountSid = "XXXXXXXX_REDACTED_XXXXXXXX";
const authToken  = "XXXXXXXX_REDACTED_XXXXXXXX";
const client = require('twilio')(accountSid, authToken);
const VoiceResponse = require('twilio').twiml.VoiceResponse;

var gpio = require('onoff').Gpio;
var cmd = require('node-cmd');
var http = require('http').createServer(handler);
var fs = require('fs');
var url = require('url');
//var io = require('socket.io')(http);

console.log("Starting server...");
http.listen(8088);


var relay = new gpio(7, 'out');


function handler(req, res) {
	console.log("Incoming call!");
	if (req.url.includes("/input")) {
		input(req, res);
	} else {
		const twiml = new VoiceResponse();
		twiml.say("Command");
		twiml.gather({
			action: '/input',
			method: 'GET',
			input: 'speech',
			speechTimeout: 2
		});

		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.end(twiml.toString());
	}
}

function input(req, res) {
	var parts = url.parse(req.url, true);
	var query = parts.query;
	console.log("/input  SpeechResult:" + query.SpeechResult);

	const twiml = new VoiceResponse();

	if (query.SpeechResult.startsWith("garage door")) {
		cmd.run('gpio write 7 0');
		setTimeout(()=>{
			cmd.run('gpio write 7 1');
		},250);
		twiml.say("Garage door toggled.");
	} else {
		twiml.say("Thank you for calling, " + query.SpeechResult);
	}
	res.writeHead(200, { 'Content-Type': 'text/html' });
	res.end(twiml.toString());
}
