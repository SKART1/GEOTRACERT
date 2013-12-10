/* 
 * @author Dariel Noa Graverán
 */

function init() {
	w = {};
	mLog = {};
	mLog.isDebugEnabled = true;
	mTitle = "Arduino Remote Control Demo";
	gRcPlugin = null;
	gCanvas = null;
	gPoint = null;

	gElements = {
		eLedBlue: $("#ledblue"),
		eLedRed: $("#ledred"),
		eLedGreen: $("#ledgreen"),
		eLedYellow: $("#ledyellow"),
		ePosition: $("#point"),
		eConnect: $("#connect_button"),
		eDisconnect: $("#disconnect_button"),
		eJoystick: document.getElementById("joystickPosition")
	};

	// Options
	// @maxLogLines: maximum number of lines that will be logged
	// @linesToDelete: quantity of lines that will be deleted from 
	// the log window each time the log exceeds the maxLogLines
	$("#log_box").log({
		maxLogLines: 500,
		linesToDelete: 20
	});
	registerEvents();
	connect();

	//Configuring tooltip as we wish
	$("[title]").tooltip({
		position: "bottom center",
		onShow: function() {
			var lTip = this.getTip();
			var lTop = ("<div class='top'></div>");
			var lMiddle = $("<div class='middle'></div>").text(lTip.text());
			var lBottom = ("<div class='bottom'></div>");
			lTip.html("").append(lTop).append(lMiddle).append(lBottom);
			this.getTrigger( ).mouseout(function( ) {
				lTip.hide( ).hide( );
			});
			this.getTrigger( ).mousemove(function( ) {
				lTip.show( );
			});
		}
	});
}

function initCanvas() {
	gCanvas = Raphael(gElements.eJoystick, 295, 295);
	gPoint = gCanvas.circle(50, 40, 10);
	gPoint.attr("fill", "yellow");
	gPoint.attr("cy", 147);
	gPoint.attr("cx", 147);

}

function registerEvents() {
	gElements.eLedBlue.click(function() {
		sendCommand(49);
	});

	gElements.eLedRed.click(function() {
		sendCommand(50);
	});
	gElements.eLedGreen.click(function() {
		sendCommand(51);
	});
	gElements.eLedYellow.click(function() {
		sendCommand(52);
	});
	gElements.eConnect.click(function() {
		connect();
	});

	gElements.eDisconnect.click(function() {
		disconnect();
	});
}

function sendCommand(aCmd) {

	if (gRcPlugin != null) {
		gRcPlugin.command({
			args: {
				cmd: parseInt(aCmd)
			},
			OnSuccess: function(aResponse) {
				//  log("Sending C2SEvent Command: {cmd:"+aCmd+"}")
				if (aResponse.message != null) {
					jwsDialog(aResponse.message + "<br><br>" +
							"Disconnect and reconnect the microcontroller, " +
							"set the port and restart the jWebSocket server.",
							mTitle, true, 'error');
				}

			}
		});
	}
	else {
		jwsDialog("Arduino Remote Control can not connect to server", mTitle, true, "warning");
	}
}

