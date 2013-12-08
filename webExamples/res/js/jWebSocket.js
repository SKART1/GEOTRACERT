//	<JasobNoObfs>
//	---------------------------------------------------------------------------
//	jWebSocket JavaScript/Browser Client (Community Edition, CE)
//	---------------------------------------------------------------------------
//	Copyright 2010-2013 Innotrade GmbH (jWebSocket.org)
//	Alexander Schulze, Germany (NRW)
//
//	Licensed under the Apache License, Version 2.0 (the "License");
//	you may not use this file except in compliance with the License.
//	You may obtain a copy of the License at
//
//	http://www.apache.org/licenses/LICENSE-2.0
//
//	Unless required by applicable law or agreed to in writing, software
//	distributed under the License is distributed on an "AS IS" BASIS,
//	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//	See the License for the specific language governing permissions and
//	limitations under the License.
//	---------------------------------------------------------------------------
//	</JasobNoObfs>

// ## :#file:*:jWebSocket.js
// ## :#d:en:Implements the jWebSocket Web Client.

// Firefox temporarily used MozWebSocket (why??), anyway, consider this here.
// Since the browserSupportNativeWebSocket method evaluates the existance of
// the window.WebSocket class, this abstraction needs to be done on the very top.
// please do not move this lines down.
if( window.MozWebSocket ) {
	window.WebSocket = window.MozWebSocket;
}

//:package:*:jws
//:class:*:jws
//:ancestor:*:-
//:d:en:Implements the basic "jws" name space for the jWebSocket client
//:d:en:including various utility methods.
var jws = {

	//:const:*:VERSION:String:1.0 RC1 (build 30518)
	//:d:en:Version of the jWebSocket JavaScript Client
	VERSION: "1.0 RC1 (build 30518)",

	//:const:*:NS_BASE:String:org.jwebsocket
	//:d:en:Base namespace
	NS_BASE: "org.jwebsocket",
	NS_SYSTEM: "org.jwebsocket.plugins.system",
	
	MSG_WS_NOT_SUPPORTED:
		"Unfortunately your browser does neither natively support WebSockets\n" +
		"nor you have the Adobe Flash-PlugIn 10+ installed.\n" +
		"Please download the last recent Adobe Flash Player at http://get.adobe.com/flashplayer.",

	// some namespace global constants
	
	//:const:*:CUR_TOKEN_ID:Integer:0
	//:d:en:Current token id, incremented per token exchange to assign results.
	CUR_TOKEN_ID: 0,
	//:const:*:JWS_SERVER_SCHEMA:String:ws
	//:d:en:Default schema, [tt]ws[/tt] for un-secured WebSocket-Connections.
	JWS_SERVER_SCHEMA: "ws",
	//:const:*:JWS_SERVER_SSL_SCHEMA:String:wss
	//:d:en:Default schema, [tt]wss[/tt] for secured WebSocket-Connections.
	JWS_SERVER_SSL_SCHEMA: "wss",
	//:const:*:JWS_SERVER_HOST:String:[hostname|localhost|IP-Number]
	//:d:en:Default hostname of current website or [tt]localhost|127.0.0.1[/tt] if no hostname can be detected.
	JWS_SERVER_HOST: ( self.location.hostname ? self.location.hostname : "127.0.0.1" ),
	//:const:*:JWS_SERVER_PORT:Integer:8787
	//:d:en:Default port number, 8787 for stand-alone un-secured servers, _
	//:d:en:80 for Jetty or Glassfish un-secured servers.
	JWS_SERVER_PORT: 8787,
	//:const:*:JWS_SERVER_SSL_PORT:Integer:9797
	//:d:en:Default port number, 9797 for stand-alone SSL secured servers, _
	//:d:en:443 for Jetty or Glassfish SSL secured servers.
	JWS_SERVER_SSL_PORT: 9797,
	//:const:*:JWS_SERVER_CONTEXT:String:jWebSocket
	//:d:en:Default application context in web application servers or servlet containers like Jetty or GlassFish.
	JWS_SERVER_CONTEXT: "/jWebSocket",
	//:const:*:JWS_SERVER_SERVLET:String:jWebSocket
	//:d:en:Default servlet in web application servers or servlet containers like Jetty or GlassFish.
	JWS_SERVER_SERVLET: "/jWebSocket",
	//:const:*:JWS_SERVER_URL:String:ws://[hostname]/jWebSocket/jWebSocket:8787
	//:d:en:Current token id, incremented per token exchange to assign results.
	//:@deprecated:en:Use [tt]getDefaultServerURL()[/tt] instead.
	JWS_SERVER_URL:
		"ws://" 
		+ ( self.location.hostname ? self.location.hostname : "127.0.0.1" )
		+ ":8787/jWebSocket/jWebSocket",

	//:const:*:CONNECTING:Integer:0
	//:d:en:The connection has not yet been established.
	CONNECTING: 0,
	//:const:*:OPEN:Integer:1
	//:d:en:The WebSocket connection is established and communication is possible.
	OPEN: 1,
	//:const:*:CLOSING:Integer:2
	//:d:en:The connection is going through the closing handshake.
	CLOSING: 2,
	//:const:*:CLOSED:Integer:3
	//:d:en:The connection has been closed or could not be opened.
	CLOSED: 3,

	//:const:*:RECONNECTING:Integer:1000
	//:d:en:The connection manager is trying to re-connect, but not yet connected. _
	//:d:en:This is jWebSocket specific and not part of the W3C API.
	RECONNECTING: 1000,
	//:const:*:OPEN_TIMED_OUT:Integer:1001
	//:d:en:The connection could not be established within the given timeout. _
	//:d:en:This is jWebSocket specific and not part of the W3C API.
	OPEN_TIMED_OUT: 1001,

	// Reliability options
	// Reliability Manager off (Default connection)
	RO_OFF: {
		autoReconnect : false,
		reconnectDelay: -1,
		reconnectTimeout: -1,
		queueItemLimit: -1,
		queueSizeLimit: -1
	},

	// Reliability Manager on
	RO_ON: {
		autoReconnect: true,
		reconnectDelay: 2000,
		reconnectTimeout: 30000,
		queueItemLimit: 1000,
		queueSizeLimit: 1024 * 1024 * 10 // 10 MByte
	},
	
	//:const:*:WS_SUBPROT_JSON:String:org.jwebsocket.json
	//:d:en:jWebSocket sub protocol JSON
	WS_SUBPROT_JSON: "org.jwebsocket.json",
	//:const:*:WS_SUBPROT_XML:String:org.jwebsocket.xml
	//:d:en:jWebSocket sub protocol XML
	WS_SUBPROT_XML: "org.jwebsocket.xml",
	//:const:*:WS_SUBPROT_CSV:String:org.jwebsocket.csv
	//:d:en:jWebSocket sub protocol CSV
	WS_SUBPROT_CSV: "org.jwebsocket.csv",
	//:const:*:WS_SUBPROT_CUSTOM:String:org.jwebsocket.text
	//:d:en:jWebSocket sub protocol text
	//:@deprecated:en:Use [tt]WS_SUBPROT_TEXT()[/tt] instead.
	WS_SUBPROT_CUSTOM: "org.jwebsocket.text",
	//:const:*:WS_SUBPROT_TEXT:String:org.jwebsocket.text
	//:d:en:jWebSocket sub protocol text
	WS_SUBPROT_TEXT: "org.jwebsocket.text",
	//:const:*:WS_SUBPROT_BINARY:String:org.jwebsocket.binary
	//:d:en:jWebSocket sub protocol binary
	WS_SUBPROT_BINARY: "org.jwebsocket.binary",

	//:const:*:SCOPE_PRIVATE:String:private
	//:d:en:private scope, only authenticated user can read and write his personal items
	SCOPE_PRIVATE: "private",
	//:const:*:SCOPE_PUBLIC:String:public
	//:d:en:public scope, everybody can read and write items from this scope
	SCOPE_PUBLIC: "public",

	//:const:*:DEF_RESP_TIMEOUT:Integer:30000
	//:d:en:Default timeout in milliseconds for waiting on asynchronous responses.
	//:d:en:An individual timeout can be passed per request.
	DEF_RESP_TIMEOUT: 30000,

	//:i:en:Browsertype Constants
	//:const:*:BT_UNKNOWN:Integer:0
	//:d:en:Browsertype is unknown.
	BT_UNKNOWN		:  0,
	//:const:*:BT_FIREFOX:Integer::
	//:d:en:Browser is "Firefox".
	BT_FIREFOX		:  1,
	//:const:*:BT_NETSCAPE:Integer:2
	//:d:en:Browser is "Netscape".
	BT_NETSCAPE		:  2,
	//:const:*:BT_OPERA:Integer:3
	//:d:en:Browser is "Opera".
	BT_OPERA		:  3,
	//:const:*:BT_IEXPLORER:Integer:4
	//:d:en:Browser is "Internet Explorer".
	BT_IEXPLORER	:  4,
	//:const:*:BT_SAFARI:Integer:5
	//:d:en:Browser is "Safari".
	BT_SAFARI		:  5,
	//:const:*:BT_CHROME:Integer:6
	//:d:en:Browser is "Chrome".
	BT_CHROME		: 6,

	//:const:*:BROWSER_NAMES
	//:d:en:Array of browser names. Each BT_xxx constant can be used as an index to this array.
	BROWSER_NAMES : [
		"Unknown",
		"Firefox",
		"Netscape",
		"Opera",
		"Internet Explorer",
		"Safari",
		"Chrome"
	],
	
	//:const:*:GUEST_USER_LOGINNAME:String:guest
	//:d:en:Guest user login name is "guest" (if not changed on the server).
	GUEST_USER_LOGINNAME: "guest",
	//:const:*:GUEST_USER_PASSWORD:String:guest
	//:d:en:Guest user password is "guest" (if not changed on the server).
	GUEST_USER_PASSWORD: "guest",

	//:const:*:DEMO_ADMIN_LOGINNAME:String:root
	//:d:en:Root user login name is "root" (if not changed on the server).
	//:d:en:FOR DEMO AND DEBUG PURPOSES ONLY! NEVER SAVE PRODUCTION ROOT CREDENTIALS HERE!
	DEMO_ROOT_LOGINNAME: "root",
	//:const:*:DEMO_ADMIN_PASSWORD:String:root
	//:d:en:Root user password is "root" (if not changed on the server).
	//:d:en:FOR DEMO AND DEBUG PURPOSES ONLY! NEVER SAVE PRODUCTION ROOT CREDENTIALS HERE!
	DEMO_ROOT_PASSWORD: "root",
	//:const:*:PACKET_DELIVERY_ACKNOWLEDGE_PREFIX:String:pda
	//:d:en:Prefix for delivery acknowledge packets
	PACKET_DELIVERY_ACKNOWLEDGE_PREFIX : "pda",
	//:const:*:PACKET_ID_DELIMETER:String:,
	//:d:en:Packet identifier delimeter
	PACKET_ID_DELIMETER: ",",
	//:const:*:PACKET_FRAGMENT_PREFIX:String:FRAGMENT
	//:d:en:Prefix used to sign fragmented packets
	PACKET_FRAGMENT_PREFIX: "FRAGMENT",
	//:const:*:PACKET_LAST_FRAGMENT_PREFIX:String:LFRAGMENT
	//:d:en:Prefix used to sign the last fragment on a packet fragmentation
	PACKET_LAST_FRAGMENT_PREFIX: "LFRAGMENT",
	//:const:*:MAX_FRAME_SIZE_FREFIX:String:maxframesize
	//:d:en:Prefix used on the max frame size handshake 
	MAX_FRAME_SIZE_FREFIX: "maxframesize",
	//:const:*:PACKET_TRANSACTION_MAX_BYTES_PREFIXED:Integer:31
	//:d:en:Maximum number of bytes that can be prefixed during a packet transaction
	PACKET_TRANSACTION_MAX_BYTES_PREFIXED: 31,
	
	
	//:m:*:$
	//:d:en:Convenience replacement for [tt]document.getElementById()[/tt]. _
	//:d:en:Returns the first HTML element with the given id or [tt]null[/tt] _
	//:d:en:if the element could not be found.
	//:a:en::aId:String:id of the HTML element to be returned.
	//:r:*:::void:none
	$: function( aId ) {
		return document.getElementById( aId );
	},

	//:m:*:getServerURL
	//:d:en:Returns the URL to the jWebSocket based on schema, host, port, _
	//:d:en:context and servlet.
	//:a:en::::none
	//:r:*:::String:jWebSocket server URL consisting of schema://host:port/context/servlet
	getServerURL: function( aSchema, aHost, aPort, aContext, aServlet ) {
		var lURL =
		aSchema + "://"
		+ aHost 
		+ ( aPort ? ":" + aPort : "" );
		if( aContext && aContext.length > 0 ) {
			lURL += aContext;
			if( aServlet && aServlet.length > 0 ) {
				lURL += aServlet;
			}
		}
		return lURL;
	},
	
	//:m:*:getWebAppURL
	//:d:en:Returns the WebSocket server URL for Web Apps (Tomcat, Grizzly, Jetty, etc...)
	//:a:en::aId:String:id of the HTML element to be returned.
	//:a:en::aContext:String:Context path of the Web App. The value is optional, default: self.location.pathname
	//:a:en::aServlet:String:Servlet name of the jWebSocket app. The value is optional, default: jws.JWS_SERVER_SERVLET
	//:r:*:::String:WebSocket server URL consisting of schema://host:port/context/servlet
	getWebAppURL: function(aContext, aServlet){
		var lContext = aContext || self.location.pathname;
		var lServlet = aServlet || jws.JWS_SERVER_SERVLET;
		return jws.getServerURL(
					"https" === self.location.protocol ? "wss" : "ws",
					self.location.hostname,
					self.location.port,
					lContext,
					lServlet
					);
	},

	//:m:*:getDefaultServerURL
	//:d:en:Returns the default URL to the un-secured jWebSocket Server. This is a convenience _
	//:d:en:method used in all jWebSocket demo dialogs. In case of changes to the _
	//:d:en:server URL you only need to change to above JWS_SERVER_xxx constants.
	//:a:en::::none
	//:r:*:::void:Default jWebSocket server URL consisting of schema://host:port/context/servlet
	getDefaultServerURL: function() {
		return( this.getServerURL(
			jws.JWS_SERVER_SCHEMA,
			jws.JWS_SERVER_HOST,
			jws.JWS_SERVER_PORT,
			jws.JWS_SERVER_CONTEXT,
			jws.JWS_SERVER_SERVLET
			));
	},
	
	//:m:*:getDefaultServerCometURL
	//:d:en:Returns the default comet URL to the un-secured jWebSocket Server. This is a convenience _
	//:d:en:method used in all jWebSocket demo dialogs. In case of changes to the _
	//:d:en:server URL you only need to change to above JWS_SERVER_xxx constants.
	//:a:en::::none
	//:r:*:::void:Default jWebSocket server comet URL consisting of schema://host:port/context/servlet+Comet
	getDefaultServerCometURL: function() {
		return this.getDefaultServerURL() + "Comet";
	},

	//:m:*:getDefaultSSLServerURL
	//:d:en:Returns the default URL to the secured jWebSocket Server. This is a convenience _
	//:d:en:method used in all jWebSocket demo dialogs. In case of changes to the _
	//:d:en:server URL you only need to change to above JWS_SERVER_xxx constants.
	//:a:en::::none
	//:r:*:::void:Default jWebSocket server URL consisting of schema://host:port/context/servlet
	getDefaultSSLServerURL: function() {
		return( this.getServerURL(
			jws.JWS_SERVER_SSL_SCHEMA,
			jws.JWS_SERVER_HOST,
			jws.JWS_SERVER_SSL_PORT,
			jws.JWS_SERVER_CONTEXT,
			jws.JWS_SERVER_SERVLET
			));
	},
	
	//:m:*:getDefaultSSLServerCometURL
	//:d:en:Returns the default comet URL to the secured jWebSocket Server. This is a convenience _
	//:d:en:method used in all jWebSocket demo dialogs. In case of changes to the _
	//:d:en:server URL you only need to change to above JWS_SERVER_xxx constants.
	//:a:en::::none
	//:r:*:::void:Default jWebSocket server comet URL consisting of schema://host:port/context/servlet+Comet
	getDefaultSSLServerCometURL: function() {
		return this.getDefaultSSLServerURL() + "Comet";
	},

	//:m:*:getAutoServerURL
	//:d:en:Returns the default URL to the jWebSocket Server. The schema ws/wss _
	//:d:en:is automatically selected by the http/https schema. This is a convenience _
	//:d:en:method used for the jWebSocket demo dialogs. In case of changes to the _
	//:d:en:server URL you only need to change to above JWS_SERVER_xxx constants.
	//:a:en::::none
	//:r:*:::void:Default jWebSocket server URL consisting of schema://host:port/context/servlet
	getAutoServerURL: function() {
		var lIsWSS = location.protocol && location.protocol.indexOf("https") >= 0;
		return( this.getServerURL(
			(lIsWSS ? jws.JWS_SERVER_SSL_SCHEMA : jws.JWS_SERVER_SCHEMA ),
			jws.JWS_SERVER_HOST,
			(lIsWSS ? jws.JWS_SERVER_SSL_PORT : jws.JWS_SERVER_PORT ),
			jws.JWS_SERVER_CONTEXT,
			jws.JWS_SERVER_SERVLET
			));
	},
	
	//:m:*:browserSupportsWebSockets
	//:d:en:checks if the browser or one of its plug-ins like flash or chrome _
	//:d:en:do support web sockets to be used by an application.
	//:a:en::::none
	//:r:*:::boolean:[tt]true[/tt] if the browser or one of its plug-ins support websockets, otherwise [tt]false[/tt].
	browserSupportsWebSockets: function() {
		return( 
			window.WebSocket !== null && window.WebSocket !== undefined
			);
	},
	
	//:m:*:enableCometSupportForWebSockets
	//:d:en:Sets the XHRWebSocket implementation as default WebSocket class.
	//:d:en:Uses Comet technique to provide a WebSocket simulation.
	//:a:en::::none
	enableCometSupportForWebSockets: function(){
		// setting the XHRWebSocket implementation 
		window.WebSocket = XHRWebSocket;
	},

	//:m:*:browserSupportsNativeWebSockets
	//:d:en:checks if the browser natively supports web sockets, no plug-ins
	//:d:en:are considered. Caution! This is a public field not a function!
	//:a:en::::none
	//:r:*:::boolean:[tt]true[/tt] if the browser natively support websockets, otherwise [tt]false[/tt].
	browserSupportsNativeWebSockets: (function() {
		return(
			window.WebSocket !== null && window.WebSocket !== undefined
			);
	})(),

	//:m:*:browserSupportsJSON
	//:d:en:checks if the browser natively or by JSON lib does support JSON.
	//:a:en::::none
	//:r:*:::boolean:[tt]true[/tt] if the browser or one of its plug-ins support JSON, otherwise [tt]false[/tt].
	browserSupportsJSON: function() {
		return(
			window.JSON !== null && window.JSON !== undefined
			);
	},

	//:m:*:browserSupportsNativeJSON
	//:d:en:checks if the browser natively supports JSON, no plug-ins
	//:d:en:are considered. Caution! This is a public field not a function!
	//:a:en::::none
	//:r:*:::boolean:[tt]true[/tt] if the browser natively support websockets, otherwise [tt]false[/tt].
	browserSupportsNativeJSON: (function() {
		return(
			window.JSON !== null && window.JSON !== undefined
			);
	})(),

	//:m:*:browserSupportsWebWorkers
	//:d:en:checks if the browser natively supports HTML5 WebWorkers
	//:a:en::::none
	//:r:*:::boolean:[tt]true[/tt] if the browser natively support WebWorkers, otherwise [tt]false[/tt].
	browserSupportsWebWorkers: (function() {
		return(
			window.Worker !== null && window.Worker !== undefined
			);
	})(),

	//:m:*:loadScript
	//:d:en:loads a script from a URL dynamically at run-time
	//:a:en::aURL:String:URL to java script file
	//:r:*:::void:
	loadScript: function( aURL, aOptions ) {
		if( !aOptions ) {
			aOptions = {};
		}
		var lParent = document.getElementsByTagName( "head" )[ 0 ];
		lScript = document.createElement( "script" );
		lScript.type = "text/javascript";
		if( aOptions.id ) {
			lScript.id = aOptions.id;
		}	
		lParent.appendChild( lScript );
		if( aOptions.OnSuccess ) {
			lScript.onload = aOptions.OnSuccess;
		}
		if( aOptions.OnFailure ) {
			lScript.onerror = aOptions.OnFailure;
		}
		lScript.src = aURL;
	},

	//:m:*:runAsThread
	//:d:en:checks if the browser natively supports HTML5 WebWorkers
	//:a:en::::none
	//:r:*:::boolean:[tt]true[/tt] if the browser natively support WebWorkers, otherwise [tt]false[/tt].
	runAsThread: function( aOptions ) {
		// if browser does not support WebWorkers nothing can be done here
		if ( !this.browserSupportsWebWorkers ) {
			return {
				code: -1,
				msg: "Browser does not (yet) support WebWorkers."
			};
		}
		// check if options were passed
		if( !aOptions ) {
			aOptions = {};
		}
		// set default options
		var lOnMessage = null;
		var lOnError = null;
		var lFile = jws.SCRIPT_PATH + "jwsWorker.js";
		var lMethod = null;
		var lArgs = [];
		// checked options passed
		if( aOptions.OnMessage && "function" === typeof aOptions.OnMessage ) {
			lOnMessage = aOptions.OnMessage;
		}
		if( aOptions.OnError && "function" === typeof aOptions.OnError ) {
			lOnError = aOptions.OnError;
		}
		if( aOptions.file && "String" === typeof aOptions.file ) {
			lFile = aOptions.file;
		}
		if( aOptions.method && "function" === typeof aOptions.method ) {
			lMethod = aOptions.method;
		}
		if( aOptions.args ) {
			lArgs = aOptions.args;
		}
		// TODO:
		// check lArgs for type, if needed convert to array

		var lThis = this;
		// create worker object if required
		if( !jws.worker ) {
			jws.worker = new Worker( lFile );

			// This listener is called when a message from the thread
			// to the application is posted.
			jws.worker.onmessage = function( aEvent ) {
				if( null !== lOnMessage ) {
					lOnMessage.call( lThis, {
						data: aEvent.data
					});
				}
			// console.log( "Worker message: " + JSON.stringify( aEvent.data ) );
			};

			// This listener is called when an error
			// occurred within the thread.
			jws.worker.onerror = function( aEvent ) {
				if( null !== lOnError ) {
					lOnError.call( lThis, {
						message: aEvent.message
					});
				}
			// console.log( "Worker error: " + aEvent.message );
			};
		}

		jws.worker.postMessage({
			// instance: lThis,
			method: lMethod.toString(),
			args: lArgs
		});

		return {
			code: 0,
			msg: "ok",
			worker: jws.worker
		};
	},

	SCRIPT_PATH: (function() {
		var lScripts = document.getElementsByTagName( "script" );
		for( var lIdx = 0, lCnt = lScripts.length; lIdx < lCnt; lIdx++ ) {
			var lScript = lScripts[ lIdx ];
			var lPath = lScript.src;
			if( !lPath ) {
				lPath = lScript.getAttribute( "src" );
			}
			if( lPath ) {
				var lPos = lPath.lastIndexOf( "jWebSocket" );
				if( lPos > 0 ) {
					return lPath.substr( 0, lPos );
				}
			}
		}
		return null;
	})(),

	//:m:*:isIE
	//:d:en:checks if the browser is Internet Explorer. _
	//:d:en:This is needed to switch to IE specific event model.
	//:a:en::::none
	//:r:*:::boolean:[tt]true[/tt] if the browser is IE, otherwise [tt]false[/tt].
	isIE: (function() {
		var lUserAgent = navigator.userAgent;
		var lIsIE = lUserAgent.indexOf( "MSIE" );
		return( lIsIE >= 0 );
	})(),

	//:i:de:Bei Erweiterung der Browsertypen auch BROWSER_NAMES entsprechend anpassen!

	//:m:*:getBrowserName
	//:d:en:Returns the name of the browser.
	//:a:en::::none
	//:r:en::browserName:String:Name of the used browser.
	getBrowserName: function() {
		return this.fBrowserName;
	},

	//:m:*:getBrowserVersion
	//:d:en:Returns the browser version als float value.
	//:a:en::::none
	//:r:en::browserVersion:Float:Version number of the browser.
	getBrowserVersion: function() {
		return this.fBrowserVerNo;
	},

	//:m:*:getBrowserVersionString
	//:d:en:Returns the browser version as string value.
	//:a:en::::none
	//:r:en:::String:Version string of the browser.
	getBrowserVersionString: function() {
		return this.fBrowserVerStr;
	},

	//:m:*:isFirefox
	//:d:en:Determines, if the used browser is a "Firefox".
	//:a:en::::none
	//:r:en::isFirefox:Boolean:[tt]true[/tt], if Browser is Firefox, otherwise [tt]false[/tt].
	isFirefox: function() {
		return this.fIsFirefox;
	},

	//:m:*:isOpera
	//:d:en:Determines, if the used browser is a "Opera".
	//:a:en::::none
	//:r:en::isOpera:Boolean:[tt]true[/tt], if Browser is Opera, otherwise [tt]false[/tt].
	isOpera: function() {
		return this.fIsOpera;
	},

	//:m:*:isChrome
	//:d:en:Determines, if the used browser is a "Chrome".
	//:a:en::::none
	//:r:en::isOpera:Boolean:[tt]true[/tt], if Browser is Chrome, otherwise [tt]false[/tt].
	isChrome: function() {
		return this.fIsChrome;
	},

	//:m:*:isIExplorer
	//:d:en:Determines, if the used browser is a "Internet Explorer".
	//:a:en::::none
	//:r:en::isIExplorer:Boolean:[tt]true[/tt], if Browser is Internet Explorer, otherwise [tt]false[/tt].
	isIExplorer: function() {
		return this.fIsIExplorer;
	},

	//:m:*:isIExplorer
	//:d:en:Determines, if the used browser is a "Internet Explorer" and the version number is less than or equal to 6.x.
	//:a:en::::none
	//:r:en::isIExplorer:Boolean:[tt]true[/tt], if Browser is Internet Explorer less then or equal to 6.x, otherwise [tt]false[/tt].
	isIE_LE6: function() {
		return( this.isIExplorer() && this.getBrowserVersion() < 7 );
	},

	//:m:*:isIExplorer
	//:d:en:Determines, if the used browser is a "Internet Explorer" and the version number is less than or equal to 7.x. _
	//:d:en:This is required for cross-browser-abstraction.
	//:a:en::::none
	//:r:en::isIExplorer:Boolean:[tt]true[/tt], if Browser is Internet Explorer less then or equal to 7.x, otherwise [tt]false[/tt].
	isIE_LE7: function() {
		return( this.isIExplorer() && this.getBrowserVersion() < 8 );
	},

	//:m:*:isIExplorer
	//:d:en:Determines, if the used browser is a "Internet Explorer" and the version number is greater than or equal to 8.x. _
	//:d:en:This is required for cross-browser-abstraction.
	//:a:en::::none
	//:r:en::isIExplorer:Boolean:[tt]true[/tt], if Browser is Internet Explorer greater then or equal to 8.x, otherwise [tt]false[/tt].
	isIE_GE8: function() {
		return( this.isIExplorer() && this.getBrowserVersion() >= 8 );
	},

	//:m:*:isSafari
	//:d:en:Determines, if the used browser is a "Safari".
	//:a:en::::none
	//:r:en::isSafari:Boolean:[tt]true[/tt], if Browser is Safari, otherwise [tt]false[/tt].
	isSafari: function() {
		return this.fIsSafari;
	},

	//:m:*:isNetscape
	//:d:en:Determines, if the used browser is a "Netscape".
	//:a:en::::none
	//:r:en:::Boolean:[tt]true[/tt], if Browser is Netscape, otherwise [tt]false[/tt].
	isNetscape: function() {
		return this.fIsNetscape;
	},

	//:m:*:isPocketIE
	//:d:en:Determines, if the used browser is a "Pocket Internet Explorer".
	//:a:en::::none
	//:r:en::isPocketIE:Boolean:[tt]true[/tt], if browser is Pocket Internet Explorer, otherwise [tt]false[/tt].
	isPocketIE: function() {
		return this.fIsPocketIE;
	},

	//:package:*:jws.console
	//:class:*:console
	//:ancestor:*:-
	//:d:en:Implements an abstraction wrapper around the log console of various browsers.
	console: {
		// per deploy default set isActive to false and level = 2 (info)
		mIsActive: false,
		mLevel: 2, 
		mMaxLogLineLen: 512,
		// don't use below constants here for the level but use the number!
		// They are not yet defined at this point in time!
			 
		//:const:*:ALL:integer:0
		//:d:en:Show all log output.
		ALL: 0,
		//:const:*:DEBUG:integer:1
		//:d:en:Log debug, info, warn, error and fatal output.
		DEBUG: 1,
		//:const:*:INFO:integer:2
		//:d:en:Log info, warn, error and fatal output.
		INFO: 2,
		//:const:*:WARN:integer:3
		//:d:en:Log warn, error and fatal output.
		WARN: 3,
		//:const:*:ERROR:integer:4
		//:d:en:Log error and fatal output.
		ERROR: 4,
		//:const:*:FATAL:integer:5
		//:d:en:Log fatal output only.
		FATAL: 5,
	
		//:m:*:isDebugEnabled
		//:d:en:Determines, if the debug log output is currently enabled. _
		//:d:en:A call to this method can improve performance, _
		//:d:en:since complex log output string do not need to be generated.
		//:a:en::::none
		//:r:en:::Boolean:[tt]true[/tt], if debug logs are enabled, otherwise [tt]false[/tt].
		isDebugEnabled: function() {
			return( window.console && jws.console.mIsActive
				&& jws.console.mLevel <= jws.console.DEBUG );
		},
	
		//:m:*:isInfoEnabled
		//:d:en:Determines, if the info log output is currently enabled. _
		//:d:en:A call to this method can improve performance, _
		//:d:en:since complex log output string do not need to be generated.
		//:a:en::::none
		//:r:en:::Boolean:[tt]true[/tt], if info logs are enabled, otherwise [tt]false[/tt].
		isInfoEnabled: function() {
			return( window.console && jws.console.mIsActive
				&& jws.console.mLevel <= jws.console.INFO );
		},
	
		//:m:*:log
		//:d:en:Logs the given message as non-classified message to the console.
		//:a:*::aMsg:String:Message to be logged as non-classified output.
		//:r:en:::void:none
		log: function( aMsg ) {
			if( window.console 
				&& jws.console.mIsActive
				) {
				console.log( aMsg );
			}
		},
		
		//:m:*:debug
		//:d:en:Logs the given message as debug message to the console. _
		//:d:en:If the log is not active or the log mLevel is set higher than _
		//:d:en:[tt]DEBUG[/tt] the message is suppressed.
		//:a:*::aMsg:String:Message to be logged as debug output.
		//:r:en:::void:none
		debug: function( aMsg ) {
			if( window.console
				&& jws.console.mIsActive 
				&& jws.console.mLevel <= jws.console.DEBUG
				) {
				if( console.debug ) {
					console.debug( aMsg );
				} else {
					console.log( "[debug]: " + aMsg );
				}	
			}
		},
		
		//:m:*:info
		//:d:en:Logs the given message as an info message to the console. _
		//:d:en:If the log is not active or the log mLevel is set higher than _
		//:d:en:[tt]INFO[/tt] the message is suppressed.
		//:a:*::aMsg:String:Message to be logged as an info output.
		//:r:en:::void:none
		info: function( aMsg ) {
			if( window.console 
				&& jws.console.mIsActive 
				&& jws.console.mLevel <= jws.console.INFO
				) {
				if( console.info ) {
					console.info( aMsg );
				} else {
					console.log( "[info]: " + aMsg );
				}	
			}
		},
		
		//:m:*:warn
		//:d:en:Logs the given message as a warning message to the console. _
		//:d:en:If the log is not active or the log mLevel is set higher than _
		//:d:en:[tt]WARN[/tt] the message is suppressed.
		//:a:*::aMsg:String:Message to be logged as a warning output.
		//:r:en:::void:none
		warn: function( aMsg ) {
			if( window.console
				&& jws.console.mIsActive
				&& jws.console.mLevel <= jws.console.WARN
				) {
				if( console.warn ) {
					console.warn( aMsg );
				} else {
					console.log( "[warn]: " + aMsg );
				}	
			}
		},
		
		//:m:*:error
		//:d:en:Logs the given message as an error message to the console. _
		//:d:en:If the log is not active or the log mLevel is set higher than _
		//:d:en:[tt]ERROR[/tt] the message is suppressed.
		//:a:*::aMsg:String:Message to be logged as an error output.
		//:r:en:::void:none
		error: function( aMsg ) {
			if( window.console
				&& jws.console.mIsActive
				&& jws.console.mLevel <= jws.console.ERROR
				) {
				if( console.error ) {
					console.error( aMsg );
				} else {
					console.log( "[error]: " + aMsg );
				}	
			}
		},
		
		//:m:*:fatal
		//:d:en:Logs the given message as a fatal message to the console. _
		//:d:en:If the log is not active or the log mLevel is set higher than _
		//:d:en:[tt]FATAL[/tt] the message is suppressed.
		//:a:*::aMsg:String:Message to be logged as a fatal output.
		//:r:en:::void:none
		fatal: function( aMsg ) {
			if( window.console
				&& jws.console.mIsActive
				&& jws.console.mLevel <= jws.console.FATAL
				) {
				if( console.fatal ) {
					console.fatal( aMsg );
				} else {
					console.log( "[fatal]: " + aMsg );
				}	
			}
		},
		
		//:m:*:getMaxLogLineLen
		//:d:en:Returns the maximum length of the log lines to avoid too long log output.
		//:a:en::::none
		//:r:en:::Integer:The configured maximum log line length
		getMaxLogLineLen: function() {
			return jws.console.mMaxLogLineLen; 
		},
		
		//:m:*:getLevel
		//:d:en:Returns the current log level, which should be one of the jws.console constants.
		//:a:en::::none
		//:r:en:::Integer:One of the jws.console constants ([tt]ALL[/tt], [tt]DEBUG[/tt], [tt]INFO[/tt], [tt]WARN[/tt], [tt]ERROR[/tt], [tt]FATAL[/tt]).
		getLevel: function() {
			return jws.console.mLevel; 
		},
		
		//:m:*:setLevel
		//:d:en:Specifies the log level, which should be one of the jws.console constants.
		//:a:en::aLevel:Integer:One of the jws.console constants ([tt]ALL[/tt], [tt]DEBUG[/tt], [tt]INFO[/tt], [tt]WARN[/tt], [tt]ERROR[/tt], [tt]FATAL[/tt]).
		//:r:en:::void:none
		setLevel: function( aLevel ) {
			jws.console.mLevel = aLevel;
		},
		
		//:m:*:isActive
		//:d:en:Returns if the logs are activated (turned on) or de-activated (turned off).
		//:a:en::::none
		//:r:en:::Boolean:[tt]true[/tt], if the logs are enabled, otherwise [tt]false[/tt].
		isActive: function() {
			return jws.console.mIsActive;
		},
		
		//:m:*:setActive
		//:d:en:Specifies if the logs are to be activated (turned on) or de-activated (turned off).
		//:a:en::aActive:Boolean:[tt]true[/tt], to enable the logs, otherwise [tt]false[/tt].
		//:r:en:::void:none
		setActive: function( aActive ) {
			jws.console.mIsActive = aActive;
		}
		
	}	

};


//i:en:Browser detection (embedded into a function to not polute global namespace...
(function() {

	jws.fBrowserName	= "unknown";
	jws.fBrowserType	= jws.BT_UNKNOWN;
	jws.fBrowserVerNo	= undefined;

	jws.fIsIExplorer	= false;
	jws.fIsFirefox		= false;
	jws.fIsNetscape		= false;
	jws.fIsOpera		= false;
	jws.fIsSafari		= false;
	jws.fIsChrome		= false;
	
	var lUA = navigator.userAgent;

	//:i:en:First evaluate name of the browser
	jws.fIsChrome = lUA.indexOf( "Chrome" ) >= 0;
	if( jws.fIsChrome ) {
		jws.fBrowserType = jws.BT_CHROME;
	} else {
		jws.fIsSafari = lUA.indexOf( "Safari" ) >= 0;
		if( jws.fIsSafari ) {
			jws.fBrowserType = jws.BT_SAFARI;
		}
		else {
			jws.fIsNetscape = lUA.indexOf( "Netscape" ) >= 0;
			if( jws.fIsNetscape ) {
				jws.fBrowserType = jws.BT_NETSCAPE;
			} else {
				jws.fIsFirefox = "Netscape" === navigator.appName;
				if( jws.fIsFirefox ) {
					jws.fBrowserType = jws.BT_FIREFOX;
				} else {
					jws.fIsOpera = "Opera" === navigator.appName;
					if( jws.fIsOpera ) {
						jws.fBrowserType = jws.BT_OPERA;
					} else {
						jws.fIsIExplorer = "Microsoft Internet Explorer" === navigator.appName;
						if( jws.fIsIExplorer ) {
							jws.fBrowserType = jws.BT_IEXPLORER;
						} else {
							jws.fIsPocketIE = "Microsoft Pocket Internet Explorer" === navigator.appName;
							if( jws.fIsPocketIE ) {
								jws.fBrowserType = jws.BT_IEXPLORER;
							}
						}
					}
				}
			}
		}
	}

	var p, lIdx;
	var lStr;
	var lFound;
	var lVersion;

	if( jws.fIsIExplorer ) {
		//:i:de:Beispiel f&uuml;r userAgent bei IE6:
		//:i:de:"Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322; .NET CLR 2.0.50727)"
		jws.fBrowserName = jws.BROWSER_NAMES[ jws.BT_IEXPLORER ];
		lVersion = lUA.match( /MSIE.*/i );
		if ( lVersion ) {
			lStr = lVersion[ 0 ].substr( 5 );
			p = lStr.indexOf( ";" );
			jws.fBrowserVerStr = p > 0 ? lStr.substr( 0, p ) : lStr;
			jws.fBrowserVerNo = parseFloat( jws.fBrowserVerStr );
		}
	} else if( jws.fIsFirefox ) {
		jws.fBrowserName = jws.BROWSER_NAMES[ jws.BT_FIREFOX ];
		//:i:de:Beispiel f&uuml;r userAgent bei FF 2.0.0.11:
		//:i:de:"Mozilla/5.0 (Windows; U; Windows NT 5.1; de; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11"
		lVersion = lUA.match( /Firefox\/.*/i );
		if ( lVersion ) {
			lStr = lVersion[ 0 ].substr( 8 );
			p = lStr.indexOf( " " );
			if( p > 0 ) {
				jws.fBrowserVerStr = lStr.substring( 0, p );
			} else	{
				jws.fBrowserVerStr = lStr;
			}	
			lFound = 0;
			lIdx = 0;
			while( lIdx < lStr.length ) {
				if( '.' === lStr.charAt( lIdx ) ) {
					lFound++;
				}	
				if( lFound >= 2 ) {
					break;
				}	
				lIdx++;
			}
			lStr = lStr.substring( 0, lIdx );
			jws.fBrowserVerNo = parseFloat( lStr );
		}
	}
	else if( jws.fIsNetscape ) {
		jws.fBrowserName = jws.BROWSER_NAMES[ jws.BT_NETSCAPE ];
		//:i:de:Beispiel f&uuml;r userAgent bei FF 2.0.0.11:
		//:i:de:"Mozilla/5.0 (Windows; U; Windows NT 5.1; de; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11"
		lVersion = lUA.match( /Netscape\/.*/i );
		if ( lVersion ) {
			lStr = lVersion[ 0 ].substr( 9 );
			p = lStr.indexOf( " " );
			if( p > 0 ) {
				jws.fBrowserVerStr = lStr.substring( 0, p );
			} else {
				jws.fBrowserVerStr = lStr;
			}
			lFound = 0;
			lIdx = 0;
			while( lIdx < lStr.length ) {
				if( '.' === lStr.charAt( lIdx ) ) {
					lFound++;
				}
				if( lFound >= 2 ) {
					break;
				}	
				lIdx++;
			}
			lStr = lStr.substring( 0, lIdx );
			jws.fBrowserVerNo = parseFloat( lStr );
		}
	} else if( jws.fIsOpera ) {
		//:i:de:Beispiel f&uuml;r userAgent bei Opera 9.24
		//:i:de:Opera/9.24 (Windows NT 5.1; U; en)
		jws.fBrowserName = jws.BROWSER_NAMES[ jws.BT_OPERA ];
		lVersion = lUA.match( /Opera\/.*/i );
		if ( lVersion ) {
			lStr = lVersion[ 0 ].substr( 6 );
			p = lStr.indexOf( " " );
			jws.fBrowserVerStr = p > 0 ? lStr.substr( 0, p ) : lStr;
			jws.fBrowserVerNo = parseFloat( lStr );
			// since 10.0 opera provides a separate "version" field
			lVersion = lUA.match( /Version\/.*/i );
			lStr = lVersion[ 0 ].substr( 8 );
			if ( lVersion ) {
				p = lStr.indexOf( " " );
				jws.fBrowserVerStr = ( p > 0 ? lStr.substr( 0, p ) : lStr ) + "/" + jws.fBrowserVerStr;
				jws.fBrowserVerNo = parseFloat( lStr );
			}
		}
	} else if( jws.fIsChrome ) {
		//:i:de:Beispiel f&uuml;r userAgent bei Chrome 4.0.211.7
		//:i:de:Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/532.0 (KHTML, like Gecko) Chrome/4.0.211.7 Safari/532.0
		jws.fBrowserName = jws.BROWSER_NAMES[ jws.BT_CHROME ];
		lVersion = lUA.match( /Chrome\/.*/i );
		if ( lVersion ) {
			lStr = lVersion[ 0 ].substr( 7 );
			p = lStr.indexOf( " " );
			jws.fBrowserVerStr = p > 0 ? lStr.substr( 0, p ) : lStr;
			jws.fBrowserVerNo = parseFloat( lStr );
		}
	} else if( jws.fIsSafari ) {
		jws.fBrowserName = jws.BROWSER_NAMES[ jws.BT_SAFARI ];
		//:i:de:Beispiel f&uuml;r userAgent bei Safari 3.0.4 (523.15):
		//:i:de:"Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/523.15 (KHTML, like Gecko) Version/3.0 Safari/523.15"
		lVersion = lUA.match( /Version\/.*/i );
		if ( lVersion ) {
			lStr = lVersion[ 0 ].substr( 8 );
			p = lStr.indexOf( " " );
			jws.fBrowserVerStr = p > 0 ? lStr.substr( 0, p ) : lStr;

			lFound = 0;
			lIdx = 0;
			while( lIdx < lStr.length ) {
				if( '.' === lStr.charAt( lIdx ) ) {
					lFound++;
				}	
				if( lFound >= 2 ) {
					break;
				}	
				lIdx++;
			}
			lStr = lStr.substring( 0, lIdx );
			jws.fBrowserVerNo = parseFloat( lStr );

			lVersion = lUA.match( /Safari\/.*/i );
			if ( lVersion ) {
				lStr = "." + lVersion[ 0 ].substr( 7 );
				p = lStr.indexOf( " " );
				jws.fBrowserVerStr += p > 0 ? lStr.substr( 0, p ) : lStr; 
			}
		}	
	}
}());
	

//:package:*:jws.events
//:class:*:jws.events
//:ancestor:*:-
//:d:en:Provides an event abstraction for old Internet Explorer versions. _
//:d:en:This is provided for convenience for simple applications that don't make _
//:d:en:use of high level UI/JS frameworks. If a UI or JavaScript framework is _
//:d:en:used we recommended to use the event abstraction of this framework.
jws.events = {

	//:m:*:addEventListener
	//:d:en:Adds a listener (callback) to an event in a cross-browser compatible way.
	//:a:en::aElement:Node:Source element that fires events.
	//:a:en::aEvent:String:Name of the event as a string.
	//:a:en::aListener:Function:The listener function which is called in case of the event.
	//:r:*:::void:none
	addEventListener : (
		jws.isIE ?
		function( aElement, aEvent, aListener ) {
			aElement.attachEvent( "on" + aEvent, aListener);
		}
		:
		function( aElement, aEvent, aListener ) {
			aElement.addEventListener( aEvent, aListener, false );
		}
	),

	//:m:*:removeEventListener
	//:d:en:Removes a listener (callback) from an event in a cross-browser compatible way.
	//:a:en::aElement:Node:Source element that fires events.
	//:a:en::aEvent:String:Name of the event as a string.
	//:a:en::aListener:Function:The listener function which is called in case of the event.
	removeEventListener : (
		jws.isIE ?
		function( aElement, aEvent, aListener ) {
			aElement.detachEvent( "on" + aEvent, aListener);
		}
		:
		function( aElement, aEvent, aListener ) {
			aElement.removeEventListener( aEvent, aListener, false );
		}
	),

	//:m:*:getTarget
	//:d:en:Returns the element which originally fired the event in a cross-browser compatible way.
	//:r:*:::Node:Element that originally fired the event.
	getTarget : (
		jws.isIE ?
		function( aEvent ) {
			return aEvent.srcElement;
		}
		:
		function( aEvent ) {
			return aEvent.target;
		}
	),
	
	preventDefault : (
		jws.isIE ?
		function( aEvent ) {
			aEvent = window.event;
			if( aEvent ) {
				aEvent.returnValue = false;
			}
		}
		:
		function( aEvent ) {
			return aEvent.preventDefault();
		}
	),

	stopEvent : (
		jws.isIE ?
		function( aEvent ) {
			if( aEvent && aEvent.preventDefault ) {
				return aEvent.preventDefault();
			}
		}
		:
		function( aEvent ) {
			return aEvent.stopPropagation();
		}
	)
		
};

//  <JasobNoObfs>
/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 * For full source please refer to: md5.js
 */