function connect() {
	if (jws.browserSupportsWebSockets()) {
		jws.myConn = new jws.jWebSocketJSONClient();
		jws.myConn.open(jws.JWS_SERVER_URL, {
			OnOpen: function() {
				log("Connect to:" + jws.JWS_SERVER_URL);
				securityFilter = new jws.SecurityFilter();
				securityFilter.OnNotAuthorized = function(aEvent) {
					console.log("Failure: NOT AUTHORIZED to notify an event with id '" + aEvent.type + "'. Logon first!");
				}
				cacheFilter = new jws.CacheFilter();
				cacheFilter.cache = new Cache();
				validatorFiler = new jws.ValidatorFilter();

				//Creating a event notifier
				notifier = new jws.EventsNotifier();
				notifier.ID = "notifier0";
				notifier.NS = "rc";
				notifier.jwsClient = jws.myConn;
				jws.user = new jws.AppUser();
				notifier.filterChain = [securityFilter, cacheFilter, validatorFiler];
				notifier.initialize();
				//Creating a plugin generator
				generator = new jws.EventsPlugInGenerator();
				gRcPlugin = generator.generate("rc", notifier, function() {
					initCanvas();
					startArduinoRemoteControl();
					gRcPlugin.ledState = function(aEvent) {
						changeledsStatus(aEvent.blue, aEvent.red, aEvent.green, aEvent.yellow);
					}

					gRcPlugin.joystickPosition = function(aEvent) {
						changePosition(aEvent.x, aEvent.y);
						//log("Receiving S2CEvent JoystickPosition: {x:"+aEvent.x+", y:"+aEvent.y+"}");                      
					}

				});
				$("#client_status").attr("class", "").addClass("online").text("connected");
			},
			OnClose: function(aEvent) {
				log("Disconnect to:" + jws.JWS_SERVER_URL);
				$("#client_status").attr("class", "").addClass("offline").text("disconnect");
				$("#client_id").text("Client-ID: " + "---");
				$("#websocket_type").text("WebSocket: " + "---");
				gRcPlugin = null;
			},
			OnMessage: function(aMessage, aData)
			{
				//console.log(aData)
				//             if(aData.type == "s2c.en" && aData._e=="joystickPosition"){
				//               log("S2C Event "+ aData._e+ "{ x:"+ aData.x + ", y:"+aData.y+" }")   
				//                 
				//             }
				//             if(aData.type == "s2c.en" && aData._e=="ledState"){
				//               log("S2C Event "+ aData._e+ "{ blue:"+ aData.blue + ", red:"+aData.red+ ", green:"+ aData.green+", yellow:"+ aData.yellow+" }")   
				//                 
				//             }
			},
			OnWelcome: function(aEvent) {

				$("#client_id").text("Client-ID: " + aEvent.sourceId);
				$("#websocket_type").text("WebSocket: " + (jws.browserSupportsNativeWebSockets ? "(native)" : "(flashbridge)"));
			}

		});
	} else {
		var lMsg = jws.MSG_WS_NOT_SUPPORTED;
		alert(lMsg);
		log(lMsg);
	}
}

function disconnect() {
	jws.myConn.close({
		timeout: 1000
	});

}

function startArduinoRemoteControl() {

	gRcPlugin.startrc({
		OnSuccess: function(aResponse) {
			if (aResponse.message != null) {
				jwsDialog(aResponse.message + "<br><br>" +
						"Disconnect and reconnect the microcontroller, set the " +
						"port and restart the jWebSocket server.", mTitle, true, "alert");
			}
		}
	});
}

function changeledsStatus(aBlue, aRed, aGreen, aYellow) {

	if (aBlue) {
		gElements.eLedBlue.removeClass("off").addClass("on");
	}
	else {
		gElements.eLedBlue.removeClass("on").addClass("off");
	}
	if (aRed) {
		gElements.eLedRed.removeClass("off").addClass("on");
	}
	else {
		gElements.eLedRed.removeClass("on").addClass("off");
	}
	if (aGreen) {
		gElements.eLedGreen.removeClass("off").addClass("on");
	}
	else {
		gElements.eLedGreen.removeClass("on").addClass("off");
	}
	if (aYellow) {
		gElements.eLedYellow.removeClass("off").addClass("on");
	}
	else {
		gElements.eLedYellow.removeClass("on").addClass("off");
	}
}

function changePosition(aX, aY) {
	//positioning value of x and y value in the center    
	var lX = 147 - (aX) * 27;
	var lY = 147 + (aY) * 27;
	var lDistance = Math.sqrt(Math.pow(147 - lX, 2) + Math.pow(147 - lY, 2));

	if (lDistance <= 138) {
		gPoint.attr("cy", lY);
		gPoint.attr("cx", lX);
	}
}

$(document).ready(function() {
	init();
});