var hexcase=0;var b64pad="";function hex_md5(s){return rstr2hex(rstr_md5(str2rstr_utf8(s)));};function b64_md5(s){return rstr2b64(rstr_md5(str2rstr_utf8(s)));};function any_md5(s,e){return rstr2any(rstr_md5(str2rstr_utf8(s)),e);};function hex_hmac_md5(k,d){return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k),str2rstr_utf8(d)));};function b64_hmac_md5(k,d){return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k),str2rstr_utf8(d)));};function any_hmac_md5(k,d,e){return rstr2any(rstr_hmac_md5(str2rstr_utf8(k),str2rstr_utf8(d)),e);};function md5_vm_test(){return hex_md5("abc").toLowerCase()=="900150983cd24fb0d6963f7d28e17f72";};function rstr_md5(s){return binl2rstr(binl_md5(rstr2binl(s),s.length*8));};function rstr_hmac_md5(key,data){var bkey=rstr2binl(key);if(bkey.length>16)bkey=binl_md5(bkey,key.length*8);var ipad=Array(16),opad=Array(16);for(var i=0;i<16;i++){ipad[i]=bkey[i]^0x36363636;opad[i]=bkey[i]^0x5C5C5C5C;}var hash=binl_md5(ipad.concat(rstr2binl(data)),512+data.length*8);return binl2rstr(binl_md5(opad.concat(hash),512+128));};function rstr2hex(input){try{hexcase}catch(e){hexcase=0;}var hex_tab=hexcase?"0123456789ABCDEF":"0123456789abcdef";var output="";var x;for(var i=0;i<input.length;i++){x=input.charCodeAt(i);output+=hex_tab.charAt((x>>>4)&0x0F)+hex_tab.charAt(x&0x0F);}return output;};function rstr2b64(input){try{b64pad}catch(e){b64pad='';}var tab="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";var output="";var len=input.length;for(var i=0;i<len;i+=3){var triplet=(input.charCodeAt(i)<<16)|(i+1<len?input.charCodeAt(i+1)<<8:0)|(i+2<len?input.charCodeAt(i+2):0);for(var j=0;j<4;j++){if(i*8+j*6>input.length*8)output+=b64pad;else output+=tab.charAt((triplet>>>6*(3-j))&0x3F);}}return output;};function rstr2any(input,encoding){var divisor=encoding.length;var i,j,q,x,quotient;var dividend=Array(Math.ceil(input.length/2));for(i=0;i<dividend.length;i++){dividend[i]=(input.charCodeAt(i*2)<<8)|input.charCodeAt(i*2+1);}var full_length=Math.ceil(input.length*8/(Math.log(encoding.length)/Math.log(2)));var remainders=Array(full_length);for(j=0;j<full_length;j++){quotient=Array();x=0;for(i=0;i<dividend.length;i++){x=(x<<16)+dividend[i];q=Math.floor(x/divisor);x-=q*divisor;if(quotient.length>0||q>0)quotient[quotient.length]=q;}remainders[j]=x;dividend=quotient;}var output="";for(i=remainders.length-1;i>=0;i--)output+=encoding.charAt(remainders[i]);return output;};function str2rstr_utf8(input){var output="";var i= -1;var x,y;while(++i<input.length){x=input.charCodeAt(i);y=i+1<input.length?input.charCodeAt(i+1):0;if(0xD800<=x&&x<=0xDBFF&&0xDC00<=y&&y<=0xDFFF){x=0x10000+((x&0x03FF)<<10)+(y&0x03FF);i++;}if(x<=0x7F)output+=String.fromCharCode(x);else if(x<=0x7FF)output+=String.fromCharCode(0xC0|((x>>>6)&0x1F),0x80|(x&0x3F));else if(x<=0xFFFF)output+=String.fromCharCode(0xE0|((x>>>12)&0x0F),0x80|((x>>>6)&0x3F),0x80|(x&0x3F));else if(x<=0x1FFFFF)output+=String.fromCharCode(0xF0|((x>>>18)&0x07),0x80|((x>>>12)&0x3F),0x80|((x>>>6)&0x3F),0x80|(x&0x3F));}return output;};function str2rstr_utf16le(input){var output="";for(var i=0;i<input.length;i++)output+=String.fromCharCode(input.charCodeAt(i)&0xFF,(input.charCodeAt(i)>>>8)&0xFF);return output;};function str2rstr_utf16be(input){var output="";for(var i=0;i<input.length;i++)output+=String.fromCharCode((input.charCodeAt(i)>>>8)&0xFF,input.charCodeAt(i)&0xFF);return output;};function rstr2binl(input){var output=Array(input.length>>2);for(var i=0;i<output.length;i++)output[i]=0;for(var i=0;i<input.length*8;i+=8)output[i>>5]|=(input.charCodeAt(i/8)&0xFF)<<(i%32);return output;};function binl2rstr(input){var output="";for(var i=0;i<input.length*32;i+=8)output+=String.fromCharCode((input[i>>5]>>>(i%32))&0xFF);return output;};function binl_md5(x,len){x[len>>5]|=0x80<<((len)%32);x[(((len+64)>>>9)<<4)+14]=len;var a=1732584193;var b= -271733879;var c= -1732584194;var d=271733878;for(var i=0;i<x.length;i+=16){var olda=a;var oldb=b;var oldc=c;var oldd=d;a=md5_ff(a,b,c,d,x[i+0],7,-680876936);d=md5_ff(d,a,b,c,x[i+1],12,-389564586);c=md5_ff(c,d,a,b,x[i+2],17,606105819);b=md5_ff(b,c,d,a,x[i+3],22,-1044525330);a=md5_ff(a,b,c,d,x[i+4],7,-176418897);d=md5_ff(d,a,b,c,x[i+5],12,1200080426);c=md5_ff(c,d,a,b,x[i+6],17,-1473231341);b=md5_ff(b,c,d,a,x[i+7],22,-45705983);a=md5_ff(a,b,c,d,x[i+8],7,1770035416);d=md5_ff(d,a,b,c,x[i+9],12,-1958414417);c=md5_ff(c,d,a,b,x[i+10],17,-42063);b=md5_ff(b,c,d,a,x[i+11],22,-1990404162);a=md5_ff(a,b,c,d,x[i+12],7,1804603682);d=md5_ff(d,a,b,c,x[i+13],12,-40341101);c=md5_ff(c,d,a,b,x[i+14],17,-1502002290);b=md5_ff(b,c,d,a,x[i+15],22,1236535329);a=md5_gg(a,b,c,d,x[i+1],5,-165796510);d=md5_gg(d,a,b,c,x[i+6],9,-1069501632);c=md5_gg(c,d,a,b,x[i+11],14,643717713);b=md5_gg(b,c,d,a,x[i+0],20,-373897302);a=md5_gg(a,b,c,d,x[i+5],5,-701558691);d=md5_gg(d,a,b,c,x[i+10],9,38016083);c=md5_gg(c,d,a,b,x[i+15],14,-660478335);b=md5_gg(b,c,d,a,x[i+4],20,-405537848);a=md5_gg(a,b,c,d,x[i+9],5,568446438);d=md5_gg(d,a,b,c,x[i+14],9,-1019803690);c=md5_gg(c,d,a,b,x[i+3],14,-187363961);b=md5_gg(b,c,d,a,x[i+8],20,1163531501);a=md5_gg(a,b,c,d,x[i+13],5,-1444681467);d=md5_gg(d,a,b,c,x[i+2],9,-51403784);c=md5_gg(c,d,a,b,x[i+7],14,1735328473);b=md5_gg(b,c,d,a,x[i+12],20,-1926607734);a=md5_hh(a,b,c,d,x[i+5],4,-378558);d=md5_hh(d,a,b,c,x[i+8],11,-2022574463);c=md5_hh(c,d,a,b,x[i+11],16,1839030562);b=md5_hh(b,c,d,a,x[i+14],23,-35309556);a=md5_hh(a,b,c,d,x[i+1],4,-1530992060);d=md5_hh(d,a,b,c,x[i+4],11,1272893353);c=md5_hh(c,d,a,b,x[i+7],16,-155497632);b=md5_hh(b,c,d,a,x[i+10],23,-1094730640);a=md5_hh(a,b,c,d,x[i+13],4,681279174);d=md5_hh(d,a,b,c,x[i+0],11,-358537222);c=md5_hh(c,d,a,b,x[i+3],16,-722521979);b=md5_hh(b,c,d,a,x[i+6],23,76029189);a=md5_hh(a,b,c,d,x[i+9],4,-640364487);d=md5_hh(d,a,b,c,x[i+12],11,-421815835);c=md5_hh(c,d,a,b,x[i+15],16,530742520);b=md5_hh(b,c,d,a,x[i+2],23,-995338651);a=md5_ii(a,b,c,d,x[i+0],6,-198630844);d=md5_ii(d,a,b,c,x[i+7],10,1126891415);c=md5_ii(c,d,a,b,x[i+14],15,-1416354905);b=md5_ii(b,c,d,a,x[i+5],21,-57434055);a=md5_ii(a,b,c,d,x[i+12],6,1700485571);d=md5_ii(d,a,b,c,x[i+3],10,-1894986606);c=md5_ii(c,d,a,b,x[i+10],15,-1051523);b=md5_ii(b,c,d,a,x[i+1],21,-2054922799);a=md5_ii(a,b,c,d,x[i+8],6,1873313359);d=md5_ii(d,a,b,c,x[i+15],10,-30611744);c=md5_ii(c,d,a,b,x[i+6],15,-1560198380);b=md5_ii(b,c,d,a,x[i+13],21,1309151649);a=md5_ii(a,b,c,d,x[i+4],6,-145523070);d=md5_ii(d,a,b,c,x[i+11],10,-1120210379);c=md5_ii(c,d,a,b,x[i+2],15,718787259);b=md5_ii(b,c,d,a,x[i+9],21,-343485551);a=safe_add(a,olda);b=safe_add(b,oldb);c=safe_add(c,oldc);d=safe_add(d,oldd);}return Array(a,b,c,d);};function md5_cmn(q,a,b,x,s,t){return safe_add(bit_rol(safe_add(safe_add(a,q),safe_add(x,t)),s),b);};function md5_ff(a,b,c,d,x,s,t){return md5_cmn((b&c)|((~b)&d),a,b,x,s,t);};function md5_gg(a,b,c,d,x,s,t){return md5_cmn((b&d)|(c&(~d)),a,b,x,s,t);};function md5_hh(a,b,c,d,x,s,t){return md5_cmn(b^c^d,a,b,x,s,t);};function md5_ii(a,b,c,d,x,s,t){return md5_cmn(c^(b|(~d)),a,b,x,s,t);};function safe_add(x,y){var lsw=(x&0xFFFF)+(y&0xFFFF);var msw=(x>>16)+(y>>16)+(lsw>>16);return(msw<<16)|(lsw&0xFFFF);};function bit_rol(num,cnt){return(num<<cnt)|(num>>>(32-cnt));}
//  </JasobNoObfs>

// Add ECMA-262 method binding if not supported natively
if (!('lastIndexOf' in Array.prototype)) {
	//:m:*:lastIndexOf
	//:d:en:Is a recent addition to the ECMA-262 standard. This method allows _
	//:d:en:using lastIndexOf in implementations which do not natively support _
	//:d:en:it. Returns the last index at which a given element can be found _
	//:d:en:in the array, or -1 if it is not present. The array is searched _
	//:d:en:backwards, starting at aFromIndex
	//:a:en::aSearchElem:The string value to be converted to byte array
	//:a:en::aFromIndex:The index at which to start searching backwards
	//:r:*:::Number:The last index at which a given element can be found in the array
    Array.prototype.lastIndexOf = function( aSearchElem, aFromIndex /*opt*/ ) {
        if( aFromIndex === undefined ) {
			aFromIndex = this.length - 1;
		}
        if( aFromIndex < 0 ) {
			aFromIndex += this.length;
		}
        if( aFromIndex > this.length - 1 ) {
			aFromIndex = this.length - 1;
		}
        for( aFromIndex++; aFromIndex --> 0; ) {
            if( aFromIndex in this && this[ aFromIndex ] === aSearchElem ) {
                return aFromIndex;
			}
		}
        return -1;
    };
}

//:package:*:jws.tools
//:class:*:jws.tools
//:ancestor:*:-
//:d:en:Implements some required JavaScript tools.
jws.tools = {
	
	//:m:*:str2bytes
	//:d:en:Converts a string to byte array
	//:a:en::aString:String:The string value to be converted to byte array
	//:r:*:::Array:The byte array representation of the given string parameter
	str2bytes: function(aString){
		var lBytes = [];
		for (var lIndex = 0; lIndex < aString.length; lIndex++){
			lBytes.push(aString.charCodeAt(lIndex));
		}
		
		return lBytes;
	},
	
	//:m:*:bytes2str
	//:d:en:Converts a byte array to string
	//:a:en::aByteArray:Array:The byte array to be converted to string
	//:r:*:::String:The string representation of the given byte array parameter
	bytes2str: function(aByteArray){
		var lString = "";
		for (var lIndex = 0; lIndex < aByteArray.length; lIndex++){
			lString += String.fromCharCode(aByteArray[lIndex]);
		}
		
		return lString;
	},
	
	//:m:*:getUniqueInteger
	//:d:en:Gets a unique number
	//:r:*:::Integer:A unique integer number
	getUniqueInteger: function () {
		if ( undefined === this.fUniqueInteger || 2147483647 === this.fUniqueInteger ){
			this.fUniqueInteger = 1;
		}
		
		return this.fUniqueInteger++;
	},

	//:m:*:zerofill
	//:d:en:Fills up an integer value with the given number of zero characters
	//:d:en:to support a date time exchange according to ISO 8601
	//:a:en::aInt:Number:Number to be formatted.
	//:a:en::aDigits:Number:Nu,ber of digits for the result.
	//:r:*:::String:String with the exact number of digits filled with 0.
	zerofill: function( aInt, aDigits ) {
		var lRes = aInt.toFixed( 0 );
		if( lRes.length > aDigits ) {
			lRes = lRes.substring( lRes.length - aDigits );
		} else {
			while( lRes.length < aDigits ) {
				lRes = "0" + lRes;
			}
		}
		return lRes;
	},
	
	//:m:*:calcMD5
	//:d:en:Generates an MD5 hash for the given UTF-8 input String
	//:a:en::aUTF8:String:UTF-8 String to generate the MD5 hash for.
	//:r:*:::String:String (32 digits) containing the MD5 hash for the given String.
	calcMD5: function( aUTF8 ) {
		return( hex_md5( aUTF8 ) );
	},
	
	//:m:*:escapeSQL
	//:d:en:Escapes SQL queries for special SQL databases. _
	//:d:en:Since this is usally done by the database abstraction on the server _
	//:d:en:the use of this function on the client is supposed to be used in _
	//:d:en:exceptional cases only to provide abstraction which not yet _
	//:d:en:supported by the server.
	//:a:en::aSQL:String:SQL String to be escaped for SQL queries.
	//:r:*:::String:Escaped SQL String for use SQL queries.
	escapeSQL: function( aSQL ) {
		if( aSQL && typeof aValue === "string" ) {
		// escape single quotes in strings by double single quotes
		// aSQL = aSQL.replace( /[']/g, "''" );
		// here can be done further escapes as required for the particular database...
		}	
		return aSQL;
	},

	date2ISO: function( aDate ) {
		// JavaScript returns negative values for +GMT
		var lTZO = -aDate.getTimezoneOffset();
		var lAbsTZO = Math.abs( lTZO );
		var lRes =
		aDate.getUTCFullYear() 
		+ "-"
		+ this.zerofill( aDate.getUTCMonth() + 1, 2 )
		+ "-"
		+ this.zerofill( aDate.getUTCDate(), 2 )
		// use time separator
		+ "T"
		+ this.zerofill( aDate.getUTCHours(), 2 )
		+ ":"
		+ this.zerofill( aDate.getUTCMinutes(), 2 )
		+ ":"
		+ this.zerofill( aDate.getUTCSeconds(), 2 )
		+ "."
		+ this.zerofill( aDate.getUTCMilliseconds(), 3 )
		/*
			+ ( lTZO >= 0 ? "+" : "-" )
			+ this.zerofill( lAbsTZO / 60, 2 )
			+ this.zerofill( lAbsTZO % 60, 2 )
		 */
		// trailing Z means it's UTC
		+ "Z";
		return lRes;
	},

	ISO2Date: function( aISO, aTimezone ) {
		var lDate = new Date();
		// date part
		lDate.setUTCFullYear( aISO.substr( 0, 4 ) );
		lDate.setUTCMonth( aISO.substr( 5, 2 ) - 1 );
		lDate.setUTCDate( aISO.substr( 8, 2 ) );
		// time
		lDate.setUTCHours( aISO.substr( 11, 2 ) );
		lDate.setUTCMinutes( aISO.substr( 14, 2 ) );
		lDate.setUTCSeconds( aISO.substr( 17, 2 ) );
		lDate.setUTCMilliseconds( aISO.substr( 20, 3 ) );
		//:TODO:en:Analyze timezone
		return lDate;
	},

	date2String: function( aDate ) {
		var lRes =
			aDate.getUTCFullYear() 
			+ this.zerofill( aDate.getUTCMonth() + 1, 2 )
			+ this.zerofill( aDate.getUTCDate(), 2 )
			+ this.zerofill( aDate.getUTCHours(), 2 )
			+ this.zerofill( aDate.getUTCMinutes(), 2 )
			+ this.zerofill( aDate.getUTCSeconds(), 2 )
			+ this.zerofill( aDate.getUTCMilliseconds(), 2 );
		return lRes;
	},

	string2Date: function( aISO ) {
		var lDate = new Date();
		// date part
		lDate.setUTCFullYear( aISO.substr( 0, 4 ) );
		lDate.setUTCMonth( aISO.substr( 4, 2 ) - 1 );
		lDate.setUTCDate( aISO.substr( 6, 2 ) );
		// time
		lDate.setUTCHours( aISO.substr( 8, 2 ) );
		lDate.setUTCMinutes( aISO.substr( 10, 2 ) );
		lDate.setUTCSeconds( aISO.substr( 12, 2 ) );
		lDate.setUTCMilliseconds( aISO.substr( 14, 3 ) );
		return lDate;
	},
	
	generateSharedUTID: function(aToken){
		var string = JSON.stringify(aToken);
		var chars = string.split('');
		chars.sort();
		return hex_md5("{" + chars.toString() + "}");
	},

	getType: function( aObject ) {
		var lValue = aObject;
		var lRes = typeof lValue;

		// differentation between integer and float types
		if ( "number" === lRes ) {
			if( ( parseFloat( lValue ) === parseInt( lValue ) ) ){
				lRes = "integer";
			} else {
				lRes = "double";
			}
		// identification of array type
		} else if ( Object.prototype.toString.call( lValue ) === "[object Array]" ) {
			lRes = "array";
		// identification of null value for any type
		} else if ( lValue === null ) {
			lRes = "null";
		}
		return lRes;
	},
	
	isArrayOf: function( aArray, aType ){
		if ( !Ext.isArray(aArray) ){
			return false;
		}
		for ( var lIndex in aArray ){
			if (this.getType(aArray[lIndex]) !== aType){
				return false;
			}
		}
	
		return true;
	},
	
	setProperties: function(aObject, aProperties, aSubfix){
		var lSubfix = aSubfix || "";
		var lSetter = null;
		var lProp = null;
		for (lProp in aProperties){
			lSetter = "set" + lProp.substr(0, 1).toUpperCase() + lProp.substr(1);
			if ( "function" === typeof( aObject[ lSetter ] ) ) {
				aObject[lSetter](aProperties[lProp]);
			} else {
				aObject[lSubfix + lProp] = aProperties[lProp];
			}
		}
		
		return aObject;
	},
	
	zip: function( aString, aBase64Encode ) {
		if( !JSZip ) {
			throw new Error( 'JSZip library is missing. Class not found!' );
		}
		var lBase64 = aBase64Encode || false;
		var lJSZip = new JSZip();
		lJSZip.file( "temp.zip", aString );
		var lZipped = lJSZip.generate( { compression: "DEFLATE",  base64 : lBase64 } );
		
		return lZipped;
	},
	
	unzip: function( aString, aBase64Decode ) {
		if( !JSZip ) {
			throw new Error( 'JSZip library is missing. Class not found!' );
		}
		var lBase64 = aBase64Decode || false;
		var lJSZip = new JSZip( aString, { base64: lBase64 } );
		var lFile = lJSZip.file( "temp.zip" );
		
		return lFile.asBinary();
	},
	
	intersect: function( aArray1, aArray2 ) {
		var lResult = [];
		if( aArray1 && aArray2 ) {
			for( var lIndex = 0; lIndex < aArray1.length; lIndex++ ){
				if ( -1 < aArray2.lastIndexOf( aArray1[ lIndex ] ) ){
					lResult.push( aArray1[ lIndex ] );
				}
			}
		}
		return lResult;
	},
	
	clone: function(aObject){
		if( null === aObject || "object" !== typeof( aObj ) ) {
			return aObject;
		}
		
		//Supporting "clone" method
		if( "function" === typeof( aObject[ "clone" ] ) ) {
			return aObject.clone();
		}
		
		//Supporting clonation in Date objects
		if( aObject instanceof Date ){
			return new Date( aObject.getTime() );
		}
		
		//Special clone for Array objects
		var cloneArray = function( aArray ) {
			var lLength = aArray.length;
			var lCopy = [];
			if( lLength > 0 ){
				for (var lIndex = 0; lIndex < lLength; lIndex++){
					lCopy[lIndex] = jws.tools.clone(aArray[lIndex]);
				}
			}
			
			return lCopy;
		};

		var lConstructor = new aObject.constructor();
		for( var lProperty in aObject ) {
			var lValue = aObject[ lProperty ];
			if ( lValue instanceof Array )
				lConstructor[ lProperty ] = cloneArray( lValue );
			else {
				lConstructor[ lProperty ] = jws.tools.clone( lValue );
			}
		}
		return lConstructor;
	}
};

if( !jws.browserSupportsNativeWebSockets ) {
	//	<JasobNoObfs>
	// --- original code, please refer to swfobject.js in folder flash-bridge ---
	// SWFObject v2.2 <http://code.google.com/p/swfobject/> 
	// released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
	var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O.ActiveXObject!=D){try{var ad=new ActiveXObject(W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?"ActiveX":"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();
	//	</JasobNoObfs>
	
	// check if appropriate flash player version is installed
	if( swfobject.hasFlashPlayerVersion( "10.0.0" ) ) {
	
		WEB_SOCKET_DEBUG = true;
		
		// init flash bridge
		// use function to not polute the namespace with identifiers
		// get all scripts on the page to find jWebSocket.js path
		(function() {
			var lScripts = document.getElementsByTagName( "script" );
			for( var lIdx = 0, lCnt = lScripts.length; lIdx < lCnt; lIdx++ ) {
				var lScript = lScripts[ lIdx ];
				var lPath = lScript.src;
				if( !lPath ) {
					lPath = lScript.getAttribute( "src" );
				}
				if( lPath ) {
					// check for all three versions of jWebSocket.js 
					var lPos = lPath.lastIndexOf( "jWebSocket_Bundle_min.js" );
					if( lPos < 0 ) {
						lPos = lPath.lastIndexOf( "jWebSocket_Bundle.js" );
					}
					if( lPos < 0 ) {
						lPos = lPath.lastIndexOf( "jWebSocket.js" );
					}
					if( lPos > 0 ) {
						window.WEB_SOCKET_SWF_LOCATION = 
						lPath.substr( 0, lPos ) + "flash-bridge/WebSocketMain.swf";
						jws.JWS_FLASHBRIDGE = window.WEB_SOCKET_SWF_LOCATION;
						break;
					}
				}
			}
		})();
		
		if( window.WEB_SOCKET_SWF_LOCATION ) {
			//	<JasobNoObfs>
			// --- web_socket.js (minified) ---
			// Copyright: Hiroshi Ichikawa, http://gimite.net/en/, https://github.com/gimite/web-socket-js
			// License: New BSD License
			// Reference: http://dev.w3.org/html5/websockets/
			// Reference: http://tools.ietf.org/html/rfc6455
			// Full sources codes provided in web_socket.js in folder flash-bridge
			(function(){if(window.WEB_SOCKET_FORCE_FLASH){}else if(window.WebSocket){return;}else if(window.MozWebSocket){window.WebSocket=MozWebSocket;return;}var logger;if(window.WEB_SOCKET_LOGGER){logger=WEB_SOCKET_LOGGER;}else if(window.console&&window.console.log&&window.console.error){logger=window.console;}else{logger={log:function(){},error:function(){}};}if(swfobject.getFlashPlayerVersion().major<10){logger.error("Flash Player >= 10.0.0 is required.");return;}if(location.protocol=="file:"){logger.error("WARNING: web-socket-js doesn't work in file:///... URL "+"unless you set Flash Security Settings properly. "+"Open the page via Web server i.e. http://...");}window.WebSocket=function(url,protocols,proxyHost,proxyPort,headers){var self=this;self.__id=WebSocket.__nextId++;WebSocket.__instances[self.__id]=self;self.readyState=WebSocket.CONNECTING;self.bufferedAmount=0;self.__events={};if(!protocols){protocols=[];}else if(typeof protocols=="string"){protocols=[protocols];}self.__createTask=setTimeout(function(){WebSocket.__addTask(function(){self.__createTask=null;WebSocket.__flash.create(self.__id,url,protocols,proxyHost||null,proxyPort||0,headers||null);});},0);};WebSocket.prototype.send=function(data){if(this.readyState==WebSocket.CONNECTING){throw "INVALID_STATE_ERR: Web Socket connection has not been established";}var result=WebSocket.__flash.send(this.__id,encodeURIComponent(data));if(result<0){return true;}else{this.bufferedAmount+=result;return false;}};WebSocket.prototype.close=function(){if(this.__createTask){clearTimeout(this.__createTask);this.__createTask=null;this.readyState=WebSocket.CLOSED;return;}if(this.readyState==WebSocket.CLOSED||this.readyState==WebSocket.CLOSING){return;}this.readyState=WebSocket.CLOSING;WebSocket.__flash.close(this.__id);};WebSocket.prototype.addEventListener=function(type,listener,useCapture){if(!(type in this.__events)){this.__events[type]=[];}this.__events[type].push(listener);};WebSocket.prototype.removeEventListener=function(type,listener,useCapture){if(!(type in this.__events))return;var events=this.__events[type];for(var i=events.length-1;i>=0;--i){if(events[i]===listener){events.splice(i,1);break;}}};WebSocket.prototype.dispatchEvent=function(event){var events=this.__events[event.type]||[];for(var i=0;i<events.length;++i){events[i](event);}var handler=this["on"+event.type];if(handler)handler.apply(this,[event]);};WebSocket.prototype.__handleEvent=function(flashEvent){if("readyState"in flashEvent){this.readyState=flashEvent.readyState;}if("protocol"in flashEvent){this.protocol=flashEvent.protocol;}var jsEvent;if(flashEvent.type=="open"||flashEvent.type=="error"){jsEvent=this.__createSimpleEvent(flashEvent.type);}else if(flashEvent.type=="close"){jsEvent=this.__createSimpleEvent("close");jsEvent.wasClean=flashEvent.wasClean?true:false;jsEvent.code=flashEvent.code;jsEvent.reason=flashEvent.reason;}else if(flashEvent.type=="message"){var data=decodeURIComponent(flashEvent.message);jsEvent=this.__createMessageEvent("message",data);}else{throw "unknown event type: "+flashEvent.type;}this.dispatchEvent(jsEvent);};WebSocket.prototype.__createSimpleEvent=function(type){if(document.createEvent&&window.Event){var event=document.createEvent("Event");event.initEvent(type,false,false);return event;}else{return{type:type,bubbles:false,cancelable:false};}};WebSocket.prototype.__createMessageEvent=function(type,data){if(document.createEvent&&window.MessageEvent&& !window.opera){var event=document.createEvent("MessageEvent");event.initMessageEvent("message",false,false,data,null,null,window,null);return event;}else{return{type:type,data:data,bubbles:false,cancelable:false};}};WebSocket.CONNECTING=0;WebSocket.OPEN=1;WebSocket.CLOSING=2;WebSocket.CLOSED=3;WebSocket.__isFlashImplementation=true;WebSocket.__initialized=false;WebSocket.__flash=null;WebSocket.__instances={};WebSocket.__tasks=[];WebSocket.__nextId=0;WebSocket.loadFlashPolicyFile=function(url){WebSocket.__addTask(function(){WebSocket.__flash.loadManualPolicyFile(url);});};WebSocket.__initialize=function(){if(WebSocket.__initialized)return;WebSocket.__initialized=true;if(WebSocket.__swfLocation){window.WEB_SOCKET_SWF_LOCATION=WebSocket.__swfLocation;}if(!window.WEB_SOCKET_SWF_LOCATION){logger.error("[WebSocket] set WEB_SOCKET_SWF_LOCATION to location of WebSocketMain.swf");return;}if(!window.WEB_SOCKET_SUPPRESS_CROSS_DOMAIN_SWF_ERROR&& !WEB_SOCKET_SWF_LOCATION.match(/(^|\/)WebSocketMainInsecure\.swf(\?.*)?$/)&&WEB_SOCKET_SWF_LOCATION.match(/^\w+:\/\/([^\/]+)/)){var swfHost=RegExp.$1;if(location.host!=swfHost){logger.error("[WebSocket] You must host HTML and WebSocketMain.swf in the same host "+"('"+location.host+"' != '"+swfHost+"'). "+"See also 'How to host HTML file and SWF file in different domains' section "+"in README.md. If you use WebSocketMainInsecure.swf, you can suppress this message "+"by WEB_SOCKET_SUPPRESS_CROSS_DOMAIN_SWF_ERROR = true;");}}var container=document.createElement("div");container.id="webSocketContainer";container.style.position="absolute";if(WebSocket.__isFlashLite()){container.style.left="0px";container.style.top="0px";}else{container.style.left="-100px";container.style.top="-100px";}var holder=document.createElement("div");holder.id="webSocketFlash";container.appendChild(holder);document.body.appendChild(container);swfobject.embedSWF(WEB_SOCKET_SWF_LOCATION,"webSocketFlash","1","1","10.0.0",null,null,{hasPriority:true,swliveconnect:true,allowScriptAccess:"always"},null,function(e){if(!e.success){logger.error("[WebSocket] swfobject.embedSWF failed");}});};WebSocket.__onFlashInitialized=function(){setTimeout(function(){WebSocket.__flash=document.getElementById("webSocketFlash");WebSocket.__flash.setCallerUrl(location.href);WebSocket.__flash.setDebug(! !window.WEB_SOCKET_DEBUG);for(var i=0;i<WebSocket.__tasks.length;++i){WebSocket.__tasks[i]();}WebSocket.__tasks=[];},0);};WebSocket.__onFlashEvent=function(){setTimeout(function(){try{var events=WebSocket.__flash.receiveEvents();for(var i=0;i<events.length;++i){WebSocket.__instances[events[i].webSocketId].__handleEvent(events[i]);}}catch(e){logger.error(e);}},0);return true;};WebSocket.__log=function(message){logger.log(decodeURIComponent(message));};WebSocket.__error=function(message){logger.error(decodeURIComponent(message));};WebSocket.__addTask=function(task){if(WebSocket.__flash){task();}else{WebSocket.__tasks.push(task);}};WebSocket.__isFlashLite=function(){if(!window.navigator|| !window.navigator.mimeTypes){return false;}var mimeType=window.navigator.mimeTypes["application/x-shockwave-flash"];if(!mimeType|| !mimeType.enabledPlugin|| !mimeType.enabledPlugin.filename){return false;}return mimeType.enabledPlugin.filename.match(/flashlite/i)?true:false;};if(!window.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION){swfobject.addDomLoadEvent(function(){WebSocket.__initialize();});}})();
			//	</JasobNoObfs>
		}
		
	} else {
		// no Flash Player installed
		WebSocket = null;
	}
}

jws.flashBridgeVer = "n/a";
if( window.swfobject) {
	var lInfo = swfobject.getFlashPlayerVersion();
	jws.flashBridgeVer = lInfo.major + "." + lInfo.minor + "." + lInfo.release;
}

// JSON support if not provided natively by Browsetr
if( !jws.browserSupportsNativeJSON ) {
	// <JasobNoObfs>
	// This code is public domain
	// Please refer to http://json.org/js
	if(!this.JSON){this.JSON={};}(function(){function f(n){return n<10?'0'+n:n;}if(typeof Date.prototype.toJSON!=='function'){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+'-'+f(this.getUTCMonth()+1)+'-'+f(this.getUTCDate())+'T'+f(this.getUTCHours())+':'+f(this.getUTCMinutes())+':'+f(this.getUTCSeconds())+'Z':null;};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf();};}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);})+'"':'"'+string+'"';}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==='object'&&typeof value.toJSON==='function'){value=value.toJSON(key);}if(typeof rep==='function'){value=rep.call(holder,key,value);}switch(typeof value){case'string':return quote(value);case'number':return isFinite(value)?String(value):'null';case'boolean':case'null':return String(value);case'object':if(!value){return'null';}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==='[object Array]'){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||'null';}v=partial.length===0?'[]':gap?'[\n'+gap+partial.join(',\n'+gap)+'\n'+mind+']':'['+partial.join(',')+']';gap=mind;return v;}if(rep&&typeof rep==='object'){length=rep.length;for(i=0;i<length;i+=1){k=rep[i];if(typeof k==='string'){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}else{for(k in value){if(Object.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}v=partial.length===0?'{}':gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+mind+'}':'{'+partial.join(',')+'}';gap=mind;return v;}}if(typeof JSON.stringify!=='function'){JSON.stringify=function(value,replacer,space){var i;gap='';indent='';if(typeof space==='number'){for(i=0;i<space;i+=1){indent+=' ';}}else if(typeof space==='string'){indent=space;}rep=replacer;if(replacer&&typeof replacer!=='function'&&(typeof replacer!=='object'||typeof replacer.length!=='number')){throw new Error('JSON.stringify');}return str('',{'':value});};}if(typeof JSON.parse!=='function'){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==='object'){for(k in value){if(Object.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v;}else{delete value[k];}}}}return reviver.call(holder,key,value);}text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);});}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){j=eval('('+text+')');return typeof reviver==='function'?walk({'':j},''):j;}throw new SyntaxError('JSON.parse');};}}());
	// </JasobNoObfs>
}

// Base64 support 
//	<JasobNoObfs>
//	Base64 encode / decode
//  http://www.webtoolkit.info/
var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(input){var output="";var chr1,chr2,chr3,enc1,enc2,enc3,enc4;var i=0;input=Base64._utf8_encode(input);while(i<input.length){chr1=input.charCodeAt(i++);chr2=input.charCodeAt(i++);chr3=input.charCodeAt(i++);enc1=chr1>>2;enc2=((chr1&3)<<4)|(chr2>>4);enc3=((chr2&15)<<2)|(chr3>>6);enc4=chr3&63;if(isNaN(chr2)){enc3=enc4=64;}else if(isNaN(chr3)){enc4=64;}output=output+this._keyStr.charAt(enc1)+this._keyStr.charAt(enc2)+this._keyStr.charAt(enc3)+this._keyStr.charAt(enc4);}return output;},decode:function(input){var output="";var chr1,chr2,chr3;var enc1,enc2,enc3,enc4;var i=0;input=input.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(i<input.length){enc1=this._keyStr.indexOf(input.charAt(i++));enc2=this._keyStr.indexOf(input.charAt(i++));enc3=this._keyStr.indexOf(input.charAt(i++));enc4=this._keyStr.indexOf(input.charAt(i++));chr1=(enc1<<2)|(enc2>>4);chr2=((enc2&15)<<4)|(enc3>>2);chr3=((enc3&3)<<6)|enc4;output=output+String.fromCharCode(chr1);if(enc3!=64){output=output+String.fromCharCode(chr2);}if(enc4!=64){output=output+String.fromCharCode(chr3);}}output=Base64._utf8_decode(output);return output;},_utf8_encode:function(string){string=string.replace(/\r\n/g,"\n");var utftext="";for(var n=0;n<string.length;n++){var c=string.charCodeAt(n);if(c<128){utftext+=String.fromCharCode(c);}else if((c>127)&&(c<2048)){utftext+=String.fromCharCode((c>>6)|192);utftext+=String.fromCharCode((c&63)|128);}else{utftext+=String.fromCharCode((c>>12)|224);utftext+=String.fromCharCode(((c>>6)&63)|128);utftext+=String.fromCharCode((c&63)|128);}}return utftext;},_utf8_decode:function(utftext){var string="";var i=0;var c=c1=c2=0;while(i<utftext.length){c=utftext.charCodeAt(i);if(c<128){string+=String.fromCharCode(c);i++;}else if((c>191)&&(c<224)){c2=utftext.charCodeAt(i+1);string+=String.fromCharCode(((c&31)<<6)|(c2&63));i+=2;}else{c2=utftext.charCodeAt(i+1);c3=utftext.charCodeAt(i+2);string+=String.fromCharCode(((c&15)<<12)|((c2&63)<<6)|(c3&63));i+=3;}}return string;}}
//	</JasobNoObfs>


//	---------------------------------------------------------------------------
//  jWebSocket - some convenience JavaScript OOP tools
//	---------------------------------------------------------------------------
//	
//:package:*:jws
//:class:*:jws.oop
//:ancestor:*:-
//:d:en:Implements simple class declaration to support multi-level inheritance _
//:d:en:and easy 'inherited' calls (super-calls) in JavaScript
jws.oop = {};

//:m:*:declareClass
//:d:en:Declares a new JavaScript class which supports easy inheritance and _
//:d:en:super calls. This is required in the jWebSocket framework to e.g. _
//:d:en:extend the basic communication classes to the token based communication.
//:a:en::aNamespace:String:Namespace (package) of the class as a string.
//:a:en::aClassname:String:Name of the class as a string.
//:a:en::aAncestor:Class:Ancestor class (class-variables and methods are inherited)
//:a:en::aFields:Array:Array of class fields (class-variables and public methods)
//:r:*:::void:none
jws.oop.declareClass = function( aNamespace, aClassname, aAncestor, aFields ) {
	
	var lNS = self[ aNamespace ];
	if( !lNS ) { 
		self[ aNamespace ] = {};
	}
	
	var lConstructor = function() {
		if( this.create ) {
			this.create.apply( this, arguments );
			
			// introduce plug-in running in its separate name space, use a wrapper 
			// function to run the plug-in method in the context of the jWebSocket client
			var lJWSClass = this.constructor;
			// check if client instance has plug-ins
			if( lJWSClass.fPlugIns ) {
				// iterate through all plug-ins if such exist
				for( var lIdx = 0; lIdx < lJWSClass.fPlugIns.length; lIdx++ ) {
					// get plug-in class
					var lPlugIn = lJWSClass.fPlugIns[ lIdx ];
					// check if this class has a desired name space within the jws instance
					if( lPlugIn.JWS_NS ) {
						// create the jws name space
						this[ lPlugIn.JWS_NS ] = { };
						// create wrappwer methods for all methods of the plug-in
						for( lField in lPlugIn ) {
							if( "function" === typeof( lPlugIn[ lField ] ) ) {
								var lInst = this;
								var lJS = "lFunc = function() { return lPlugIn." + lField + ".apply( lInst, arguments ); }";
								this[ lPlugIn.JWS_NS ][ lField ] = eval( lJS );
							}
						}
					}
				}
			}	

		}
	};
	
	// publish the new class in the given name space
	lNS[ aClassname ] = lConstructor;

	// move all fields from spec to new class' prototype
	var lField;
	for( lField in aFields ) {
		lConstructor.prototype[ lField ] = aFields[ lField ];
	}
	if( null !== aAncestor ) {
		// every class maintains an array of its direct descendants
		if( !aAncestor.descendants ) {
			aAncestor.descendants = [];
		}
		aAncestor.descendants.push( lConstructor );
		for( lField in aAncestor.prototype ) {
			var lAncMthd = aAncestor.prototype[ lField ];
			if( typeof lAncMthd === "function" ) {
				if( lConstructor.prototype[ lField ] ) {
					lConstructor.prototype[ lField ].inherited = lAncMthd;
				} else {
					lConstructor.prototype[ lField ] = lAncMthd;
				}
				// every method gets a reference to its super class
				// to allow class to inherited method from such
				lConstructor.prototype[ lField ].superClass = aAncestor;
			}
		}
	}
};

// plug-in functionality to allow to add plug-ins into existing classes
jws.oop.addPlugIn = function( aClass, aPlugIn, aOptions ) {

	var lField;

	// if the class has no plug-ins yet, initialize array
	if( !aClass.fPlugIns ) {
		aClass.fPlugIns = [];
	}
	
	// add the plug-in to the class
	aClass.fPlugIns.push( aPlugIn );
	
	// clone all methods of the plug-in to the class
	for( lField in aPlugIn ) {
		// don't overwrite existing methods of class with plug-in methods
		// ensure that native jWebSocket methods don't get overwritten!
		if( !aClass.prototype[ lField ] ) {
			aClass.prototype[ lField ] = aPlugIn[ lField ];
		}
	}

	// if the class already has descendants recursively
	// clone the plug-in methods to these as well.
	if( aClass.descendants ) {
		for( var lIdx = 0, lCnt = aClass.descendants.length; lIdx < lCnt; lIdx ++ ) {
			jws.oop.addPlugIn( aClass.descendants[ lIdx ], aPlugIn, aOptions );
		}
	}
};


//	---------------------------------------------------------------------------
//  jWebSocket - Base Client
//  This class does not handle exceptions or error, it throws exceptions,
//  which are handled by the descendant classes.
//	---------------------------------------------------------------------------

//:package:*:jws
//:class:*:jws.jWebSocketBaseClient
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.jWebSocketBaseClient[/tt] class. _
//:d:en:This class does not handle exceptions or error, it throws exceptions, _
//:d:en:which are (have to be) handled by the descendant classes.

jws.oop.declareClass( "jws", "jWebSocketBaseClient", null, {
	registerFilters: function(){
	// method to be overwritten in descendant classes
	},
	
	create: function( aOptions ) {
		// turn off connection reliability by default
		if( !this.fReliabilityOptions ) {
			this.fReliabilityOptions = jws.RO_OFF;
		}
	},
	
	//:m:*:processOpened
	//:d:en:Called when the WebSocket connection successfully was established. _
	//:d:en:Can to be overwritten in descendant classes to process _
	//:d:en:[tt]onopen[/tt] event in descendant classes.
	//:a:en::aEvent:Object:Pending...
	//:r:*:::void:none
	processOpened: function( aEvent ) {
	// method to be overwritten in descendant classes
	},

	//:m:*:processPacket
	//:d:en:Called when a data packet was received. _
	//:d:en:Can to be overwritten in descendant classes to process _
	//:d:en:[tt]onmessage[/tt] event in descendant classes.
	//:a:en::aEvent:Object:Pending...
	//:r:*:::void:none
	processPacket: function( aEvent ) {
		return aEvent;
	},

	//:m:*:processClosed
	//:d:en:Called when the WebSocket connection was closed. _
	//:d:en:Can to be overwritten in descendant classes to process _
	//:d:en:[tt]onclose[/tt] event in descendant classes.
	//:a:en::aEvent:Object:Pending...
	//:r:*:::void:none
	processClosed: function( aEvent ) {
	// method to be overwritten in descendant classes
	},

	//:m:*:open
	//:d:en:Tries to establish a connection the jWebSocket server.
	//:a:en::aURL:String:URL to the jWebSocket Server
	//:a:en::aOptions:Object:Optional arguments, see below...
	//:a:en:aOptions:OnOpen:function:Callback when connection was successfully established.
	//:r:*:::void:none
	open: function( aURL, aOptions ) {
		if( !aOptions ) {
			aOptions = {};
		}
		// if browser natively supports WebSockets...
		// otherwise flash bridge may have embedded WebSocket class
		if( self.WebSocket ) {

			if( !this.fConn || this.fConn.readyState > 2 ) {
				var lThis = this;
				var lValue = null;

				// check if subprotocol is given
				// if not use JSON as default
				var lSubProt = jws.WS_SUBPROT_JSON;
				if( aOptions.subProtocol ) {
					lSubProt = aOptions.subProtocol;
				}
				// check if connection reliability is desired
				if( aOptions.reliabilityOptions ) {
					this.fReliabilityOptions = aOptions.reliabilityOptions;
				}
				// turn off isExplicitClose flag
				// to allow optional reconnect
				if( this.fReliabilityOptions ) {
					this.fReliabilityOptions.isExplicitClose = false;
				}
				
				// maintain own status flag
				if( jws.RECONNECTING !== this.fStatus ) {
					this.fStatus = jws.CONNECTING;
				}	
				
				if( aOptions.OnOpenTimeout
					&& "function" === typeof aOptions.OnOpenTimeout
					&& aOptions.openTimeout ) {
					this.fOpenTimeout = aOptions.openTimeout;
					this.hOpenTimeout = setTimeout( function() {
						lThis.fOpenTimeout = null;
						var aToken = {};
						aOptions.OnOpenTimeout( aToken );
					}, this.fOpenTimeout );
				}

				// create a new web socket instance
				this.fConn = new WebSocket( aURL, lSubProt );
				// save URL and sub prot for optional re-connect
				this.fURL = aURL; 
				this.fSubProt = lSubProt;
				
				// assign the listeners to local functions (closure) to allow
				// to handle event before and after the application
				this.fConn.onopen = function( aEvent ) {
					if( jws.console.isDebugEnabled() ) {
						jws.console.debug("[onopen]: " + JSON.stringify( aEvent ));
					}	
					
					// creating a map to store the incoming fragments
					lThis.fInFragments = {};
					// creating a map to store the packet delivery listeners
					lThis.fPacketDeliveryListeners = {};
					// creating a map to store the packet delivery listeners timer tasks
					lThis.fPacketDeliveryTimerTasks = {};
					
					if( lThis.hOpenTimeout ) {
						clearTimeout( lThis.hOpenTimeout );
						lThis.hOpenTimeout = null;
					}
					lThis.fStatus = jws.OPEN;
					lThis.fOpenEvent = aEvent;
				};

				this.fConn.onmessage = function( aEvent ) {
					// utility variable
					var lPos, lPID;
					
					// supporting the max frame size handshake
					if( undefined === lThis.fMaxFrameSize ) {
						lPos = aEvent.data.indexOf( jws.MAX_FRAME_SIZE_FREFIX );
						if( 0 === lPos ) {
							lThis.fMaxFrameSize = parseInt( aEvent.data.substr( jws.MAX_FRAME_SIZE_FREFIX.length ) );
							jws.events.stopEvent( aEvent );
							if( jws.console.isDebugEnabled() ) {
								jws.console.debug( "Maximum frame size for connection is: " + lThis.fMaxFrameSize );
							}
							
							// The end of the "max frame size" handshake indicates that the connection is finally opened
							lValue = lThis.processOpened( aEvent );
							// give application change to handle event
							if( aOptions.OnOpen ) {
								aOptions.OnOpen( aEvent, lValue, lThis );
							}
							// process outgoing queue
							lThis.processQueue();
							
							return;
						}
					} else if (aEvent.data.length > this.fMaxFrameSize){
							jws.events.stopEvent( aEvent );
						jws.console.warn( "Data packet discarded. The packet size " + 
							"exceeds the max frame size supported by the client!" );
						return;
					}
					
					var lPacket = aEvent.data;
					
					// processing packet delivery acknowledge from the server
					if ( 0 === lPacket.indexOf(jws.PACKET_DELIVERY_ACKNOWLEDGE_PREFIX) ){
						if ( lPacket.length <= (10 + jws.PACKET_DELIVERY_ACKNOWLEDGE_PREFIX.length) ){
							lPID = parseInt( lPacket.replace(jws.PACKET_DELIVERY_ACKNOWLEDGE_PREFIX, "") );
							clearTimeout( lThis.fPacketDeliveryTimerTasks[ lPID ] );
							
							if ( lThis.fPacketDeliveryListeners[ lPID ] ){
								// cleaning expired data and calling success
								lThis.fPacketDeliveryListeners[ lPID ].OnSuccess();
								delete lThis.fPacketDeliveryListeners[ lPID ];
								delete lThis.fPacketDeliveryTimerTasks[ lPID ];
							}
						}
						
						return;
					}
					
					// supporting packet delivery acknowledge to the server
					lPos = aEvent.data.indexOf( jws.PACKET_ID_DELIMETER );
					if ( lPos >=0 && lPos < 10 && false === isNaN( aEvent.data.substr( 0, lPos ) ) ) {
						lPID = aEvent.data.substr( 0, lPos );
						// send packet delivery acknowledge
						lThis.sendStream( jws.PACKET_DELIVERY_ACKNOWLEDGE_PREFIX + lPID );
						if( jws.console.isDebugEnabled() ) {
							jws.console.debug( "PDA sent for packet with id: " + lPID );
						}
						
						// generating the new packet
						lPacket = lPacket.substr( lPos + 1 );
						
						// supporting fragmentation
						var lFragmentContent;
						if ( 0 === lPacket.indexOf( jws.PACKET_FRAGMENT_PREFIX ) ) {
							lPos = lPacket.indexOf( jws.PACKET_ID_DELIMETER );
							lPID = lPacket.substr( jws.PACKET_FRAGMENT_PREFIX.length, 
								lPos - jws.PACKET_FRAGMENT_PREFIX.length );
							lFragmentContent = lPacket.substr( lPos + 1 );
							// storing the packet fragment
							if( undefined === lThis.fInFragments[ lPID ] ){
								lThis.fInFragments[ lPID ] = lFragmentContent;
							} else {
								lThis.fInFragments[ lPID ] += lFragmentContent;
							}
							
							// do not process packet fragments
							return;
						} else if ( 0 === lPacket.indexOf( jws.PACKET_LAST_FRAGMENT_PREFIX ) ) {
							lPos = lPacket.indexOf( jws.PACKET_ID_DELIMETER );
							lPID = lPacket.substr( jws.PACKET_LAST_FRAGMENT_PREFIX.length, 
								lPos - jws.PACKET_LAST_FRAGMENT_PREFIX.length );
							lFragmentContent = lPacket.substr( lPos + 1 );
							// storing the packet fragment
							lThis.fInFragments[ lPID ] += lFragmentContent;
							// getting the complete packet content
							lPacket = lThis.fInFragments[ lPID ];
							// removing packet data from the fragments storage 
							delete lThis.fInFragments[ lPID ];
						}
					}
					
					if( jws.console.isDebugEnabled() ) {
						var lMaxLen = jws.console.getMaxLogLineLen();
						if( lMaxLen > 0 && lPacket.length > lMaxLen ) {
							jws.console.debug( "[onmessage]: " + lPacket.substr( 0, lMaxLen ) + "..." );
						} else {
							jws.console.debug( "[onmessage]: " + lPacket );
						}	
					}
					
					// process the packet
					lValue = lThis.processPacket( lPacket );
					
					try {
						// call filter chain
						if( this.fFilters ) {
							for( var lIdx = 0, lLen = this.fFilters.length; lIdx < lLen; lIdx++ ) {
								if ( "function" === typeof this.fFilters[ lIdx ][ "filterStreamIn" ] ){
									this.fFilters[ lIdx ][ "filterStreamIn" ]( lValue );
								}
							}
						}
						
						// give application change to handle event first
						if( aOptions.OnMessage ) {
							aOptions.OnMessage( aEvent, lValue, lThis );
						}
					} catch( lEx ) {
						jws.console.error( "[onmessage]: Exception: " + lEx.message );
					}
				};

				this.fConn.onclose = function( aEvent ) {
					if( jws.console.isDebugEnabled() ) {
						jws.console.debug("[onclose]: " + JSON.stringify( aEvent ));
					}	
					if( lThis.hOpenTimeout ) {
						clearTimeout( lThis.hOpenTimeout );
						lThis.hOpenTimeout = null;
					}
					lThis.fStatus = jws.CLOSED;
					delete lThis.fMaxFrameSize;
					
					// check if still disconnect timeout active and clear if needed
					if( lThis.hDisconnectTimeout ) {
						clearTimeout( lThis.hDisconnectTimeout );
						delete lThis.hDisconnectTimeout;
					}
					lValue = lThis.processClosed( aEvent );
					// give application chance to handle event
					if( aOptions.OnClose ) {
						aOptions.OnClose( aEvent, lValue, lThis );
					}
					lThis.fConn = null;
					
					// connection was closed, 
					// check if auto-reconnect was configured
					if( lThis.fReliabilityOptions 
						&& lThis.fReliabilityOptions.autoReconnect 
						&& !lThis.fReliabilityOptions.isExplicitClose ) {
						
						lThis.fStatus = jws.RECONNECTING;
						
						lThis.hReconnectDelayTimeout = setTimeout(
							function() {
								if( aOptions.OnReconnecting ) {
									aOptions.OnReconnecting( aEvent, lValue, lThis );
								}
								lThis.open( lThis.fURL, aOptions );
							},
							lThis.fReliabilityOptions.reconnectDelay );
					}
				};

			} else {
				throw new Error( "Already connected" );
			}
		} else {
			throw new Error( "WebSockets not supported by browser" );
		}
	},

	//:m:*:connect
	//:a:en::aURL:String:Please refer to [tt]open[/tt] method.
	//:a:en::aOptions:Object:Please refer to [tt]open[/tt] method.
	//:r:*:::void:none
	connect: function( aURL, aOptions ) {
		return this.open(aURL, aOptions );
	},

	//:m:*:processQueue
	//:d:en:Processes the token queue. _
	//:d:en:Tries to send out all tokens stored in the quere
	//:a:en::::-
	//:r:*:::void:none
	processQueue: function() {
		// is there a queue at all?
		if( this.fOutQueue ) {
			var lRes = this.checkConnected();
			if( 0 === lRes.code ) {
				var lItem;
				while( this.fOutQueue.length > 0 ) {
					// get first element of the queue
					lItem = this.fOutQueue.shift();
					// and send it to the server
					this.fConn.send( lItem.packet );
				}
			}
		}
	// if no queue exists nothing needs to be done here.
	},

	//:m:*:queuePacket
	//:d:en:Adds a new token to the send queue
	//:d:en:this method can also be executed, if no connection is established
	//:a:en::aToken:Object:Token to be queued to the jWebSocket server.
	//:a:en::aOptions:Object:Optional arguments as listed below...
	//:a:en:aOptions:OnResponse:Function:Reference to callback function, which is called when the response is received.
	//:r:*:::void:none
	queuePacket: function( aPacket, aOptions ) {
		if( !this.fOutQueue ) {
			this.fOutQueue = [];
		}
		this.fOutQueue.push({
			packet: aPacket,
			options: aOptions
		});
	},

	//:m:*:sendStream
	//:d:en:Sends a given string (packet) to the jWebSocket Server. The methods checks _
	//:d:en:if the connection is still up and throws an exception if not.
	//:a:en::aData:String:String to be send the jWebSocketServer
	//:r:*:::void:none
	sendStream: function( aData ) {
		if (aData.length > this.fMaxFrameSize){
			throw new Error( "Data packet discarded. The packet size " + 
				"exceeds the max frame size supported by the client!" );
		}
		
		// is client already connected
		if( this.isOpened() ) {
			try {
				// call filter chain
				if( this.fFilters ) {
					for( var lIdx = 0, lLen = this.fFilters.length; lIdx < lLen; lIdx++ ) {
						if ( "function" === typeof this.fFilters[ lIdx ]["filterStreamOut"] ){
							this.fFilters[ lIdx ]["filterStreamOut"]( aData );
						}
					}
				}
				
				// send data
				this.fConn.send( aData );
			} catch( lEx ) {
				// this is never fired !
				jws.console.error( "[sendStream]: Exception on send: " + lEx.message );
			}
		} else {
			if( this.isWriteable() ) {
				this.queuePacket( aData, null );
			} else {
				// if not raise exception
				throw new Error( "Not connected" );
			}	
		}
	},
	
	//:m:*:sendStream
	//:d:en:Sends a given string (packet) to the jWebSocket Server. The methods checks _
	//:d:en:if the connection is still up and throws an exception if not.
	//:a:en::aData:String:String to be send the jWebSocketServer
	//:a:en::aListener:Object:A packet delivery listener
	//:a:en:aListener:getTimeout:function:Returns the transaction timeout
	//:a:en:aListener:OnTimeout:function:Called if the packet delivery has timed out
	//:a:en:aListener:OnSuccess:function:Called if the packet has been delivered successfully 
	//:a:en:aListener:OnFailure:function:Called if the packet delivery has failed
	//:a:en::aFragmentSize:Integer:The size of the packet fragments if fragmentation is required. Default value is connection max frame size value.
	//:r:*:::void:none
	sendStreamInTransaction: function ( aData, aListener, aFragmentSize){
		var lPID = jws.tools.getUniqueInteger();
		var lThis = this;
		
		try {
			if ( undefined === aFragmentSize ){
				aFragmentSize = this.fMaxFrameSize;
			} else if ( aFragmentSize < 0 || aFragmentSize > this.fMaxFrameSize ) {
				throw new Error("Invalid 'fragment size' argument. " 
					+ "Expected value: fragment_size > 0 && fragment_size <= max_frame_size");
			}
		
			if ( typeof( aData ) !== "string" || aData.length === 0 ) {
				throw new Error("Invalid value for argument 'data'!");
			}
			if ( typeof( aListener ) !== "object" ) {
				throw new Error("Invalid value for argument 'listener'!");
			}
			if ( typeof( aListener["getTimeout"] ) !== "function" ) {
				throw new Error("Missing 'getTimeout' method on argument 'listener'!");
			}
			if ( typeof( aListener["OnSuccess"] ) !== "function" ) {
				throw new Error("Missing 'OnSuccess' method on argument 'listener'!");
			}
			if ( typeof( aListener["OnTimeout"] ) !== "function" ) {
				throw new Error("Missing 'OnTimeout' method on argument 'listener'!");
			}
			if ( typeof( aListener["OnFailure"] ) !== "function" ) {
				throw new Error("Missing 'OnFailure' method on argument 'listener'!");
			}
			
			// generating packet prefix
			var lPacketPrefix = lPID + jws.PACKET_ID_DELIMETER;
		
			// processing fragmentation
			if ( aFragmentSize < this.fMaxFrameSize && aFragmentSize < aData.length ){
				
				// first fragment is never the last
				var lIsLast = false; 
				// fragmentation id, allows multiplexing
				var lFragmentationId = jws.tools.getUniqueInteger();
				// prefix the packet for fragmentation
				var lFragmentedPacket = jws.PACKET_FRAGMENT_PREFIX 
				+ lFragmentationId 
				+ jws.PACKET_ID_DELIMETER 
				+ aData.substr( 0, aFragmentSize );
				
				if ( lFragmentedPacket.length + lPacketPrefix.length > this.fMaxFrameSize ){
					throw new Error( "The packet size exceeds the max frame size supported by the client! "
						+ "Consider that the packet has been prefixed with "
						+ ( lFragmentedPacket.length + lPacketPrefix.length - aData.length )
						+ " bytes for fragmented transaction.");
				}
				
				this.sendStreamInTransaction ( lFragmentedPacket, {
					fOriginPacket: aData,
					fOriginFragmentSize: aFragmentSize,
					fOriginListener: aListener,
					fSentTime: new Date().getTime(),
					fFragmentationId: lFragmentationId,
					fBytesSent: 0,
					
					getTimeout: function (){
						var lTimeout = this.fSentTime + this.fOriginListener.getTimeout() - new Date().getTime();
						if (lTimeout < 0) {
							lTimeout = 0;
						}

						return lTimeout;
					}, 
					
					OnTimeout: function (){
						this.fOriginListener.OnTimeout();
					},
					
					OnSuccess: function (){
						// updating bytes sent
						this.fBytesSent += this.fOriginFragmentSize;
						if ( this.fBytesSent >= this.fOriginPacket.length ) {
							// calling success if the packet was transmitted complete
							this.fOriginListener.OnSuccess();
						} else {
							// prepare to sent a next fragment
							var lLength = ( this.fOriginFragmentSize + this.fBytesSent <= this.fOriginPacket.length )
							? this.fOriginFragmentSize : this.fOriginPacket.length - this.fBytesSent;

							var lNextFragment = this.fOriginPacket.substr( this.fBytesSent, lLength );
							var lIsLast = ( lLength + this.fBytesSent === this.fOriginPacket.length ) ? true : false;
					
							// prefixing next fragment
							lNextFragment = ( ( lIsLast ) ? jws.PACKET_LAST_FRAGMENT_PREFIX : jws.PACKET_FRAGMENT_PREFIX )
							+ this.fFragmentationId 
							+ jws.PACKET_ID_DELIMETER 
							+ lNextFragment;
						
							// send fragment
							lThis.sendStreamInTransaction(lNextFragment, this);
						}
					},
					
					OnFailure: function ( lEx ){
						this.fOriginListener.OnFailure( lEx ); 
					}
				});
				
				// REQUIRED
				return;
			}
		
			// prefixing the packet
			aData = lPacketPrefix + aData;
			// saving the listener
			this.fPacketDeliveryListeners[ lPID ] = aListener;
		
			// sending the packet
			this.sendStream( aData );
		
			// setting the timer task for OnTimeout support
			var lTT = setTimeout(function(){
				if ( lThis.fPacketDeliveryListeners[ lPID ] ){
					// cleaning expired data and calling timeout
					lThis.fPacketDeliveryListeners[ lPID ].OnTimeout();
					delete lThis.fPacketDeliveryListeners[ lPID ];
					delete lThis.fPacketDeliveryTimerTasks[ lPID ];
				}
			}, 
			aListener.getTimeout());
			this.fPacketDeliveryTimerTasks[ lPID ] = lTT; 
		}catch ( lEx ){
			// cleaning expired data and calling OnFailure
			delete this.fPacketDeliveryListeners[ lPID ];
			clearTimeout( this.fPacketDeliveryTimerTasks[ lPID ] );
			delete this.fPacketDeliveryTimerTasks[ lPID ];
			aListener.OnFailure ( lEx );
		}
	},

	//:m:*:abortReconnect
	//:d:en:Aborts a pending automatic re-connection, if such.
	//:a:en::::none
	//:r:*:::boolean:[tt]true[/tt], if re-connect was pending, [tt]false[/tt] if nothing to abort.
	abortReconnect: function() {
		// in case connection could be established 
		// reset the re-connect interval.
		if( this.hReconnectDelayTimeout ) {
			clearTimeout( this.hReconnectDelayTimeout );
			this.hReconnectDelayTimeout = null;
			return true;
		}	
		return false;
	},

	//:m:*:setAutoReconnect
	//:d:en:Specifies whether to automatically re-connect in case of _
	//:d:en:connection loss.
	//:a:en::aAutoReconnect:Boolean:[tt]true[/tt] if auto-reconnect is desired, otherwise [tt]false[/tt].
	//:r:*:::void:none
	setAutoReconnect: function( aAutoReconnect ) {
		if( aAutoReconnect && "boolean" === typeof( aLimit ) ) {
			this.fReliabilityOptions.autoReconnect = aAutoReconnect;
		} else {
			this.fReliabilityOptions.autoReconnect = false;
		}
		// if no auto-reconnect is desired, abort a pending re-connect, if such.
		if( !( this.fReliabilityOptions && this.fReliabilityOptions.autoReconnect ) ) {
			abortReconnect();
		}
	},

	//:m:*:setQueueItemLimit
	//:d:en:Specifies the maximum number of allowed queue items. If a zero or _
	//:d:en:negative number is passed the number of items is not checked. _
	//:d:en:If the limit is exceeded the OnBufferOverflow event is fired.
	//:a:en::aLimit:Integer:Maximum of allowed messages in the queue.
	//:r:*:::void:none
	setQueueItemLimit: function( aLimit ) {
		if( aLimit && "number" === typeof( aLimit ) && aLimit > 0 ) {
			this.fReliabilityOptions.queueItemLimit = parseInt( aLimit );
		} else {
			this.fReliabilityOptions.queueItemLimit = 0;
		}
	},

	//:m:*:setQueueSizeLimit
	//:d:en:Specifies the maximum size in bytes allowed for the queue. If a zero or _
	//:d:en:negative number is passed the size of the queue is not checked. _
	//:d:en:If the limit is exceeded the OnBufferOverflow event is fired.
	//:a:en::aLimit:Integer:Maximum size of the queue in bytes.
	//:r:*:::void:none
	setQueueSizeLimit: function( aLimit ) {
		if( aLimit && "number" === typeof( aLimit ) && aLimit > 0 ) {
			this.fReliabilityOptions.queueSizeLimit = parseInt( aLimit );
		} else {
			this.fReliabilityOptions.queueSizeLimit = 0;
		}
	},

	//:m:*:setReliabilityOptions
	//:d:en:Specifies how the connection is management (null = no management) is done.
	//:a:en::aOptions:Object:The various connection management options.
	//:r:*:::void:none
	setReliabilityOptions: function( aOptions ) {
		this.fReliabilityOptions = aOptions;
		// if no auto-reconnect is desired, abort a pending re-connect, if such.
		// if no auto-reconnect is desired, abort a pending re-connect, if such.
		if( this.fReliabilityOptions ) {
			if( this.fReliabilityOptions.autoReconnect ) {
			//:todo:en:here we could think about establishing the connection
			// but this would required to pass all args for open!
			} else {
				this.abortReconnect();
			}	
		}
	},

	//:m:*:getReliabilityOptions
	//:d:en:Returns how the connection is management (null = no management) is done.
	//:a:en::aOptions:Object:The various connection management options.
	//:r:*:::void:none
	getReliabilityOptions: function() {
		return this.fReliabilityOptions;
	},

	//:m:*:getOutQueue
	//:d:en:Returns the outgoing message queue.
	//:a:en::::none
	//:r:*:::Array:The outgoing message queue, if such, otherwise [tt]undefined[/tt] or [tt]null[/tt].
	getOutQueue: function() {
		return this.fOutQueue;
	},

	//:m:*:resetSendQueue
	//:d:en:resets the send queue by simply deleting the queue field _
	//:d:en:of the connection.
	//:a:en::::none
	//:r:*:::void:none
	resetSendQueue: function() {
		delete this.fOutQueue;
	},

	//:m:*:isOpened
	//:d:en:Returns [tt]true[/tt] if the WebSocket connection opened up, otherwise [tt]false[/tt].
	//:a:en::::none
	//:r:*:::boolean:[tt]true[/tt] if the WebSocket connection is up otherwise [tt]false[/tt].
	isOpened: function() {
		return(
			undefined !== this.fConn
			&& null !== this.fConn
			&& jws.OPEN === this.fConn.readyState
			);
	},

	//:m:*:getURL
	//:d:en:Returns the URL if the WebSocket connection opened up, otherwise [tt]null[/tt].
	//:a:en::::none
	//:r:*:::String:the URL if the WebSocket connection opened up, otherwise [tt]null[/tt].
	getURL: function() {
		return this.fURL;
	/*
		return(
			this.fConn != undefined
			&& this.fConn != null
			&& this.fConn.readyState == jws.OPEN 
			? this.fURL
			: null
		);
			 */
	},

	//:m:*:getSubProt
	//:d:en:Returns the selected sub protocol when the WebSocket connection 
	//:d:en:was opened, otherwise [tt]null[/tt].
	//:a:en::::none
	//:r:*:::String:the URL if the WebSocket connection opened up, otherwise [tt]null[/tt].
	getSubProt: function() {
		return this.fSubProt;
	},
	
	//:m:*:isConnected
	//:@deprecated:en:Use [tt]isOpened()[/tt] instead.
	//:d:en:Returns [tt]true[/tt] if the WebSocket connection is up otherwise [tt]false[/tt].
	//:a:en::::none
	//:r:*:::boolean:[tt]true[/tt] if the WebSocket connection is up otherwise [tt]false[/tt].
	isConnected: function() {
		return( this.isOpened() );
	},

	//:m:*:forceClose
	//:d:en:Forces an immediate client side disconnect. The processClosed
	//:d:en:method is called if the connection was up otherwise no operation is
	//:d:en:performed.
	//:a:en::::none
	//:r:*:::void:none
	forceClose: function( aOptions ) {
		// if client closes usually no event is fired
		// here you optionally can fire it if required in your app!
		var lFireClose = false;
		// turn on isExplicitClose flag to not auto re-connect in case
		// of an explicit, i.e. desired client side close operation
		if( this.fReliabilityOptions ) {
			this.fReliabilityOptions.isExplicitClose = true;
		}
		if( aOptions ) {
			if( aOptions.fireClose && this.fConn.onclose ) {
				// TODO: Adjust to event fields 
				// if such are delivered in real event
				var lEvent = {};
				this.fConn.onclose( lEvent );
			}
		}
		if( this.fConn ) {
			// reset listeners to prevent any kind of potential memory leaks.
			this.fConn.onopen = null;
			this.fConn.onmessage = null;
			this.fConn.onclose = null;
			if( this.fConn.readyState === jws.OPEN
				|| this.fConn.readyState === jws.CONNECTING ) {
				this.fConn.close();
			}
			// TODO: should be called only if client was really opened before
			this.processClosed();
		}
		// explicitely reset fConn to "null"
		this.fConn = null;
	},

	//:m:*:close
	//:d:en:Closes the connection either immediately or with an optional _
	//:d:en:timeout. _
	//:d:en:If the connection is established up an exception s fired.
	//:a:en::aOptions:Object:Optional arguments as listed below...
	//:a:en:aOptions:timeout:Number:The close timeout in milliseconds, default [tt]0[/tt].
	//:r:*:::void:none
	close: function( aOptions ) {
		// check if timeout option is used
		var lTimeout = 0;

		if( aOptions ) {
			if( aOptions.timeout ) {
				lTimeout = aOptions.timeout;
			}
		}
		
		if( this.fConn && 1 === this.fConn.readyState ) {
			if( lTimeout <= 0 ) {
				this.forceClose( aOptions );
			} else {
				var lThis = this;
				this.hDisconnectTimeout = setTimeout(
					function() {
						lThis.forceClose( aOptions );
					},
					lTimeout
					);
			}
		// throw exception if not connected
		} else {
			this.fConn = null;
			throw new Error( "Not connected" );
		}
	},

	//:m:*:disconnect
	//:d:en:Deprecated, kept for upward compatibility only. Do not use anymore! _
	//:d:en:Please refer to the [tt]close[/tt] method.
	//:a:en::aOptions:Object:Please refer to the [tt]close[/tt] method.
	//:r:*::::Please refer to the [tt]close[/tt] method.
	disconnect: function( aOptions ) {
		return this.close( aOptions );
	},

	addListener: function( aCallback ) {
		// if the class has no plug-ins yet initialize array
		if( !this.fListeners ) {
			this.fListeners = [];
		}
		this.fListeners.push( aCallback );
	},

	removeListener: function( aCallback ) {
		if( this.fListeners ) {
			for( var lIdx = 0, lCnt = this.fListeners; lIdx < lCnt; lIdx++ ) {
				if( aCallback === this.fListeners[ lIdx ] ) {
					this.fListeners.splice( lIdx, 1 );
				}
			}
		}
	},
	
	//:m:*:addFilter
	//:d:en:Adds a client side filter to the instance - not to the class!
	//:a:en::aFilter:Object:Filter to be appended to the client side filter chain.
	//:r:*:::void:none
	addFilter: function( aFilter ) {
		// if the class has no filters yet initialize array
		if( !this.fFilters ) {
			this.fFilters = [];
		}
		this.fFilters.push( aFilter );
	},

	//:m:*:removeFilter
	//:d:en:Removes a client side filter from the instance - not to the class!
	//:a:en::aFilter:Object:Filter to be removed from the client side filter chain.
	//:r:*:::void:none
	removeFilter: function( aFilter ) {
		if( this.fFilters ) {
			for( var lIdx = 0, lCnt = this.fFilters; lIdx < lCnt; lIdx++ ) {
				if( aFilter === this.fFilters[ lIdx ] ) {
					this.fFilters.splice( lIdx, 1 );
				}
			}
		}
	},

	//:m:*:addPlugIn
	//:d:en:Adds a client side plug-in to the instance - not to the class!
	//:a:en::aPlugIn:Object:Plug-in to be appended to the client side plug-in chain.
	//:r:*:::void:none
	addPlugIn: function( aPlugIn, aId ) {
		// if the class has no plug-ins yet initialize array
		if( !this.fPlugIns ) {
			this.fPlugIns = [];
		}
		
		this.fPlugIns.push( aPlugIn );

		if( !aId ) {
			aId = aPlugIn.ID;
		}
		//:todo:en:check if plug-in with given id already exists!
		if( aId ) {
			aPlugIn.conn = this;
		}
	},

	//:m:*:setParam
	//:d:en:Sets a certain parameter for the jWebSocket client instance. _
	//:d:en:Here you can add parameters you need for instance within events fired by this instance.
	//:d:en:To avoid name space conflicts you should prefer the setParamNS method.
	//:a:en::aKey:String:The name for the parameter.
	//:a:en::aValue:Object:The value for the parameter, can also be an object.
	//:r:*:::Object:Previous value of the parameter if such, otherwise null.
	setParam: function( aKey, aValue ) {
		if( !this.fParams ) {
			this.fParams = {};
		}
		var lOldValue = this.getParam( aKey );
		this.fParams[ aKey ] = aValue;
		return lOldValue;
	},

	//:m:*:getParam
	//:d:en:Gets the value for certain parameter of the jWebSocket client instance. _
	//:d:en:If no value is stored for the given parameter [tt]null[/tt] is returned.
	//:d:en:To avoid name space conflicts you should prefer the getParamNS method.
	//:a:en::aKey:String:The name for the parameter for which the value should be returned.
	//:r:*:::Object:Value of the parameter if such, otherwise null.
	getParam: function( aKey ) {
		if( !this.fParams ) {
			return null;
		}
		var lRes = this.fParams[ aKey ];
		if( lRes === undefined ) {
			return null;
		}
		return lRes;
	},

	//:m:*:setParamNS
	//:d:en:Sets a certain parameter for the jWebSocket client instance. _
	//:d:en:Here you can add parameters you need for instance within events fired by this instance.
	//:a:en::aNS:String:The name space for the parameter.
	//:a:en::aKey:String:The name for the parameter.
	//:a:en::aValue:Object:The value for the parameter, can also be an object.
	//:r:*:::Object:Previous value of the parameter if such, otherwise null.
	setParamNS: function( aNS, aKey, aValue ) {
		return this.setParam( aNS + "." + aKey, aValue );
	},

	//:m:*:getParam
	//:d:en:Gets the value for certain parameter of the jWebSocket client instance. _
	//:d:en:If no value is stored for the given parameter [tt]null[/tt] is returned.
	//:a:en::aNS:String:The name space for the parameter.
	//:a:en::aKey:String:The name for the parameter for which the value should be returned.
	//:r:*:::Object:Value of the parameter if such, otherwise null.
	getParamNS: function( aNS, aKey ) {
		return this.getParam( aNS + "." + aKey );
	},
	
	//:m:*:clearParams
	//:d:en:Resets all params of this jWebSocket client. _
	//:d:en:After this operation all params are removed and cannot be used anymore.
	//:a:en::::none
	//:r:*:::void:none
	clearParams: function() {
		if( this.fParams ) {
			delete this.fParams;
		}
	}
});

//	---------------------------------------------------------------------------
//  jWebSocket token client (this is an abstract class)
//  don't create direct instances of jWebSocketTokenClient
//	---------------------------------------------------------------------------

//:package:*:jws
//:class:*:jws.jWebSocketTokenClient
//:ancestor:*:jws.jWebSocketBaseClient
//:d:en:Implementation of the [tt]jWebSocketTokenClient[/tt] class. This is _
//:d:en:an abstract class as an ancestor for the JSON-, CSV- and XML client. _
//:d:en:Do not create direct instances of jWebSocketTokenClient.
jws.oop.declareClass( "jws", "jWebSocketTokenClient", jws.jWebSocketBaseClient, {
	
	registerFilters: function( ) {
		var self = this;
		this.addFilter({
			
			filterTokenOut: function( aToken ) {
				var lEnc = aToken.enc;
				if( !lEnc ) {
					return;
				}
				for( var lAttr in lEnc ) {
					var lFormat = lEnc[ lAttr ];
					var lValue = aToken[ lAttr ];
					
					if( 0 > self.fEncodingFormats.lastIndexOf( lFormat ) ) {
						jws.console.error(
								"[process encoding]: Invalid encoding format '"
								+ lFormat
								+ " 'received. Token cannot be sent!" );
						throw new Error(
								"Invalid encoding format '"
								+ lFormat
								+ " 'received (not supported). Token cannot be sent!" );
					} else if( "zipBase64" === lFormat ) {
						aToken[lAttr] = jws.tools.zip( lValue, true );
					} else if( "base64" === lFormat ) {
						aToken[lAttr] = Base64.encode( lValue );
					}
				}
			},
					
			filterTokenIn: function( aToken ) {
				var lEnc = aToken.enc;
				if ( !lEnc ) {
					return;
				}	
				for( var lAttr in lEnc ) {
					var lFormat = lEnc[ lAttr ];
					var lValue = aToken[ lAttr ];
					if( 0 > self.fEncodingFormats.lastIndexOf( lFormat ) ) {
						jws.console.error( 
								"[process decoding]: Invalid encoding format '" 
								+ lFormat 
								+ "' received. Token cannot be processed!" );
						throw new Error( 
								"Invalid encoding format '" 
								+ lFormat 
								+ " 'received  (not supported). Token cannot be processed!" );
					} else if( "zipBase64" === lFormat ) {
						aToken[lAttr] = jws.tools.unzip( lValue, true );
					} else if( "base64" === lFormat ) {
						aToken[lAttr] = Base64.decode( lValue );
					}
				}
			}
		});
	},
	
	processOpened: function ( aEvent ){
		this.fEncodingFormats = ["base64", "zipBase64"];
		
		// sending client headers to the server 
		this.sendToken({
			ns: jws.SystemClientPlugIn.NS,
			type: "header",
			clientType: "browser",
			clientName: jws.getBrowserName(),
			clientVersion: jws.getBrowserVersionString(),
			clientInfo: navigator.userAgent,
			jwsType: "javascript",
			jwsVersion: jws.VERSION,
			jwsInfo: 
			jws.browserSupportsNativeWebSockets 
			? "native"
			: "flash " + jws.flashBridgeVer,
			encodingFormats: this.fEncodingFormats
		});
	},

	//:m:*:create
	//:d:en:This method is called by the contructor of this class _
	//:d:en:to init the instance.
	//:a:en::::none
	//:r:*:::void:none
	create: function( aOptions ) {
		// call inherited create
		arguments.callee.inherited.call( this, aOptions );
		this.fRequestCallbacks = {};
	},

	//:m:*:getId
	//:d:en:Returns the unique id of this client assigned by the jWebSocket server.
	//:a:en::::none
	//:r:*:::String:Unique id of this client.
	getId: function() {
		return this.fClientId;
	},

	//:m:*:checkCallbacks
	//:d:en:Processes an incoming result token and assigns it to a previous _
	//:d:en:request. If a request was found it calls it OnResponse method _
	//:d:en:and removes the reference of the list of pending results.
	//:d:en:This method is used internally only and should not be called by _
	//:d:en:the application.
	//:a:en::aToken:Object:The incoming result token.
	//:r:*:::void:none
	checkCallbacks: function( aToken ) {
		var lField = "utid" + aToken.utid;
		// console.log( "checking result for utid: " + aToken.utid + "..." );
		var lClbkRec = this.fRequestCallbacks[ lField ];
		if( lClbkRec ) {
			// result came in within the given timeout
			// first cleanup timeout observer because
			// OnResponse listener potentially could take a while as well
			if( lClbkRec.hCleanUp ) {
				// thus reset the timeout observer
				clearTimeout( lClbkRec.hCleanUp );
			}
			var lArgs = lClbkRec.args;
			var lCallback = lClbkRec.callback;
			if( lCallback.OnResponse ) {
				lCallback.OnResponse.call( this, aToken, lArgs );
			}	
			if( lCallback.OnSuccess
				&& 0 === aToken.code ) {
				lCallback.OnSuccess.call( this, aToken, lArgs );
			}	
			if( lCallback.OnFailure
				&& undefined !== aToken.code
				&& 0 !== aToken.code ) {
				lCallback.OnFailure.call( this, aToken, lArgs );
			}
			delete this.fRequestCallbacks[ lField ];
		}
	},

	//:m:*:createDefaultResult
	//:d:en:Creates a response token with [tt]code = 0[/tt] and _
	//:d:en:[tt]msg = "Ok"[/tt]. It automatically increases the TOKEN_ID _
	//:d:en:to obtain a unique serial id for the next request.
	//:a:en::::none
	//:r:*:::void:none
	createDefaultResult: function() {
		return{
			code: 0,
			msg: "Ok",
			localeKey: "jws.jsc.res.Ok",
			args: null,
			tid: jws.CUR_TOKEN_ID
		};
	},

	//:m:*:checkConnected
	//:d:en:Checks if the client is connected and if so returns a default _
	//:d:en:response token (please refer to [tt]createDefaultResult[/tt] _
	//:d:en:method. If the client is not connected an error token is returned _
	//:d:en:with [tt]code = -1[/tt] and [tt]msg = "Not connected"[/tt]. _
	//:d:en:This is a convenience method if a function needs to check if _
	//:d:en:the client is connected and return an error token if not.
	//:a:en::::none
	//:r:*:::void:none
	checkConnected: function() {
		var lRes = this.createDefaultResult();
		if( !this.isOpened() ) {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	},

	//:m:*:isWriteable
	//:d:en:Checks if the client currently is able to process send commands. _
	//:d:en:In case the connection-reliability option in turned on the _
	//:d:en:write queue is used to buffer outgoing packets. The queue may be _
	//:d:en:in number of items as as well as in size and time.
	//:a:en::::none
	//:r:*:::void:none
	isWriteable: function() {
		return(	this.isOpened() || this.fStatus === jws.RECONNECTING );
	},

	//:m:*:checkWriteable
	//:d:en:Checks if the client is connected and if so returns a default _
	//:d:en:response token (please refer to [tt]createDefaultResult[/tt] _
	//:d:en:method. If the client is not connected an error token is returned _
	//:d:en:with [tt]code = -1[/tt] and [tt]msg = "Not connected"[/tt]. _
	//:d:en:This is a convenience method if a function needs to check if _
	//:d:en:the client is connected and return an error token if not.
	//:a:en::::none
	//:r:*:::void:none
	checkWriteable: function() {
		var lRes = this.createDefaultResult();
		if( !this.isWriteable() ) {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notWriteable";
			lRes.msg = "Not writable.";
		}
		return lRes;
	},

	//:m:*:checkLoggedIn
	//:d:en:Checks if the client is connected and logged in and if so returns _
	//:d:en:a default response token (please refer to [tt]createDefaultResult[/tt] _
	//:d:en:method. If the client is not connected or nott logged in an error _
	//:d:en:token is returned with [tt]code = -1[/tt] and _
	//:d:en:[tt]msg = "Not logged in"[/tt]. _
	//:d:en:This is a convenience method if a function needs to check if _
	//:d:en:the client is connected and return an error token if not.
	//:a:en::::none
	//:r:*:::void:none
	checkLoggedIn: function() {
		var lRes = this.checkConnected();
		if( 0 === lRes.code && !this.isLoggedIn() ) {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notLoggedIn";
			lRes.msg = "Not logged in.";
		}
		return lRes;
	},

	//:m:*:resultToString
	//:d:en:Converts a result token to a readable string e.g. to be displayed _
	//:d:en:in the GUI.
	//:a:en::aResToken:Object:The result token to be converted into a string.
	//:r:*:::String:The human readable string output of the result token.
	resultToString: function( aResToken ) {
		return(
			( aResToken && "object" === typeof aResToken && aResToken.msg ? 
				aResToken.msg : "invalid response token" )
			// + " (code: " + aRes.code + ", tid: " + aRes.tid + ")"
			);
	},

	//:m:*:tokenToStream
	//:d:en:Converts a token into a string (stream). This method needs to be _
	//:d:en:overwritten by the descendant classes to implement a certain _
	//:d:en:sub protocol like JSON, CSV or XML. If you call this method _
	//:d:en:directly an exception is raised.
	//:a:en::aToken:Object:Token to be converted into a stream.
	//:r:*:::void:none
	tokenToStream: function( aToken ) {
		// this is supposed to convert a token into a string stream which is
		// send to the server, not implemented in base class.
		// needs to be overwritten in descendant classes!
		throw new Error( "tokenToStream needs to be overwritten in descendant classes" );
	},
	
	//:m:*:streamToToken
	//:d:en:Converts a string (stream) into a token. This method needs to be _
	//:d:en:overwritten by the descendant classes to implement a certain _
	//:d:en:sub protocol like JSON, CSV or XML. If you call this method _
	//:d:en:directly an exception is raised.
	//:a:en::aStream:String:Stream to be converted into a token.
	//:r:*:::void:none
	streamToToken: function( aStream ) {
		// this is supposed to convert a string stream from the server into 
		// a token (object), not implemented in base class.
		// needs to be overwritten in descendant classes
		throw new Error( "streamToToken needs to be overwritten in descendant classes" );
	},

	//:m:*:notifyPlugInsOpened
	//:d:en:Iterates through the client side plug-in chain and calls the _
	//:d:en:[tt]processOpened[/tt] method of each plug-in after the client _
	//:d:en:successfully established the connection to the server.
	//:d:en:By this mechanism all plug-ins easily can handle a new connection.
	//:a:en::::none
	//:r:*:::void:none
	notifyPlugInsOpened: function() {
		var lToken = {
			sourceId: this.fClientId
		};
		// notify all plug-ins about sconnect event
		var lPlugIns = jws.jWebSocketTokenClient.fPlugIns;
		if( lPlugIns ) {
			for( var lIdx = 0, lLen = lPlugIns.length; lIdx < lLen; lIdx++ ) {
				var lPlugIn = lPlugIns[ lIdx ];
				if( lPlugIn.processOpened ) {
					lPlugIn.processOpened.call( this, lToken );
				}
			}
		}
	},

	//:m:*:notifyPlugInsClosed
	//:d:en:Iterates through the client side plug-in chain and calls the _
	//:d:en:[tt]processClosed[/tt] method of each plug-in after the client _
	//:d:en:successfully established the connection to the server.
	//:d:en:By this mechanism all plug-ins easily can handle a terminated connection.
	//:a:en::::none
	//:r:*:::void:none
	notifyPlugInsClosed: function() {
		var lToken = {
			sourceId: this.fClientId
		};
		// notify all plug-ins about disconnect event
		var lPlugIns = jws.jWebSocketTokenClient.fPlugIns;
		if( lPlugIns ) {
			for( var lIdx = 0, lLen = lPlugIns.length; lIdx < lLen; lIdx++ ) {
				var lPlugIn = lPlugIns[ lIdx ];
				if( lPlugIn.processClosed ) {
					lPlugIn.processClosed.call( this, lToken );
				}
			}
		}
		// in case of a server side close event...
		this.fConn = null;
		// and the username as well
		this.fUsername = null;
	},

	//:m:*:processPacket
	//:d:en:Is called when a new raw data packet is received by the client. _
	//:d:en:This methods calls the [tt]streamToToken[/tt] method of the _
	//:d:en:its descendant who is responsible to implement the sub protocol _
	//:d:en:JSON, CSV or XML, here to parse the raw packet in the corresponding _
	//:d:en:format.
	//:a:en::aPacket:String: Received packet content
	//:r:*:::void:none
	processPacket: function( aPacket ) {
		// parse incoming token...
		var lToken = this.streamToToken( aPacket );

		try {
			// call filter chain
			if( this.fFilters ) {
				for( var lIdx = 0, lLen = this.fFilters.length; lIdx < lLen; lIdx++ ) {
					if( typeof this.fFilters[ lIdx ][ "filterTokenIn" ] === "function" ) {
						this.fFilters[ lIdx ][ "filterTokenIn" ]( lToken );
					}
				}
			}

			// and process it...
			this.processToken( lToken );
			
			return lToken;
		} catch( lEx ) {
			jws.console.error( "[processPacket]: Exception: " + lEx.message );
		}
	},

	// TODO: move handlers to system plug-in in the same way as on server.
	// TODO: No change for application!
	//:m:*:processToken
	//:d:en:Processes an incoming token. The method iterates through all _
	//:d:en:plug-ins and calls their specific [tt]processToken[/tt] method.
	//:a:en::aToken:Object:Token to be processed by the plug-ins in the plug-in chain.
	//:r:*:::void:none
	processToken: function( aToken ) {

		// TODO: Remove this temporary hack with final release 1.0
		// TODO: this was required to ensure upward compatibility from 0.10 to 0.11
		var lNS = aToken.ns;
		if ( null !== lNS && 1 === lNS.indexOf( "org.jWebSocket" ) ) {
			aToken.ns = "org.jwebsocket" + lNS.substring( 15 );
		} else if( null === lNS ) {
			aToken.ns = "org.jwebsocket.plugins.system";
		}
		
		// is it a token from the system plug-in at all?
		if( jws.NS_SYSTEM === aToken.ns ) {
			// check welcome and goodBye tokens to manage the session
			if ( aToken.type === "welcome") {
				this.fClientId = aToken.sourceId;
				this.fUsername = aToken.username;
				this.fEncodingFormats = jws.tools.intersect(this.fEncodingFormats, aToken.encodingFormats);
				
				this.registerFilters();
				this.notifyPlugInsOpened();
				
				// fire OnWelcome Event if assigned
				if( this.fOnWelcome ) {
					this.fOnWelcome( aToken );
				}
			} else if( aToken.type === "goodBye" ) {
				// fire OnGoodBye Event if assigned
				if( this.fOnGoodBye ) {
					this.fOnGoodBye( aToken );
				}
				this.fUsername = null;
			} else if( aToken.type === "close" ) {
				// if the server closes the connection close immediately too.
				this.close({
					timeout: 0
				});
			// check if we got a response from a previous request
			} else if( aToken.type === "response" ) {
				// check login and logout manage the username
				if( aToken.reqType === "login" || aToken.reqType === "logon") {
					if (0 === aToken.code){
						this.fUsername = aToken.username;
						// call logon callback
						if ( "function" === typeof this.fOnLogon ){
							this.fOnLogon( aToken );
						}
					}
				} else if( aToken.reqType === "logout" || aToken.reqType === "logoff") {
					if (0 === aToken.code){
						this.fUsername = null;
						// call logoff callback
						if ( "function" === typeof this.fOnLogoff )
							this.fOnLogoff( aToken );
					}
				}
				// check if some requests need to be answered
				this.checkCallbacks( aToken );
			} else if( aToken.type === "event" ) {
				// check login and logout manage the username
				if( aToken.name === "connect" ) {
					this.processConnected( aToken );
				}
				if( aToken.name === "disconnect" ) {
					this.processDisconnected( aToken );
				}
			}
		} else {
			// check the incoming token for an optional response callback
			this.checkCallbacks( aToken );
		}

		var lIdx, lLen, lPlugIns, lPlugIn;

		// notify all plug-ins bound to the class
		// that a token has to be processed
		lPlugIns = jws.jWebSocketTokenClient.fPlugIns;
		if( lPlugIns ) {
			for( lIdx = 0, lLen = lPlugIns.length; lIdx < lLen; lIdx++ ) {
				lPlugIn = lPlugIns[ lIdx ];
				if( lPlugIn.processToken ) {
					lPlugIn.processToken.call( this, aToken );
				}
			}
		}

		// notify all plug-ins bound to the instance
		// that a token has to be processed
		lPlugIns = this.fPlugIns;
		if( lPlugIns ) {
			for( lIdx = 0, lLen = lPlugIns.length; lIdx < lLen; lIdx++ ) {
				lPlugIn = lPlugIns[ lIdx ];
				if( lPlugIn.processToken ) {
					lPlugIn.processToken( aToken );
				}
			}
		}

		// if the instance got an OnToken event assigned
		// fire the event
		if( this.fOnToken ) {
			this.fOnToken( aToken );
		}

		if( this.fListeners ) {
			for( lIdx = 0, lLen = this.fListeners.length; lIdx < lLen; lIdx++ ) {
				this.fListeners[ lIdx ]( aToken );
			}
		}
	},

	//:m:*:processClosed
	//:d:en:Iterates through all plug-ins of the plugin-chain and calls their _
	//:d:en:specific [tt]processClosed[/tt] method.
	//:a:en::aEvent:Object:...
	//:r:*:::void:none
	processClosed: function( aEvent ) {
		this.notifyPlugInsClosed();
		this.fClientId = null;
	},

	//:m:*:processConnected
	//:d:en:Called when the client successfully received a connect event token _
	//:d:en:which means that another client has connected to the network.
	//:a:en::aToken:Object:...
	//:r:*:::void:none
	processConnected: function( aToken ) {
		// notify all plug-ins that a new client connected
		var lPlugIns = jws.jWebSocketTokenClient.fPlugIns;
		if( lPlugIns ) {
			for( var lIdx = 0, lLen = lPlugIns.length; lIdx < lLen; lIdx++ ) {
				var lPlugIn = lPlugIns[ lIdx ];
				if( lPlugIn.processConnected ) {
					lPlugIn.processConnected.call( this, aToken );
				}
			}
		}
	},

	//:m:*:processDisconnected
	//:d:en:Called when the client successfully received a disconnect event token _
	//:d:en:which means that another client has disconnected from the network.
	//:a:en::aToken:Object:...
	//:r:*:::void:none
	processDisconnected: function( aToken ) {
		// notify all plug-ins that a client disconnected
		var lPlugIns = jws.jWebSocketTokenClient.fPlugIns;
		if( lPlugIns ) {
			for( var lIdx = 0, lLen = lPlugIns.length; lIdx < lLen; lIdx++ ) {
				var lPlugIn = lPlugIns[ lIdx ];
				if( lPlugIn.processDisconnected ) {
					lPlugIn.processDisconnected.call( this, aToken );
				}
			}
		}
	},
	
	__sendToken: function(aIsTransaction, aToken, aOptions, aListener ) {
		var lRes = this.checkWriteable();
		if( 0 === lRes.code ) {
			try {
				// call filter chain
				if( this.fFilters ) {
					for( var lIdx = 0, lLen = this.fFilters.length; lIdx < lLen; lIdx++ ) {
						if ( "function" === typeof this.fFilters[ lIdx ]["filterTokenOut"] ) {
							this.fFilters[ lIdx ][ "filterTokenOut" ]( aToken );
						}
					}
				}
			} catch( lEx ) {
				jws.console.error( "[processPacket]: Exception: " + lEx.message );
				lRes.code = -1;
				lRes.localeKey = "jws.jsc.res.filterChainException";
				lRes.msg = lEx.message;
			}
		}
		
		if( 0 === lRes.code ) {
			var lSpawnThread = false;
			var lL2FragmSize = this.fMaxFrameSize;
			var lTimeout = jws.DEF_RESP_TIMEOUT;
			var lKeepRequest = false;
			var lArgs = null;
			var lCallbacks = {
				OnResponse: null,
				OnSuccess: null,
				OnFailure: null,
				OnTimeout: null
			};
			// we need to check for a response only
			// if correspondig callbacks are set
			var lControlResponse = false;
			if( aOptions ) {
				if( aOptions.OnResponse ) {
					lCallbacks.OnResponse = aOptions.OnResponse;
					lControlResponse = true;
				}
				if( aOptions.OnFailure) {
					lCallbacks.OnFailure = aOptions.OnFailure;
					lControlResponse = true;
				}
				if( aOptions.OnSuccess ) {
					lCallbacks.OnSuccess = aOptions.OnSuccess;
					lControlResponse = true;
				}
				if( aOptions.OnTimeout ) {
					lCallbacks.OnTimeout = aOptions.OnTimeout;
					lControlResponse = true;
				}
				if( aOptions.args ) {
					lArgs = aOptions.args;
				}
				if( aOptions.timeout ) {
					lTimeout = aOptions.timeout;
				}
				if( aOptions.spawnThread ) {
					lSpawnThread = aOptions.spawnThread;
				}
				if( aOptions.fragmentSize ) {
					lL2FragmSize = aOptions.fragmentSize;
				}
				if( aOptions.keepRequest ) {
					lKeepRequest = true;
				}
			}
			jws.CUR_TOKEN_ID++;
			if( lControlResponse ) {
				var lUTID = jws.CUR_TOKEN_ID;
				var lClbkId = "utid" + lUTID;
				var lThis = this;
				var lClbkRec = {
					request: new Date().getTime(),
					callback: lCallbacks,
					args: lArgs,
					timeout: lTimeout
				};
				if( lKeepRequest ) {
					lClbkRec.request = aToken;
				}
				this.fRequestCallbacks[ lClbkId ] = lClbkRec;
				// set timeout to observe response
				lClbkRec.hCleanUp = setTimeout( function() {
					var lCallbacks = lClbkRec.callback;
					// delete callback first to not fire response event
					// in case the OnTimeout processing takes longer or
					// even invokes blocking methods like alert.
					delete lThis.fRequestCallbacks[ lClbkId ];
					// now the OnTimeout Callback can be called.
					if( lCallbacks.OnTimeout ) {
						lCallbacks.OnTimeout.call( this, aToken, {
							utid: lUTID,
							timeout: lTimeout
						});
					}
				}, lTimeout );
			}
			if( lSpawnThread ) {
				aToken.spawnThread = true;
			}
			var lStream = this.tokenToStream( aToken );
			if ( aIsTransaction ) {
				if( jws.console.isDebugEnabled() ) {
					jws.console.debug( "[sendToken]: Sending stream in transaction " + lStream + "..." );
				}
				this.sendStreamInTransaction( lStream, aListener, lL2FragmSize );
			} else {
				if( jws.console.isDebugEnabled() ) {
					jws.console.debug( "[sendToken]: Sending stream " + lStream + "..." );
				}
				this.sendStream( lStream );
			}
		}
		return lRes;
	}, 

	//:m:*:sendToken
	//:d:en:Sends a token to the jWebSocket server.
	//:a:en::aToken:Object:Token to be send to the jWebSocket server.
	//:a:en::aOptions:Object:Optional arguments as listed below...
	//:a:en:aOptions:timeout:Integer:Timeout to wait for a response to be received from the server (default is [tt]jws.DEF_RESP_TIMEOUT[/tt]), if timeout is exceeded a OnTimeout callback can be fired.
	//:a:en:aOptions:spawnThread:Boolean:Specifies whether to run the request in a separate thread ([tt]true[/tt]), or within the (pooled) thread of the connection ([tt]false[/tt]).
	//:a:en:aOptions:args:Object:Optional arguments to be passed the optional response, success, failure and timeout callbacks to be easily processed.
	//:a:en:aOptions:OnResponse:Function:Reference to a response callback function, which is called when [b]any[/b] response is received.
	//:a:en:aOptions:OnSuccess:Function:Reference to a success function, which is called when a successful response is received ([tt]code=0[/tt]).
	//:a:en:aOptions:OnFailure:Function:Reference to a failure function, which is called when an failure or error was received ([tt]code!=0[/tt]).
	//:a:en:aOptions:OnTimeout:Function:Reference to a timeout function, which is called when the given response timeout is exceeded.
	//:r:*:::void:none
	sendToken: function( aToken, aOptions ) {
		return this.__sendToken( false, aToken, aOptions);
	},
	
	//:m:*:sendTokenInTransaction
	//:d:en:Sends a token to the jWebSocket server in transaction.
	//:a:en::aToken:Object:Token to be send to the jWebSocket server.
	//:a:en::aOptions:Object:Optional arguments as listed below...
	//:a:en:aOptions:timeout:Integer:Timeout to wait for a response to be received from the server (default is [tt]jws.DEF_RESP_TIMEOUT[/tt]), if timeout is exceeded a OnTimeout callback can be fired.
	//:a:en:aOptions:fragmentSize:Integer:The fragment size parameter to be used in the fragmentation process. Expected value: [tt]fragment_size > 0 && fragment_size <= max_frame_size[/tt]. Argument is optional.
	//:a:en:aOptions:spawnThread:Boolean:Specifies whether to run the request in a separate thread ([tt]true[/tt]), or within the (pooled) thread of the connection ([tt]false[/tt]).
	//:a:en:aOptions:args:Object:Optional arguments to be passed the optional response, success, failure and timeout callbacks to be easily processed.
	//:a:en:aOptions:OnResponse:Function:Reference to a response callback function, which is called when [b]any[/b] response is received.
	//:a:en:aOptions:OnSuccess:Function:Reference to a success function, which is called when a successful response is received ([tt]code=0[/tt]).
	//:a:en:aOptions:OnFailure:Function:Reference to a failure function, which is called when an failure or error was received ([tt]code!=0[/tt]).
	//:a:en:aOptions:OnTimeout:Function:Reference to a timeout function, which is called when the given response timeout is exceeded.
	//:a:en::aListener:Object:A packet delivery listener
	//:a:en:aListener:getTimeout:function:Returns the packet delivery timeout
	//:a:en:aListener:OnTimeout:function:Called if the packet delivery has timed out
	//:a:en:aListener:OnSuccess:function:Called if the packet has been delivered successfully 
	//:a:en:aListener:OnFailure:function:Called if the packet delivery has failed
	//:r:*:::void:none
	sendTokenInTransaction: function( aToken, aOptions, aListener ) {
		// generating packet delivery listener for developer convenience if missing
		if ( !aListener ){
			aListener = {};
		}
		if ( !aListener[ "getTimeout" ] ){
			var lTimeout = aOptions.timeout || jws.DEF_RESP_TIMEOUT;
			aListener[ "getTimeout" ] = function() {
				return lTimeout;
			};
		}
		if ( !aListener[ "OnTimeout" ] ){
			aListener[ "OnTimeout" ] = function() {};
		}
		if ( !aListener[ "OnSuccess" ] ){
			aListener[ "OnSuccess" ] = function() {};
		}
		if ( !aListener[ "OnFailure" ] ){
			aListener[ "OnFailure" ] = function() {};
		}
		
		// sending the token
		return this.__sendToken( true, aToken, aOptions, aListener );
	},
	
	//:m:*:sendChunkable
	//:d:en:Sends a chunkable objecto to the server
	//:a:en::aChunkable:Object:The chunkable object to be sent
	//:a:en:aChunkable:maxFrameSize:Integer:The maximum frame size that the chunks can use. Argument is optional.
	//:a:en:aChunkable:fragmentSize:Integer:The fragment size parameter to be used in the fragmentation process. Expected value: [tt]fragment_size > 0 && fragment_size <= connection.max_frame_size[/tt]. Argument is optional.
	//:a:en:aChunkable:ns:String:Chunkable namespace attribute is equivalent to Token namespace attribute.
	//:a:en:aChunkable:type:String:Chunkable type attribute is equivalent to Token type attribute.
	//:a:en:aChunkable:getChunksIterator:function:Allows to iterate over the chunkable object chunks. See the Java language [tt]Iterator[/tt] interface.
	//:a:en::aOptions:Object:Optional arguments as listed below...
	//:a:en:aOptions:timeout:Integer:Timeout to wait for a chunkable complete processing from the server (default is [tt]jws.DEF_RESP_TIMEOUT[/tt]), if timeout is exceeded a OnTimeout callback is fired.
	//:a:en:aOptions:spawnThread:Boolean:Specifies whether to run the request in a separate thread ([tt]true[/tt]), or within the (pooled) thread of the connection ([tt]false[/tt]).
	//:a:en:aOptions:args:Object:Optional arguments to be passed the optional response, success, failure and timeout callbacks to be easily processed.
	//:a:en:aOptions:OnResponse:Function:Reference to a response callback function, which is called when a chunk has been processed by the server
	//:a:en:aOptions:OnSuccess:Function:Reference to a success function, which is called when a chunk processing has been successful.
	//:a:en:aOptions:OnFailure:Function:Reference to a failure function, which is called when a chunk processing has been failed.
	//:a:en:aOptions:OnTimeout:Function:Reference to a timeout function, which is called when a chunkable processing has timeout. 
	//:a:en::aListener:Object:A chunkable delivery listener
	//:a:en:aListener:getTimeout:function:Returns the packet delivery timeout
	//:a:en:aListener:OnTimeout:function:Called if the chunkable delivery has timed out
	//:a:en:aListener:OnSuccess:function:Called if the chunkable has been delivered successfully 
	//:a:en:aListener:OnFailure:function:Called if the chunkable delivery has failed
	//:a:en:aListener:OnChunkDelivered:function:Called if a chunk has been delivered successfully
	//:r:*:::void:none
	sendChunkable: function( aChunkable, aOptions, aListener ) {
		try {
			if (undefined === aChunkable.maxFrameSize) {
				aChunkable.maxFrameSize = this.fMaxFrameSize - jws.PACKET_TRANSACTION_MAX_BYTES_PREFIXED;
			}
		
			var lChunksIterator = aChunkable.getChunksIterator();
			if ( !lChunksIterator.hasNext() ){
				throw new Error( "The chunks iterator is empty. No data to send!" );
			}
			
			var lCurrentChunk = lChunksIterator.next();
			if ( !lCurrentChunk ){
				throw new Error( "Iterator returned null on 'next' method call!" );
			}
			
			// setting chunk properties
			lCurrentChunk.ns = aChunkable.ns;
			lCurrentChunk.type = aChunkable.type;
			lCurrentChunk.isChunk = true;
			if ( !lChunksIterator.hasNext() ) {
				lCurrentChunk.isLastChunk = true;
			}
			
			// setting the fragment size
			if ( !aOptions ) {
				aOptions = {};
			}
			aOptions.fragmentSize = aChunkable.fragmentSize;
			
			// checking chunkable delivery listener
			if ( !aListener ){
				aListener = {};
			}
			if ( !aListener[ "getTimeout" ] ){
				var lTimeout = aOptions.timeout || jws.DEF_RESP_TIMEOUT;
				aListener[ "getTimeout" ] = function() {
					return lTimeout;
				};
			}
			if ( !aListener[ "OnTimeout" ] ){
				aListener[ "OnTimeout" ] = function() {};
			}
			if ( !aListener[ "OnSuccess" ] ){
				aListener[ "OnSuccess" ] = function() {};
			}
			if ( !aListener[ "OnFailure" ] ){
				aListener[ "OnFailure" ] = function() {};
			}
			if ( !aListener[ "OnChunkDelivered" ] ){
				aListener[ "OnChunkDelivered" ] = function() {};
			}
			
			// sending chunks
			this.sendTokenInTransaction(lCurrentChunk, aOptions, {
				fChunkableIterator: lChunksIterator,
				fOriginListener: aListener,
				fSentTime: new Date().getTime(),
				fCurrentChunk: lCurrentChunk,
				fNs: lCurrentChunk.ns,
				fType: lCurrentChunk.type,
				fOriginOptions: aOptions,
				
				getTimeout: function (){
					var lTimeout = this.fSentTime + this.fOriginListener.getTimeout() - new Date().getTime();
					if (lTimeout < 0) {
						lTimeout = 0;
					}

					return lTimeout;
				}, 
					
				OnTimeout: function (){
					this.fOriginListener.OnTimeout();
				}, 
				
				OnSuccess: function() {
					this.OnChunkDelivered( this.fCurrentChunk );
					
					// process next chunks
					if ( this.fChunkableIterator.hasNext() ) {
						try {
							this.fCurrentChunk = mChunkableIterator.next();
							if ( !this.fCurrentChunk ){
								throw new Error( "Iterator returned null on 'next' method call!" );
							}
								
							// setting chunk properties
							this.fCurrentChunk.ns = this.fNs;
							this.fCurrentChunk.type = this.fType;
							this.fCurrentChunk.isChunk = true;
								
							if ( !this.fChunkableIterator.hasNext() ) {
								this.fCurrentChunk.isLastChunk = true;
							}
							
							// setting aOptions timeout parameter appropiate value
							// since aOptions.timeout is the global processing timeout
							if ( aOptions.timeout ){
								aOptions.timeout = this.fSentTime + aOptions.timeout - new Date().getTime();
								if (aOptions.timeout < 0) {
									aOptions.timeout = 0;
								}
							}
							
							// sending the token in transaction
							this.sendTokenInTransaction(this.fCurrentChunk, this.fOriginOptions, this);
						} catch (lEx) {
							this.fOriginListener.OnFailure(lEx);
						}
					} else {
						this.fOriginListener.OnSuccess();
					}
				},
				
				OnChunkDelivered: function( aChunk ) {
					this.fOriginListener.OnChunkDelivered( aChunk );
				}
			});
		} catch (lEx){
			aListener.OnFailure(lEx);
		}
	},

	//:m:*:getLastTokenId
	//:d:en:Returns the last token id that has been used for the last recent
	//:d:en:request.This id was already used and cannot be used for further
	//:d:en:tranmissions.
	//:a:en::::none
	//:r:*:::Integer:Last recently used unique token-id.
	getLastTokenId: function() {
		return jws.CUR_TOKEN_ID;
	},

	//:m:*:getNextTokenId
	//:d:en:Returns the next token id that will be used for the next request.
	//:d:en:This id will be used by the next sendToken call.
	//:a:en::::none
	//:r:*:::Integer:Next unique token-id used for the next sendToken call.
	getNextTokenId: function() {
		return jws.CUR_TOKEN_ID + 1;
	},

	//:m:*:sendText
	//:d:en:Sends a simple text message to a certain target client within the _
	//:d:en:WebSocket network by creating and sending a [tt]send[/tt] token. _
	//:d:en:The receiver must be addressed by its client id.
	//:d:en:This method requires the user to be authenticated.
	//:a:en::aTarget:String:Client id of the target client for the message.
	//:a:en::aText:String:Textmessage to be send to the target client.
	//:r:*:::void:none
	sendText: function( aTarget, aText ) {
		var lRes = this.checkLoggedIn();
		if( 0 === lRes.code ) {
			this.sendToken({
				ns: jws.NS_SYSTEM,
				type: "send",
				targetId: aTarget,
				sourceId: this.fClientId,
				sender: this.fUsername,
				data: aText
			});
		}
		return lRes;
	},

	//:m:*:broadcastText
	//:d:en:Broadcasts a simple text message to all clients or a limited set _
	//:d:en:of clients within the WebSocket network by creating and sending _
	//:d:en:a [tt]broadcast[/tt] token. The caller can decide to wether or not _
	//:d:en:included in the broadcast and if he requests a response (optional _
	//:d:en:"one-way" token).
	//:d:en:This method requires the user to be authenticated.
	//:a:en::aPool:String:...
	//:a:en::aText:type:...
	//:a:en::aOptions:Object:...
	//:a:en:aOptions:senderIncluded:Boolean:..., default [tt]false[/tt].
	//:a:en:aOptions:responseRequested:Boolean:..., default [tt]true[/tt].
	//:r:*:::void:none
	broadcastText: function( aPool, aText, aOptions ) {
		var lRes = this.checkLoggedIn();
		var lSenderIncluded = false;
		var lResponseRequested = true;
		if( aOptions ) {
			if( aOptions.senderIncluded ) {
				lSenderIncluded = aOptions.senderIncluded;
			}
			if( aOptions.responseRequested ) {
				lResponseRequested = aOptions.responseRequested;
			}
		}
		if( 0 === lRes.code ) {
			this.sendToken({
				ns: jws.NS_SYSTEM,
				type: "broadcast",
				sourceId: this.fClientId,
				sender: this.fUsername,
				pool: aPool,
				data: aText,
				senderIncluded: lSenderIncluded,
				responseRequested: lResponseRequested
			},
			aOptions
			);
		}
		return lRes;
	},

	//:m:*:echo
	//:d:en:Sends an echo token to the jWebSocket server. The server returns
	//:d:en:the same message with a prefix.
	//:a:en::aData:String:An arbitrary string to be returned by the server.
	//:r:*:::void:none
	echo: function( aData ) {
		var lRes = this.checkWriteable();
		if( 0 === lRes.code ) {
			this.sendToken({
				ns: jws.NS_SYSTEM,
				type: "echo",
				data: aData
			});
		}
		return lRes;
	},

	//:m:*:open
	//:d:en:Tries to establish a connection to the jWebSocket server. Unlike _
	//:d:en:the inherited [tt]open[/tt] method no exceptions is fired in case _
	//:d:en:of an error but a response token is returned.
	//:a:en::aURL:String:URL to the jWebSocket server.
	//:a:en::aOptions:Object:Optional arguments, for details please refer to the open method of the [tt]jWebSocketBaseClient[/tt] class.
	//:r:*:::Object:The response token.
	//:r:*:Object:code:Number:Response code (0 = ok, otherwise error).
	//:r:*:Object:msg:String:"Ok" or error message.
	open: function( aURL, aOptions ) {
		var lRes = this.createDefaultResult();
		try {
			if( aOptions && aOptions.OnToken && "function" === typeof aOptions.OnToken ) {
				this.fOnToken = aOptions.OnToken;
			}
			if( aOptions && aOptions.OnWelcome && "function" === typeof aOptions.OnWelcome ) {
				this.fOnWelcome = aOptions.OnWelcome;
			}
			if( aOptions && aOptions.OnGoodBye && "function" === typeof aOptions.OnGoodBye ) {
				this.fOnGoodBye = aOptions.OnGoodBye;
			}
			if( aOptions && aOptions.OnLogon && "function" === typeof aOptions.OnLogon ) {
				this.fOnLogon = aOptions.OnLogon;
			}
			if( aOptions && aOptions.OnLogoff && "function" === typeof aOptions.OnLogoff ) {
				this.fOnLogoff = aOptions.OnLogoff;
			}
			// call inherited connect, catching potential exception
			arguments.callee.inherited.call( this, aURL, aOptions );
		} catch( ex ) {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.ex";
			lRes.args = [ ex.message ];
			lRes.msg = "Exception on open: " + ex.message;
		}
		return lRes;
	},

	//:m:*:connect
	//:d:en:Deprecated, kept for upward compatibility only. Do not use anymore!
	//:d:en:Please refer to the [tt]open[/tt] method.
	//:a:en:::Deprecated:Please refer to the [tt]open[/tt] method.
	//:r:*:::Deprecated:Please refer to the [tt]open[/tt] method.
	connect: function( aURL, aOptions ) {
		return this.open( aURL, aOptions );
	},

	//:m:*:close
	//:d:en:Closes an established WebSocket connection.
	//:a:en::aOptions:Object:Optional arguments as listed below...
	//:a:en:aOptions:timeout:Number:Timeout in milliseconds.
	//:r:*:::void:none
	close: function( aOptions ) {
		var lTimeout = 0;

		var lNoGoodBye = false;
		var lNoLogoutBroadcast = false;
		var lNoDisconnectBroadcast = false;

		// turn on isExplicitClose flag to not auto re-connect in case
		// of an explicit, i.e. desired client side close operation
		if( this.fReliabilityOptions ) {
			this.fReliabilityOptions.isExplicitClose = true;
		}
		
		if( aOptions ) {
			if( aOptions.timeout ) {
				lTimeout = aOptions.timeout;
			}
			if( aOptions.noGoodBye ) {
				lNoGoodBye = true;
			}
			if( aOptions.noLogoutBroadcast ) {
				lNoLogoutBroadcast = true;
			}
			if( aOptions.noDisconnectBroadcast ) {
				lNoDisconnectBroadcast = true;
			}
		}
		var lRes = this.checkConnected();
		try {
			// if connected and timeout is passed give server a chance to
			// register the disconnect properly and send a good bye response.
			if( 0 === lRes.code ) {
				if( lTimeout > 0 ) {
					var lToken = {
						ns: jws.NS_SYSTEM,
						type: "close",
						timeout: lTimeout
					};
					// only add the following optional fields to
					// the close token on explicit request
					if( lNoGoodBye ) {
						lToken.noGoodBye = true;
					}
					if( lNoLogoutBroadcast ) {
						lToken.noLogoutBroadcast = true;
					}
					if( lNoDisconnectBroadcast ) {
						lToken.noDisconnectBroadcast = true;
					}
					this.sendToken( lToken );
				}
				// call inherited disconnect, catching potential exception
				arguments.callee.inherited.call( this, aOptions );
			} else {
				lRes.code = -1;
				lRes.localeKey = "jws.jsc.res.notConnected";
				lRes.msg = "Not connected.";
			}
		} catch( ex ) {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.ex";
			lRes.args = [ ex.message ];
			lRes.msg = "Exception on close: " + ex.message;
		}
		return lRes;
	},

	//:m:*:disconnect
	//:d:en:Deprecated, kept for upward compatibility only. Do not use anymore!
	//:d:en:Please refer to the [tt]close[/tt] method.
	//:a:en:::Deprecated:Please refer to the [tt]close[/tt] method.
	//:r:*:::Deprecated:Please refer to the [tt]close[/tt] method.
	disconnect: function( aOptions ) {
		return this.close( aOptions );
	},
	
	//:m:*:setConfiguration
	//:d:en:Sets server-side plug-ins configuration per session
	//:a:en::aNS:String:The plug-in namespace
	//:a:en::aParams:Object:The configuration params. 
	//:r:*:::void:none
	setConfiguration: function ( aNS, aParams ){
		var lRes = this.checkConnected();
		if( 0 === lRes.code ) {
			for( var lKey in aParams ){
				var lValue = aParams[ lKey ];
				if( "object" === typeof ( lValue ) ){
					this.setConfiguration( aNS + "." + lKey, lValue );
				} else {
					this.sessionPut( aNS + "." + lKey, lValue, false, {} );
				}
			}
		}	
		return lRes;
	}

});


//	---------------------------------------------------------------------------
//  jWebSocket Client System Plug-In
//	---------------------------------------------------------------------------

//:package:*:jws
//:class:*:jws.SystemClientPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.SystemClientPlugIn[/tt] class.
jws.SystemClientPlugIn = {

	//:const:*:NS:String:org.jwebsocket.plugins.system (jws.NS_BASE + ".plugins.system")
	//:d:en:Namespace for SystemClientPlugIn
	// if namespace changed update server plug-in accordingly!
	NS: jws.NS_SYSTEM,

	//:const:*:ALL_CLIENTS:Number:0
	//:d:en:For [tt]getClients[/tt] method: Returns all currently connected clients irrespective of their authentication state.
	ALL_CLIENTS: 0,
	//:const:*:AUTHENTICATED:Number:1
	//:d:en:For [tt]getClients[/tt] method: Returns all authenticated clients only.
	AUTHENTICATED: 1,
	//:const:*:NON_AUTHENTICATED:Number:2
	//:d:en:For [tt]getClients[/tt] method: Returns all non-authenticated clients only.
	NON_AUTHENTICATED: 2,
	
	//:const:*:PW_PLAIN:Number:null
	//:d:en:Use no password encoding, password is passed as plain text.
	PW_PLAIN		: null,
	//:const:*:PW_ENCODE_MD5:Number:1
	//:d:en:Use MD5 password encoding, password is given as plain but converted and passed as a MD5 hash.
	PW_ENCODE_MD5	: 1,
	//:const:*:PW_MD5_ENCODED:Number:2
	//:d:en:Use MD5 password encoding, password is given and passed as a MD5 hash. _
	//:d:en:The method relies on the correct encoding and does not check the hash.
	PW_MD5_ENCODED	: 2,

	//:m:*:processToken
	//:d:en:Processes an incoming token. Checks if certains events are supposed to be fired.
	//:a:en::aToken:Object:Token to be processed by the plug-ins in the plug-in chain.
	//:r:*:::void:none
	processToken: function( aToken ) {

		// is it a token from the system plug-in at all?
		if( jws.NS_SYSTEM === aToken.ns ) {
			if( "login" === aToken.reqType ) {
				if( 0 === aToken.code ) {
					if( this.fOnLoggedIn ) {
						this.fOnLoggedIn( aToken );
					}
				} else {
					if( this.fOnLoginError ) {
						this.fOnLoginError( aToken );
					}
				}
			} else if( "logon" === aToken.reqType ) {
				if( 0 === aToken.code ) {
					if( this.fOnLoggedOn ) {
						this.fOnLoggedOn( aToken );
					}
				} else {
					if( this.fOnLogonError ) {
						this.fOnLogonError( aToken );
					}
				}
			} else if( "logout" === aToken.reqType ) {
				if( 0 === aToken.code ) {
					if( this.fOnLoggedOut ) {
						this.fOnLoggedOut( aToken );
					}
				} else {
					if( this.fOnLogoutError ) {
						this.fOnLogoutError( aToken );
					}
				}
			} else if( "logoff" === aToken.reqType ) {
				if( 0 === aToken.code ) {
					if( this.fOnLoggedOff ) {
						this.fOnLoggedOff( aToken );
					}
				} else {
					if( this.fOnLogoffError ) {
						this.fOnLogoffError( aToken );
					}
				}
			}
		}
	},

	//:m:*:login
	//:d:en:Tries to authenticate the client against the jWebSocket Server by _
	//:d:en:sending a [tt]login[/tt] token.
	//:a:en::aUsername:String:The login name of the user.
	//:a:en::aPassword:String:The password of the user.
	//:a:en::aOptions:Object:Optional arguments for the sendToken operation
	//:a:en:aOptions:pool:String:Default pool the user want to register at (default [tt]null[/tt], no pool).
	//:a:en:aOptions:autoConnect:Boolean:not yet supported (defautl [tt]true[/tt]).
	//:r:*:::void:none
	login: function( aUsername, aPassword, aOptions ) {
		var lPool = null;
		var lEncoding = null;
		if( aOptions ) {
			if( aOptions.pool !== undefined ) {
				lPool = aOptions.pool;
			}
			if( aOptions.encoding !== undefined ) {
				lEncoding = aOptions.encoding;
				// check if password has to be converted into a MD5 sum
				if( lEncoding === jws.SystemClientPlugIn.PW_ENCODE_MD5 ) {
					if( aPassword ) {
						aPassword = jws.tools.calcMD5( aPassword );
					}
					lEncoding = "md5";
				// check if password is already md5 encoded
				} else if( lEncoding === jws.SystemClientPlugIn.PW_MD5_ENCODED ) {
					lEncoding = "md5";
				} else {
					// TODO: raise error here due to invalid encoding option
					lEncoding = null;
				}
			}
		}
		var lRes = this.createDefaultResult();
		if( this.isOpened() ) {
			this.sendToken({
				ns: jws.SystemClientPlugIn.NS,
				type: "login",
				username: aUsername,
				password: aPassword,
				encoding: lEncoding,
				pool: lPool
			}, aOptions);
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	},

	//:m:*:logon
	//:d:en:Tries to connect and authenticate the client against the _
	//:d:en:jWebSocket Server in a single call. If the client is already _
	//:d:en:connected this connection is used and not re-established. _
	//:d:en:If the client is already authenticated he is logged off first and _
	//:d:en:re-logged in afterwards by sending a [tt]login[/tt] token.
	//:d:en:The logoff of the client in case of a re-login is automatically _
	//:d:en:processed by the jWebSocket server and does not need to be _
	//:d:en:explicitely triggered by the client.
	// TODO: check server if it sends logout event in ths case!
	//:a:en::aURL:String:The URL of the jWebSocket Server.
	//:a:en::aUsername:String:The login name of the user.
	//:a:en::aPassword:String:The password of the user.
	//:a:en::aOptions:Object:Optional arguments as listed below...
	// TODO: document options!
	//:r:*:::void:none
	logon: function( aURL, aUsername, aPassword, aOptions ) {
		var lRes = this.createDefaultResult();
		if( !aOptions ) {
			aOptions = {};
		}
		// if already connected, just send the login token 
		if( this.isOpened() ) {
			this.login( aUsername, aPassword, aOptions );
		} else {
			var lAppOnWelcomeClBk = aOptions.OnWelcome;
			var lThis = this;
			aOptions.OnWelcome = function( aEvent ) {
				if( lAppOnWelcomeClBk ) {
					lAppOnWelcomeClBk.call( lThis, aEvent );
				}
				
				lThis.login( aUsername, aPassword, aOptions );
			};
			this.open(
				aURL,
				aOptions
				);
		}
		return lRes;
	},

	//:m:*:logout
	//:d:en:Logs the currently authenticated used out. After that the user _
	//:d:en:is not authenticated anymore against the jWebSocket network. _
	//:d:en:The client is not automatically disconnected.
	//:d:en:If you want to logout and disconnect please refere to the _
	//:d:en:[tt]close[/tt] method. Closing a connection automatically logs off _
	//:d:en:a potentially authenticated user.
	// TODO: implement optional auto disconnect!
	//:a:en::::none
	//:r:*:::void:none
	logout: function() {
		var lRes = this.checkConnected();
		if( 0 === lRes.code ) {
			this.sendToken({
				ns: jws.SystemClientPlugIn.NS,
				type: "logout"
			});
		}
		return lRes;
	},
	
	systemLogon: function( aUsername, aPassword, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 === lRes.code ) {
			var lToken = {
				ns: jws.SystemClientPlugIn.NS,
				type: "logon",
				username: aUsername,
				password: aPassword
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	systemLogoff: function( aOptions ) {
		var lRes = this.checkConnected();
		if( 0 === lRes.code ) {
			var lToken = {
				ns: jws.SystemClientPlugIn.NS,
				type: "logoff"
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	systemGetAuthorities: function( aOptions ) {
		var lRes = this.checkConnected();
		if( 0 === lRes.code ) {
			var lToken = {
				ns: jws.SystemClientPlugIn.NS,
				type: "getAuthorities"
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	//:m:*:isLoggedIn
	//:d:en:Returns [tt]true[/tt] when the client is authenticated, _
	//:d:en:otherwise [tt]false[/tt].
	//:a:en::::none
	//:r:*:::Boolean:[tt]true[/tt] when the client is authenticated, otherwise [tt]false[/tt].
	isLoggedIn: function() {
		return( this.isOpened() && this.fUsername );
	},

	broadcastToken: function( aToken, aOptions ) {
		aToken.ns = jws.SystemClientPlugIn.NS;
		aToken.type = "broadcast";
		aToken.sourceId = this.fClientId;
		aToken.sender = this.fUsername;
		return this.sendToken( aToken, aOptions );
	},

	//:m:*:getUsername
	//:d:en:Returns the login name when the client is authenticated, _
	//:d:en:otherwise [tt]null[/tt].
	//:d:en:description pending...
	//:a:en::::none
	//:r:*:::String:Login name when the client is authenticated, otherwise [tt]null[/tt].
	getUsername: function() {
		return( this.isLoggedIn() ? this.fUsername : null );
	},

	//:m:*:getClients
	//:d:en:Returns an array of clients that are currently connected to the
	//:d:en:jWebSocket network by using the [tt]getClients[/tt] token.
	//:d:en:Notice that the call is non-blocking, i.e. the clients are _
	//:d:en:returned asynchronously by the OnResponse event.
	//:a:en::aOptions:Object:Optional arguments as listed below...
	// TODO: support and/or check pool here!
	//:a:en:aOptions:pool:String:Only consider connections to that certain pool (default=[tt]null[/tt]).
	//:a:en:aOptions:mode:Number:One of the following constants [tt]AUTHENTICATED[/tt], [tt]NON_AUTHENTICATED[/tt], [tt]ALL_CLIENTS[/tt].
	//:r:*:::void:none
	getClients: function( aOptions ) {
		var lMode = jws.SystemClientPlugIn.ALL_CLIENTS;
		var lPool = null;
		if( aOptions ) {
			if( aOptions.mode === jws.SystemClientPlugIn.AUTHENTICATED ||
				aOptions.mode === jws.SystemClientPlugIn.NON_AUTHENTICATED ) {
				lMode = aOptions.mode;
			}
			if( aOptions.pool ) {
				lPool = aOptions.pool;
			}
		}
		var lRes = this.createDefaultResult();
		if( this.isLoggedIn() ) {
			this.sendToken({
				ns: jws.SystemClientPlugIn.NS,
				type: "getClients",
				mode: lMode,
				pool: lPool
			});
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notLoggedIn";
			lRes.msg = "Not logged in.";
		}
		return lRes;
	},

	//:m:*:getNonAuthClients
	//:d:en:Requests an array of all clients that are currently connected to _
	//:d:en:the jWebSocket network but not authenticated.
	//:d:en:Notice that the call is non-blocking, i.e. the clients are _
	//:d:en:returned asynchronously by the OnResponse event.
	//:a:en::aOptions:Object:Please refer to the [tt]getClients[/tt] method.
	//:r:*:::void:none
	getNonAuthClients: function( aOptions ) {
		if( !aOptions ) {
			aOptions = {};
		}
		aOptions.mode = jws.SystemClientPlugIn.NON_AUTHENTICATED;
		return this.getClients( aOptions );
	},

	//:m:*:getAuthClients
	//:d:en:Requests an array of all clients that are currently connected to _
	//:d:en:the jWebSocket network and that are authenticated.
	//:d:en:Notice that the call is non-blocking, i.e. the clients are _
	//:d:en:returned asynchronously by the OnResponse event.
	//:a:en::aOptions:Object:Please refer to the [tt]getClients[/tt] method.
	//:r:*:::void:none
	getAuthClients: function( aOptions ) {
		if( !aOptions ) {
			aOptions = {};
		}
		aOptions.mode = jws.SystemClientPlugIn.AUTHENTICATED;
		return this.getClients( aOptions );
	},

	//:m:*:getAllClients
	//:d:en:Requests an array of all clients that are currently connected to _
	//:d:en:the jWebSocket network irrespective of their authentication status.
	//:d:en:Notice that the call is non-blocking, i.e. the clients are _
	//:d:en:returned asynchronously by the OnResponse event.
	//:a:en::aOptions:Object:Please refer to the [tt]getClients[/tt] method.
	//:r:*:::void:none
	getAllClients: function( aOptions ) {
		if( !aOptions ) {
			aOptions = {};
		}
		aOptions.mode = jws.SystemClientPlugIn.ALL_CLIENTS;
		return this.getClients( aOptions );
	},

	//:m:*:ping
	//:d:en:Sends a simple [tt]ping[/tt] token to the jWebSocket Server as a _
	//:d:en:notification that the client is still alive. The client optionally _
	//:d:en:can request an echo so that the client also get a notification _
	//:d:en:that the server still is alive. The [tt]ping[/tt] thus is an _
	//:d:en:important part of the jWebSocket connection management.
	//:a:en::aOptions:Object:Optional arguments as listed below...
	//:a:en:aOptions:echo:Boolean:Specifies whether the client expects a response from the server (default=[tt]true[/tt]).
	//:r:*:::void:none
	ping: function( aOptions ) {
		var lEcho = false;
		if( aOptions ) {
			if( aOptions.echo ) {
				lEcho = true;
			}
		}
		var lRes = this.createDefaultResult();
		if( this.isOpened() ) {
			this.sendToken({
				ns: jws.SystemClientPlugIn.NS,
				type: "ping",
				echo: lEcho
			},
			aOptions
			);
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	},

	//:m:*:wait
	//:d:en:Simply send a wait request to the jWebSocket server. _
	//:d:en:The server waits for the given amount of time and returns a _
	//:d:en:result token. This feature is for test and debugging purposes only _
	//:d:en:and is not related to any particular business logic.
	//:a:en::aDuration:Integer:Duration in ms the server waits for a response
	//:a:en::aOptions:Object:Optional arguments as listed below...
	//:a:en:aOptions:OnResponse:Function:Callback to be invoked once the response is received.
	//:r:*:::void:none
	wait: function( aDuration, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 === lRes.code ) {
			var lResponseRequested = true;
			if( aOptions ) {
				if( undefined !== aOptions.responseRequested ) {
					lResponseRequested = aOptions.responseRequested;
				}
			}
			this.sendToken({
				ns: jws.SystemClientPlugIn.NS,
				type: "wait",
				duration: aDuration,
				responseRequested: lResponseRequested
			},
			aOptions
			);
		}
		return lRes;
	},

	//:m:*:startKeepAlive
	//:d:en:Starts the keep-alive timer in background. keep-alive sends _
	//:d:en:periodic pings to the server with an configurable interval.
	//:d:en:If the keep-alive timer has already has been started, the previous _
	//:d:en:one will be stopped automatically and a new one with new options _
	//:d:en:will be initiated.
	//:a:en::aOptions:Objects:Optional arguments as listed below...
	//:a:en:aOptions:interval:Number:Number of milliseconds for the interval.
	//:a:en:aOptions:echo:Boolean:Specifies wether the server is supposed to send an answer to the client.
	//:a:en:aOptions:immediate:Boolean:Specifies wether to send the first ping immediately or after the first interval.
	//:r:*:::void:none
	startKeepAlive: function( aOptions ) {
		// if we have a keep alive running already stop it
		if( this.hKeepAlive ) {
			this.stopKeepAlive();
		}
		// return if not (yet) connected
		if( !this.isOpened() ) {
			// TODO: provide reasonable result here!
			return;
		}
		var lInterval = 10000;
		var lEcho = true;
		var lImmediate = true;
		if( aOptions ) {
			if( undefined !== aOptions.interval ) {
				lInterval = aOptions.interval;
			}
			if( undefined !== aOptions.echo  ) {
				lEcho = aOptions.echo;
			}
			if( undefined !== aOptions.immediate ) {
				lImmediate = aOptions.immediate;
			}
		}
		if( lImmediate ) {
			// send first ping immediately, if requested
			this.ping({
				echo: lEcho
			});
		}
		// and then initiate interval...
		var lThis = this;
		this.hKeepAlive = setInterval(
			function() {
				if( lThis.isOpened() ) {
					lThis.ping({
						echo: lEcho
					});
				} else {
					lThis.stopKeepAlive();
				}
			},
			lInterval
			);
	},

	//:m:*:stopKeepAlive
	//:d:en:Stops the keep-alive timer in background. If no keep-alive is _
	//:d:en:running no operation is performed.
	//:a:en::::none
	//:r:*:::void:none
	stopKeepAlive: function() {
		// TODO: return reasonable results here
		if( this.hKeepAlive ) {
			clearInterval( this.hKeepAlive );
			this.hKeepAlive = null;
		}
	},

	setSystemCallbacks: function( aListeners ) {
		if( !aListeners ) {
			aListeners = {};
		}
		if( aListeners.OnLoggedIn !== undefined ) {
			this.fOnLoggedIn = aListeners.OnLoggedIn;
		}
		if( aListeners.OnLoginError !== undefined ) {
			this.fOnLoginError = aListeners.OnLoginError;
		}
		if( aListeners.OnLoggedOut !== undefined ) {
			this.fOnLoggedOut = aListeners.OnLoggedOut;
		}
		if( aListeners.OnLogoutError !== undefined ) {
			this.fOnLogoutError = aListeners.OnLogoutError;
		}
		if( aListeners.OnLoggedOn !== undefined ) {
			this.fOnLoggedOn = aListeners.OnLoggedOn;
		}
		if( aListeners.OnLogonError !== undefined ) {
			this.fOnLogonError = aListeners.OnLogonError;
		}
		if( aListeners.OnLoggedOff !== undefined ) {
			this.fOnLoggedOff = aListeners.OnLoggedOff;
		}
		if( aListeners.OnLogoffError !== undefined ) {
			this.fOnLogoffError = aListeners.OnLogoffError;
		}
	},
	
	//:m:*:sessionPut
	//:d:en:Put key/value entry in the server-side client session storage.
	//:a:en::aKey:String:The entry key
	//:a:en::aValue:Object:The entry value
	//:a:en::aPublic:Boolean:Indicates if the entry will be readable by other clients. Public entries key returned by the server, contains the 'public::' subfix.
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:a:en::aOptions.connectionStorage:Boolean:Uses the active connection specific persistent storage. 
	//:r:*:::void:none
	sessionPut: function (aKey, aValue, aPublic, aOptions){
		if( !aOptions ) { aOptions = {}; }
		this.sendToken({
			ns: jws.SystemClientPlugIn.NS,
			type: "sessionPut",
			key: aKey,
			value: aValue,
			"public": aPublic,
			connectionStorage: aOptions.connectionStorage || false
		}, aOptions);
	},
	
	//:m:*:sessionHas
	//:d:en:Indicates if the client server-side session storage contains a custom entry given the entry key.
	//:a:en::aClientId:String:The client identifier
	//:a:en::aKey:String:The entry key
	//:a:en::aPublic:Boolean:Indicates if the entry is declared as public. Public entries key returned by the server, contains the 'public::' subfix.
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:a:en::aOptions.connectionStorage:Boolean:Uses the active connection specific persistent storage. 
	//:r:*:::void:none
	sessionHas: function (aClientId, aKey, aPublic, aOptions){
		if( !aOptions ) { aOptions = {}; }
		this.sendToken({
			ns: jws.SystemClientPlugIn.NS,
			type: "sessionHas",
			key: aKey,
			clientId: aClientId,
			"public": aPublic,
			connectionStorage: aOptions.connectionStorage || false
		}, aOptions);
	},
	
	//:m:*:sessionGet
	//:d:en:Gets a server-side client session storage entry given the entry key.
	//:a:en::aClientId:String:The client identifier
	//:a:en::aKey:String:The entry key
	//:a:en::aPublic:Boolean:Indicates if the entry is declared as public. Public entries key returned by the server, contains the 'public::' subfix.
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:a:en::aOptions.connectionStorage:Boolean:Uses the active connection specific persistent storage. 
	//:r:*:::void:none
	sessionGet: function (aClientId, aKey, aPublic, aOptions){
		if( !aOptions ) { aOptions = {}; }
		this.sendToken({
			ns: jws.SystemClientPlugIn.NS,
			type: "sessionGet",
			key: aKey,
			clientId: aClientId,
			"public": aPublic,
			connectionStorage: aOptions.connectionStorage || false
		}, aOptions);
	},
	
	//:m:*:sessionRemove
	//:d:en:Removes a server-side client session storage entry given the entry key.
	//:a:en::aKey:String:The entry key
	//:a:en::aPublic:Boolean:Indicates if the entry is declared as public. Public entries key returned by the server, contains the 'public::' subfix.
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:a:en::aOptions.connectionStorage:Boolean:Uses the active connection specific persistent storage. 
	//:r:*:::void:none
	sessionRemove: function (aKey, aPublic, aOptions){
		if( !aOptions ) { aOptions = {}; }
		this.sendToken({
			ns: jws.SystemClientPlugIn.NS,
			type: "sessionRemove",
			key: aKey,
			"public": aPublic,
			connectionStorage: aOptions.connectionStorage || false
		}, aOptions);
	},
	
	//:m:*:sessionKeys
	//:d:en:Retrieves the list of entry keys stored in the server-side session storage of a given client. _
	//:d:en:A client can only get the public entries from others.
	//:a:en::aClientId:String:The client identifier
	//:a:en::aPublic:Boolean:Indicates if only the public entry keys will be retrieved. Public entries key returned by the server, contains the 'public::' subfix.
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:a:en::aOptions.connectionStorage:Boolean:Uses the active connection specific persistent storage. 
	//:r:*:::void:none
	sessionKeys: function (aClientId, aPublic, aOptions){
		if( !aOptions ) { aOptions = {}; }
		this.sendToken({
			ns: jws.SystemClientPlugIn.NS,
			type: "sessionKeys",
			clientId: aClientId,
			"public": aPublic,
			connectionStorage: aOptions.connectionStorage || false
		}, aOptions);
	},
	
	//:m:*:sessionGetAll
	//:d:en:Retrieves all the entries stored in the server-side session storage of a given client. _
	//:d:en:A client can only get the public entries from others.
	//:a:en::aClientId:String:The client identifier
	//:a:en::aPublic:Boolean:Indicates if only the public entries will be retrieved. Public entries key returned by the server, contains the 'public::' subfix.
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:a:en::aOptions.connectionStorage:Boolean:Uses the active connection specific persistent storage. 
	//:r:*:::void:none
	sessionGetAll: function (aClientId, aPublic, aOptions){
		if( !aOptions ) { aOptions = {}; }
		this.sendToken({
			ns: jws.SystemClientPlugIn.NS,
			type: "sessionGetAll",
			clientId: aClientId,
			"public": aPublic,
			connectionStorage: aOptions.connectionStorage || false
		}, aOptions);
	},
	
	//:m:*:sessionGetMany
	//:d:en:Retrieves a list of public entries stored in the server-side session storage of many clients. 
	//:a:en::aClients:Array:The list of clients
	//:a:en::aKeys:Array:The list of entry keys to retrieve
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:a:en::aOptions.connectionStorage:Boolean:Uses the active connection specific persistent storage. 
	//:r:*:::void:none
	sessionGetMany: function (aClients, aKeys, aOptions){
		if( !aOptions ) { aOptions = {}; }
		this.sendToken({
			ns: jws.SystemClientPlugIn.NS,
			type: "sessionGetMany",
			clients: aClients,
			keys: aKeys,
			connectionStorage: aOptions.connectionStorage || false
		}, aOptions);
	}
};

// add the JWebSocket SystemClient PlugIn into the BaseClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.SystemClientPlugIn );


//	---------------------------------------------------------------------------
//  jWebSocket JSON client
//	todo: consider potential security issues with 'eval'
//	---------------------------------------------------------------------------

//:package:*:jws
//:class:*:jws.jWebSocketJSONClient
//:ancestor:*:jws.jWebSocketTokenClient
//:d:en:Implementation of the [tt]jws.jWebSocketJSONClient[/tt] class.
jws.oop.declareClass( "jws", "jWebSocketJSONClient", jws.jWebSocketTokenClient, {

	//:m:*:tokenToStream
	//:d:en:converts a token to a JSON stream. If the browser provides a _
	//:d:en:native JSON class this is used, otherwise it use the automatically _
	//:d:en:embedded JSON library from json.org.
	//:a:en::aToken:Token:The token (an JavaScript Object) to be converted into an JSON stream.
	//:r:*:::String:The resulting JSON stream.
	tokenToStream: function( aToken ) {
		aToken.utid = jws.CUR_TOKEN_ID;
		var lJSON = JSON.stringify( aToken );
		return( lJSON );
	},

	//:m:*:streamToToken
	//:d:en:converts a JSON stream into a token. If the browser provides a _
	//:d:en:native JSON class this is used, otherwise it use the automatically _
	//:d:en:embedded JSON library from json.org. For security reasons the _
	//:d:en:use of JavaScript's eval explicitely was avoided.
	//:a:en::aStream:String:The data stream received from the server to be parsed as JSON.
	//:r:*::Token:Object:The Token object of stream could be parsed successfully.
	//:r:*:Token:[i]field[/i]:[i]type[/i]:Fields of the token depend on its content and purpose and need to be interpreted by the higher level software tiers.
	streamToToken: function( aStream ) {
		// parsing a JSON object in JavaScript couldn't be simpler...
		var lObj = JSON.parse( aStream );
		return lObj;
	}

});


//	---------------------------------------------------------------------------
//  jWebSocket CSV client
//	todo: implement jWebSocket JavaScript CSV client
//	jWebSocket target release 1.1
//	---------------------------------------------------------------------------

//:package:*:jws
//:class:*:jws.jWebSocketCSVClient
//:ancestor:*:jws.jWebSocketTokenClient
//:d:en:Implementation of the [tt]jws.jWebSocketCSVClient[/tt] class.
jws.oop.declareClass( "jws", "jWebSocketCSVClient", jws.jWebSocketTokenClient, {

	// todo: implement escaping of command separators and equal signs
	//:m:*:tokenToStream
	//:d:en:converts a token to a CSV stream.
	//:a:en::aToken:Token:The token (an JavaScript Object) to be converted into an CSV stream.
	//:r:*:::String:The resulting CSV stream.
	tokenToStream: function( aToken ) {
		var lCSV = "utid=" + jws.CUR_TOKEN_ID;
		for( var lKey in aToken ) {
			var lVal = aToken[ lKey ];
			if( lVal === null || lVal === undefined ) {
				// simply do not generate a value, keep value field empty
				lCSV += "," + lKey + "=";
			} else if( "string" === typeof lVal ) {
				// escape commata and quotes
				lVal = lVal.replace( /[,]/g, "\\x2C" );
				lVal = lVal.replace( /["]/g, "\\x22" );
				lCSV += "," + lKey + "=\"" + lVal + "\"";
			} else {
				lCSV += "," + lKey + "=" + lVal;
			}
		}
		return lCSV;
	},

	// todo: implement escaping of command separators and equal signs
	//:m:*:streamToToken
	//:d:en:converts a CSV stream into a token.
	//:a:en::aStream:String:The data stream received from the server to be parsed as CSV.
	//:r:*::Token:Object:The Token object of stream could be parsed successfully.
	//:r:*:Token:[i]field[/i]:[i]type[/i]:Fields of the token depend on its content and purpose and need to be interpreted by the higher level software tiers.
	streamToToken: function( aStream ) {
		var lToken = {};
		var lItems = aStream.split(",");
		for( var lIdx = 0, lCnt = lItems.length; lIdx < lCnt; lIdx++ ) {
			var lKeyVal = lItems[ lIdx ].split( "=" );
			if( 2 === lKeyVal.length ) {
				var lKey = lKeyVal[ 0 ];
				var lVal = lKeyVal[ 1 ];
				if( lVal.length >= 2 
					&& "\"" === lVal.charAt( 0 )
					&& "\"" === lVal.charAt( lVal.length - 1 ) ) {
					// unescape commata and quotes
					lVal = lVal.replace( /\\x2C/g, "\x2C" );
					lVal = lVal.replace( /\\x22/g, "\x22" );
					// strip string quotes
					lVal = lVal.substr( 1, lVal.length - 2 );
				}
				lToken[ lKey ] = lVal;
			}
		}
		return lToken;
	}

});


//	---------------------------------------------------------------------------
//  jWebSocket XML client
//	todo: PRELIMINARY! Implement jWebSocket JavaScript XML client
//	Targetted for jWebSocket release 1.1
//	---------------------------------------------------------------------------

//:package:*:jws
//:class:*:jws.jWebSocketXMLClient
//:ancestor:*:jws.jWebSocketTokenClient
//:d:en:Implementation of the [tt]jws.jWebSocketXMLClient[/tt] class.
jws.oop.declareClass( "jws", "jWebSocketXMLClient", jws.jWebSocketTokenClient, {

	//:m:*:tokenToStream
	//:d:en:converts a token to a XML stream.
	//:a:en::aToken:Token:The token (an JavaScript Object) to be converted into an XML stream.
	//:r:*:::String:The resulting XML stream.
	tokenToStream: function( aToken ) {

		function obj2xml( aKey, aValue ) {
			var lXML = "";
			// do we have an array? Caution! Keep this condition on
			// the top because array is also an object!
			if ( aValue instanceof Array ) {
				lXML += "<" + aKey + " type=\"" + "array" + "\">";
				for( var lIdx = 0, lCnt = aValue.length; lIdx < lCnt; lIdx++ ) {
					lXML += obj2xml( "item", aValue[ lIdx ] );
				}
				lXML += "</" + aKey + ">";
			}
			// or do we have an object?
			else if ( "object" === typeof aValue ) {
				lXML += "<" + aKey + " type=\"" + "object" + "\">";
				for(var lField in aValue ) {
					lXML += obj2xml( lField, aValue[ lField ] );
				}
				lXML += "</" + aKey + ">";
			}
			// or do we have a plain field?
			else {
				lXML +=
				"<" + aKey + " type=\"" + typeof aValue + "\">" +
				aValue.toString() +
				"</" + aKey + ">";
			}
			return lXML;
		}

		var lEncoding = "windows-1252";
		var lResXML =
		"<?xml version=\"1.0\" encoding=\"" + lEncoding + "\"?>" +
		"<token>";
		for( var lField in aToken ) {
			lResXML += obj2xml( lField, aToken[ lField ] );
		}
		lResXML += "</token>";
		return lResXML;
	},

	//:m:*:streamToToken
	//:d:en:converts a XML stream into a token.
	//:a:en::aStream:String:The data stream received from the server to be parsed as XML.
	//:r:*::Token:Object:The Token object of stream could be parsed successfully.
	//:r:*:Token:[i]field[/i]:[i]type[/i]:Fields of the token depend on its content and purpose and need to be interpreted by the higher level software tiers.
	streamToToken: function( aStream ) {
		// first convert the stream into an XML document 
		// by using the embedded XML parser.
		// We do not really want to parse the XML in Javascript!
		// Using the built-in parser should be more performant.
		var lDoc = null;
		/* Once we have an applet for IEx ;-)
		if( window.ActiveXObject ) {
			//:i:de:Internet Explorer
			lDoc = new ActiveXObject( "Microsoft.XMLDOM" );
			lDoc.async = "false";
			lDoc.loadXML( aStream );
		} else {
			 */
		// For all other Browsers
		try{
			var lParser = new DOMParser();
			lDoc = lParser.parseFromString( aStream, "text/xml" );
		} catch( ex ) {
		// ignore exception here, lDoc will keep being null
		}
		/*
		}
			 */

		function node2obj( aNode, aObj ) {
			var lNode = aNode.firstChild;
			while( null !== lNode ) {
				// 1 = element node
				if( 1 === lNode.nodeType ) {
					var lType = lNode.getAttribute( "type" );
					var lKey = lNode.nodeName;
					if( lType ) {
						var lValue = lNode.firstChild;
						// 3 = text node
						if( lValue && 3 === lValue.nodeType ) {
							lValue = lValue.nodeValue;
							if( lValue ) {
								if( "string" === lType ) {
								} else if( "number" === lType ) {
								} else if( "boolean" === lType ) {
								} else if( "date" === lType ) {
								} else {
									lValue = undefined;
								}
								if( lValue ) {
									if ( aObj instanceof Array ) {
										aObj.push( lValue );
									} else {
										aObj[ lKey ] = lValue;
									}
								}
							}
						} else
						// 1 = element node
						if( lValue && 1 === lValue.nodeType ) {
							if( "array" === lType ) {
								aObj[ lKey ] = [];
								node2obj( lNode, aObj[ lKey ] );
							} else if( "object" === lType ) {
								aObj[ lKey ] = {};
								node2obj( lNode, aObj[ lKey ] );
							}
						}
					}
				}
				lNode = lNode.nextSibling;
			}
		}

		var lToken = {};
		if( lDoc ) {
			node2obj( lDoc.firstChild, lToken );
		}
		return lToken;
	}

});

// supporting String to ByteArray conversion
String.prototype.getBytes = function () {
  var lBytes = [];
  for (var lIndex = 0; lIndex < this.length; ++lIndex) {
    lBytes.push(this.charCodeAt(lIndex));
  }
  
  return lBytes;
};
