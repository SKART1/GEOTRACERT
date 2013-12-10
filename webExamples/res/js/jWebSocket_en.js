//  <JasobNoObfs>
//	---------------------------------------------------------------------------
//	jWebSocket Client (uses jWebSocket Server)
//	Copyright (c) 2010, 2011 Alexander Schulze, Innotrade GmbH, Herzogenrath
//	---------------------------------------------------------------------------
//	This program is free software; you can redistribute it and/or modify it
//	under the terms of the GNU Lesser General Public License as published by the
//	Free Software Foundation; either version 3 of the License, or (at your
//	option) any later version.
//	This program is distributed in the hope that it will be useful, but WITHOUT
//	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
//	FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
//	more details.
//	You should have received a copy of the GNU Lesser General Public License along
//	with this program; if not, see <http://www.gnu.org/licenses/lgpl.html>.
//	---------------------------------------------------------------------------
//  </JasobNoObfs>

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

	//:const:*:VERSION:String:1.0b5 (nightly build 11222)
	//:d:en:Version of the jWebSocket JavaScript Client
	VERSION: "1.0b5 (nightly build 11222)",

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
		"ws://" + ( self.location.hostname ? self.location.hostname : "127.0.0.1" ) + ":8787/jWebSocket/jWebSocket",

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
		reconnectDelay: 500,
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
		if( aOptions.OnMessage && typeof aOptions.OnMessage == "function" ) {
			lOnMessage = aOptions.OnMessage;
		}
		if( aOptions.OnError && typeof aOptions.OnError == "function" ) {
			lOnError = aOptions.OnError;
		}
		if( aOptions.file && typeof aOptions.file == "String" ) {
			lFile = aOptions.file;
		}
		if( aOptions.method && typeof aOptions.method == "function" ) {
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
				if( lOnMessage != null ) {
					lOnMessage.call( lThis, {
						data: aEvent.data
					});
				}
				// console.log( "Worker message: " + JSON.stringify( aEvent.data ) );
			};

			// This listener is called when an error
			// occurred within the thread.
			jws.worker.onerror = function( aEvent ) {
				if( lOnError != null ) {
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
		isActive: false,
		level: 2, 
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
			return( window.console && jws.console.isActive
				&& jws.console.level <= jws.console.DEBUG );
		},
	
		//:m:*:isInfoEnabled
		//:d:en:Determines, if the info log output is currently enabled. _
		//:d:en:A call to this method can improve performance, _
		//:d:en:since complex log output string do not need to be generated.
		//:a:en::::none
		//:r:en:::Boolean:[tt]true[/tt], if info logs are enabled, otherwise [tt]false[/tt].
		isInfoEnabled: function() {
			return( window.console && jws.console.isActive
				&& jws.console.level <= jws.console.INFO );
		},
	
		//:m:*:log
		//:d:en:Logs the given message as non-classified message to the console.
		//:a:*::aMsg:String:Message to be logged as non-classified output.
		//:r:en:::void
		log: function( aMsg ) {
			if( window.console 
				&& jws.console.isActive
			) {
				console.log( aMsg );
			}
		},
		
		//:m:*:debug
		//:d:en:Logs the given message as debug message to the console. _
		//:d:en:If the log is not active or the log level is set higher than _
		//:d:en:[tt]DEBUG[/tt] the message is suppressed.
		//:a:*::aMsg:String:Message to be logged as debug output.
		//:r:en:::void
		debug: function( aMsg ) {
			if( window.console
				&& jws.console.isActive 
				&& jws.console.level <= jws.console.DEBUG
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
		//:d:en:If the log is not active or the log level is set higher than _
		//:d:en:[tt]INFO[/tt] the message is suppressed.
		//:a:*::aMsg:String:Message to be logged as an info output.
		//:r:en:::void
		info: function( aMsg ) {
			if( window.console 
				&& jws.console.isActive 
				&& jws.console.level <= jws.console.INFO
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
		//:d:en:If the log is not active or the log level is set higher than _
		//:d:en:[tt]WARN[/tt] the message is suppressed.
		//:a:*::aMsg:String:Message to be logged as a warning output.
		//:r:en:::void
		warn: function( aMsg ) {
			if( window.console
				&& jws.console.isActive
				&& jws.console.level <= jws.console.WARN
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
		//:d:en:If the log is not active or the log level is set higher than _
		//:d:en:[tt]ERROR[/tt] the message is suppressed.
		//:a:*::aMsg:String:Message to be logged as an error output.
		//:r:en:::void
		error: function( aMsg ) {
			if( window.console
				&& jws.console.isActive
				&& jws.console.level <= jws.console.ERROR
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
		//:d:en:If the log is not active or the log level is set higher than _
		//:d:en:[tt]FATAL[/tt] the message is suppressed.
		//:a:*::aMsg:String:Message to be logged as a fatal output.
		//:r:en:::void
		fatal: function( aMsg ) {
			if( window.console
				&& jws.console.isActive
				&& jws.console.level <= jws.console.FATAL
			) {
				if( console.fatal ) {
					console.fatal( aMsg );
				} else {
					console.log( "[fatal]: " + aMsg );
				}	
			}
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
				jws.fIsFirefox = navigator.appName == "Netscape";
				if( jws.fIsFirefox ) {
					jws.fBrowserType = jws.BT_FIREFOX;
				} else {
					jws.fIsOpera = navigator.appName == "Opera";
					if( jws.fIsOpera ) {
						jws.fBrowserType = jws.BT_OPERA;
					} else {
						jws.fIsIExplorer = navigator.appName == "Microsoft Internet Explorer";
						if( jws.fIsIExplorer ) {
							jws.fBrowserType = jws.BT_IEXPLORER;
						} else {
							jws.fIsPocketIE = navigator.appName == "Microsoft Pocket Internet Explorer";
							if( jws.fIsPocketIE ) {
								jws.fBrowserType = jws.BT_IEXPLORER;
							}
						}
					}
				}
			}
		}
	}

	var p, i;
	var lStr;
	var lFound;
	var lVersion;

	if( jws.fIsIExplorer ) {
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
			i = 0;
			while( i < lStr.length ) {
				if( lStr.charAt( i ) == '.' ) {
					lFound++;
				}	
				if( lFound >= 2 ) {
					break;
				}	
				i++;
			}
			lStr = lStr.substring( 0, i );
			jws.fBrowserVerNo = parseFloat( lStr );
		}
	}
	else if( jws.fIsNetscape ) {
		jws.fBrowserName = jws.BROWSER_NAMES[ jws.BT_NETSCAPE ];
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
			i = 0;
			while( i < lStr.length ) {
				if( lStr.charAt( i ) == '.' ) {
					lFound++;
				}
				if( lFound >= 2 ) {
					break;
				}	
				i++;
			}
			lStr = lStr.substring( 0, i );
			jws.fBrowserVerNo = parseFloat( lStr );
		}
	} else if( jws.fIsOpera ) {
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
		lVersion = lUA.match( /Version\/.*/i );
		if ( lVersion ) {
			lStr = lVersion[ 0 ].substr( 8 );
			p = lStr.indexOf( " " );
			jws.fBrowserVerStr = p > 0 ? lStr.substr( 0, p ) : lStr;

			lFound = 0;
			i = 0;
			while( i < lStr.length ) {
				if( lStr.charAt( i ) == '.' ) {
					lFound++;
				}	
				if( lFound >= 2 ) {
					break;
				}	
				i++;
			}
			lStr = lStr.substring( 0, i );
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
	)

};

//  <JasobNoObfs>
/* A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 * For full source please refer to: md5.js
 */
var hexcase=0;var b64pad="";function hex_md5(s){return rstr2hex(rstr_md5(str2rstr_utf8(s)));};function b64_md5(s){return rstr2b64(rstr_md5(str2rstr_utf8(s)));};function any_md5(s,e){return rstr2any(rstr_md5(str2rstr_utf8(s)),e);};function hex_hmac_md5(k,d){return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k),str2rstr_utf8(d)));};function b64_hmac_md5(k,d){return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k),str2rstr_utf8(d)));};function any_hmac_md5(k,d,e){return rstr2any(rstr_hmac_md5(str2rstr_utf8(k),str2rstr_utf8(d)),e);};function md5_vm_test(){return hex_md5("abc").toLowerCase()=="900150983cd24fb0d6963f7d28e17f72";};function rstr_md5(s){return binl2rstr(binl_md5(rstr2binl(s),s.length*8));};function rstr_hmac_md5(key,data){var bkey=rstr2binl(key);if(bkey.length>16)bkey=binl_md5(bkey,key.length*8);var ipad=Array(16),opad=Array(16);for(var i=0;i<16;i++){ipad[i]=bkey[i]^0x36363636;opad[i]=bkey[i]^0x5C5C5C5C;}var hash=binl_md5(ipad.concat(rstr2binl(data)),512+data.length*8);return binl2rstr(binl_md5(opad.concat(hash),512+128));};function rstr2hex(input){try{hexcase}catch(e){hexcase=0;}var hex_tab=hexcase?"0123456789ABCDEF":"0123456789abcdef";var output="";var x;for(var i=0;i<input.length;i++){x=input.charCodeAt(i);output+=hex_tab.charAt((x>>>4)&0x0F)+hex_tab.charAt(x&0x0F);}return output;};function rstr2b64(input){try{b64pad}catch(e){b64pad='';}var tab="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";var output="";var len=input.length;for(var i=0;i<len;i+=3){var triplet=(input.charCodeAt(i)<<16)|(i+1<len?input.charCodeAt(i+1)<<8:0)|(i+2<len?input.charCodeAt(i+2):0);for(var j=0;j<4;j++){if(i*8+j*6>input.length*8)output+=b64pad;else output+=tab.charAt((triplet>>>6*(3-j))&0x3F);}}return output;};function rstr2any(input,encoding){var divisor=encoding.length;var i,j,q,x,quotient;var dividend=Array(Math.ceil(input.length/2));for(i=0;i<dividend.length;i++){dividend[i]=(input.charCodeAt(i*2)<<8)|input.charCodeAt(i*2+1);}var full_length=Math.ceil(input.length*8/(Math.log(encoding.length)/Math.log(2)));var remainders=Array(full_length);for(j=0;j<full_length;j++){quotient=Array();x=0;for(i=0;i<dividend.length;i++){x=(x<<16)+dividend[i];q=Math.floor(x/divisor);x-=q*divisor;if(quotient.length>0||q>0)quotient[quotient.length]=q;}remainders[j]=x;dividend=quotient;}var output="";for(i=remainders.length-1;i>=0;i--)output+=encoding.charAt(remainders[i]);return output;};function str2rstr_utf8(input){var output="";var i= -1;var x,y;while(++i<input.length){x=input.charCodeAt(i);y=i+1<input.length?input.charCodeAt(i+1):0;if(0xD800<=x&&x<=0xDBFF&&0xDC00<=y&&y<=0xDFFF){x=0x10000+((x&0x03FF)<<10)+(y&0x03FF);i++;}if(x<=0x7F)output+=String.fromCharCode(x);else if(x<=0x7FF)output+=String.fromCharCode(0xC0|((x>>>6)&0x1F),0x80|(x&0x3F));else if(x<=0xFFFF)output+=String.fromCharCode(0xE0|((x>>>12)&0x0F),0x80|((x>>>6)&0x3F),0x80|(x&0x3F));else if(x<=0x1FFFFF)output+=String.fromCharCode(0xF0|((x>>>18)&0x07),0x80|((x>>>12)&0x3F),0x80|((x>>>6)&0x3F),0x80|(x&0x3F));}return output;};function str2rstr_utf16le(input){var output="";for(var i=0;i<input.length;i++)output+=String.fromCharCode(input.charCodeAt(i)&0xFF,(input.charCodeAt(i)>>>8)&0xFF);return output;};function str2rstr_utf16be(input){var output="";for(var i=0;i<input.length;i++)output+=String.fromCharCode((input.charCodeAt(i)>>>8)&0xFF,input.charCodeAt(i)&0xFF);return output;};function rstr2binl(input){var output=Array(input.length>>2);for(var i=0;i<output.length;i++)output[i]=0;for(var i=0;i<input.length*8;i+=8)output[i>>5]|=(input.charCodeAt(i/8)&0xFF)<<(i%32);return output;};function binl2rstr(input){var output="";for(var i=0;i<input.length*32;i+=8)output+=String.fromCharCode((input[i>>5]>>>(i%32))&0xFF);return output;};function binl_md5(x,len){x[len>>5]|=0x80<<((len)%32);x[(((len+64)>>>9)<<4)+14]=len;var a=1732584193;var b= -271733879;var c= -1732584194;var d=271733878;for(var i=0;i<x.length;i+=16){var olda=a;var oldb=b;var oldc=c;var oldd=d;a=md5_ff(a,b,c,d,x[i+0],7,-680876936);d=md5_ff(d,a,b,c,x[i+1],12,-389564586);c=md5_ff(c,d,a,b,x[i+2],17,606105819);b=md5_ff(b,c,d,a,x[i+3],22,-1044525330);a=md5_ff(a,b,c,d,x[i+4],7,-176418897);d=md5_ff(d,a,b,c,x[i+5],12,1200080426);c=md5_ff(c,d,a,b,x[i+6],17,-1473231341);b=md5_ff(b,c,d,a,x[i+7],22,-45705983);a=md5_ff(a,b,c,d,x[i+8],7,1770035416);d=md5_ff(d,a,b,c,x[i+9],12,-1958414417);c=md5_ff(c,d,a,b,x[i+10],17,-42063);b=md5_ff(b,c,d,a,x[i+11],22,-1990404162);a=md5_ff(a,b,c,d,x[i+12],7,1804603682);d=md5_ff(d,a,b,c,x[i+13],12,-40341101);c=md5_ff(c,d,a,b,x[i+14],17,-1502002290);b=md5_ff(b,c,d,a,x[i+15],22,1236535329);a=md5_gg(a,b,c,d,x[i+1],5,-165796510);d=md5_gg(d,a,b,c,x[i+6],9,-1069501632);c=md5_gg(c,d,a,b,x[i+11],14,643717713);b=md5_gg(b,c,d,a,x[i+0],20,-373897302);a=md5_gg(a,b,c,d,x[i+5],5,-701558691);d=md5_gg(d,a,b,c,x[i+10],9,38016083);c=md5_gg(c,d,a,b,x[i+15],14,-660478335);b=md5_gg(b,c,d,a,x[i+4],20,-405537848);a=md5_gg(a,b,c,d,x[i+9],5,568446438);d=md5_gg(d,a,b,c,x[i+14],9,-1019803690);c=md5_gg(c,d,a,b,x[i+3],14,-187363961);b=md5_gg(b,c,d,a,x[i+8],20,1163531501);a=md5_gg(a,b,c,d,x[i+13],5,-1444681467);d=md5_gg(d,a,b,c,x[i+2],9,-51403784);c=md5_gg(c,d,a,b,x[i+7],14,1735328473);b=md5_gg(b,c,d,a,x[i+12],20,-1926607734);a=md5_hh(a,b,c,d,x[i+5],4,-378558);d=md5_hh(d,a,b,c,x[i+8],11,-2022574463);c=md5_hh(c,d,a,b,x[i+11],16,1839030562);b=md5_hh(b,c,d,a,x[i+14],23,-35309556);a=md5_hh(a,b,c,d,x[i+1],4,-1530992060);d=md5_hh(d,a,b,c,x[i+4],11,1272893353);c=md5_hh(c,d,a,b,x[i+7],16,-155497632);b=md5_hh(b,c,d,a,x[i+10],23,-1094730640);a=md5_hh(a,b,c,d,x[i+13],4,681279174);d=md5_hh(d,a,b,c,x[i+0],11,-358537222);c=md5_hh(c,d,a,b,x[i+3],16,-722521979);b=md5_hh(b,c,d,a,x[i+6],23,76029189);a=md5_hh(a,b,c,d,x[i+9],4,-640364487);d=md5_hh(d,a,b,c,x[i+12],11,-421815835);c=md5_hh(c,d,a,b,x[i+15],16,530742520);b=md5_hh(b,c,d,a,x[i+2],23,-995338651);a=md5_ii(a,b,c,d,x[i+0],6,-198630844);d=md5_ii(d,a,b,c,x[i+7],10,1126891415);c=md5_ii(c,d,a,b,x[i+14],15,-1416354905);b=md5_ii(b,c,d,a,x[i+5],21,-57434055);a=md5_ii(a,b,c,d,x[i+12],6,1700485571);d=md5_ii(d,a,b,c,x[i+3],10,-1894986606);c=md5_ii(c,d,a,b,x[i+10],15,-1051523);b=md5_ii(b,c,d,a,x[i+1],21,-2054922799);a=md5_ii(a,b,c,d,x[i+8],6,1873313359);d=md5_ii(d,a,b,c,x[i+15],10,-30611744);c=md5_ii(c,d,a,b,x[i+6],15,-1560198380);b=md5_ii(b,c,d,a,x[i+13],21,1309151649);a=md5_ii(a,b,c,d,x[i+4],6,-145523070);d=md5_ii(d,a,b,c,x[i+11],10,-1120210379);c=md5_ii(c,d,a,b,x[i+2],15,718787259);b=md5_ii(b,c,d,a,x[i+9],21,-343485551);a=safe_add(a,olda);b=safe_add(b,oldb);c=safe_add(c,oldc);d=safe_add(d,oldd);}return Array(a,b,c,d);};function md5_cmn(q,a,b,x,s,t){return safe_add(bit_rol(safe_add(safe_add(a,q),safe_add(x,t)),s),b);};function md5_ff(a,b,c,d,x,s,t){return md5_cmn((b&c)|((~b)&d),a,b,x,s,t);};function md5_gg(a,b,c,d,x,s,t){return md5_cmn((b&d)|(c&(~d)),a,b,x,s,t);};function md5_hh(a,b,c,d,x,s,t){return md5_cmn(b^c^d,a,b,x,s,t);};function md5_ii(a,b,c,d,x,s,t){return md5_cmn(c^(b|(~d)),a,b,x,s,t);};function safe_add(x,y){var lsw=(x&0xFFFF)+(y&0xFFFF);var msw=(x>>16)+(y>>16)+(lsw>>16);return(msw<<16)|(lsw&0xFFFF);};function bit_rol(num,cnt){return(num<<cnt)|(num>>>(32-cnt));}
//  </JasobNoObfs>


//:package:*:jws.tools
//:class:*:jws.tools
//:ancestor:*:-
//:d:en:Implements some required JavaScript tools.
jws.tools = {

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
		if( aSQL && typeof aValue == "string" ) {
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
			+ this.zerofill( aDate.getUTCMilliseconds(), 2 )
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
		if ( "number" == lRes ) {
			if( ( parseFloat( lValue ) == parseInt( lValue ) ) ){
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
	}

};

if( !jws.browserSupportsNativeWebSockets ) {
	//	<JasobNoObfs>
	// --- swfobject.js ---
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
			// Full sources codes provided in web_socket.js
			(function(){if(window.WEB_SOCKET_FORCE_FLASH){}else if(window.WebSocket){return;}else if(window.MozWebSocket){window.WebSocket=MozWebSocket;return;}var logger;if(window.WEB_SOCKET_LOGGER){logger=WEB_SOCKET_LOGGER;}else if(window.console&&window.console.log&&window.console.error){logger=window.console;}else{logger={log:function(){},error:function(){}};}if(swfobject.getFlashPlayerVersion().major<10){logger.error("Flash Player >= 10.0.0 is required.");return;}if(location.protocol=="file:"){logger.error("WARNING: web-socket-js doesn't work in file:///... URL "+"unless you set Flash Security Settings properly. "+"Open the page via Web server i.e. http://...");}window.WebSocket=function(url,protocols,proxyHost,proxyPort,headers){var self=this;self.__id=WebSocket.__nextId++;WebSocket.__instances[self.__id]=self;self.readyState=WebSocket.CONNECTING;self.bufferedAmount=0;self.__events={};if(!protocols){protocols=[];}else if(typeof protocols=="string"){protocols=[protocols];}self.__createTask=setTimeout(function(){WebSocket.__addTask(function(){self.__createTask=null;WebSocket.__flash.create(self.__id,url,protocols,proxyHost||null,proxyPort||0,headers||null);});},0);};WebSocket.prototype.send=function(data){if(this.readyState==WebSocket.CONNECTING){throw "INVALID_STATE_ERR: Web Socket connection has not been established";}var result=WebSocket.__flash.send(this.__id,encodeURIComponent(data));if(result<0){return true;}else{this.bufferedAmount+=result;return false;}};WebSocket.prototype.close=function(){if(this.__createTask){clearTimeout(this.__createTask);this.__createTask=null;this.readyState=WebSocket.CLOSED;return;}if(this.readyState==WebSocket.CLOSED||this.readyState==WebSocket.CLOSING){return;}this.readyState=WebSocket.CLOSING;WebSocket.__flash.close(this.__id);};WebSocket.prototype.addEventListener=function(type,listener,useCapture){if(!(type in this.__events)){this.__events[type]=[];}this.__events[type].push(listener);};WebSocket.prototype.removeEventListener=function(type,listener,useCapture){if(!(type in this.__events))return;var events=this.__events[type];for(var i=events.length-1;i>=0;--i){if(events[i]===listener){events.splice(i,1);break;}}};WebSocket.prototype.dispatchEvent=function(event){var events=this.__events[event.type]||[];for(var i=0;i<events.length;++i){events[i](event);}var handler=this["on"+event.type];if(handler)handler.apply(this,[event]);};WebSocket.prototype.__handleEvent=function(flashEvent){if("readyState"in flashEvent){this.readyState=flashEvent.readyState;}if("protocol"in flashEvent){this.protocol=flashEvent.protocol;}var jsEvent;if(flashEvent.type=="open"||flashEvent.type=="error"){jsEvent=this.__createSimpleEvent(flashEvent.type);}else if(flashEvent.type=="close"){jsEvent=this.__createSimpleEvent("close");jsEvent.wasClean=flashEvent.wasClean?true:false;jsEvent.code=flashEvent.code;jsEvent.reason=flashEvent.reason;}else if(flashEvent.type=="message"){var data=decodeURIComponent(flashEvent.message);jsEvent=this.__createMessageEvent("message",data);}else{throw "unknown event type: "+flashEvent.type;}this.dispatchEvent(jsEvent);};WebSocket.prototype.__createSimpleEvent=function(type){if(document.createEvent&&window.Event){var event=document.createEvent("Event");event.initEvent(type,false,false);return event;}else{return{type:type,bubbles:false,cancelable:false};}};WebSocket.prototype.__createMessageEvent=function(type,data){if(document.createEvent&&window.MessageEvent&& !window.opera){var event=document.createEvent("MessageEvent");event.initMessageEvent("message",false,false,data,null,null,window,null);return event;}else{return{type:type,data:data,bubbles:false,cancelable:false};}};WebSocket.CONNECTING=0;WebSocket.OPEN=1;WebSocket.CLOSING=2;WebSocket.CLOSED=3;WebSocket.__initialized=false;WebSocket.__flash=null;WebSocket.__instances={};WebSocket.__tasks=[];WebSocket.__nextId=0;WebSocket.loadFlashPolicyFile=function(url){WebSocket.__addTask(function(){WebSocket.__flash.loadManualPolicyFile(url);});};WebSocket.__initialize=function(){if(WebSocket.__initialized)return;WebSocket.__initialized=true;if(WebSocket.__swfLocation){window.WEB_SOCKET_SWF_LOCATION=WebSocket.__swfLocation;}if(!window.WEB_SOCKET_SWF_LOCATION){logger.error("[WebSocket] set WEB_SOCKET_SWF_LOCATION to location of WebSocketMain.swf");return;}if(!window.WEB_SOCKET_SUPPRESS_CROSS_DOMAIN_SWF_ERROR&& !WEB_SOCKET_SWF_LOCATION.match(/(^|\/)WebSocketMainInsecure\.swf(\?.*)?$/)&&WEB_SOCKET_SWF_LOCATION.match(/^\w+:\/\/([^\/]+)/)){var swfHost=RegExp.$1;if(location.host!=swfHost){logger.error("[WebSocket] You must host HTML and WebSocketMain.swf in the same host "+"('"+location.host+"' != '"+swfHost+"'). "+"See also 'How to host HTML file and SWF file in different domains' section "+"in README.md. If you use WebSocketMainInsecure.swf, you can suppress this message "+"by WEB_SOCKET_SUPPRESS_CROSS_DOMAIN_SWF_ERROR = true;");}}var container=document.createElement("div");container.id="webSocketContainer";container.style.position="absolute";if(WebSocket.__isFlashLite()){container.style.left="0px";container.style.top="0px";}else{container.style.left="-100px";container.style.top="-100px";}var holder=document.createElement("div");holder.id="webSocketFlash";container.appendChild(holder);document.body.appendChild(container);swfobject.embedSWF(WEB_SOCKET_SWF_LOCATION,"webSocketFlash","1","1","10.0.0",null,null,{hasPriority:true,swliveconnect:true,allowScriptAccess:"always"},null,function(e){if(!e.success){logger.error("[WebSocket] swfobject.embedSWF failed");}});};WebSocket.__onFlashInitialized=function(){setTimeout(function(){WebSocket.__flash=document.getElementById("webSocketFlash");WebSocket.__flash.setCallerUrl(location.href);WebSocket.__flash.setDebug(! !window.WEB_SOCKET_DEBUG);for(var i=0;i<WebSocket.__tasks.length;++i){WebSocket.__tasks[i]();}WebSocket.__tasks=[];},0);};WebSocket.__onFlashEvent=function(){setTimeout(function(){try{var events=WebSocket.__flash.receiveEvents();for(var i=0;i<events.length;++i){WebSocket.__instances[events[i].webSocketId].__handleEvent(events[i]);}}catch(e){logger.error(e);}},0);return true;};WebSocket.__log=function(message){logger.log(decodeURIComponent(message));};WebSocket.__error=function(message){logger.error(decodeURIComponent(message));};WebSocket.__addTask=function(task){if(WebSocket.__flash){task();}else{WebSocket.__tasks.push(task);}};WebSocket.__isFlashLite=function(){if(!window.navigator|| !window.navigator.mimeTypes){return false;}var mimeType=window.navigator.mimeTypes["application/x-shockwave-flash"];if(!mimeType|| !mimeType.enabledPlugin|| !mimeType.enabledPlugin.filename){return false;}return mimeType.enabledPlugin.filename.match(/flashlite/i)?true:false;};if(!window.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION){swfobject.addDomLoadEvent(function(){WebSocket.__initialize();});}})(); 
			//	</JasobNoObfs>
		}
		
	} else {
		// no Flash Player installed
		WebSocket = null;
	}
}


jws.XHR = {
	//:i:en:AJAX constants

	//:const:*:XHR_ASYNC
	//:d:en:Use asynchronous communication with the server. The current process is continued.
	ASYNC: true,
	//:const:*:SYNC
	//:d:en:Use synchronous communication with the server. The current process is blocked.
	SYNC: false,
	
	METHOD_GET: "get",
	METHOD_POST: "post",
	METHOD_HEAD: "head",
	
	getXHRInstance: function() {
		var lXHR = null;

		if ( window.XMLHttpRequest ) {
			lXHR = new XMLHttpRequest();
		} else if( window.ActiveXObject ) {
			/*
 var XMLHTTP_IDS = new Array('MSXML2.XMLHTTP.5.0',
                                     'MSXML2.XMLHTTP.4.0',
                                     'MSXML2.XMLHTTP.3.0',
                                     'MSXML2.XMLHTTP',
                                     'Microsoft.XMLHTTP' );
          var success = false;
          for (var i=0;i < XMLHTTP_IDS.length && !success; i++) {
              try {
                   xmlhttp = new ActiveXObject(XMLHTTP_IDS[i]);
                      success = true;
                } catch (e) {}
          }
          if (!success) {
              throw new Error('Unable to create XMLHttpRequest.');
          }
*/
			try {
				lXHR = new ActiveXObject( "Msxml2.XMLHTTP" );
			} catch( e1 ) {
				try{
					lXHR = new ActiveXObject( "Microsoft.XMLHTTP" );
				} catch( e2 ) {
					throw "f3.cfw.std.ex.xhr.NotAvail";
				}
			}
		} else {
			throw "f3.cfw.std.ex.xhr.NotAvail";
		}
		return lXHR;
	},

	isProtocolOk: function( aContext ) {
		if( !aContext ) {
			aContext = self;
		}	
		//:i:en:file protocol does not allow XHR requests.
		return(
			!(	aContext.location.protocol &&
				aContext.location.protocol.toLowerCase() == "file:"
				)
			);
	},
	
	//:i:en:default AJAX handler if no handler are provided by application
	mXHRSucClbk: function( aXHR, aArgs ) {
		throw "f3.cfw.std.ex.xhr.NoSuccObs";
	},

	mXHRErrClbk: function( aXHR, aArgs ) {
		throw "f3.cfw.std.ex.xhr.NoErrObs";
	},

	mXHRRespLsnr: function() {
		var aOptions = arguments.callee.options;

		if( f3.ajax.Request !== undefined /* && f3.ajax.Request.mXHRStChgObs */ ) {

			if( aOptions.OnReadyStateChange ) {
				aOptions.OnReadyStateChange( aOptions.XHR, aOptions );
			}
			switch( aOptions.XHR.readyState ) {
				//:i:en:uninitialized
				case 0:
				//:i:en:loading
				case 1:
				//:i:en:loaded
				case 2:
				//:i:en:interactive
				case 3:
					break;
				//:i:en:complete
				case 4:
					clearTimeout( aOptions.hTimeout );
					if( aOptions.XHR.status == 200 ) {
						// aOptions.OnSuccess( aOptions.XHR, aOptions );
						f3.dom.Event.callObserver( aOptions.OnSuccess, aOptions.XHR, aOptions );
					} else	{
						// aOptions.OnError( aOptions.XHR, aOptions );
						f3.dom.Event.callObserver( aOptions.OnError, aOptions.XHR, aOptions );
					}	
					aOptions.XHR = null;
					aOptions = null;
					arguments.callee.self = null;
					arguments.callee.options = null;
					// arguments.callee = null;
					break;
				default:
					aOptions.OnError( aOptions.XHR, aOptions );
					aOptions.XHR = null;
					aOptions = null;
					arguments.callee.self = null;
					arguments.callee.options = null;
					// arguments.callee = null;
					break;
			}
		}
	},

//	this.mXHRRespLsnr.options = aOptions;
//	this.mXHRRespLsnr.self = this;


	//:m:*:request
	//:d:en:This method performs a AJAX call. The call either can be asynchronous or synchronous.
	//:a:en::aURL:String:Server URL to access a resource or servlet.
	//:a:en:aOptions:method:String:Can be "post" or "get".
	//:a:en:aOptions:asynchronous:Boolean:Perform the request asynchronously (non-blocking) oder synchronously (blocking).
	//:a:en:aOptions:OnSuccess:Function:Callback for a successful request.
	//:a:en:aOptions:OnError:Function:Callback for a erroneous request.
	//:r:*:::void
	request: function( aURL, aOptions ) {

		//i:de:Einige Vorgabewerte pr&uuml;fen...
		//i:en:Check some default values
		aOptions = f3.core.OOP.getDefaultOptions( aOptions, {
			method			: "POST",
			asynchronous	: f3.ajax.Common.ASYNC,
			postBody		: null,
			timeout			: -1,
			// username		: null,
			// password		: null,
			OnSuccess		: f3.ajax.Request.mXHRSucClbk,
			OnError			: f3.ajax.Request.mXHRErrClbk,
			contentType		: "text/plain; charset=UTF-8", // "application/x-www-form-urlencoded"
			cacheControl	: "must-revalidate"
		});

		if( !f3.ajax.Common.isProtocolOk() ) {
			throw new Error( 0, f3.localeManager.getCurLocStr( "f3.cfw.std.ex.xhr.file" ) );
		}

		aOptions.XHR = f3.ajax.Common.getXHRInstance();
		if( aOptions.XHR ) {

			aOptions.XHR.open( aOptions.method, aURL, aOptions.asynchronous );

			if ( aOptions.method.toLowerCase() == "post" ) {
				aOptions.XHR.setRequestHeader(
					"Content-type",
					aOptions.contentType
					);
			}

			if( aOptions.cacheControl )
				aOptions.XHR.setRequestHeader( "Cache-Control", aOptions.cacheControl );

		
			var lResponseHandler = new $f3.$XHRResponse( aOptions );

			if( !f3.browser.Browser.isFirefox() || aOptions.asynchronous ) {
				aOptions.XHR.onreadystatechange = lResponseHandler.mXHRRespLsnr;
			// function() {
			//	if( f3.ajax.Request !== undefined && f3.ajax.Request.mXHRStChgObs )
			//		f3.ajax.Request.mXHRStChgObs( aOptions );
			//};
			} else {
				aOptions.XHR.onreadystatechange = null;
			}
			
			if( aOptions.timeout > 0 ) {
				aOptions.hTimeout = 
				setTimeout(
					function() {
						aOptions.XHR.abort();
						if( f3.browser.Browser.isFirefox() && !aOptions.asynchronous ) {
							lResponseHandler.handler( aOptions );
						}
					},
					aOptions.timeout
					);
			}	
			
			try {
				aOptions.XHR.send( aOptions.postBody );
			} catch( e ) {
				aOptions.OnError( aOptions.XHR, aOptions );
			}	
			if( f3.browser.Browser.isFirefox() && !aOptions.asynchronous ) {
				lResponseHandler.mXHRRespLsnr( aOptions );
			}
		// f3.ajax.Request.mXHRStChgObs( aOptions );
		}


		return aOptions.XHR;
	}

}


if( !jws.browserSupportsNativeJSON ) {
	// <JasobNoObfs>
	// Please refer to http://json.org/js
	if(!this.JSON){this.JSON={};}(function(){function f(n){return n<10?'0'+n:n;}if(typeof Date.prototype.toJSON!=='function'){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+'-'+f(this.getUTCMonth()+1)+'-'+f(this.getUTCDate())+'T'+f(this.getUTCHours())+':'+f(this.getUTCMinutes())+':'+f(this.getUTCSeconds())+'Z':null;};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf();};}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);})+'"':'"'+string+'"';}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==='object'&&typeof value.toJSON==='function'){value=value.toJSON(key);}if(typeof rep==='function'){value=rep.call(holder,key,value);}switch(typeof value){case'string':return quote(value);case'number':return isFinite(value)?String(value):'null';case'boolean':case'null':return String(value);case'object':if(!value){return'null';}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==='[object Array]'){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||'null';}v=partial.length===0?'[]':gap?'[\n'+gap+partial.join(',\n'+gap)+'\n'+mind+']':'['+partial.join(',')+']';gap=mind;return v;}if(rep&&typeof rep==='object'){length=rep.length;for(i=0;i<length;i+=1){k=rep[i];if(typeof k==='string'){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}else{for(k in value){if(Object.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}v=partial.length===0?'{}':gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+mind+'}':'{'+partial.join(',')+'}';gap=mind;return v;}}if(typeof JSON.stringify!=='function'){JSON.stringify=function(value,replacer,space){var i;gap='';indent='';if(typeof space==='number'){for(i=0;i<space;i+=1){indent+=' ';}}else if(typeof space==='string'){indent=space;}rep=replacer;if(replacer&&typeof replacer!=='function'&&(typeof replacer!=='object'||typeof replacer.length!=='number')){throw new Error('JSON.stringify');}return str('',{'':value});};}if(typeof JSON.parse!=='function'){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==='object'){for(k in value){if(Object.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v;}else{delete value[k];}}}}return reviver.call(holder,key,value);}text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);});}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){j=eval('('+text+')');return typeof reviver==='function'?walk({'':j},''):j;}throw new SyntaxError('JSON.parse');};}}());
	// </JasobNoObfs>
}

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
		}
	};
	
	// publish the new class in the given name space
	lNS[ aClassname ] = lConstructor;

	// move all fields from spec to new class' prototype
	var lField;
	for( lField in aFields ) {
		lConstructor.prototype[ lField ] = aFields[ lField ];
	}
	if( aAncestor != null ) {
		// every class maintains an array of its direct descendants
		if( !aAncestor.descendants ) {
			aAncestor.descendants = [];
		}
		aAncestor.descendants.push( lConstructor );
		for( lField in aAncestor.prototype ) {
			var lAncMthd = aAncestor.prototype[ lField ];
			if( typeof lAncMthd == "function" ) {
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
jws.oop.addPlugIn = function( aClass, aPlugIn ) {

	// if the class has no plug-ins yet initialize array
	if( !aClass.fPlugIns ) {
		aClass.fPlugIns = [];
	}
	// add the plug-in to the class
	aClass.fPlugIns.push( aPlugIn );
	// clone all methods of the plug-in to the class
	for( var lField in aPlugIn ) {
		// don't overwrite existing methods of class with plug-in methods
		// ensure that native jWebSocket methods don't get overwritten!
		if( !aClass.prototype[ lField ] ) {
			aClass.prototype[ lField ] = aPlugIn[ lField ];
			// var lObj = aClass.prototype[ lField ];
		}
	}
	// if the class already has descendants recursively
	// clone the plug-in methods to these as well.
	if( aClass.descendants ) {
		for( var lIdx = 0, lCnt = aClass.descendants.length; lIdx < lCnt; lIdx ++ ) {
			jws.oop.addPlugIn( aClass.descendants[ lIdx ], aPlugIn );
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
		// method to be overwritten in descendant classes
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

			// TODO: !this.fConn is not enough here! Check for readystate!
			// if connection not already established...
			if( !this.fConn ) {
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
				if( this.fStatus != jws.RECONNECTING ) {
					this.fStatus = jws.CONNECTING;
				}	
				
				if( aOptions.OnOpenTimeout
					&& typeof aOptions.OnOpenTimeout == "function"
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
					if( lThis.hOpenTimeout ) {
						clearTimeout( lThis.hOpenTimeout );
						lThis.hOpenTimeout = null;
					}
					lThis.fStatus = jws.OPEN;
					lValue = lThis.processOpened( aEvent );
					// give application change to handle event
					if( aOptions.OnOpen ) {
						aOptions.OnOpen( aEvent, lValue, lThis );
					}
					// process outgoing queue
					lThis.processQueue();
				};

				this.fConn.onmessage = function( aEvent ) {
					if( jws.console.isDebugEnabled() ) {
						jws.console.debug("[onmessage]: " + JSON.stringify( aEvent ));
					}	
					lValue = lThis.processPacket( aEvent );
					// give application change to handle event first
					if( aOptions.OnMessage ) {
						aOptions.OnMessage( aEvent, lValue, lThis );
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
							lThis.fReliabilityOptions.reconnectDelay
						);
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
			if( lRes.code == 0 ) {
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
	//:d:en:Sends a given string to the jWebSocket Server. The methods checks _
	//:d:en:if the connection is still up and throws an exception if not.
	//:a:en::aData:String:String to be send the jWebSocketServer
	//:r:*:::void:none
	sendStream: function( aData ) {
		// is client already connected
		if( this.isOpened() ) {
			try {
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
		if( aAutoReconnect && typeof( aLimit ) == "boolean" ) {
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
		if( aLimit && typeof( aLimit ) == "number" && aLimit > 0 ) {
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
		if( aLimit && typeof( aLimit ) == "number" && aLimit > 0 ) {
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
				abortReconnect();
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
			this.fConn != undefined
			&& this.fConn != null
			&& this.fConn.readyState == jws.OPEN
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
			if( this.fConn.readyState == jws.OPEN
					|| this.fConn.readyState == jws.CONNECTING ) {
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
		// connection established at all?
		// TODO: Shouldn't we test for ready state here?
		if( this.fConn ) {
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
				if( aCallback == this.fListeners[ lIdx ] ) {
					this.fListeners.splice( lIdx, 1 );
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
		// add the plug-in to the class
		this.fPlugIns.push( aPlugIn );
/*
 		 var lField;
 */
		if( !aId ) {
			aId = aPlugIn.ID;
		}
		//:todo:en:check if plug-in with given id already exists!
		if( aId ) {
			aPlugIn.conn = this;
/*
			// blend all methods of the plug-in to the connection instance
			this[ aId ] = {
				conn: this
			};
			for( lField in aPlugIn ) {
				if( lField != "conn" ) {
					this[ aId ][ lField ] = aPlugIn[ lField ];
				}
			}
*/
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
				&& aToken.code === 0 ) {
				lCallback.OnSuccess.call( this, aToken, lArgs );
			}	
			if( lCallback.OnFailure
				&& aToken.code != undefined 
				&& aToken.code != 0 ) {
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
		return(
			this.isOpened() || this.fStatus == jws.RECONNECTING
		);
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
		if( lRes.code == 0 && !this.isLoggedIn() ) {
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
			( aResToken && typeof aResToken == "object" && aResToken.msg ? 
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
		// reset the session...
		this.fSessionId = null;
		// and the username as well
		this.fUsername = null;
	},

	//:m:*:processPacket
	//:d:en:Is called when a new raw data packet is received by the client. _
	//:d:en:This methods calls the [tt]streamToToken[/tt] method of the _
	//:d:en:its descendant who is responsible to implement the sub protocol _
	//:d:en:JSON, CSV or XML, here to parse the raw packet in the corresponding _
	//:d:en:format.
	//:a:en::aEvent:Object:Event object from the browser's WebSocket instance.
	//:r:*:::void:none
	processPacket: function( aEvent ) {
		// parse incoming token...
		var lToken = this.streamToToken( aEvent.data );
		// and process it...
		this.processToken( lToken );
		return lToken;
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
		if ( lNS != null && lNS.indexOf( "org.jWebSocket" ) == 1 ) {
			aToken.ns = "org.jwebsocket" + lNS.substring( 15 );
		} else if( lNS == null ) {
			aToken.ns = "org.jwebsocket.plugins.system";
		}

		// is it a token from the system plug-in at all?
		if( jws.NS_SYSTEM == aToken.ns ) {
			// check welcome and goodBye tokens to manage the session
			if( aToken.type == "welcome" && aToken.usid ) {
				this.fSessionId = aToken.usid;
				this.fClientId = aToken.sourceId;
				this.notifyPlugInsOpened();
				// fire OnWelcome Event if assigned
				if( this.fOnWelcome ) {
					this.fOnWelcome( aToken );
				}
				var lFlashBridgeVer = "n/a";
				if( swfobject) {
					var lInfo = swfobject.getFlashPlayerVersion();
					lFlashBridgeVer = lInfo.major + "." + lInfo.minor + "." + lInfo.release;
				}
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
							: "flash " + lFlashBridgeVer
					}, {
					}
				);
			} else if( aToken.type == "goodBye" ) {
				// fire OnGoodBye Event if assigned
				if( this.fOnGoodBye ) {
					this.fOnGoodBye( aToken );
				}
				this.fSessionId = null;
				this.fUsername = null;
			} else if( aToken.type == "close" ) {
				// if the server closes the connection close immediately too.
				this.close({
					timeout: 0
				});
			// check if we got a response from a previous request
			} else if( aToken.type == "response" ) {
				// check login and logout manage the username
				if( aToken.reqType == "login" ) {
					this.fUsername = aToken.username;
					// if re-login used previous session-id re-assign it here!
					if( aToken.usid ) {
						this.fSessionId = aToken.usid;
					}
				}
				if( aToken.reqType == "logout" ) {
					this.fUsername = null;
				}
				// check if some requests need to be answered
				this.checkCallbacks( aToken );
			} else if( aToken.type == "event" ) {
				// check login and logout manage the username
				if( aToken.name == "connect" ) {
					this.processConnected( aToken );
				}
				if( aToken.name == "disconnect" ) {
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
		var lRes = this.checkWriteable();
		if( lRes.code == 0 ) {
			var lSpawnThread = false;
			var lL2FragmSize = 0;
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
			if( lL2FragmSize > 0 && lStream.length > 0 ) {
				var lToken, lFragment, lFragmId = 0, lStart = 0, lTotal = lStream.length;
				while( lStream.length > 0 ) {
					lToken = {
						ns: jws.NS_SYSTEM,
						type: "fragment",
						utid: aToken.utid,
						index: lFragmId++,
						total: parseInt( lTotal / lL2FragmSize ) + 1,
						data: lStream.substr( 0, lL2FragmSize )
					};
					lStart += lL2FragmSize;
					lStream = lStream.substr( lL2FragmSize );
					lFragment = this.tokenToStream( lToken );
					this.sendStream( lFragment );
					// console.log( "sending fragment " + lFragment + "..." );
				}
			} else {
				if( jws.console.isDebugEnabled() ) {
					jws.console.debug( "[sendToken]: Sending stream " + lStream + "..." );
				}
				this.sendStream( lStream );
			}
		}
		return lRes;
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
		if( lRes.code == 0 ) {
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
		if( lRes.code == 0 ) {
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
		if( lRes.code == 0 ) {
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
			if( aOptions && aOptions.OnToken && typeof aOptions.OnToken == "function" ) {
				this.fOnToken = aOptions.OnToken;
			}
			if( aOptions && aOptions.OnWelcome && typeof aOptions.OnWelcome == "function" ) {
				this.fOnWelcome = aOptions.OnWelcome;
			}
			if( aOptions && aOptions.OnGoodBye && typeof aOptions.OnGoodBye == "function" ) {
				this.fOnGoodBye = aOptions.OnGoodBye;
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
			if( lRes.code == 0 ) {
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
		if( jws.NS_SYSTEM == aToken.ns ) {
			if( "login" == aToken.reqType ) {
				if( aToken.code == 0 ) {
					if( this.fOnLoggedIn ) {
						this.fOnLoggedIn( aToken );
					}
				} else {
					if( this.fOnLoginError ) {
						this.fOnLoginError( aToken );
					}
				}
			} else if( "logout" == aToken.reqType ) {
				if( aToken.code == 0 ) {
					if( this.fOnLoggedOut ) {
						this.fOnLoggedOut( aToken );
					}
				} else {
					if( this.fOnLogoutError ) {
						this.fOnLogoutError( aToken );
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
	//:a:en::aOptions:Object:Optional arguments as listed below...
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
				if( jws.SystemClientPlugIn.PW_ENCODE_MD5 == lEncoding ) {
					if( aPassword ) {
						aPassword = jws.tools.calcMD5( aPassword );
					}
					lEncoding = "md5";
				// check if password is already md5 encoded
				} else if( jws.SystemClientPlugIn.PW_MD5_ENCODED == lEncoding ) {
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
			});
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
		if( lRes.code == 0 ) {
			this.sendToken({
				ns: jws.SystemClientPlugIn.NS,
				type: "logout"
			});
		}
		return lRes;
	},
	
	systemLogon: function( aUsername, aPassword, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
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
		if( 0 == lRes.code ) {
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
		if( 0 == lRes.code ) {
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
			if( aOptions.mode == jws.SystemClientPlugIn.AUTHENTICATED ||
				aOptions.mode == jws.SystemClientPlugIn.NON_AUTHENTICATED ) {
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
		if( lRes.code == 0 ) {
			var lResponseRequested = true;
			if( aOptions ) {
				if( aOptions.responseRequested != undefined ) {
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
			stopKeepAlive();
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
			if( aOptions.interval != undefined ) {
				lInterval = aOptions.interval;
			}
			if( aOptions.echo != undefined ) {
				lEcho = aOptions.echo;
			}
			if( aOptions.immediate != undefined ) {
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
			} else if( typeof lVal == "string" ) {
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
			if( lKeyVal.length == 2 ) {
				var lKey = lKeyVal[ 0 ];
				var lVal = lKeyVal[ 1 ];
				if( lVal.length >= 2 
					&& lVal.charAt(0)=="\""
					&& lVal.charAt(lVal.length-1)=="\"" ) {
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
			else if ( typeof aValue  == "object" ) {
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
			while( lNode != null ) {
				// 1 = element node
				if( lNode.nodeType == 1 ) {
					var lType = lNode.getAttribute( "type" );
					var lKey = lNode.nodeName;
					if( lType ) {
						var lValue = lNode.firstChild;
						// 3 = text node
						if( lValue && lValue.nodeType == 3 ) {
							lValue = lValue.nodeValue;
							if( lValue ) {
								if( lType == "string" ) {
								} else if( lType == "number" ) {
								} else if( lType == "boolean" ) {
								} else if( lType == "date" ) {
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
						if( lValue && lValue.nodeType == 1 ) {
							if( lType == "array" ) {
								aObj[ lKey ] = [];
								node2obj( lNode, aObj[ lKey ] );
							} else if( lType == "object" ) {
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

/*
(function() {
	var lObj = {
		aNumber: 1,
		aString: "test1",
		aBoolean: true,
		aArray: [ 2, "test2", false ],
		aObject: {
			bNumber: 3,
			bString: "test3",
			bBoolean: true,
			bArray: [ 3, "test3", true ]
		}
	};
	var lStream = 
		'<?xml version="1.0" encoding="windows-1252"?>' +
		'<token>' +
			'<aNumber type="number">1</aNumber>' +
			'<aString type="string">test1</aString>' +
			'<aBoolean type="boolean">true</aBoolean>' +
			'<aArray type="array">' +
				'<item type="number">2</item>'+
				'<item type="string">test2</item>' +
				'<item type="boolean">false</item>' +
			'</aArray>' +
			'<aObject type="object">' +
				'<bNumber type="number">3</bNumber>'+
				'<bString type="string">test3</bString>' +
				'<bBoolean type="boolean">true</bBoolean>' +
				'<bArray type="array">'+
					'<item type="number">3</item>' +
					'<item type="string">test3</item>' +
					'<item type="boolean">true</item>' +
				'</bArray>' +
			'</aObject>' +
		'</token>';

	var lXMLClient = new jws.jWebSocketXMLClient();
//	var lStream = lXMLClient.tokenToStream( lObj );
	var lToken = lXMLClient.streamToToken( lStream );
	console.log( lStream );
})();
*//*
MIT LICENSE
Copyright (c) 2007 Monsur Hossain (http://monsur.hossai.in)

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

/**
* An easier way to refer to the priority of a cache item
* @enum {number}
*/
var CachePriority = {
  'LOW': 1,
  'NORMAL': 2,
  'HIGH': 4
};

/**
* Creates a new Cache object.
* @param {number} maxSize The maximum size of the cache (or -1 for no max).
* @param {boolean} debug Whether to log events to the console.log.
* @constructor
*/
function Cache(maxSize, debug, storage) {
    this.maxSize_ = maxSize || -1;
    this.debug_ = debug || false;
    this.items_ = storage || new Cache.BasicCacheStorage();
    this.count_ = 0;

    this.fillFactor_ = .75;

    this.stats_ = {};
    this.stats_['hits'] = 0;
    this.stats_['misses'] = 0;
    this.log_('Initialized cache with size ' + maxSize);
}

/**
* Basic in memory cache storage backend.
* @constructor
*/
Cache.BasicCacheStorage = function() {
  this.items_ = {};
}
Cache.BasicCacheStorage.prototype.get = function(key) {
  return this.items_[key];
}
Cache.BasicCacheStorage.prototype.set = function(key, value) {
  this.items_[key] = value;
}
Cache.BasicCacheStorage.prototype.remove = function(key) {
  var item = this.get(key);
  delete this.items_[key];
  return item;
}
Cache.BasicCacheStorage.prototype.keys = function() {
  var ret = [], p;
  for (p in this.items_) ret.push(p);
  return ret;
}

/**
* Local Storage based persistant cache storage backend.
* If a size of -1 is used, it will purge itself when localStorage
* is filled. This is 5MB on Chrome/Safari.
* WARNING: The amortized cost of this cache is very low, however,
* when a the cache fills up all of localStorage, and a purge is required, it can
* take a few seconds to fetch all the keys and values in storage.
* Since localStorage doesn't have namespacing, this means that even if this
* individual cache is small, it can take this time if there are lots of other
* other keys in localStorage.
*
* @param {string} namespace A string to namespace the items in localStorage. Defaults to 'default'.
* @constructor
*/
Cache.LocalStorageCacheStorage = function(namespace) {
  this.prefix_ = 'cache-storage.' + (namespace || 'default') + '.';
  // Regexp String Escaping from http://simonwillison.net/2006/Jan/20/escape/#p-6
  var escapedPrefix = this.prefix_.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  this.regexp_ = new RegExp('^' + escapedPrefix)
}
Cache.LocalStorageCacheStorage.prototype.get = function(key) {
  var item = localStorage[this.prefix_ + key];
  if (item) return JSON.parse(item);
  return null;
}
Cache.LocalStorageCacheStorage.prototype.set = function(key, value) {
  localStorage[this.prefix_ + key] = JSON.stringify(value);
}
Cache.LocalStorageCacheStorage.prototype.remove = function(key) {
  var item = this.get(key);
  delete localStorage[this.prefix_ + key];
  return item;
}
Cache.LocalStorageCacheStorage.prototype.keys = function() {
  var ret = [], p;
  for (p in localStorage) {
    if (p.match(this.regexp_)) ret.push(p.replace(this.prefix_, ''));
  };
  return ret;
}

/**
* Retrieves an item from the cache.
* @param {string} key The key to retrieve.
* @return {Object} The item, or null if it doesn't exist.
*/
Cache.prototype.getItem = function(key) {

  // retrieve the item from the cache
  var item = this.items_.get(key);

  if (item != null) {
    if (!this.isExpired_(item)) {
      // if the item is not expired
      // update its last accessed date
      item.lastAccessed = new Date().getTime();
    } else {
      // if the item is expired, remove it from the cache
      this.removeItem_(key);
      item = null;
    }
  }

  // return the item value (if it exists), or null
  var returnVal = item ? item.value : null;
  if (returnVal) {
    this.stats_['hits']++;
    this.log_('Cache HIT for key ' + key)
  } else {
    this.stats_['misses']++;
    this.log_('Cache MISS for key ' + key)
  }
  return returnVal;
};


Cache._CacheItem = function(k, v, o) {
    if (!k) {
      throw new Error("key cannot be null or empty");
    }
    this.key = k;
    this.value = v;
    o = o || {};
    if (o.expirationAbsolute) {
      o.expirationAbsolute = o.expirationAbsolute.getTime();
    }
    if (!o.priority) {
      o.priority = CachePriority.NORMAL;
    }
    this.options = o;
    this.lastAccessed = new Date().getTime();
};


/**
* Sets an item in the cache.
* @param {string} key The key to refer to the item.
* @param {Object} value The item to cache.
* @param {Object} options an optional object which controls various caching
* options:
* expirationAbsolute: the datetime when the item should expire
* expirationSliding: an integer representing the seconds since
* the last cache access after which the item
* should expire
* priority: How important it is to leave this item in the cache.
* You can use the values CachePriority.LOW, .NORMAL, or
* .HIGH, or you can just use an integer. Note that
* placing a priority on an item does not guarantee
* it will remain in cache. It can still be purged if
* an expiration is hit, or if the cache is full.
* callback: A function that gets called when the item is purged
* from cache. The key and value of the removed item
* are passed as parameters to the callback function.
*/
Cache.prototype.setItem = function(key, value, options) {

  // add a new cache item to the cache
  if (this.items_.get(key) != null) {
    this.removeItem_(key);
  }
  this.addItem_(new Cache._CacheItem(key, value, options));
  this.log_("Setting key " + key);

  // if the cache is full, purge it
  if ((this.maxSize_ > 0) && (this.count_ > this.maxSize_)) {
    var that = this;
    setTimeout(function() {
      that.purge_.call(that);
    }, 0);
  }
};


/**
* Removes all items from the cache.
*/
Cache.prototype.clear = function() {
  // loop through each item in the cache and remove it
  var keys = this.items_.keys()
  for (var i = 0; i < keys.length; i++) {
    this.removeItem_(keys[i]);
  }
  this.log_('Cache cleared');
};


/**
* @return {Object} The hits and misses on the cache.
*/
Cache.prototype.getStats = function() {
  return this.stats_;
};


/**
* @return {string} Returns an HTML string representation of the cache.
*/
Cache.prototype.toHtmlString = function() {
  var returnStr = this.count_ + " item(s) in cache<br /><ul>";
  var keys = this.items_.keys()
  for (var i = 0; i < keys.length; i++) {
    var item = this.items_.get(keys[i]);
    returnStr = returnStr + "<li>" + item.key.toString() + " = " +
        item.value.toString() + "</li>";
  }
  returnStr = returnStr + "</ul>";
  return returnStr;
};


/**
* Allows it to resize the Cache capacity if needed.
* @param {integer} newMaxSize the new max amount of stored entries within the Cache
*/
Cache.prototype.resize = function(newMaxSize) {
  this.log_('Resizing Cache from ' + this.maxSize_ + ' to ' + newMaxSize);
  // Set new size before purging so we know how many items to purge
  var oldMaxSize = this.maxSize_
  this.maxSize_ = newMaxSize;

  if (newMaxSize > 0 && (oldMaxSize < 0 || newMaxSize < oldMaxSize)) {
    if (this.count_ > newMaxSize) {
      // Cache needs to be purged as it does contain too much entries for the new size
      this.purge_();
    } // else if cache isn't filled up to the new limit nothing is to do
  }
  // else if newMaxSize >= maxSize nothing to do
  this.log_('Resizing done');
}

/**
* Removes expired items from the cache.
*/
Cache.prototype.purge_ = function() {
  var tmparray = new Array();
  var purgeSize = Math.round(this.maxSize_ * this.fillFactor_);
  if (this.maxSize_ < 0)
    purgeSize = this.count_ * this.fillFactor_;
  // loop through the cache, expire items that should be expired
  // otherwise, add the item to an array
  var keys = this.items_.keys();
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var item = this.items_.get(key);
    if (this.isExpired_(item)) {
      this.removeItem_(key);
    } else {
      tmparray.push(item);
    }
  }

  if (tmparray.length > purgeSize) {
    // sort this array based on cache priority and the last accessed date
    tmparray = tmparray.sort(function(a, b) {
      if (a.options.priority != b.options.priority) {
        return b.options.priority - a.options.priority;
      } else {
        return b.lastAccessed - a.lastAccessed;
      }
    });
    // remove items from the end of the array
    while (tmparray.length > purgeSize) {
      var ritem = tmparray.pop();
      this.removeItem_(ritem.key);
    }
  }
  this.log_('Purged cached');
};


/**
* Add an item to the cache.
* @param {Object} item The cache item to add.
* @private
*/
Cache.prototype.addItem_ = function(item, attemptedAlready) {
  var cache = this;
  try {
    this.items_.set(item.key, item);
    this.count_++;
  } catch(err) {
    if (attemptedAlready) {
      this.log_('Failed setting again, giving up: ' + err.toString());
      throw(err);
    }
    this.log_('Error adding item, purging and trying again: ' + err.toString());
    this.purge_();
    this.addItem_(item, true);
  }
};


/**
* Remove an item from the cache, call the callback function (if it exists).
* @param {String} key The key of the item to remove
* @private
*/
Cache.prototype.removeItem_ = function(key) {
  var item = this.items_.remove(key);
  this.count_--;
  this.log_("removed key " + key);

  // if there is a callback function, call it at the end of execution
  if (item.options.callback != null) {
    setTimeout(function() {
      item.options.callback.call(null, item.key, item.value);
    }, 0);
  }
};


/**
* @param {Object} item A cache item.
* @return {boolean} True if the item is expired
* @private
*/
Cache.prototype.isExpired_ = function(item) {
  var now = new Date().getTime();
  var expired = false;
  if (item.options.expirationAbsolute &&
      (item.options.expirationAbsolute < now)) {
      // if the absolute expiration has passed, expire the item
      expired = true;
  }
  if (!expired && item.options.expirationSliding) {
    // if the sliding expiration has passed, expire the item
    var lastAccess =
        item.lastAccessed + (item.options.expirationSliding * 1000);
    if (lastAccess < now) {
      expired = true;
    }
  }
  return expired;
};


/**
* Logs a message to the console.log if debug is set to true.
* @param {string} msg The message to log.
* @private
*/
Cache.prototype.log_ = function(msg) {
  if (this.debug_) {
    console.log(msg);
  }
};

if (typeof module !== "undefined") {
  module.exports = Cache;
}
//	---------------------------------------------------------------------------
//	jWebSocket API PlugIn (uses jWebSocket Client and Server)
//	(C) 2010 jWebSocket.org, Alexander Schulze, Innotrade GmbH, Herzogenrath
//	---------------------------------------------------------------------------
//	This program is free software; you can redistribute it and/or modify it
//	under the terms of the GNU Lesser General Public License as published by the
//	Free Software Foundation; either version 3 of the License, or (at your
//	option) any later version.
//	This program is distributed in the hope that it will be useful, but WITHOUT
//	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
//	FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
//	more details.
//	You should have received a copy of the GNU Lesser General Public License along
//	with this program; if not, see <http://www.gnu.org/licenses/lgpl.html>.
//	---------------------------------------------------------------------------

//:author:*:kyberneees
//:author:*:aschulze

//:package:*:jws
//:class:*:jws.APIPlugInClass
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.APIPlugIn[/tt] instance plug-in. This _
//:d:en:plug-in provides the methods to register and unregister at certain _
//:d:en:stream sn the server.
jws.APIPlugInClass = {

	//:const:*:NS:String:org.jwebsocket.plugins.API (jws.NS_BASE + ".plugins.api")
	//:d:en:Namespace for the [tt]APIPlugIn[/tt] class.
	// if namespace changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.api",
	//:const:*:ID:String:APIPlugIn
	//:d:en:Id for the [tt]APIPlugIn[/tt] class.
	ID: "api",

	hasPlugIn: function( aId, aOptions ) {
		var lToken = {
			ns: jws.APIPlugInClass.NS,
			type: "hasPlugIn",
			plugin_id: aId
		};
		var lOptions = {};
		if( aOptions ) {
			if( aOptions.OnResponse ) {
				lOptions.OnResponse = aOptions.OnResponse;
			}
		}
		this.conn.sendToken( lToken, lOptions );
	},

	getPlugInAPI: function( aId, aOptions ) {
		var lToken = {
			ns: jws.APIPlugInClass.NS,
			type: "getPlugInAPI",
			plugin_id: aId
		};
		var lOptions = {};
		if( aOptions ) {
			if( aOptions.OnResponse ) {
				lOptions.OnResponse = aOptions.OnResponse;
			}
		}
		this.conn.sendToken( lToken, lOptions );
	},

	supportsToken: function( aId, aOptions ) {
		var lToken = {
			ns: jws.APIPlugInClass.NS,
			type: "supportsToken",
			token_type: aId
		};
		var lOptions = {};
		if( aOptions ) {
			if( aOptions.OnResponse ) {
				lOptions.OnResponse = aOptions.OnResponse;
			}
		}
		this.conn.sendToken( lToken, lOptions );
	},

	getServerAPI: function( aOptions ) {
		var lToken = {
			ns: jws.APIPlugInClass.NS,
			type: "getServerAPI"
		};
		var lOptions = {};
		if( aOptions ) {
			if( aOptions.OnResponse ) {
				lOptions.OnResponse = aOptions.OnResponse;
			}
		}
		this.conn.sendToken( lToken, lOptions );
	},

	getPlugInsIds: function( aOptions ) {
		var lToken = {
			ns: jws.APIPlugInClass.NS,
			type: "getPlugInIds"
		}
		var lOptions = {};
		if( aOptions ) {
			if( aOptions.OnResponse ) {
				lOptions.OnResponse = aOptions.OnResponse;
			}
		}
		this.conn.sendToken( lToken, lOptions );
	},

	createSpecFromAPI: function( aConn, aServerPlugIn ) {

		// a plug-in might have more than one feature
		var lCnt =  aServerPlugIn.supportedTokens.length;
		var lSpecs = [];

		for( var lIdx = 0; lIdx < lCnt; lIdx++ ) {

			var lToken = aServerPlugIn.supportedTokens[ lIdx ];
			lToken.ns = aServerPlugIn.namespace;

			// console.log( JSON.stringify( lToken ) );

			// this is the function which has to be executed as a parameter
			// of the it call within a describe statement (actually the suite).
			var lItFunc = function () {
				var lResponseReceived = false;
				// create the automated test token
				var lTestToken = {
					ns: lToken.ns,
					type: lToken.type
				};
				// add all arguments
				var lInArgs = lToken.inArguments;
				for( var lInArgIdx = 0, lInArgCnt = lInArgs.length; lInArgIdx < lInArgCnt; lInArgIdx++ ) {
					var lInArg = lInArgs[ lInArgIdx ];
					lTestToken[ lInArg.name ]  = lInArg.testValue;
				}
				console.log( "Automatically sending " + JSON.stringify( lTestToken ) );
				aConn.sendToken( lTestToken, {
					OnResponse: function( aToken ) {
						console.log( "Received auto response: " + JSON.stringify( aToken ) );
						lResponseReceived = true;
					}
				});

				waitsFor(
					function() {
						return lResponseReceived == true;
					},
					"test",
					20000
				);

				runs( function() {
					expect( lResponseReceived ).toEqual( true );
					// stop watch for this spec
					// jws.StopWatchPlugIn.stopWatch( "defAPIspec" );
				});
			};

			lSpecs.push( lItFunc );
		}
		// here the spec function are created and returned only
		// but not yet executed!
		return lSpecs;
	}

};

jws.APIPlugIn = function() {
	// do NOT use this.conn = aConn; here!
	// Add the plug-in via conn.addPlugin instead!

	// here you can add optonal instance fields
	}

jws.APIPlugIn.prototype = jws.APIPlugInClass;
//	---------------------------------------------------------------------------
//	jWebSocket Channel PlugIn (uses jWebSocket Client and Server)
//	(C) 2010 jWebSocket.org, Alexander Schulze, Innotrade GmbH, Herzogenrath
//	---------------------------------------------------------------------------
//	This program is free software; you can redistribute it and/or modify it
//	under the terms of the GNU Lesser General Public License as published by the
//	Free Software Foundation; either version 3 of the License, or (at your
//	option) any later version.
//	This program is distributed in the hope that it will be useful, but WITHOUT
//	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
//	FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
//	more details.
//	You should have received a copy of the GNU Lesser General Public License along
//	with this program; if not, see <http://www.gnu.org/licenses/lgpl.html>.
//	---------------------------------------------------------------------------


//	---------------------------------------------------------------------------
//  jWebSocket Channel Plug-In
//	---------------------------------------------------------------------------

//:package:*:jws
//:class:*:jws.ChannelPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.ChannelPlugIn[/tt] class. This _
//:d:en:plug-in provides the methods to subscribe and unsubscribe at certain _
//:d:en:channel sn the server.
jws.ChannelPlugIn = {

	//:const:*:NS:String:org.jwebsocket.plugins.channels (jws.NS_BASE + ".plugins.channels")
	//:d:en:Namespace for the [tt]ChannelPlugIn[/tt] class.
	// if namespace changes update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.channels",

	SUBSCRIBE: "subscribe",
	UNSUBSCRIBE: "unsubscribe",
	GET_CHANNELS: "getChannels",
	CREATE_CHANNEL: "createChannel",
	REMOVE_CHANNEL: "removeChannel",
	GET_SUBSCRIBERS: "getSubscribers",
	GET_SUBSCRIPTIONS: "getSubscriptions",

	AUTHORIZE: "authorize",
	PUBLISH: "publish",
	STOP: "stop",

	processToken: function( aToken ) {
		// check if namespace matches
		if( aToken.ns == jws.ChannelPlugIn.NS ) {
			// here you can handle incoming tokens from the server
			// directy in the plug-in if desired.
			if( "event" == aToken.type ) {
				if( "channelCreated" == aToken.name ) {
					if( this.fOnChannelCreated ) {
						this.fOnChannelCreated( aToken );
					}
				} else if( "channelRemoved" == aToken.name ) {
					if( this.fOnChannelRemoved ) {
						this.fOnChannelRemoved( aToken );
					}
				} 
			} else if( "getChannels" == aToken.reqType ) {
				if( this.fOnChannelsReceived ) {
					this.fOnChannelsReceived( aToken );
				}
			}
		}
	},

	//:m:*:channelSubscribe
	//:d:en:Registers the client at the given channel on the server. _
	//:d:en:After this operation the client obtains all messages on this _
	//:d:en:channel. Basically, a client can subscribe at multiple channels.
	//:d:en:If no channel with the given ID exists on the server an error token _
	//:d:en:is returned. Depending on the type of the channel it may take more _
	//:d:en:or less time until you get the first token from the channel.
	//:a:en::aChannel:String:The id of the server side data channel.
	//:r:*:::void:none
	// TODO: introduce OnResponse here too to get notified on error or success.
	channelSubscribe: function( aChannel, aAccessKey, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			this.sendToken({
				ns: jws.ChannelPlugIn.NS,
				type: jws.ChannelPlugIn.SUBSCRIBE,
				channel: aChannel,
				accessKey: aAccessKey
			}, aOptions );
		}
		return lRes;
	},

	//:m:*:channelUnsubscribe
	//:d:en:Unsubscribes the client from the given channel on the server.
	//:d:en:From this point in time the client does not receive any messages _
	//:d:en:on this channel anymore.
	//:a:en::aChannel:String:The id of the server side data channel.
	//:r:*:::void:none
	// TODO: introduce OnResponse here too to get notified on error or success.
	channelUnsubscribe: function( aChannel, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			this.sendToken({
				ns: jws.ChannelPlugIn.NS,
				type: jws.ChannelPlugIn.UNSUBSCRIBE,
				channel: aChannel
			}, aOptions );
		}
		return lRes ;
	},

	//:m:*:channelAuth
	//:d:en:Authenticates the client at a certain channel to publish messages.
	//:a:en::aChannel:String:The id of the server side data channel.
	//:a:en::aAccessKey:String:Access key configured for the channel.
	//:a:en::aSecretKey:String:Secret key configured for the channel.
	//:r:*:::void:none
	// TODO: introduce OnResponse here too to get notified on error or success.
	channelAuth: function( aChannel, aAccessKey, aSecretKey, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			this.sendToken({
				ns: jws.ChannelPlugIn.NS,
				type: jws.ChannelPlugIn.AUTHORIZE,
				channel: aChannel,
				// login: this.getUsername(),
				accessKey: aAccessKey,
				secretKey: aSecretKey
			}, aOptions );
		}
		return lRes;
	},

	//:m:*:channelPublish
	//:d:en:Sends a message to the given channel on the server.
	//:d:en:The client needs to be authenticated against the server and the
	//:d:en:channel to publish data. All clients that subscribed to the channel
	//:d:en:will receive the message.
	//:a:en::aChannel:String:The id of the server side data channel.
	//:a:en::aData:String:Data to be sent to the server side data channel.
	//:r:*:::void:none
	// TODO: introduce OnResponse here too to get noticed on error or success.
	channelPublish: function( aChannel, aData, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			this.sendToken({
				ns: jws.ChannelPlugIn.NS,
				type: jws.ChannelPlugIn.PUBLISH,
				channel: aChannel,
				data: aData
			}, aOptions );
		}
		return lRes;
	},

	//:m:*:channelCreate
	//:d:en:Creates a new channel on the server. If a channel with the given _
	//:d:en:channel-id already exists the create channel request is rejected. _
	//:d:en:A private channel requires an access key, if this is not provided _
	//:d:en:for a private channel the request is rejected. For public channel _
	//:d:en:the access key is optional.
	//:a:en::aChannel:String:The id of the server side data channel.
	//:a:en::aName:String:The name (human readably) of the channel.
	//:r:*:::void:none
	channelCreate: function( aId, aName, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lIsPrivate = false;
			var lIsSystem = false;
			var lAccessKey = null;
			var lSecretKey = null;
			var lOwner = null;
			var lPassword = null;
			if( aOptions ) {
				if( aOptions.isPrivate != undefined ) {
					lIsPrivate = aOptions.isPrivate;
				}
				if( aOptions.isSystem != undefined ) {
					lIsSystem = aOptions.isSystem;
				}
				if( aOptions.accessKey != undefined ) {
					lAccessKey = aOptions.accessKey;
				}
				if( aOptions.secretKey != undefined ) {
					lSecretKey = aOptions.secretKey;
				}
				if( aOptions.owner != undefined ) {
					lOwner = aOptions.owner;
				}
				if( aOptions.password != undefined ) {
					lPassword = aOptions.password;
				}
			}
			this.sendToken({
				ns: jws.ChannelPlugIn.NS,
				type: jws.ChannelPlugIn.CREATE_CHANNEL,
				channel: aId,
				name: aName,
				isPrivate: lIsPrivate,
				isSystem: lIsSystem,
				accessKey: lAccessKey,
				secretKey: lSecretKey,
				owner: lOwner,
				password: lPassword
			}, aOptions );
		}
		return lRes;
	},

	//:m:*:channelRemove
	//:d:en:Removes a (non-system) channel on the server. Only the owner of _
	//:d:en:channel can remove a channel. If a accessKey/secretKey pair is _
	//:d:en:defined for a channel this needs to be passed as well, otherwise _
	//:d:en:the remove request is rejected.
	//:a:en::aChannel:String:The id of the server side data channel.
	//:r:*:::void:none
	channelRemove: function( aId, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lAccessKey = null;
			var lSecretKey = null;
			var lOwner = null;
			var lPassword = null;
			if( aOptions ) {
				if( aOptions.accessKey != undefined ) {
					lAccessKey = aOptions.accessKey;
				}
				if( aOptions.secretKey != undefined ) {
					lSecretKey = aOptions.secretKey;
				}
				if( aOptions.owner != undefined ) {
					lOwner = aOptions.owner;
				}
				if( aOptions.password != undefined ) {
					lPassword = aOptions.password;
				}
			}
			this.sendToken({
				ns: jws.ChannelPlugIn.NS,
				type: jws.ChannelPlugIn.REMOVE_CHANNEL,
				channel: aId,
				accessKey: lAccessKey,
				secretKey: lSecretKey,
				owner: lOwner,
				password: lPassword
			}, aOptions );
		}
		return lRes;
	},

	//:m:*:channelGetSubscribers
	//:d:en:Returns all channels to which the current client currently has
	//:d:en:subscribed to. This also includes private channels. The owners of
	//:d:en:the channels are not returned due to security reasons.
	//:a:en::aChannel:String:The id of the server side data channel.
	//:a:en::aAccessKey:String:Access Key for the channel (required for private channels, optional for public channels).
	//:r:*:::void:none
	channelGetSubscribers: function( aChannel, aAccessKey, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			this.sendToken({
				ns: jws.ChannelPlugIn.NS,
				type: jws.ChannelPlugIn.GET_SUBSCRIBERS,
				channel: aChannel,
				accessKey: aAccessKey
			}, aOptions );
		}
		return lRes;
	},

	//:m:*:channelGetSubscriptions
	//:d:en:Returns all channels to which the current client currently has
	//:d:en:subscribed to. This also includes private channels. The owners of
	//:d:en:the channels are not returned due to security reasons.
	//:a:en:::none
	//:r:*:::void:none
	channelGetSubscriptions: function( aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			this.sendToken({
				ns: jws.ChannelPlugIn.NS,
				type: jws.ChannelPlugIn.GET_SUBSCRIPTIONS
			}, aOptions );
		}
		return lRes;
	},

	//:m:*:channelGetIds
	//:d:en:Tries to obtain all ids of the public channels
	//:a:en:::none
	//:r:*:::void:none
	channelGetIds: function( aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			this.sendToken({
				ns: jws.ChannelPlugIn.NS,
				type: jws.ChannelPlugIn.GET_CHANNELS
			}, aOptions );
		}
		return lRes;
	},

	setChannelCallbacks: function( aListeners ) {
		if( !aListeners ) {
			aListeners = {};
		}
		if( aListeners.OnChannelCreated !== undefined ) {
			this.fOnChannelCreated = aListeners.OnChannelCreated;
		}
		if( aListeners.OnChannelsReceived !== undefined ) {
			this.fOnChannelsReceived = aListeners.OnChannelsReceived;
		}
		if( aListeners.OnChannelRemoved !== undefined ) {
			this.fOnChannelRemoved = aListeners.OnChannelRemoved;
		}
	}

};

// add the ChannelPlugIn PlugIn into the jWebSocketTokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.ChannelPlugIn );
//	---------------------------------------------------------------------------
//	jWebSocket Sample Client PlugIn (uses jWebSocket Client and Server)
//	(C) 2010 jWebSocket.org, Alexander Schulze, Innotrade GmbH, Herzogenrath
//	---------------------------------------------------------------------------
//	This program is free software; you can redistribute it and/or modify it
//	under the terms of the GNU Lesser General Public License as published by the
//	Free Software Foundation; either version 3 of the License, or (at your
//	option) any later version.
//	This program is distributed in the hope that it will be useful, but WITHOUT
//	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
//	FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
//	more details.
//	You should have received a copy of the GNU Lesser General Public License along
//	with this program; if not, see <http://www.gnu.org/licenses/lgpl.html>.
//	---------------------------------------------------------------------------

//	---------------------------------------------------------------------------
//  jWebSocket Sample Client Plug-In
//	---------------------------------------------------------------------------

jws.CanvasPlugIn = {

	// namespace for shared objects plugin
	// if namespace is changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.canvas",

	processToken: function( aToken ) {
		// check if namespace matches
		if( aToken.reqNS == jws.CanvasPlugIn.NS ) {
			// here you can handle incomimng tokens from the server
			// directy in the plug-in if desired.
			if( "clear" == aToken.reqType ) {
				this.doClear( aToken.id );
			} else if( "beginPath" == aToken.reqType ) {
				this.doBeginPath( aToken.id );
			} else if( "moveTo" == aToken.reqType ) {
				this.doMoveTo( aToken.id, aToken.x, aToken.y );
			} else if( "lineTo" == aToken.reqType ) {
				this.doLineTo( aToken.id, aToken.x, aToken.y );
			} else if( "line" == aToken.reqType ) {
				this.doLine( aToken.id, aToken.x1, aToken.y1,
					aToken.x2, aToken.y2, { color: aToken.color });
			} else if( "closePath" == aToken.reqType ) {
				this.doClosePath( aToken.id );
			}
		}
	},

	fCanvas: {},

	canvasOpen: function( aId, aElementId ) {
		var lElem = jws.$( aElementId );
		this.fCanvas[ aId ] = {
			fDOMElem: lElem,
			ctx: lElem.getContext( "2d" )
		};
	},

	canvasClose: function( aId ) {
		this.fCanvas[ aId ] = null;
		delete this.fCanvas[ aId ];
	},

	doClear: function( aId ) {
		var lCanvas = this.fCanvas[ aId ];
		if( lCanvas != null ) {
			var lW = lCanvas.fDOMElem.getAttribute( "width" );
			var lH = lCanvas.fDOMElem.getAttribute( "height" );
			lCanvas.ctx.clearRect( 0, 0, lW, lH );
			return true;
		}
		return false;
	},

	canvasClear: function( aId ) {
		if( this.doClear( aId ) ) {
			var lToken = {
				reqNS: jws.CanvasPlugIn.NS,
				reqType: "clear",
				id: aId
			};
			this.broadcastToken(lToken);
		}
	},

	canvasGetBase64: function( aId, aMimeType ) {
		var lRes = {
			code: -1,
			msg : "Ok"
		};
		var lCanvas = this.fCanvas[ aId ];
		if( lCanvas != null ) {
			if( typeof lCanvas.fDOMElem.toDataURL == "function" ) {
				lRes.code = 0;
				lRes.encoding = "base64";
				lRes.data = lCanvas.fDOMElem.toDataURL( aMimeType );
			} else {
				lRes.msg = "Retrieving image data from canvas not (yet) supported by browser.";
			}
		} else {
			lRes.msg = "Canvas not found.";
		}
		return lRes;
	},

	doBeginPath: function( aId ) {
		var lCanvas = this.fCanvas[ aId ];
		if( lCanvas != null ) {
			// console.log( "doBeginPath: " + aId);
			lCanvas.ctx.beginPath();
			return true;
		}
		return false;
	},

	canvasBeginPath: function( aId ) {
		if( this.doBeginPath( aId ) ) {
			var lToken = {
				reqNS: jws.CanvasPlugIn.NS,
				reqType: "beginPath",
				id: aId
			};
			this.broadcastToken(lToken);
		}
	},

	doMoveTo: function( aId, aX, aY ) {
		var lCanvas = this.fCanvas[ aId ];
		if( lCanvas != null ) {
			// console.log( "doMoveTo: " + aId + ", x:" + aX + ", y: " + aX );
			lCanvas.ctx.moveTo( aX, aY );
			return true;
		}
		return false;
	},

	canvasMoveTo: function( aId, aX, aY ) {
		if( this.doMoveTo( aId, aX, aY ) ) {
			var lToken = {
				reqNS: jws.CanvasPlugIn.NS,
				reqType: "moveTo",
				id: aId,
				x: aX,
				y: aY
			};
			this.broadcastToken(lToken);
		}
	},

	doLineTo: function( aId, aX, aY ) {
		var lCanvas = this.fCanvas[ aId ];
		if( lCanvas != null ) {
			// console.log( "doLineTo: " + aId + ", x:" + aX + ", y: " + aX );
			lCanvas.ctx.lineTo( aX, aY );
			lCanvas.ctx.stroke();
			return true;
		}
		return false;
	},

	canvasLineTo: function( aId, aX, aY ) {
		if( this.doLineTo( aId, aX, aY ) ) {
			var lToken = {
				reqNS: jws.CanvasPlugIn.NS,
				reqType: "lineTo",
				id: aId,
				x: aX,
				y: aY
			};
			this.broadcastToken(lToken);
		}
	},

	doLine: function( aId, aX1, aY1, aX2, aY2, aOptions ) {
		if( undefined == aOptions ) {
			aOptions = {};
		}
		var lColor = "black";
		if( aOptions.color ) {
			lColor = aOptions.color;
		}
		var lCanvas = this.fCanvas[ aId ];
		if( lCanvas != null ) {
			lCanvas.ctx.beginPath();
			lCanvas.ctx.moveTo( aX1, aY1 );
			lCanvas.ctx.strokeStyle = lColor;
			lCanvas.ctx.lineTo( aX2, aY2 );
			lCanvas.ctx.stroke();
			lCanvas.ctx.closePath();
			return true;
		}
		return false;
	},

	canvasLine: function( aId, aX1, aY1, aX2, aY2, aOptions ) {
		if( undefined == aOptions ) {
			aOptions = {};
		}
		var lColor = "black";
		if( aOptions.color ) {
			lColor = aOptions.color;
		}
		if( this.doLine( aId, aX1, aY1, aX2, aY2, aOptions ) ) {
			var lToken = {
				reqNS: jws.CanvasPlugIn.NS,
				reqType: "line",
				id: aId,
				x1: aX1,
				y1: aY1,
				x2: aX2,
				y2: aY2,
				color: lColor
			};
			this.broadcastToken(lToken);
		}
	},

	doClosePath: function( aId ) {
		var lCanvas = this.fCanvas[ aId ];
		if( lCanvas != null ) {
			// console.log( "doClosePath" );
			lCanvas.ctx.closePath();
			return true;
		}
		return false;
	},

	canvasClosePath: function( aId ) {
		if( this.doClosePath( aId ) ) {
			var lToken = {
				reqNS: jws.CanvasPlugIn.NS,
				reqType: "closePath",
				id: aId
			};
			this.broadcastToken(lToken);
		}
	}

}

// add the JWebSocket Shared Objects PlugIn into the TokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.CanvasPlugIn );

// optionally include canvas support for IE8
if( jws.isIE ) {

	//  <JasobNoObfs>
	//
	//	-------------------------------------------------------------------------------
	//	ExplorerCanvas
	//
	//	Google Open Source:
	//		<http://code.google.com>
	//		<opensource@google.com>
	//
	//	Developers:
	//		Emil A Eklund <emil@eae.net>
	//		Erik Arvidsson <erik@eae.net>
	//		Glen Murphy <glen@glenmurphy.com>
	//
	//	-------------------------------------------------------------------------------
	//	DESCRIPTION
	//
	//	Firefox, Safari and Opera 9 support the canvas tag to allow 2D command-based
	//	drawing operations. ExplorerCanvas brings the same functionality to Internet
	//	Explorer; web developers only need to include a single script tag in their
	//	existing canvas webpages to enable this support.
	//
	//	-------------------------------------------------------------------------------
	//	INSTALLATION
	//
	//	Include the ExplorerCanvas tag in the same directory as your HTML files, and
	//	add the following code to your page, preferably in the <head> tag.
	//
	//	<!--[if IE]><script type="text/javascript" src="excanvas.js"></script><![endif]-->
	//
	//	If you run into trouble, please look at the included example code to see how
	//	to best implement this
	//	
	//	Copyright 2006 Google Inc.
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
	//
	//	Fullsource code at: http://excanvas.sourceforge.net/
	//	and http://code.google.com/p/explorercanvas/
	//
	//	</JasobNoObfs>

	document.createElement("canvas").getContext||(function(){var s=Math,j=s.round,F=s.sin,G=s.cos,V=s.abs,W=s.sqrt,k=10,v=k/2;function X(){return this.context_||(this.context_=new H(this))}var L=Array.prototype.slice;function Y(b,a){var c=L.call(arguments,2);return function(){return b.apply(a,c.concat(L.call(arguments)))}}var M={init:function(b){if(/MSIE/.test(navigator.userAgent)&&!window.opera){var a=b||document;a.createElement("canvas");a.attachEvent("onreadystatechange",Y(this.init_,this,a))}},init_:function(b){b.namespaces.g_vml_||
	b.namespaces.add("g_vml_","urn:schemas-microsoft-com:vml","#default#VML");b.namespaces.g_o_||b.namespaces.add("g_o_","urn:schemas-microsoft-com:office:office","#default#VML");if(!b.styleSheets.ex_canvas_){var a=b.createStyleSheet();a.owningElement.id="ex_canvas_";a.cssText="canvas{display:inline-block;overflow:hidden;text-align:left;width:300px;height:150px}g_vml_\\:*{behavior:url(#default#VML)}g_o_\\:*{behavior:url(#default#VML)}"}var c=b.getElementsByTagName("canvas"),d=0;for(;d<c.length;d++)this.initElement(c[d])},
	initElement:function(b){if(!b.getContext){b.getContext=X;b.innerHTML="";b.attachEvent("onpropertychange",Z);b.attachEvent("onresize",$);var a=b.attributes;if(a.width&&a.width.specified)b.style.width=a.width.nodeValue+"px";else b.width=b.clientWidth;if(a.height&&a.height.specified)b.style.height=a.height.nodeValue+"px";else b.height=b.clientHeight}return b}};function Z(b){var a=b.srcElement;switch(b.propertyName){case "width":a.style.width=a.attributes.width.nodeValue+"px";a.getContext().clearRect();
	break;case "height":a.style.height=a.attributes.height.nodeValue+"px";a.getContext().clearRect();break}}function $(b){var a=b.srcElement;if(a.firstChild){a.firstChild.style.width=a.clientWidth+"px";a.firstChild.style.height=a.clientHeight+"px"}}M.init();var N=[],B=0;for(;B<16;B++){var C=0;for(;C<16;C++)N[B*16+C]=B.toString(16)+C.toString(16)}function I(){return[[1,0,0],[0,1,0],[0,0,1]]}function y(b,a){var c=I(),d=0;for(;d<3;d++){var f=0;for(;f<3;f++){var h=0,g=0;for(;g<3;g++)h+=b[d][g]*a[g][f];c[d][f]=
	h}}return c}function O(b,a){a.fillStyle=b.fillStyle;a.lineCap=b.lineCap;a.lineJoin=b.lineJoin;a.lineWidth=b.lineWidth;a.miterLimit=b.miterLimit;a.shadowBlur=b.shadowBlur;a.shadowColor=b.shadowColor;a.shadowOffsetX=b.shadowOffsetX;a.shadowOffsetY=b.shadowOffsetY;a.strokeStyle=b.strokeStyle;a.globalAlpha=b.globalAlpha;a.arcScaleX_=b.arcScaleX_;a.arcScaleY_=b.arcScaleY_;a.lineScale_=b.lineScale_}function P(b){var a,c=1;b=String(b);if(b.substring(0,3)=="rgb"){var d=b.indexOf("(",3),f=b.indexOf(")",d+
	1),h=b.substring(d+1,f).split(",");a="#";var g=0;for(;g<3;g++)a+=N[Number(h[g])];if(h.length==4&&b.substr(3,1)=="a")c=h[3]}else a=b;return{color:a,alpha:c}}function aa(b){switch(b){case "butt":return"flat";case "round":return"round";case "square":default:return"square"}}function H(b){this.m_=I();this.mStack_=[];this.aStack_=[];this.currentPath_=[];this.fillStyle=this.strokeStyle="#000";this.lineWidth=1;this.lineJoin="miter";this.lineCap="butt";this.miterLimit=k*1;this.globalAlpha=1;this.canvas=b;
	var a=b.ownerDocument.createElement("div");a.style.width=b.clientWidth+"px";a.style.height=b.clientHeight+"px";a.style.overflow="hidden";a.style.position="absolute";b.appendChild(a);this.element_=a;this.lineScale_=this.arcScaleY_=this.arcScaleX_=1}var i=H.prototype;i.clearRect=function(){this.element_.innerHTML=""};i.beginPath=function(){this.currentPath_=[]};i.moveTo=function(b,a){var c=this.getCoords_(b,a);this.currentPath_.push({type:"moveTo",x:c.x,y:c.y});this.currentX_=c.x;this.currentY_=c.y};
	i.lineTo=function(b,a){var c=this.getCoords_(b,a);this.currentPath_.push({type:"lineTo",x:c.x,y:c.y});this.currentX_=c.x;this.currentY_=c.y};i.bezierCurveTo=function(b,a,c,d,f,h){var g=this.getCoords_(f,h),l=this.getCoords_(b,a),e=this.getCoords_(c,d);Q(this,l,e,g)};function Q(b,a,c,d){b.currentPath_.push({type:"bezierCurveTo",cp1x:a.x,cp1y:a.y,cp2x:c.x,cp2y:c.y,x:d.x,y:d.y});b.currentX_=d.x;b.currentY_=d.y}i.quadraticCurveTo=function(b,a,c,d){var f=this.getCoords_(b,a),h=this.getCoords_(c,d),g={x:this.currentX_+
	0.6666666666666666*(f.x-this.currentX_),y:this.currentY_+0.6666666666666666*(f.y-this.currentY_)};Q(this,g,{x:g.x+(h.x-this.currentX_)/3,y:g.y+(h.y-this.currentY_)/3},h)};i.arc=function(b,a,c,d,f,h){c*=k;var g=h?"at":"wa",l=b+G(d)*c-v,e=a+F(d)*c-v,m=b+G(f)*c-v,r=a+F(f)*c-v;if(l==m&&!h)l+=0.125;var n=this.getCoords_(b,a),o=this.getCoords_(l,e),q=this.getCoords_(m,r);this.currentPath_.push({type:g,x:n.x,y:n.y,radius:c,xStart:o.x,yStart:o.y,xEnd:q.x,yEnd:q.y})};i.rect=function(b,a,c,d){this.moveTo(b,
	a);this.lineTo(b+c,a);this.lineTo(b+c,a+d);this.lineTo(b,a+d);this.closePath()};i.strokeRect=function(b,a,c,d){var f=this.currentPath_;this.beginPath();this.moveTo(b,a);this.lineTo(b+c,a);this.lineTo(b+c,a+d);this.lineTo(b,a+d);this.closePath();this.stroke();this.currentPath_=f};i.fillRect=function(b,a,c,d){var f=this.currentPath_;this.beginPath();this.moveTo(b,a);this.lineTo(b+c,a);this.lineTo(b+c,a+d);this.lineTo(b,a+d);this.closePath();this.fill();this.currentPath_=f};i.createLinearGradient=function(b,
	a,c,d){var f=new D("gradient");f.x0_=b;f.y0_=a;f.x1_=c;f.y1_=d;return f};i.createRadialGradient=function(b,a,c,d,f,h){var g=new D("gradientradial");g.x0_=b;g.y0_=a;g.r0_=c;g.x1_=d;g.y1_=f;g.r1_=h;return g};i.drawImage=function(b){var a,c,d,f,h,g,l,e,m=b.runtimeStyle.width,r=b.runtimeStyle.height;b.runtimeStyle.width="auto";b.runtimeStyle.height="auto";var n=b.width,o=b.height;b.runtimeStyle.width=m;b.runtimeStyle.height=r;if(arguments.length==3){a=arguments[1];c=arguments[2];h=g=0;l=d=n;e=f=o}else if(arguments.length==
	5){a=arguments[1];c=arguments[2];d=arguments[3];f=arguments[4];h=g=0;l=n;e=o}else if(arguments.length==9){h=arguments[1];g=arguments[2];l=arguments[3];e=arguments[4];a=arguments[5];c=arguments[6];d=arguments[7];f=arguments[8]}else throw Error("Invalid number of arguments");var q=this.getCoords_(a,c),t=[];t.push(" <g_vml_:group",' coordsize="',k*10,",",k*10,'"',' coordorigin="0,0"',' style="width:',10,"px;height:",10,"px;position:absolute;");if(this.m_[0][0]!=1||this.m_[0][1]){var E=[];E.push("M11=",
	this.m_[0][0],",","M12=",this.m_[1][0],",","M21=",this.m_[0][1],",","M22=",this.m_[1][1],",","Dx=",j(q.x/k),",","Dy=",j(q.y/k),"");var p=q,z=this.getCoords_(a+d,c),w=this.getCoords_(a,c+f),x=this.getCoords_(a+d,c+f);p.x=s.max(p.x,z.x,w.x,x.x);p.y=s.max(p.y,z.y,w.y,x.y);t.push("padding:0 ",j(p.x/k),"px ",j(p.y/k),"px 0;filter:progid:DXImageTransform.Microsoft.Matrix(",E.join(""),", sizingmethod='clip');")}else t.push("top:",j(q.y/k),"px;left:",j(q.x/k),"px;");t.push(' ">','<g_vml_:image src="',b.src,
	'"',' style="width:',k*d,"px;"," height:",k*f,'px;"',' cropleft="',h/n,'"',' croptop="',g/o,'"',' cropright="',(n-h-l)/n,'"',' cropbottom="',(o-g-e)/o,'"'," />","</g_vml_:group>");this.element_.insertAdjacentHTML("BeforeEnd",t.join(""))};i.stroke=function(b){var a=[],c=P(b?this.fillStyle:this.strokeStyle),d=c.color,f=c.alpha*this.globalAlpha;a.push("<g_vml_:shape",' filled="',!!b,'"',' style="position:absolute;width:',10,"px;height:",10,'px;"',' coordorigin="0 0" coordsize="',k*10," ",k*10,'"',' stroked="',
	!b,'"',' path="');var h={x:null,y:null},g={x:null,y:null},l=0;for(;l<this.currentPath_.length;l++){var e=this.currentPath_[l];switch(e.type){case "moveTo":a.push(" m ",j(e.x),",",j(e.y));break;case "lineTo":a.push(" l ",j(e.x),",",j(e.y));break;case "close":a.push(" x ");e=null;break;case "bezierCurveTo":a.push(" c ",j(e.cp1x),",",j(e.cp1y),",",j(e.cp2x),",",j(e.cp2y),",",j(e.x),",",j(e.y));break;case "at":case "wa":a.push(" ",e.type," ",j(e.x-this.arcScaleX_*e.radius),",",j(e.y-this.arcScaleY_*e.radius),
	" ",j(e.x+this.arcScaleX_*e.radius),",",j(e.y+this.arcScaleY_*e.radius)," ",j(e.xStart),",",j(e.yStart)," ",j(e.xEnd),",",j(e.yEnd));break}if(e){if(h.x==null||e.x<h.x)h.x=e.x;if(g.x==null||e.x>g.x)g.x=e.x;if(h.y==null||e.y<h.y)h.y=e.y;if(g.y==null||e.y>g.y)g.y=e.y}}a.push(' ">');if(b)if(typeof this.fillStyle=="object"){var m=this.fillStyle,r=0,n={x:0,y:0},o=0,q=1;if(m.type_=="gradient"){var t=m.x1_/this.arcScaleX_,E=m.y1_/this.arcScaleY_,p=this.getCoords_(m.x0_/this.arcScaleX_,m.y0_/this.arcScaleY_),
	z=this.getCoords_(t,E);r=Math.atan2(z.x-p.x,z.y-p.y)*180/Math.PI;if(r<0)r+=360;if(r<1.0E-6)r=0}else{var p=this.getCoords_(m.x0_,m.y0_),w=g.x-h.x,x=g.y-h.y;n={x:(p.x-h.x)/w,y:(p.y-h.y)/x};w/=this.arcScaleX_*k;x/=this.arcScaleY_*k;var R=s.max(w,x);o=2*m.r0_/R;q=2*m.r1_/R-o}var u=m.colors_;u.sort(function(ba,ca){return ba.offset-ca.offset});var J=u.length,da=u[0].color,ea=u[J-1].color,fa=u[0].alpha*this.globalAlpha,ga=u[J-1].alpha*this.globalAlpha,S=[],l=0;for(;l<J;l++){var T=u[l];S.push(T.offset*q+
	o+" "+T.color)}a.push('<g_vml_:fill type="',m.type_,'"',' method="none" focus="100%"',' color="',da,'"',' color2="',ea,'"',' colors="',S.join(","),'"',' opacity="',ga,'"',' g_o_:opacity2="',fa,'"',' angle="',r,'"',' focusposition="',n.x,",",n.y,'" />')}else a.push('<g_vml_:fill color="',d,'" opacity="',f,'" />');else{var K=this.lineScale_*this.lineWidth;if(K<1)f*=K;a.push("<g_vml_:stroke",' opacity="',f,'"',' joinstyle="',this.lineJoin,'"',' miterlimit="',this.miterLimit,'"',' endcap="',aa(this.lineCap),
	'"',' weight="',K,'px"',' color="',d,'" />')}a.push("</g_vml_:shape>");this.element_.insertAdjacentHTML("beforeEnd",a.join(""))};i.fill=function(){this.stroke(true)};i.closePath=function(){this.currentPath_.push({type:"close"})};i.getCoords_=function(b,a){var c=this.m_;return{x:k*(b*c[0][0]+a*c[1][0]+c[2][0])-v,y:k*(b*c[0][1]+a*c[1][1]+c[2][1])-v}};i.save=function(){var b={};O(this,b);this.aStack_.push(b);this.mStack_.push(this.m_);this.m_=y(I(),this.m_)};i.restore=function(){O(this.aStack_.pop(),
	this);this.m_=this.mStack_.pop()};function ha(b){var a=0;for(;a<3;a++){var c=0;for(;c<2;c++)if(!isFinite(b[a][c])||isNaN(b[a][c]))return false}return true}function A(b,a,c){if(!!ha(a)){b.m_=a;if(c)b.lineScale_=W(V(a[0][0]*a[1][1]-a[0][1]*a[1][0]))}}i.translate=function(b,a){A(this,y([[1,0,0],[0,1,0],[b,a,1]],this.m_),false)};i.rotate=function(b){var a=G(b),c=F(b);A(this,y([[a,c,0],[-c,a,0],[0,0,1]],this.m_),false)};i.scale=function(b,a){this.arcScaleX_*=b;this.arcScaleY_*=a;A(this,y([[b,0,0],[0,a,
	0],[0,0,1]],this.m_),true)};i.transform=function(b,a,c,d,f,h){A(this,y([[b,a,0],[c,d,0],[f,h,1]],this.m_),true)};i.setTransform=function(b,a,c,d,f,h){A(this,[[b,a,0],[c,d,0],[f,h,1]],true)};i.clip=function(){};i.arcTo=function(){};i.createPattern=function(){return new U};function D(b){this.type_=b;this.r1_=this.y1_=this.x1_=this.r0_=this.y0_=this.x0_=0;this.colors_=[]}D.prototype.addColorStop=function(b,a){a=P(a);this.colors_.push({offset:b,color:a.color,alpha:a.alpha})};function U(){}G_vmlCanvasManager=
	M;CanvasRenderingContext2D=H;CanvasGradient=D;CanvasPattern=U})();

}//	---------------------------------------------------------------------------
//	jWebSocket Chat PlugIn (uses jWebSocket Client and Server)
//	(C) 2010 jWebSocket.org, Alexander Schulze, Innotrade GmbH, Herzogenrath
//	---------------------------------------------------------------------------
//	This program is free software; you can redistribute it and/or modify it
//	under the terms of the GNU Lesser General Public License as published by the
//	Free Software Foundation; either version 3 of the License, or (at your
//	option) any later version.
//	This program is distributed in the hope that it will be useful, but WITHOUT
//	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
//	FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
//	more details.
//	You should have received a copy of the GNU Lesser General Public License along
//	with this program; if not, see <http://www.gnu.org/licenses/lgpl.html>.
//	---------------------------------------------------------------------------


//	---------------------------------------------------------------------------
//  jWebSocket Chat Client Plug-In
//	---------------------------------------------------------------------------

jws.ChatPlugIn = {

	// namespace for Chat plugin
	// if namespace is changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.chat",

	processToken: function( aToken ) {
		// check if namespace matches
		if( aToken.ns == jws.ChatPlugIn.NS ) {
			// here you can handle incoming tokens from the server
			// directy in the plug-in if desired.
			if( "login" == aToken.reqType ) {
				if( this.onChatRequestToken ) {
					this.onChatRequestToken( aToken );
				}
			}
		}
	},

	ChatLogin: function( aUsername, aPassword, aServer, aPort, aUseSSL, aOptions ) {
		// check websocket connection status
		var lRes = this.checkConnected();
		// if connected to websocket network...
		if( 0 == lRes.code ) {
			// Chat API calls Chat Login screen,
			// hence here no user name or password are required.
			// Pass the callbackURL to notify Web App on successfull connection
			// and to obtain OAuth verifier for user.
			var lToken = {
				ns: jws.ChatPlugIn.NS,
				type: "login",
				username: aUsername,
				password: aPassword,
				server: aServer,
				port: aPort,
				useSSL: aUseSSL
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	ChatLogout: function( aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.ChatPlugIn.NS,
				type: "logout"
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	setChatCallbacks: function( aListeners ) {
		if( !aListeners ) {
			aListeners = {};
		}
		/*
		if( aListeners.onChatRequestToken !== undefined ) {
			this.onChatRequestToken = aListeners.onChatRequestToken;
		}
		*/
	}

}

// add the JWebSocket Chat PlugIn into the TokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.ChatPlugIn );
//	---------------------------------------------------------------------------
//	jWebSocket Client Gaming Plug-In
//	Copyright (c) 2010 Alexander Schulze, Innotrade GmbH, Herzogenrath
//	---------------------------------------------------------------------------
//	This program is free software; you can redistribute it and/or modify it
//	under the terms of the GNU Lesser General Public License as published by the
//	Free Software Foundation; either version 3 of the License, or (at your
//	option) any later version.
//	This program is distributed in the hope that it will be useful, but WITHOUT
//	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
//	FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
//	more details.
//	You should have received a copy of the GNU Lesser General Public License along
//	with this program; if not, see <http://www.gnu.org/licenses/lgpl.html>.
//	---------------------------------------------------------------------------


//	---------------------------------------------------------------------------
//  jWebSocket Client Gaming Plug-In
//	---------------------------------------------------------------------------

jws.ClientGamingPlugIn = {

	// namespace for client gaming plugin
	// not yet used because here we use the system broadcast only
	NS: jws.NS_BASE + ".plugins.clientGaming",
	
	fIsActive: false,

	setActive: function( aActive ) {
		if( aActive ) {
			
		} else {
			
		}
		jws.ClientGamingPlugIn.fIsActive = aActive;
	},
	
	isActive: function() {
		return jws.ClientGamingPlugIn.fIsActive;
	},

	// this places a div on the current document when a new client connects
	addPlayer: function( aId, aUsername, aColor ) {
		aId = "player" + aId;
		var lDiv = document.getElementById( aId );
		if( !lDiv ) {
			lDiv = document.createElement( "div" );
		}
		lDiv.id = aId;
		lDiv.style.position = "absolute";
		lDiv.style.overflow = "hidden";
		lDiv.style.opacity = 0.85;
		lDiv.style.left = "100px";
		lDiv.style.top = "100px";
		lDiv.style.width = "75px";
		lDiv.style.height = "75px";
		lDiv.style.border = "1px solid black";
		lDiv.style.background = "url(img/player_" + aColor + ".png) 15px 18px no-repeat";
		lDiv.style.backgroundColor = aColor;
		lDiv.style.color = "white";
		lDiv.innerHTML = "<font style=\"font-size:8pt\">Player " + aUsername + "</font>";
		document.body.appendChild( lDiv );

		if( !this.fPlayers ) {
			this.fPlayers = {};
		}
		this.fPlayers[ aId ] = lDiv;
	},

	removeAllPlayers: function() {
		if( this.fPlayers ) {
			for( var lId in this.fPlayers) {
				document.body.removeChild( this.fPlayers[ lId ] );
			}
		}
		delete this.fPlayers;
	},

	// this removes a div from the document when a client logs out
	removePlayer: function( aId ) {
		aId = "player" + aId;
		var lDiv = document.getElementById( aId );
		if( lDiv ) {
			document.body.removeChild( lDiv );
			if( this.fPlayers ) {
				delete this.fPlayers[ aId ];
			}
		}
	},

	// this moves a div when the user presses one of the arrow keys
	movePlayer: function( aId, aX, aY ) {
		aId = "player" + aId;
		var lDiv = document.getElementById( aId );
		if( lDiv ) {
			lDiv.style.left = aX + "px";
			lDiv.style.top = aY + "px";
		}
	},

	// this method is called when the server connection was established
	processOpened: function( aToken ) {
		// console.log( "jws.ClientGamingPlugIn: Opened " + aToken.sourceId );
		if( this.isActive() ) {
			// add own player to playground
			this.addPlayer( aToken.sourceId, aToken.sourceId, "green" );

			// broadcast an identify request to all clients to initialize game.
			aToken.ns = jws.SystemClientPlugIn.NS;
			aToken.type = "broadcast";
			aToken.request = "identify";
			this.sendToken( aToken );
		}	
	},

	// this method is called when the server connection was closed
	processClosed: function( aToken ) {
		// console.log( "jws.ClientGamingPlugIn: Closed " + aToken.sourceId );

		// if disconnected remove ALL players from playground
		if( this.isActive() ) {
			this.removeAllPlayers();
		}	
	},

	// this method is called when another client connected to the network
	processConnected: function( aToken ) {
		// console.log( "jws.ClientGamingPlugIn: Connected " + aToken.sourceId );
		if( this.isActive() ) {
			this.addPlayer( aToken.sourceId, aToken.sourceId, "red" );
		}	
	},

	// this method is called when another client disconnected from the network
	processDisconnected: function( aToken ) {
		// console.log( "jws.ClientGamingPlugIn: Disconnected " + aToken.sourceId );
		if( this.isActive() ) {
			this.removePlayer( aToken.sourceId );
		}	
	},

	// this method processes an incomng token from another client or the server
	processToken: function( aToken ) {
		// Clients use system broadcast, so there's no special namespace here
		if( aToken.ns == jws.SystemClientPlugIn.NS ) {
			// process a move from another client
			var lX, lY;
			if( aToken.event == "move" ) {
				lX = aToken.x;
				lY = aToken.y;
				this.movePlayer( aToken.sourceId, lX, lY );
			// process a move from another client
			} else if( aToken.event == "identification" ) {
				this.addPlayer( aToken.sourceId, aToken.sourceId, "red" );
				lX = aToken.x;
				lY = aToken.y;
				this.movePlayer( aToken.sourceId, lX, lY );
			// process an identification request from another client
			} else if( aToken.request == "identify" ) {
				var lDiv = document.getElementById( "player" + this.getId() );
				lX = 100;
				lY = 100;
				if( lDiv ) {
					lX = parseInt( lDiv.style.left );
					lY = parseInt( lDiv.style.top );
				}
				var lToken = {
					ns: jws.SystemClientPlugIn.NS,
					type: "broadcast",
					event: "identification",
					x: lX,
					y: lY,
					username: this.getUsername()
				}
				this.sendToken( lToken );
			}
		}
	},

	// this method broadcasts a token to all other clients on the server
	broadcastGamingEvent: function( aToken, aOptions ) {
		var lRes = this.checkConnected();
		if( lRes.code == 0 ) {
			// use name space of system plug in here because 
			// there's no server side plug-in for the client-pluh-in
			aToken.ns = jws.SystemClientPlugIn.NS;
			aToken.type = "broadcast";
			aToken.event = "move";
			// explicitely include sender,
			// default is false on the server
			aToken.senderIncluded = true;
			// do not need a response here, save some time ;-)
			aToken.responseRequested = false;
			aToken.username = this.getUsername();
			this.sendToken( aToken, aOptions );
		}
		return lRes;
	}

};

// add the JWebSocket Client Gaming PlugIn into the TokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.ClientGamingPlugIn );
//  ---------------------------------------------------------------------------
//  jWebSocket - EventsPlugIn
//  Copyright (c) 2010 Innotrade GmbH, jWebSocket.org
//  ---------------------------------------------------------------------------
//  This program is free software; you can redistribute it and/or modify it
//  under the terms of the GNU Lesser General Public License as published by the
//  Free Software Foundation; either version 3 of the License, or (at your
//  option) any later version.
//  This program is distributed in the hope that it will be useful, but WITHOUT
//  ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
//  FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
//  more details.
//  You should have received a copy of the GNU Lesser General Public License along
//  with this program; if not, see <http://www.gnu.org/licenses/lgpl.html>.
//  ---------------------------------------------------------------------------

//:package:*:jws
//:class:*:jws.EventsCallbacksHandler
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.EventsCallbacksHandler[/tt] class. _
//:d:en:This class handle request callbacks on the events plug-in
jws.oop.declareClass( "jws", "EventsCallbacksHandler", null, {
	OnTimeout: function(rawRequest, aArgs){
		if (undefined != aArgs.meta.OnTimeout){
			aArgs.meta.OnTimeout(rawRequest);
		}
	}
	,
	OnResponse: function(aResponseEvent, aArgs){
		aArgs.meta.elapsedTime = (new Date().getTime()) - aArgs.sentTime;

		if (undefined != aArgs.meta.eventDefinition){
			var index = aArgs.filterChain.length - 1;
			while (index > -1){
				try
				{
					aArgs.filterChain[index].afterCall(aArgs.meta, aResponseEvent);
				}
				catch(err)
				{
					switch (err)
					{
						case "stop_filter_chain":
							return;
							break;
						default:
							throw err;
							break;
					}
				}
				index--;
			}
		}
		
		if (aResponseEvent.code == 0){
			if (undefined != aArgs.meta.OnResponse)
				aArgs.meta.OnResponse(aResponseEvent);

			if (undefined != aArgs.meta.OnSuccess)
				aArgs.meta.OnSuccess(aResponseEvent);
		}
		else {
			if (undefined != aArgs.meta.OnResponse)
				aArgs.meta.OnResponse(aResponseEvent);

			if (undefined != aArgs.meta.OnFailure)
				aArgs.meta.OnFailure(aResponseEvent);
		}
	}
});

//:file:*:jwsEventsPlugIn.js
//:d:en:Implements the EventsPlugIn in the client side

//:package:*:jws
//:class:*:jws.EventsNotifier
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.EventsNotifier[/tt] class. _
//:d:en:This class handle raw events notifications to/from the server side.
jws.oop.declareClass( "jws", "EventsNotifier", null, {
	ID: ""
	,
	jwsClient: {}
	,
	NS: ""
	,
	filterChain: []
	,
	plugIns: []
	,
	//:m:*:initialize
	//:d:en:Initialize this component. 
	//:a:en::::none
	//:r:*:::void:none
	initialize : function(){
		//Registering the notifier as plug-in of the used connection
		this.jwsClient.addPlugIn(this);
		
		//Initializing each filters
		for (var i = 0, end = this.filterChain.length; i < end; i++){
			if (this.filterChain[i]["initialize"]){
				this.filterChain[i].initialize(this);
			}
		}
	}
	,
	//:m:*:notify
	//:d:en:Notify an event in the server side
	//:a:en::aEventName:String:The event name.
	//:a:en::aOptions:Object:Contains the event arguments and the OnResponse, OnSuccess and OnFailure callbacks.
	//:r:*:::void:none
	notify: function(aEventName, aOptions){
		if (this.jwsClient.isConnected()){
			var lToken = {};
			if (aOptions.args){
				lToken = aOptions.args;
				delete (aOptions.args);
			}
			lToken.ns   = this.NS;
			lToken.type = aEventName;
			
			aOptions.UTID = jws.tools.generateSharedUTID(lToken);
			
			var request;
			if (!aOptions['OnResponse'] && !aOptions['OnSuccess'] && !aOptions['OnFailure'] && !aOptions['OnTimeout']){
				request = {};
			}
			else{
				request = new jws.EventsCallbacksHandler();	
			}
			
			request.args = {
				meta: aOptions,
				filterChain: this.filterChain,
				sentTime: new Date().getTime()
			};
			
			
			if (undefined != aOptions.eventDefinition){
				for (var i = 0; i < this.filterChain.length; i++){
					try {
						this.filterChain[i].beforeCall(lToken, request);
					}
					catch(err) {
						switch (err) {
							case "stop_filter_chain":
								return;
								break;
							default:
								throw err;
								break;
						}
					}
				}
			}
			
			this.jwsClient.sendToken(lToken, request);
		}
		else
			throw "client:not_connected";
	}
	,
	//:m:*:processToken
	//:d:en:Processes an incoming token. Used to support S2C events notifications. _
	//:d:en:Use the "event_name" and "plugin_id" information to execute _
	//:d:en:a targered method in a plug-in.
	//:a:en::aToken:Object:Token to be processed
	//:r:*:::void:none
	processToken: function (aToken) {
		if (this.NS == aToken.ns && "s2c.event_notification" == aToken.type){
			var event_name = aToken.event_name;
			var plugin_id = aToken.plugin_id;

			if (undefined != this.plugIns[plugin_id] && undefined != this.plugIns[plugin_id][event_name]){
				var startTime = new Date().getTime();
				var result = this.plugIns[plugin_id][event_name](aToken);
				var processingTime = (new Date().getTime()) - startTime;

				//Sending response back to the server
				if (aToken.has_callback){
					this.notify("s2c.onresponse", {
						args: {
							req_id: aToken.uid,
							response: result,
							processingTime: processingTime
						}
					});
				}
			}
			else {
				//Sending the "not supported" event notification
				this.notify("s2c.event_not_supported", {
					args: {
						req_id: aToken.uid
					}
				});
				throw "s2c_event_support_not_found:" + event_name;
			}
		}
	}
});

//:package:*:jws
//:class:*:jws.EventsPlugInGenerator
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.EventsPlugInGenerator[/tt] class. _
//:d:en:This class handle the generation of server plug-ins as _
//:d:en:Javascript objects.
jws.oop.declareClass( "jws", "EventsPlugInGenerator", null, {

	//:m:*:generate
	//:d:en:Processes an incoming token. Used to support S2C events notifications. _
	//:a:en::aPlugInId:String:Remote plug-in "id" to generate in the client.
	//:a:en::aNotifier:jws.EventsNotifier:The event notifier used to connect with the server.
	//:a:en::OnReady:Function:This callback is called when the plug-in has been generated.
	//:r:*:::void:none
	generate: function(aPlugInId, aNotifier, OnReady){
		var plugIn = new jws.EventsPlugIn();
		plugIn.notifier = aNotifier;

		aNotifier.notify("plugin.getapi", {
			args: {
				plugin_id: aPlugInId
			}
			,
			plugIn: plugIn
			,
			OnReady: OnReady
			,
			OnSuccess: function(aResponseEvent){
				this.plugIn.id = aResponseEvent.id;
				this.plugIn.plugInAPI = aResponseEvent.api;

				//Generating the plugin methods
				for (method in aResponseEvent.api){
					eval("this.plugIn." + method + "=function(aOptions){if (undefined == aOptions){aOptions = {};};var eventName=this.plugInAPI."+method+".type; aOptions.eventDefinition=this.plugInAPI."+ method + "; aOptions.timeout = this.plugInAPI."+method+".timeout; this.notifier.notify(eventName, aOptions);}")
				}

				//Registering the plugin in the notifier
				this.plugIn.notifier.plugIns[this.plugIn.id] = this.plugIn;

				//Plugin is ready to use
				this.OnReady(this.plugIn);
			}
			,
			OnFailure: function(aResponseEvent){
				throw aResponseEvent.msg;
			}	
		});

		return plugIn;
	}
});

//:package:*:jws
//:class:*:jws.EventsPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.EventsPlugIn[/tt] class. _
//:d:en:This class represents an abstract client plug-in. The methods are _
//:d:en:generated in runtime.
jws.oop.declareClass( "jws", "EventsPlugIn", null, {
	id: ""
	,
	notifier: {}
	,
	plugInAPI: {}
	
//Methods are generated in runtime!
//Custom methods can be added using the OnReady callback
});

//:package:*:jws
//:class:*:jws.AppUser
//:ancestor:*:-
//:d:en:Application user instance.
jws.oop.declareClass( "jws", "AppUser", null, {
	principal: ""
	,
	uuid: ""
	,
	roles: []
	,
	//:m:*:clear
	//:d:en:Clear the user instance
	//:r:*:::void:none
	clear: function (){
		this.principal = "";
		this.roles = [];
		this.uuid = "";
	}
	,
	//:m:*:isAuthenticated
	//:d:en:Returns TRUE if the user is authenticated, FALSE otherwise
	//:r:*:::boolean:none
	isAuthenticated: function(){
		return (this.principal)? true : false
	}
	,
	//:m:*:hasRole
	//:d:en:TRUE if the user have the given role, FALSE otherwise
	//:a:en::r:String:A role
	//:r:*:::boolean:none
	hasRole: function(r){
		var end = this.roles.length;
		
		for (var i = 0; i < end; i++){
			if (r == this.roles[i])
				return true
		}
	
		return false;
	}
});


//:package:*:jws
//:class:*:jws.EventsBaseFilter
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.EventsBaseFilter[/tt] class. _
//:d:en:This class represents an abstract client filter.
jws.oop.declareClass( "jws", "EventsBaseFilter", null, {
	id: ""
	,
	
	//:m:*:initialize
	//:d:en:Initialize the filter instance
	//:a:en::aNotifier:jws.EventsNotifier:The filter notifier
	//:r:*:::void:none
	initialize: function(aNotifier){}
	,

	//:m:*:beforeCall
	//:d:en:This method is called before every C2S event notification.
	//:a:en::aToken:Object:The token to be filtered.
	//:a:en::aRequest:Object:The OnResponse callback to be called.
	//:r:*:::void:none
	beforeCall: function(aToken, aRequest){}
	,
	//:m:*:afterCall
	//:d:en:This method is called after every C2S event notification.
	//:a:en::aRequest:Object:The request to be filtered.
	//:a:en::aResponseEvent:Object:The response token from the server.
	//:r:*:::void:none
	afterCall: function(aRequest, aResponseEvent){}
});

//:package:*:jws
//:class:*:jws.SecurityFilter
//:ancestor:*:jws.EventsBaseFilter
//:d:en:Implementation of the [tt]jws.SecurityFilter[/tt] class. _
//:d:en:This class handle the security for every C2S event notification _
//:d:en:in the client, using the server side security configuration.
jws.oop.declareClass( "jws", "SecurityFilter", jws.EventsBaseFilter, {
	id: "security"
	,
	initialize: function(aNotifier){
		jws.user = new jws.AppUser();
	},
	
	//:m:*:beforeCall
	//:d:en:This method is called before every C2S event notification. _
	//:d:en:Checks that the logged in user has the correct roles to notify _
	//:d:en:a custom event in the server.
	//:a:en::aToken:Object:The token to be filtered.
	//:a:en::aRequest:Object:The OnResponse callback to be called.
	//:r:*:::void:none
	beforeCall: function(aToken, aRequest){
		if (aRequest.args.meta.eventDefinition.isSecurityEnabled){
			var r, u;
			var roles, users = null;
			var exclusion = false;
			var role_authorized = false;
			var user_authorized = false;
			var stop = false;
			
			//@TODO: Support IP addresses restrictions checks on the JS client

			//Getting users restrictions
			users = aRequest.args.meta.eventDefinition.users;

			//Getting roles restrictions
			roles = aRequest.args.meta.eventDefinition.roles;
			
			//Avoid unnecessary checks if the user is not authenticated
			if (users && roles && !jws.user.isAuthenticated()){
				if (aRequest.OnResponse){
					aRequest.OnResponse({
						code: -1,
						msg: "User is not authenticated yet!"
					}, aRequest.args);
				}
				this.OnNotAuthorized(aToken);
				throw "stop_filter_chain";
			}

			//Checking if the user have the allowed roles
			if (users.length > 0){
				var user_match = false;
				for (var k = 0; k < users.length; k++){
					u = users[k];
					
					if ("all" != u){
						exclusion = (u.substring(0,1) == "!") ? true : false;
						u = (exclusion) ? u.substring(1) : u;

						if (u == jws.user.principal){
							user_match = true;
							if (!exclusion){
								user_authorized = true;
							}
							break;
						}
					} else {
						user_match = true;
						user_authorized = true;
						break;
					}
				}

				//Not Authorized USER
				if (!user_authorized && user_match || 0 == roles.length){
					aRequest.OnResponse({
						code: -1,
						msg: "Not autorized to notify this event. USER restrictions: " + users.toString()
					}, aRequest.args);
					
					this.OnNotAuthorized(aToken);
					throw "stop_filter_chain";
				}
			}

			//Checking if the user have the allowed roles
			if (roles.length > 0){
				for (var i = 0; i < roles.length; i++){
					for (var j = 0; j < jws.user.roles.length; j++){
						r = roles[i];
					
						if ("all" != r){
							exclusion = (r.substring(0,1) == "!") ? true : false;
							r = (exclusion) ? r.substring(1) : r;

							if (r == jws.user.roles[j]){
								if (!exclusion){
									role_authorized = true;
								}
								stop = true;
								break;
							}
						} else {
							role_authorized = true;
							stop = true;
							break;
						}	
					}
					if (stop){
						break;
					}
				}

				//Not Authorized ROLE
				if (!role_authorized){
					if (aRequest.OnResponse){
						aRequest.OnResponse({
							code: -1,
							msg: "Not autorized to notify this event. ROLE restrictions: " + roles.toString()
						}, aRequest.args);
					}
					this.OnNotAuthorized(aToken);
					throw "stop_filter_chain";
				}
			}
		}
	}
	,
	//:m:*:OnNotAuthorized
	//:d:en:This method is called when a "not authorized" event notification _
	//:d:en:is detected. Allows to define a global behiavor for this kind _
	//:d:en:of exception.
	//:a:en::aToken:Object:The "not authorized" token to be processed.
	//:r:*:::void:none
	OnNotAuthorized: function(aToken){
		throw "not_authorized";
	}
});

//:package:*:jws
//:class:*:jws.CacheFilter
//:ancestor:*:jws.EventsBaseFilter
//:d:en:Implementation of the [tt]jws.CacheFilter[/tt] class. _
//:d:en:This class handle the cache for every C2S event notification _
//:d:en:in the client, using the server side cache configuration.
jws.oop.declareClass( "jws", "CacheFilter", jws.EventsBaseFilter, {
	id: "cache"
	,
	cache:{}
	,
	initialize: function(notifier){
		notifier.notify("clientcacheaspect.setstatus", {
			args: {
				enabled: true
			}
		});
		
		notifier.plugIns['__cache__'] = {
			cache: this.cache,
			cleanEntries: function(event){
				for (var i = 0, end = event.entries.length; i < end; i++){
					this.cache.removeItem_(jws.user.principal.toString() + event.suffix + event.entries[i]);
				}
			}
		}
	}
	,
	//:m:*:beforeCall
	//:d:en:This method is called before every C2S event notification. _
	//:d:en:Checks if exist a non-expired cached response for the outgoing event. _
	//:d:en:If TRUE, the cached response is used and the server is not notified.
	//:a:en::aToken:Object:The token to be filtered.
	//:a:en::aRequest:jws.OnResponseObject:The OnResponse callback to be called.
	//:r:*:::void:none
	beforeCall: function(aToken, aRequest){
		if (aRequest.args.meta.eventDefinition.isCacheEnabled){
			var key = aRequest.args.meta.eventDefinition.type + aRequest.args.meta.UTID;
			
			//Storing in the user private cache storage if required
			if (aRequest.args.meta.eventDefinition.isCachePrivate && jws.user.isAuthenticated()){
				key = jws.user.uuid + key;
			}
			
			var cachedResponseEvent = this.cache.getItem(key);

			if (null != cachedResponseEvent){
				//Setting the processing time of the cached response to 0
				cachedResponseEvent.processingTime = 0;
				
				//Updating the elapsed time
				aRequest.args.meta.elapsedTime = (new Date().getTime()) - aRequest.sentTime;
				
				//Calling the OnResponse callback
				if (aRequest.OnResponse){
					aRequest.OnResponse(cachedResponseEvent, aRequest.args);
				}
				
				throw "stop_filter_chain";
			}
		}
	}
	,
	//:m:*:afterCall
	//:d:en:This method is called after every C2S event notification. _
	//:d:en:Checks if a response needs to be cached. The server configuration _
	//:d:en:for cache used.
	//:a:en::aRequest:Object:The request to be filtered.
	//:a:en::aResponseEvent:Object:The response token from the server.
	//:r:*:::void:none
	afterCall: function(aRequest, aResponseEvent){
		if (aRequest.eventDefinition.isCacheEnabled){
			var key = aRequest.eventDefinition.type 
			+ aRequest.UTID;

			//Storing in the user private cache storage if required
			if (aRequest.eventDefinition.isCachePrivate){
				key = jws.user.uuid + key;
			}
			
			this.cache.setItem(key, aResponseEvent, {
				expirationAbsolute: null,
				expirationSliding: aRequest.eventDefinition.cacheTime,
				priority: CachePriority.High
			});
		}
	}
});

//:package:*:jws
//:class:*:jws.ValidatorFilter
//:ancestor:*:jws.EventsBaseFilter
//:d:en:Implementation of the [tt]jws.ValidatorFilter[/tt] class. _
//:d:en:This class handle the validation for every argument in the request.
jws.oop.declareClass( "jws", "ValidatorFilter", jws.EventsBaseFilter, {
	id: "validator"
	,
	
	//:m:*:beforeCall
	//:d:en:This method is called before every C2S event notification. _
	//:d:en:Checks if the request arguments match with the validation server rules.
	//:a:en::aToken:Object:The token to be filtered.
	//:a:en::aRequest:jws.OnResponseObject:The OnResponse callback to be called.
	//:r:*:::void:none
	beforeCall: function(aToken, aRequest){
		var arguments = aRequest.args.meta.eventDefinition.incomingArgsValidation;
		
		for (var index = 0; index < arguments.length; index++){
			if (undefined === aToken[arguments[index].name] && !arguments[index].optional){
				if (aRequest.OnResponse){
					aRequest.OnResponse({
						code: -1,
						msg: "Argument '"+arguments[index].name+"' is required!"
					}, aRequest.args);
				}
				throw "stop_filter_chain";
			}else if (aToken.hasOwnProperty(arguments[index].name)){
				var requiredType = arguments[index].type;
				if (requiredType != jws.tools.getType(aToken[arguments[index].name])){
					if (aRequest.OnResponse){
						aRequest.OnResponse({
							code: -1,
							msg: "Argument '"+arguments[index].name+"' has invalid type. Required: '"+requiredType+"'"
						}, aRequest.args);
					}
					throw "stop_filter_chain";
				}
			}
		}
	}
});


//	---------------------------------------------------------------------------
//	jWebSocket Filesyste, Client PlugIn (uses jWebSocket Client and Server)
//	(C) 2010 jWebSocket.org, Alexander Schulze, Innotrade GmbH, Herzogenrath
//	---------------------------------------------------------------------------
//	This program is free software; you can redistribute it and/or modify it
//	under the terms of the GNU Lesser General Public License as published by the
//	Free Software Foundation; either version 3 of the License, or (at your
//	option) any later version.
//	This program is distributed in the hope that it will be useful, but WITHOUT
//	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
//	FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
//	more details.
//	You should have received a copy of the GNU Lesser General Public License along
//	with this program; if not, see <http://www.gnu.org/licenses/lgpl.html>.
//	---------------------------------------------------------------------------


//	---------------------------------------------------------------------------
//  jWebSocket Filesystem Client Plug-In
//	---------------------------------------------------------------------------

jws.FileSystemPlugIn = {

	// namespace for filesystem plugin
	// if namespace is changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.filesystem",

	NOT_FOUND_ERR: 1,
	SECURITY_ERR: 2,
	ABORT_ERR: 3,
	NOT_READABLE_ERR: 4,
	ENCODING_ERR: 5,
	NO_MODIFICATION_ALLOWED_ERR: 6,
	INVALID_STATE_ERR: 7,
	SYNTAX_ERR: 8,
	INVALID_MODIFICATION_ERR: 9,
	QUOTA_EXCEEDED_ERR: 10,
	TYPE_MISMATCH_ERR: 11,
	PATH_EXISTS_ERR: 12,

	processToken: function( aToken ) {
		// check if namespace matches
		if( aToken.ns == jws.FileSystemPlugIn.NS ) {
			// here you can handle incomimng tokens from the server
			// directy in the plug-in if desired.
			if( "load" == aToken.reqType ) {
				if( aToken.code == 0 ) {
					aToken.data = Base64.decode( aToken.data );
					if( this.OnFileLoaded ) {
						this.OnFileLoaded( aToken );
					}
				} else {
					if( this.OnFileError ) {
						this.OnFileError( aToken );
					}
				}
			} else if( "event" == aToken.type ) {
				if( "filesaved" == aToken.name ) {
					if( this.OnFileSaved ) {
						this.OnFileSaved( aToken );
					}
				} else if( "filesent" == aToken.name ) {
					if( this.OnFileSent ) {
						this.OnFileSent( aToken );
					}
				}
			}
		}
	},

	fileGetFilelist: function( aAlias, aFilemasks, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lScope = jws.SCOPE_PRIVATE;
			var lRecursive = false;

			if( aOptions ) {
				if( aOptions.scope != undefined ) {
					lScope = aOptions.scope;
				}
				if( aOptions.recursive != undefined ) {
					lRecursive = aOptions.recursive;
				}
			}
			var lToken = {
				ns: jws.FileSystemPlugIn.NS,
				type: "getFilelist",
				alias: aAlias,
				recursive: lRecursive,
				scope: lScope,
				filemasks: aFilemasks
			};
			this.sendToken( lToken,	aOptions );
		}	
		return lRes;
	},

	fileLoad: function( aFilename, aOptions ) {
		var lRes = this.createDefaultResult();
		var lScope = jws.SCOPE_PRIVATE;

		if( aOptions ) {
			if( aOptions.scope != undefined ) {
				lScope = aOptions.scope;
			}
		}
		if( this.isConnected() ) {
			var lToken = {
				ns: jws.FileSystemPlugIn.NS,
				type: "load",
				scope: lScope,
				filename: aFilename
			};
			this.sendToken( lToken,	aOptions );
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	},

	fileSave: function( aFilename, aData, aOptions ) {
		var lRes = this.createDefaultResult();
		var lEncoding = "base64";
		var lSuppressEncoder = false;
		var lScope = jws.SCOPE_PRIVATE;
		if( aOptions ) {
			if( aOptions.scope != undefined ) {
				lScope = aOptions.scope;
			}
			if( aOptions.encoding != undefined ) {
				lEncoding = aOptions.encoding;
			}
			if( aOptions.suppressEncoder != undefined ) {
				lSuppressEncoder = aOptions.suppressEncoder;
			}
		}
		if( !lSuppressEncoder ) {
			if( lEncoding == "base64" ) {
				aData = Base64.encode( aData );
			}
		}
		if( this.isConnected() ) {
			var lToken = {
				ns: jws.FileSystemPlugIn.NS,
				type: "save",
				scope: lScope,
				encoding: lEncoding,
				notify: true,
				data: aData,
				filename: aFilename
			};
			this.sendToken( lToken,	aOptions );
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	},

	fileSend: function( aTargetId, aFilename, aData, aOptions ) {
		var lEncoding = "base64";
		var lIsNode = false;
		if( aOptions ) {
			if( aOptions.encoding != undefined ) {
				lEncoding = aOptions.encoding;
			}
			if( aOptions.isNode != undefined ) {
				lIsNode = aOptions.isNode;
			}
		}
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.FileSystemPlugIn.NS,
				type: "send",
				data: aData,
				encoding: lEncoding,
				filename: aFilename
			};
			if( lIsNode ) {
				lToken.unid = aTargetId;
			} else {
				lToken.targetId = aTargetId;				
			}
			this.sendToken( lToken );
		}
		return lRes;
	},

	fileGetErrorMsg: function( aCode ) {
		var lMsg = "unkown";
		switch( aCode ) {
			case jws.FileSystemPlugIn.NOT_FOUND_ERR: {
				lMsg = "NOT_FOUND_ERR";
				break;
			}
			case jws.FileSystemPlugIn.SECURITY_ERR: {
				lMsg = "SECURITY_ERR";
				break;
			}
			case jws.FileSystemPlugIn.ABORT_ERR: {
				lMsg = "ABORT_ERR";
				break;
			}
			case jws.FileSystemPlugIn.NOT_READABLE_ERR: {
				lMsg = "NOT_READABLE_ERR";
				break;
			}
			case jws.FileSystemPlugIn.ENCODING_ERR: {
				lMsg = "ENCODING_ERR";
				break;
			}
			case jws.FileSystemPlugIn.NO_MODIFICATION_ALLOWED_ERR: {
				lMsg = "NO_MODIFICATION_ALLOWED_ERR";
				break;
			}
			case jws.FileSystemPlugIn.INVALID_STATE_ERR: {
				lMsg = "INVALID_STATE_ERR";
				break;
			}
			case jws.FileSystemPlugIn.SYNTAX_ERR: {
				lMsg = "SYNTAX_ERR";
				break;
			}
			case jws.FileSystemPlugIn.INVALID_MODIFICATION_ERR: {
				lMsg = "INVALID_MODIFICATION_ERR";
				break;
			}
			case jws.FileSystemPlugIn.QUOTA_EXCEEDED_ERR: {
				lMsg = "QUOTA_EXCEEDED_ERR";
				break;
			}
			case jws.FileSystemPlugIn.TYPE_MISMATCH_ERR: {
				lMsg = "TYPE_MISMATCH_ERR";
				break;
			}
			case jws.FileSystemPlugIn.PATH_EXISTS_ERR: {
				lMsg = "PATH_EXISTS_ERR";
				break;
			}
		}
		return lMsg;
	},

	//:author:*:Unni Vemanchery Mana:2011-02-17:Incorporated image processing capabilities.
	//:m:*:fileLoadLocal
	//:d:en:This is a call back method which gets the number of files selected from the user.
	//:d:en:Construts a FileReader object that is specified in HTML 5 specification
	//:d:en:Finally calls its readAsDataURL with the filename obeject and reads the
	//:d:en:file content in Base64 encoded string.
	//:a:en::evt:Object:File Selection event object.
	//:r:*:::void:none
	fileLoadLocal: function( aDOMElem, aOptions ) {
		// to locally load a file no check for websocket connection is required
		var lRes = {
			code: 0,
			msg: "ok"
		};
		// check if the file upload element exists at all
		if( !aDOMElem || !aDOMElem.files ) {
			// TODO: Think about error message here!
			return {
				code: -1,
				msg: "No input file element passed."
			};
		}
		// check if the browser already supports the HTML5 File API
		if( undefined == window.FileReader ) {
			return {
				code: -1,
				msg: "Your browser does not yet support the HTML5 File API."
			};
		}
		// create options if not passed (eg. encoding)
		if( !aOptions ) {
			aOptions = {};
		}
		// if no encoding was passed and a default one
		if( !aOptions.encoding ) {
			aOptions.encoding = "base64";
		}
		// iterate through list of files
		var lFileList = aDOMElem.files;
		if( !lFileList || !lFileList.length ) {
			return {
				code: -1,
				msg: "No files selected."
			};
		}
		for( var lIdx = 0, lCnt = lFileList.length; lIdx < lCnt; lIdx++ ) {
			var lFile = lFileList[ lIdx ]
			var lReader = new FileReader();
			var lThis = this;

			// if file is completely loaded, fire OnLocalFileRead event
			lReader.onload = (function( aFile ) {
				return function( aEvent ) {
					if( lThis.OnLocalFileRead || aOptions.OnSuccess) {
						var lToken = {
							encoding: aOptions.encoding,
							fileName : aFile.fileName,
							fileSize: aFile.fileSize,
							type: aFile.type,
							lastModified: aFile.lastModifiedDate,
							data: aEvent.target.result
						};
						if( aOptions.args ) {
							lToken.args = aOptions.args;
						}
						if( aOptions.action ) {
							lToken.action = aOptions.action;
						}
					}
					if( lThis.OnLocalFileRead ) {
						lThis.OnLocalFileRead( lToken );
					}
					if( aOptions.OnSuccess ) {
						aOptions.OnSuccess( lToken );
					}
				}
			})( lFile );

			// if any error appears fire OnLocalFileError event
			lReader.onerror = (function( aFile ) {
				return function( aEvent ) {
					if( lThis.OnLocalFileError || aOptions.OnFailure ) {
						// TODO: force error case and fill token
						var lCode = aEvent.target.error.code;
						var lToken = {
							code: lCode,
							msg: lThis.fileGetErrorMsg( lCode )
						};
						if( aOptions.args ) {
							lToken.args = aOptions.args;
						}
						if( aOptions.action ) {
							lToken.action = aOptions.action;
						}
					}
					if( lThis.OnLocalFileError ) {
						lThis.OnLocalFileError( lToken );
					}
					if( aOptions.OnFailure ) {
						aOptions.OnFailure( lToken );
					}
				}
			})( lFile );

			// and finally read the file(s)
			try{
				lReader.readAsDataURL( lFile );
			} catch( lEx ) {
				if( lThis.OnLocalFileError || aOptions.OnFailure ) {
					var lToken = {
						code: -1,
						msg: lEx.message
					};
					if( aOptions.args ) {
						lToken.args = aOptions.args;
					}
					if( aOptions.action ) {
						lToken.action = aOptions.action;
					}
				}
				if( lThis.OnLocalFileError ) {
					lThis.OnLocalFileError( lToken );
				}
				if( aOptions.OnFailure ) {
					aOptions.OnFailure( lToken );
				}
			}
		}
		return lRes;
	},

	setFileSystemCallbacks: function( aListeners ) {
		if( !aListeners ) {
			aListeners = {};
		}
		if( aListeners.OnFileLoaded !== undefined ) {
			this.OnFileLoaded = aListeners.OnFileLoaded;
		}
		if( aListeners.OnFileSaved !== undefined ) {
			this.OnFileSaved = aListeners.OnFileSaved;
		}
		if( aListeners.OnFileSent !== undefined ) {
			this.OnFileSent = aListeners.OnFileSent;
		}
		if( aListeners.OnFileError !== undefined ) {
			this.OnFileError = aListeners.OnFileError;
		}

		if( aListeners.OnLocalFileRead !== undefined ) {
			this.OnLocalFileRead = aListeners.OnLocalFileRead;
		}
		if( aListeners.OnLocalFileError !== undefined ) {
			this.OnLocalFileError = aListeners.OnLocalFileError;
		}
	}

}

// add the JWebSocket Shared Objects PlugIn into the TokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.FileSystemPlugIn );
//	---------------------------------------------------------------------------
//	jWebSocket Sample Client PlugIn (uses jWebSocket Client and Server)
//	(C) 2010 jWebSocket.org, Alexander Schulze, Innotrade GmbH, Herzogenrath
//	---------------------------------------------------------------------------
//	This program is free software; you can redistribute it and/or modify it
//	under the terms of the GNU Lesser General Public License as published by the
//	Free Software Foundation; either version 3 of the License, or (at your
//	option) any later version.
//	This program is distributed in the hope that it will be useful, but WITHOUT
//	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
//	FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
//	more details.
//	You should have received a copy of the GNU Lesser General Public License along
//	with this program; if not, see <http://www.gnu.org/licenses/lgpl.html>.
//	---------------------------------------------------------------------------


//	---------------------------------------------------------------------------
//  jWebSocket JDBC Plug-In
//	---------------------------------------------------------------------------

//:package:*:jws
//:class:*:jws.JDBCPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.JDBCPlugIn[/tt] class.
//:d:en:This client-side plug-in provides the API to access the features of the _
//:d:en:JDBC plug-in on the jWebSocket server.
jws.JDBCPlugIn = {

	//:const:*:NS:String:org.jwebsocket.plugins.jdbc (jws.NS_BASE + ".plugins.jdbc")
	//:d:en:Namespace for the [tt]JDBCPlugIn[/tt] class.
	// if namespace is changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.jdbc",
	
	//:m:*:processToken
	//:d:en:Processes an incoming token from the server side JDBC plug-in and _
	//:d:en:checks if certains events have to be fired. _
	//:d:en:If e.g. the request type was [tt]selectSQL[/tt] and data is _
	//:d:en:returned the [tt]OnJDBCRowSet[/tt] event is fired. Normally this _
	//:d:en:method is not called by the application directly.
	//:a:en::aToken:Object:Token to be processed by the plug-in in the plug-in chain.
	//:r:*:::void:none
	processToken: function( aToken ) {
		// check if namespace matches
		if( aToken.ns == jws.JDBCPlugIn.NS ) {
			// here you can handle incomimng tokens from the server
			// directy in the plug-in if desired.
			if( "selectSQL" == aToken.reqType ) {
				if( this.OnJDBCRowSet ) {
					this.OnJDBCRowSet( aToken );
				}
			}
		}
	},

	//:m:*:jdbcQuerySQL
	//:d:en:Runs a single native SQL query on the server utilizing the JDBC plug-in. 
	//:d:en:For security reasons it is recommended to use the abstract SQL commands.
	//:a:en::aQuery:String:Single SQL query string to be executed by the server side JDBC plug-in.
	//:a:en::aOptions:Object:Optional arguments, please refer to the [tt]sendToken[/tt] method of the [tt]jWebSocketTokenClient[/tt] class for details.
	//:r:*:::void:none
	jdbcQuerySQL: function( aQuery, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.JDBCPlugIn.NS,
				type: "querySQL",
				sql: aQuery
			};
			this.sendToken( lToken, aOptions );
		}
		return lRes;
	},

	//:m:*:jdbcQueryScript
	//:d:en:Runs a native SQL query script on the server utilizing the JDBC plug-in. 
	//:d:en:Attention! You may not mix query and update commands in a script!
	//:d:en:For security reasons it is recommended to use the abstract SQL commands.
	//:a:en::aScript:Array:Array of SQL query strings to be executed by the server side JDBC plug-in.
	//:a:en::aOptions:Object:Optional arguments, please refer to the [tt]sendToken[/tt] method of the [tt]jWebSocketTokenClient[/tt] class for details.
	//:r:*:::void:none
	jdbcQueryScript: function( aScript, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.JDBCPlugIn.NS,
				type: "querySQL",
				script: aScript
			};
			this.sendToken( lToken, aOptions );
		}
		return lRes;
	},

	//:m:*:jdbcUpdateSQL
	//:d:en:Runs a single native SQL update command on the server utilizing the JDBC plug-in. 
	//:d:en:This method returns an array of numbers how many rows have _
	//:d:en:been updated. No SQL result data is returned.
	//:d:en:For security reasons it is recommended to use the abstract SQL commands.
	//:a:en::aQuery:String:Single SQL update command string to be executed by the server side JDBC plug-in.
	//:a:en::aOptions:Object:Optional arguments, please refer to the [tt]sendToken[/tt] method of the [tt]jWebSocketTokenClient[/tt] class for details.
	//:r:*:::void:none
	jdbcUpdateSQL: function( aQuery, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.JDBCPlugIn.NS,
				type: "updateSQL",
				sql: aQuery
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	//:m:*:jdbcUpdateScript
	//:d:en:Runs a native SQL update script on the server utilizing the JDBC plug-in. _
	//:d:en:This method returns an array of numbers how many rows have _
	//:d:en:been updated. No SQL result data is returned.
	//:d:en:Attention! You may not mix query and update commands in a script!
	//:d:en:For security reasons it is recommended to use the abstract SQL commands.
	//:a:en::aScript:Array:Array of SQL update strings to be executed by the server side JDBC plug-in.
	//:a:en::aOptions:Object:Optional arguments, please refer to the [tt]sendToken[/tt] method of the [tt]jWebSocketTokenClient[/tt] class for details.
	//:r:*:::void:none
	jdbcUpdateScript: function( aScript, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.JDBCPlugIn.NS,
				type: "updateSQL",
				script: aScript
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	jdbcExecSQL: function( aQuery, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.JDBCPlugIn.NS,
				type: "execSQL",
				sql: aQuery
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	jdbcSelect: function( aQuery, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lTables = aQuery.tables;
			if( lTables && !lTables.length ) {
				lTables = [ lTables ];
			}
			var lFields = aQuery.fields;
			if( lFields && !lFields.length ) {
				lFields = [ lFields ];
			}
			var lJoins = aQuery.joins;
			if( lJoins && !lJoins.length ) {
				lJoins = [ lJoins ];
			}
			var lOrders = aQuery.orders;
			if( lOrders && !lOrders.length ) {
				lOrders = [ lOrders ];
			}
			var lToken = {
				ns: jws.JDBCPlugIn.NS,
				type: "select",
				tables: lTables,
				joins: lJoins,
				fields: lFields,
				orders: lOrders,
				where: aQuery.where,
				group: aQuery.group,
				having: aQuery.having
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	jdbcUpdate: function( aQuery, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.JDBCPlugIn.NS,
				type: "update",
				table: aQuery.table,
				fields: aQuery.fields,
				values: aQuery.values,
				where: aQuery.where
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	jdbcInsert: function( aQuery, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.JDBCPlugIn.NS,
				type: "insert",
				table: aQuery.table,
				fields: aQuery.fields,
				values: aQuery.values
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	jdbcDelete: function( aQuery, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.JDBCPlugIn.NS,
				type: "delete",
				table: aQuery.table,
				where: aQuery.where
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},
	
	jdbcGetPrimaryKeys: function( aSequence, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lCount = 1;
			if( aOptions ) {
				if( aOptions.count != undefined ) {
					lCount = aOptions.count;
				}
			}
			var lToken = {
				ns: jws.JDBCPlugIn.NS,
				type: "getNextSeqVal",
				sequence: aSequence,
				count: lCount
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	setJDBCCallbacks: function( aListeners ) {
		if( !aListeners ) {
			aListeners = {};
		}
		if( aListeners.OnJDBCRowSet !== undefined ) {
			this.OnJDBCRowSet = aListeners.OnJDBCRowSet;
		}
		if( aListeners.OnJDBCResult !== undefined ) {
			this.OnJDBCResult = aListeners.OnJDBCResult;
		}
	}

}

// add the JWebSocket Shared Objects PlugIn into the TokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.JDBCPlugIn );
//	---------------------------------------------------------------------------
//	jWebSocket JMS PlugIn (uses jWebSocket Client and Server)
//	(c) 2011 Innotrade GmbH - jWebSocket.org, Alexander Schulze
//	---------------------------------------------------------------------------
//	This program is free software; you can redistribute it and/or modify it
//	under the terms of the GNU Lesser General Public License as published by the
//	Free Software Foundation; either version 3 of the License, or (at your
//	option) any later version.
//	This program is distributed in the hope that it will be useful, but WITHOUT
//	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
//	FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
//	more details.
//	You should have received a copy of the GNU Lesser General Public License along
//	with this program; if not, see <http://www.gnu.org/licenses/lgpl.html>.
//	---------------------------------------------------------------------------

//:author:*:Johannes Smutny

//:package:*:jws
//:class:*:jws.JMSPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.JMSPlugIn[/tt] class. This _
//:d:en:plug-in provides the methods to subscribe and unsubscribe at certain _
//:d:en:channel on the server.
jws.JMSPlugIn = {

	// :const:*:NS:String:org.jwebsocket.plugins.channels (jws.NS_BASE +
	// ".plugins.channels")
	// :d:en:Namespace for the [tt]ChannelPlugIn[/tt] class.
	// if namespace changes update server plug-in accordingly!
	NS : jws.NS_BASE + ".plugins.jms",

	SEND_TEXT : "sendJmsText",
	SEND_TEXT_MESSAGE : "sendJmsTextMessage",
	SEND_MAP : "sendJmsMap",
	SEND_MAP_MESSAGE : "sendJmsMapMessage",
	LISTEN : "listenJms",
	LISTEN_MESSAGE : "listenJmsMessage",
	UNLISTEN : "unlistenJms",

	listenJms : function(aConnectionFactoryName, aDestinationName, 
		aPubSubDomain, aOptions) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			this.sendToken({
				ns : jws.JMSPlugIn.NS,
				type : jws.JMSPlugIn.LISTEN,
				connectionFactoryName : aConnectionFactoryName,
				destinationName : aDestinationName,
				pubSubDomain : aPubSubDomain
			}, aOptions );
		}
		return lRes;
	},

	listenJmsMessage : function(aConnectionFactoryName, aDestinationName,
		aPubSubDomain, aOptions) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			this.sendToken({
				ns : jws.JMSPlugIn.NS,
				type : jws.JMSPlugIn.LISTEN_MESSAGE,
				connectionFactoryName : aConnectionFactoryName,
				destinationName : aDestinationName,
				pubSubDomain : aPubSubDomain
			}, aOptions );
		}
		return lRes;
	},

	unlistenJms : function(aConnectionFactoryName, aDestinationName,
		aPubSubDomain, aOptions) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			this.sendToken({
				ns : jws.JMSPlugIn.NS,
				type : jws.JMSPlugIn.UNLISTEN,
				connectionFactoryName : aConnectionFactoryName,
				destinationName : aDestinationName,
				pubSubDomain : aPubSubDomain
			}, aOptions );
		}
		return lRes;
	},
	

	sendJmsText : function(aConnectionFactoryName, aDestinationName,
		aPubSubDomain, aText, aOptions ) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			this.sendToken({
				ns : jws.JMSPlugIn.NS,
				type : jws.JMSPlugIn.SEND_TEXT,
				connectionFactoryName : aConnectionFactoryName,
				destinationName : aDestinationName,
				pubSubDomain : aPubSubDomain,
				msgPayLoad : aText
			}, aOptions );
		}
		return lRes;
	},

	sendJmsTextMessage : function(aConnectionFactoryName, aDestinationName,
		aPubSubDomain, aText, aJmsHeaderProperties, aOptions ) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			this.sendToken({
				ns : jws.JMSPlugIn.NS,
				type : jws.JMSPlugIn.SEND_TEXT_MESSAGE,
				connectionFactoryName : aConnectionFactoryName,
				destinationName : aDestinationName,
				pubSubDomain : aPubSubDomain,
				msgPayLoad : aText,
				jmsHeaderProperties : aJmsHeaderProperties
			}, aOptions );
		}
		return lRes;
	},

	sendJmsMap : function(aConnectionFactoryName, aDestinationName,
		aPubSubDomain, aMap, aOptions ) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			this.sendToken({
				ns : jws.JMSPlugIn.NS,
				type : jws.JMSPlugIn.SEND_MAP,
				connectionFactoryName : aConnectionFactoryName,
				destinationName : aDestinationName,
				pubSubDomain : aPubSubDomain,
				msgPayLoad : aMap
			}, aOptions );
		}
		return lRes;
	},
	
	sendJmsMapMessage : function(aConnectionFactoryName, aDestinationName,
		aPubSubDomain, aMap, aJmsHeaderProperties, aOptions ) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			this.sendToken({
				ns : jws.JMSPlugIn.NS,
				type : jws.JMSPlugIn.SEND_MAP_MESSAGE,
				connectionFactoryName : aConnectionFactoryName,
				destinationName : aDestinationName,
				pubSubDomain : aPubSubDomain,
				msgPayLoad : aMap,
				jmsHeaderProperties : aJmsHeaderProperties
			}, aOptions );
		}
		return lRes;
	},

	processToken : function(aToken) {
		// check if namespace matches
		if (aToken.ns == jws.JMSPlugIn.NS) {
			// here you can handle incoming tokens from the server
			// directy in the plug-in if desired.
			if ("event" == aToken.type) {
				if ("handleJmsText" == aToken.name) {
					if (this.OnHandleJmsText) {
						this.OnHandleJmsText(aToken);
					}
				} else if ("handleJmsTextMessage" == aToken.name) {
					if (this.OnHandleJmsTextMessage) {
						this.OnHandleJmsTextMessage(aToken);
					}
				} else if ("handleJmsMap" == aToken.name) {
					if (this.OnHandleJmsMap) {
						this.OnHandleJmsMap(aToken);
					}
				} else if ("handleJmsMapMessage" == aToken.name) {
					if (this.OnHandleJmsMapMessage) {
						this.OnHandleJmsMapMessage(aToken);
					}
				}
			}
		}
	},

	setHandleMessageCallbacks : function(aListeners) {
		if (!aListeners) {
			aListeners = {};
		}
		if (aListeners.OnHandleJmsText !== undefined) {
			this.OnHandleJmsText = aListeners.OnHandleJmsText;
		}
		if (aListeners.OnHandleJmsTextMessage !== undefined) {
			this.OnHandleJmsTextMessage = aListeners.OnHandleJmsTextMessage;
		}
		if (aListeners.OnHandleJmsMap !== undefined) {
			this.OnHandleJmsMap = aListeners.OnHandleJmsMap;
		}
		if (aListeners.OnHandleJmsMapMessage !== undefined) {
			this.OnHandleJmsMapMessage = aListeners.OnHandleJmsMapMessage;
		}
	}

};
// add the JMSPlugIn PlugIn into the jWebSocketTokenClient class
jws.oop.addPlugIn(jws.jWebSocketTokenClient, jws.JMSPlugIn);
//	---------------------------------------------------------------------------
//	jWebSocket Logging PlugIn (uses jWebSocket Client and Server)
//	(C) 2011 jWebSocket.org, Alexander Schulze, Innotrade GmbH, Herzogenrath
//	---------------------------------------------------------------------------
//	This program is free software; you can redistribute it and/or modify it
//	under the terms of the GNU Lesser General Public License as published by the
//	Free Software Foundation; either version 3 of the License, or (at your
//	option) any later version.
//	This program is distributed in the hope that it will be useful, but WITHOUT
//	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
//	FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
//	more details.
//	You should have received a copy of the GNU Lesser General Public License along
//	with this program; if not, see <http://www.gnu.org/licenses/lgpl.html>.
//	---------------------------------------------------------------------------


//	---------------------------------------------------------------------------
//  jWebSocket Logging Client Plug-In
//	---------------------------------------------------------------------------

//:package:*:jws
//:class:*:jws.LoggingPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.LoggingPlugIn[/tt] class.
jws.LoggingPlugIn = {

	//:const:*:NS:String:org.jwebsocket.plugins.Logging (jws.NS_BASE + ".plugins.logging")
	//:d:en:Namespace for the [tt]LoggingPlugIn[/tt] class.
	// if namespace is changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.logging",

	DEBUG: "debug",
	INFO: "info",
	WARN: "warn",
	ERROR: "error",
	FATAL: "fatal",

	processToken: function( aToken ) {
		// check if namespace matches
		if( aToken.ns == jws.LoggingPlugIn.NS ) {
			// here you can handle incoming tokens from the server
			// directy in the plug-in if desired.
			if( "log" == aToken.reqType ) {
				if( this.OnLogged ) {
					this.OnLogged( aToken );
				}
			}
		}
	},

	loggingLog: function( aLevel, aInfo, aMessage, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.LoggingPlugIn.NS,
				type: "log",
				level: aLevel,
				info: aInfo,
				message: aMessage
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	loggingEvent: function( aTable, aData, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lSequence = null;
			var lPrimaryKey = null;
			if( aOptions ) {
				if( aOptions.primaryKey ) {
					lPrimaryKey = aOptions.primaryKey;
				}
				if( aOptions.sequence ) {
					lSequence = aOptions.sequence;
				}	
			}
			var lFields = [];
			var lValues = [];
			for( var lField in aData ) {
				lFields.push( lField );
				// do not use "jws.tools.escapeSQL()" here, 
				// the SQL string will be escaped by the server!
				lValues.push( aData[ lField ] );
			}
			var lToken = {
				ns: jws.LoggingPlugIn.NS,
				type: "logEvent",
				table: aTable,
				fields: lFields,
				values: lValues
			};
			if( lPrimaryKey && lSequence ) {
				lToken.primaryKey = lPrimaryKey;
				lToken.sequence = lSequence;
			}
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	loggingGetEvents: function( aTable, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lPrimaryKey = null;
			var lFromKey = null;
			var lToKey = null;
			if( aOptions ) {
				if( aOptions.primaryKey ) {
					lPrimaryKey = aOptions.primaryKey;
				}
				if( aOptions.fromKey ) {
					lFromKey = aOptions.fromKey;
				}
				if( aOptions.toKey ) {
					lToKey = aOptions.toKey;
				}
			}
			var lToken = {
				ns: jws.LoggingPlugIn.NS,
				type: "getEvents",
				table: aTable,
				primaryKey: lPrimaryKey,
				fromKey: lFromKey,
				toKey: lToKey
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	loggingSubscribe: function( aTable, aOptions ) {
		
	},

	loggingUnsubscribe: function( aTable, aOptions ) {
		
	},

	setLoggingCallbacks: function( aListeners ) {
		if( !aListeners ) {
			aListeners = {};
		}
		if( aListeners.OnLogged !== undefined ) {
			this.OnLogged = aListeners.OnLogged;
		}
	}

}

// add the JWebSocket Logging PlugIn into the TokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.LoggingPlugIn );
//	---------------------------------------------------------------------------
//	jWebSocket Mail PlugIn (uses jWebSocket Client and Server)
//	(C) 2010 jWebSocket.org, Alexander Schulze, Innotrade GmbH, Herzogenrath
//	---------------------------------------------------------------------------
//	This program is free software; you can redistribute it and/or modify it
//	under the terms of the GNU Lesser General Public License as published by the
//	Free Software Foundation; either version 3 of the License, or (at your
//	option) any later version.
//	This program is distributed in the hope that it will be useful, but WITHOUT
//	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
//	FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
//	more details.
//	You should have received a copy of the GNU Lesser General Public License along
//	with this program; if not, see <http://www.gnu.org/licenses/lgpl.html>.
//	---------------------------------------------------------------------------


//	---------------------------------------------------------------------------
//  jWebSocket Mail Client Plug-In
//	---------------------------------------------------------------------------

//:package:*:jws
//:class:*:jws.MailPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.MailPlugIn[/tt] class.
jws.MailPlugIn = {

	//:const:*:NS:String:org.jwebsocket.plugins.mail (jws.NS_BASE + ".plugins.mail")
	//:d:en:Namespace for the [tt]MailPlugIn[/tt] class.
	// if namespace is changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.mail",
	HTML_MAIL: true,
	TEXT_MAIL: false,

	//:m:*:processToken
	//:d:en:Processes an incoming token from the server side Mail plug-in and _
	//:d:en:checks if certains events have to be fired. _
	//:d:en:If e.g. the request type was [tt]sendMail[/tt] and data is _
	//:d:en:returned the [tt]OnMailSent[/tt] event is fired. Normally this _
	//:d:en:method is not called by the application directly.
	//:a:en::aToken:Object:Token to be processed by the plug-in in the plug-in chain.
	//:r:*:::void:none
	processToken: function( aToken ) {
		// check if namespace matches
		if( aToken.ns == jws.MailPlugIn.NS ) {
			// here you can handle incomimng tokens from the server
			// directy in the plug-in if desired.
			if( "sendMail" == aToken.reqType ) {
				if( this.OnMailSent ) {
					this.OnMailSent( aToken );
				}
			}
		}
	},

	//:m:*:sendMail
	//:d:en:Sends the mail identified by the given Id to the mail server. _
	//:d:en:To create please refer to the [tt]createMail[/tt] method, which _
	//:d:en:delivers an id to be used to refer to the mail to be sent. _
	//:d:en:You can add attachments with [tt]addAttachment[/tt] or drop the mail with [tt]dropMail[/tt] before sending.
	//:a:en::aId:String:Id of the mail to be sent to the mail server.
	//:a:en::aOptions:Object:Optional arguments, please refer to the [tt]sendToken[/tt] method of the [tt]jWebSocketTokenClient[/tt] class for details.
	//:r:*:::void:none
	sendMail: function( aId, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.MailPlugIn.NS,
				type: "sendMail",
				id: aId
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	//:m:*:createMail
	//:d:en:Creates a new mail on the server and returns its id to the client to add attachment
	//:d:en:You can directly send the mail by using the [tt]sendMail[/tt] method, 
	//:d:en:add attachments with [tt]addAttachment[/tt] before sending or _
	//:d:en:drop the mail with [tt]dropMail[/tt].
	//:a:en::aFrom:String:From e-mail address of the sender (attention: this field may by defaulted/ignored by certain mailserves).
	//:a:en::aTo:String:To e-mail address of the recepient(s).
	//:a:en::aCC:String:CC (Carbon Copy) addresses of the recepient(s).
	//:a:en::aCC:String:BCC (Blind Carbon Copy) addresses of the recepient(s).
	//:a:en::aSubject:String:Subject (title) of the e-mail.
	//:a:en::aSubject:String:Body (message) of the e-mail, can be either plain text or HTML, identified by aIsHTML.
	//:a:en::aIsHTML:Boolean:Specifies if the body is passed as plain text ([tt]false[/tt]) or as formatted HTML ([tt]true[/tt]).
	//:a:en::aOptions:Object:Optional arguments, please refer to the [tt]sendToken[/tt] method of the [tt]jWebSocketTokenClient[/tt] class for details.
	//:r:*:::void:none
	createMail: function( aFrom, aTo, aCC, aBCC, aSubject, aBody, aIsHTML, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.MailPlugIn.NS,
				type: "createMail",
				from: aFrom,
				to: aTo,
				cc: aCC,
				bcc: aBCC,
				subject: aSubject,
				body: aBody,
				isHTML: aIsHTML
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	//:m:*:dropMail
	//:d:en:Drops the mail identified by the given Id to the mail server. All _
	//:d:en:attachments and other references like embedded images are also _
	//:d:en:removed from the server. If the no mail with the given Id exists _
	//:d:en:on the server an error token will be returned.
	//:a:en::aId:String:Id of the mail to be sent to the mail server.
	//:a:en::aOptions:Object:Optional arguments, please refer to the [tt]sendToken[/tt] method of the [tt]jWebSocketTokenClient[/tt] class for details.
	//:r:*:::void:none
	dropMail: function( aId, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.MailPlugIn.NS,
				type: "dropMail",
				id: aId
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	//:m:*:addAttachment
	//:d:en:Add an attachment (file) to the mail on the server identified _
	//:d:en:by its Id.
	//:a:en::aId:String:Id of the mail to add an attachment.
	//:a:en::aFilename:String:name of the file to be attached.
	//:a:en::aData:String:Data of the file to be attached (base64 encoded).
	//:a:en::aOptions:Object:Optional arguments, please refer to the [tt]sendToken[/tt] method of the [tt]jWebSocketTokenClient[/tt] class for details.
	//:a:en:aOptions:archiveName:String:Optional, if given all attachments will be archived (e.g. in a .rar or .zip file), needs to be configured accordingly on the server.
	//:a:en:aOptions:volumeSize:Integer:Optional, if an archive is choosen it will be automatically splitted in mutliple volumes to avoid e-mail size limitations.
	//:r:*:::void:none
	addAttachment: function( aId, aFilename, aData, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lEncoding = "base64";
			var lSuppressEncoder = false;
			var lScope = jws.SCOPE_PRIVATE;
			var lVolumeSize = null;
			var lArchiveName = null;
			if( aOptions ) {
				if( aOptions.scope != undefined ) {
					lScope = aOptions.scope;
				}
				if( aOptions.encoding != undefined ) {
					lEncoding = aOptions.encoding;
				}
				if( aOptions.suppressEncoder != undefined ) {
					lSuppressEncoder = aOptions.suppressEncoder;
				}
				if( aOptions.volumeSize != undefined ) {
					lVolumeSize = aOptions.volumeSize;
				}
				if( aOptions.archiveName != undefined ) {
					lArchiveName = aOptions.archiveName;
				}
			}
			if( !lSuppressEncoder ) {
				if( lEncoding == "base64" ) {
					aData = Base64.encode( aData );
				}
			}
			var lToken = {
				ns: jws.MailPlugIn.NS,
				type: "addAttachment",
				encoding: lEncoding,
				id: aId,
				data: aData,
				filename: aFilename
			};
			if( lVolumeSize ) {
				lToken.volumeSize = lVolumeSize;
			}
			if( lArchiveName ) {
				lToken.archiveName = lArchiveName;
			}
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
		
	},

	removeAttachment: function( aId, aOptions ) {
		
	},

	getMail: function( aId, aOptions ) {
		
	},

	moveMail: function( aId, aOptions ) {
		
	},

	setMailCallbacks: function( aListeners ) {
		if( !aListeners ) {
			aListeners = {};
		}
		if( aListeners.OnMailSent !== undefined ) {
			this.OnMailSent = aListeners.OnMailSent;
		}
	}

}

// add the jWebSocket Mail PlugIn into the TokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.MailPlugIn );
//	---------------------------------------------------------------------------
//	jWebSocket Reporting Client PlugIn (uses jWebSocket Client and Server)
//	(C) 2010 jWebSocket.org, Alexander Schulze, Innotrade GmbH, Herzogenrath
//	---------------------------------------------------------------------------
//	This program is free software; you can redistribute it and/or modify it
//	under the terms of the GNU Lesser General Public License as published by the
//	Free Software Foundation; either version 3 of the License, or (at your
//	option) any later version.
//	This program is distributed in the hope that it will be useful, but WITHOUT
//	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
//	FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
//	more details.
//	You should have received a copy of the GNU Lesser General Public License along
//	with this program; if not, see <http://www.gnu.org/licenses/lgpl.html>.
//	---------------------------------------------------------------------------


//	---------------------------------------------------------------------------
//  jWebSocket Reporting Client Plug-In
//	---------------------------------------------------------------------------

//:package:*:jws
//:class:*:jws.ReportingPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.ReportingPlugIn[/tt] class.
jws.ReportingPlugIn = {

	//:const:*:NS:String:org.jwebsocket.plugins.reporting (jws.NS_BASE + ".plugins.reporting")
	//:d:en:Namespace for the [tt]ReportingPlugIn[/tt] class.
	// if namespace is changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.reporting",

	processToken: function( aToken ) {
		// check if namespace matches
		if( aToken.ns == jws.ReportingPlugIn.NS ) {
			// here you can handle incomimng tokens from the server
			// directy in the plug-in if desired.
			if( "createReport" == aToken.reqType ) {
				if( this.OnReport ) {
					this.OnReport( aToken );
				}
			} else if( "getReports" == aToken.reqType ) {
				if( this.OnReports ) {
					this.OnReports( aToken );
				}
			} else if( "getReportParams" == aToken.reqType ) {
				if( this.OnReportParams ) {
					this.OnReportParams( aToken );
				}
			}
		}
	},

	reportingCreateReport: function( aReportId, aParams, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lOutputType = "pdf";
			if( aOptions ) {
				if( aOptions.outputType ) {
					lOutputType = aOptions.outputType;
				} 
			}
			var lToken = {
				ns: jws.ReportingPlugIn.NS,
				type: "createReport",
				reportId: aReportId,
				outputType: lOutputType,
				params: aParams
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},
	
	reportingGetReports: function( aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.ReportingPlugIn.NS,
				type: "getReports"
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},
	
	reportingGetReportParams: function( aReportId, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.ReportingPlugIn.NS,
				type: "getReportParams",
				reportId: aReportId
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},
	
	setReportingCallbacks: function( aListeners ) {
		if( !aListeners ) {
			aListeners = {};
		}
		if( aListeners.OnReportAvail !== undefined ) {
			this.OnReportAvail = aListeners.OnReportAvail;
		}
		if( aListeners.OnReports !== undefined ) {
			this.OnReports = aListeners.OnReports;
		}
		if( aListeners.OnReportParams !== undefined ) {
			this.OnReportParams = aListeners.OnReportParams;
		}
	}

}

// add the JWebSocket Shared Objects PlugIn into the TokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.ReportingPlugIn );
//	---------------------------------------------------------------------------
//	jWebSocket Mail RPC/RRPC  (uses jWebSocket Client and Server)
//	(C) 2010 jWebSocket.org, Alexander Schulze, Innotrade GmbH, Herzogenrath
//	Authors: Alexander Schulze, Quentin Ambard
//	---------------------------------------------------------------------------
//	This program is free software; you can redistribute it and/or modify it
//	under the terms of the GNU Lesser General Public License as published by the
//	Free Software Foundation; either version 3 of the License, or (at your
//	option) any later version.
//	This program is distributed in the hope that it will be useful, but WITHOUT
//	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
//	FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
//	more details.
//	You should have received a copy of the GNU Lesser General Public License along
//	with this program; if not, see <http://www.gnu.org/licenses/lgpl.html>.
//	---------------------------------------------------------------------------


//	---------------------------------------------------------------------------
//  jWebSocket RPC/RRPC Client Plug-In
//	---------------------------------------------------------------------------

//:package:*:jws
//:class:*:jws.RPCClientPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.RPCClientPlugIn[/tt] class.
jws.RPCClientPlugIn = {

	// granted rrpc's
	grantedProcs: [],

	// granted rrpc's
	spawnThreadDefault: false,

	//:const:*:NS:String:org.jwebsocket.plugins.rpc (jws.NS_BASE + ".plugins.rpc")
	//:d:en:Namespace for the [tt]RPCClientPlugIn[/tt] class.
	// if namespace changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.rpc",

	//:m:*:setSpawnThreadDefault
	//:d:en:set the default value of the spawnThread option
	//:a:en::aDefault:Boolean.
	//:r:*:::void:none
	setSpawnThreadDefault: function (aDefault) {
		this.spawnThreadDefault = aDefault;
	},

	//:m:*:addGrantedProcedure
	//:d:en:grant the access to a rrpc procedure
	//:a:en::aProcedure:String procedure name (including name space).
	//:r:*:::void:none
	addGrantedProcedure: function (aProcedure) {
		jws.RPCClientPlugIn.grantedProcs[ jws.RPCClientPlugIn.grantedProcs.length ] = aProcedure;
	},

	//:m:*:removeGrantedProcedure
	//:d:en:remove the access to a rrpc procedure
	//:a:en::aProcedure:String procedure name (including name space).
	//:r:*:::void:none
	removeGrantedProcedure: function (aProcedure) {
		var lIdx = jws.RPCClientPlugIn.grantedProcs.indexOf( aProcedure );
		if( lIdx >= 0 ) {
			jws.RPCClientPlugIn.grantedProcs.splice( lIdx, 1 );
		}
	},

	//:m:*:processToken
	//:d:en:Processes an incoming token from the server or a remote client. _
	//:d:en:Here the token is checked for type [tt]rrpc[/tt]. If such is _
	//:d:en:detected it gets processed by the [tt]onRRPC[/tt] method of this class.
	//:a:en::aToken:Object:Token received from the server or a remote client.
	//:r:*:::void:none
	processToken: function( aToken ) {
		// console.log( "jws.RPCClientPlugIn: Processing token " + aToken.ns + "/" + aToken.type + "..." );
		if( aToken.ns == jws.RPCClientPlugIn.NS ) {
			if( aToken.type == "rrpc" ) {
				this.onRRPC( aToken );
			}
		}
	},

	//:m:*:rpc
	//:d:en:Runs a remote procedure call (RPC) on the jWebSocket server. _
	//:d:en:The security mechanisms on the server require the call to be _
	//:d:en:granted, otherwise it gets rejected.
	//:a:en::aClass:String:Class of the method that is supposed to be called.
	//:a:en::aMthd:String:Name of the method that is supposed to be called.
	//:a:en::aArgs:Array:Arguments for method that is supposed to be called. Should always be an array, but also works with simple values. Caution with a simple array as parameter (args mus be: [[1,2..]]).
	//:a:en::aOptions:Object:Optional arguments. For details please refer to the [tt]sendToken[/tt] method.
	//:r:*:::void:none
	rpc: function( aClass, aMthd, aArgs, aOptions) {
		if (aArgs != null && !(aArgs instanceof Array)) {
			aArgs = [aArgs];
		}
		aOptions = this.setDefaultOption (aOptions) ;
		var lRes = this.createDefaultResult();
		if( this.isConnected() ) {
			this.sendToken({
				ns: jws.RPCClientPlugIn.NS,
				type: "rpc",
				classname: aClass,
				method: aMthd,
				args: aArgs
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

	setDefaultOption: function( aOptions ) {
		if (aOptions === undefined) {
			aOptions = {} ;
		}
		if (aOptions.spawnThread === undefined) {
			aOptions.spawnThread = this.spawnThreadDefault;
		}
		return aOptions ;
	},

	//:m:*:rrpc
	//:d:en:Runs a reverse remote procedure call (RRPC) on another client.
	//:a:en::aTarget:String:Id of the target remote client.
	//:a:en::aClass:String:Class of the method that is supposed to be called.
	//:a:en::aMthd:String:Name of the method that is supposed to be called.
	//:a:en::aArgs:Array:Arguments for method that is supposed to be called.
	//:a:en::aOptions:Object:Optional arguments. For details please refer to the [tt]sendToken[/tt] method.
	//:r:*:::void:none
	rrpc: function( aTarget, aClass, aMthd, aArgs, aOptions ) {
		if (aArgs != null && !(aArgs instanceof Array)) {
			aArgs = [aArgs];
		}
		aOptions = this.setDefaultOption (aOptions) ;
		var lRes = this.createDefaultResult();
		if( this.isConnected() ) {
			this.sendToken({
				ns: jws.RPCClientPlugIn.NS,
				type: "rrpc",
				targetId: aTarget,
				classname: aClass,
				method: aMthd,
				args: aArgs
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

	//:m:*:onRRPC
	//:d:en:Processes a remote procedure call from another client. _
	//:d:en:This method is called internally only and should not be invoked _
	//:d:en:by the application.
	//:a:en::aToken:Object:Token that contains the rrpc arguments from the source client.
	//:r:*:::void:none
	onRRPC: function( aToken ) {
		var lClassname = aToken.classname;
		var lMethod = aToken.method;
		var lArgs = aToken.args;
		var lPath = lClassname + "." + lMethod;
		// check if the call is granted on this client
		if( jws.RPCClientPlugIn.grantedProcs.indexOf( lPath ) >= 0 ) {
			var lFunctionSplit = lClassname.split( '.' );
			var lFunctionSplitSize = lFunctionSplit.length;
			var lTheFunction = window[ lFunctionSplit[ 0 ] ] ;
			for( var j = 1; j < lFunctionSplitSize; j++ ) {
				lTheFunction = lTheFunction[ lFunctionSplit[ j ] ];
			}
			var lRes;
			try {
				lRes = lTheFunction[ lMethod ].apply( null, lArgs);
			} catch (ex) {
				//TODO: send back the error under a better format
				lRes = ex
					+ "\nProbably a typo error (method called="
					+ lMethod
					+ ") or wrong number of arguments (args: "
					+ JSON.stringify(lArgs)
					+ ")";
			}
		} else {
			//TODO: send back the error under a better format
			lRes =
			+ "\nAcces not granted to the="
			+ lMethod;
		}
		this.sendToken({
				// ns: jws.SystemPlugIn.NS,
				type: "send",
				targetId: aToken.sourceId,
				result: lRes,
				reqType: "rrpc",
				code: 0
			},null // aOptions
		);
	}
}

// add the JWebSocket RPC PlugIn into the BaseClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.RPCClientPlugIn );
//	---------------------------------------------------------------------------
//	jWebSocket Sample Client PlugIn (uses jWebSocket Client and Server)
//	(C) 2010 jWebSocket.org, Alexander Schulze, Innotrade GmbH, Herzogenrath
//	---------------------------------------------------------------------------
//	This program is free software; you can redistribute it and/or modify it
//	under the terms of the GNU Lesser General Public License as published by the
//	Free Software Foundation; either version 3 of the License, or (at your
//	option) any later version.
//	This program is distributed in the hope that it will be useful, but WITHOUT
//	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
//	FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
//	more details.
//	You should have received a copy of the GNU Lesser General Public License along
//	with this program; if not, see <http://www.gnu.org/licenses/lgpl.html>.
//	---------------------------------------------------------------------------


//	---------------------------------------------------------------------------
//  jWebSocket Sample Client Plug-In
//	---------------------------------------------------------------------------

jws.SamplesPlugIn = {

	// namespace for shared objects plugin
	// if namespace is changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.samples",

	processToken: function( aToken ) {
		// check if namespace matches
		if( aToken.ns == jws.SamplesPlugIn.NS ) {
			// here you can handle incomimng tokens from the server
			// directy in the plug-in if desired.
			if( "requestServerTime" == aToken.reqType ) {
				// this is just for demo purposes
				// don't use blocking calls here which block the communication!
				// like alert( "jWebSocket Server returned: " + aToken.time );
				if( this.OnSamplesServerTime ) {
					this.OnSamplesServerTime( aToken );
				}
			}
		}
	},

	requestServerTime: function( aOptions ) {
		var lRes = this.createDefaultResult();
		if( this.isConnected() ) {
			var lToken = {
				ns: jws.SamplesPlugIn.NS,
				type: "requestServerTime"
			};
			this.sendToken( lToken,	aOptions );
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	},

	setSamplesCallbacks: function( aListeners ) {
		if( !aListeners ) {
			aListeners = {};
		}
		if( aListeners.OnSamplesServerTime !== undefined ) {
			this.OnSamplesServerTime = aListeners.OnSamplesServerTime;
		}
	}

}

// add the JWebSocket Shared Objects PlugIn into the TokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.SamplesPlugIn );
//	---------------------------------------------------------------------------
//	jWebSocket Shared Objects PlugIn (uses jWebSocket Client and Server)
//	(C) 2010 jWebSocket.org, Alexander Schulze, Innotrade GmbH, Herzogenrath
//	---------------------------------------------------------------------------
//	This program is free software; you can redistribute it and/or modify it
//	under the terms of the GNU Lesser General Public License as published by the
//	Free Software Foundation; either version 3 of the License, or (at your
//	option) any later version.
//	This program is distributed in the hope that it will be useful, but WITHOUT
//	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
//	FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
//	more details.
//	You should have received a copy of the GNU Lesser General Public License along
//	with this program; if not, see <http://www.gnu.org/licenses/lgpl.html>.
//	---------------------------------------------------------------------------


//	---------------------------------------------------------------------------
//  jWebSocket Shared Objects Plug-In
//	---------------------------------------------------------------------------

jws.SharedObjectsPlugIn = {

	// namespace for shared objects plugin
	// if namespace is changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.sharedObjs",
	// if data types are changed update server plug-in accordingly!
	DATA_TYPES: [ "number", "string", "boolean", "object", "set", "list", "map", "table" ],

	fObjects: {},

	processToken: function( aToken ) {
		// console.log( "jws.SharedObjectsPlugIn: Processing token " + aToken.ns + "/" + aToken.type + "..." );
		if( aToken.ns == jws.SharedObjectsPlugIn.NS ) {
			if( aToken.name == "created" ) {
				// create a new object on the client
				if( this.OnSharedObjectCreated ) {
					this.OnSharedObjectCreated( aToken );
				}
			} else if( aToken.name == "destroyed" ) {
				// destroy an existing object on the client
				if( this.OnSharedObjectDestroyed ) {
					this.OnSharedObjectDestroyed( aToken );
				}
			} else if( aToken.name == "updated" ) {
				// update an existing object on the client
				if( this.OnSharedObjectUpdated ) {
					this.OnSharedObjectUpdated( aToken );
				}
			} else if( aToken.name == "init" ) {
				// init all shared object on the client
				if( this.OnSharedObjectsInit ) {
					var lObj = JSON.parse( aToken.value );
					this.OnSharedObjectsInit( aToken, lObj );
				}
			}
		}
	},

	createSharedObject: function( aId, aDataType, aValue, aOptions ) {
		var lRes = this.createDefaultResult();
		if( this.isConnected() ) {
			var lToken = {
				ns: jws.SharedObjectsPlugIn.NS,
				type: "create",
				id: aId,
				datatype: aDataType,
				value: aValue
			};
			this.sendToken( lToken,	aOptions );
			if( this.OnSharedObjectCreated ) {
				this.OnSharedObjectCreated( lToken );
			}
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	},

	destroySharedObject: function( aId, aDataType, aOptions ) {
		var lRes = this.createDefaultResult();
		if( this.isConnected() ) {
			var lToken = {
				ns: jws.SharedObjectsPlugIn.NS,
				type: "destroy",
				id: aId,
				datatype: aDataType
			};
			this.sendToken( lToken, aOptions );
			if( this.OnSharedObjectDestroyed ) {
				this.OnSharedObjectDestroyed( lToken );
			}
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	},

	getSharedObject: function( aId, aDataType, aOptions ) {
		var lRes = this.createDefaultResult();
		if( this.isConnected() ) {
			var lToken = {
				ns: jws.SharedObjectsPlugIn.NS,
				type: "get",
				id: aId,
				datatype: aDataType
			};
			this.sendToken( lToken,	aOptions );
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	},

	updateSharedObject: function( aId, aDataType, aValue, aOptions ) {
		var lRes = this.createDefaultResult();
		if( this.isConnected() ) {
			var lToken = {
				ns: jws.SharedObjectsPlugIn.NS,
				type: "update",
				id: aId,
				datatype: aDataType,
				value: aValue
			};
			this.sendToken( lToken,	aOptions );
			if( this.OnSharedObjectUpdated ) {
				this.OnSharedObjectUpdated( lToken );
			}
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	},

	setSharedObjectsCallbacks: function( aListeners ) {
		if( !aListeners ) {
			aListeners = {};
		}
		if( aListeners.OnSharedObjectCreated !== undefined ) {
			this.OnSharedObjectCreated = aListeners.OnSharedObjectCreated;
		}
		if( aListeners.OnSharedObjectDestroyed !== undefined ) {
			this.OnSharedObjectDestroyed = aListeners.OnSharedObjectDestroyed;
		}
		if( aListeners.OnSharedObjectUpdated !== undefined ) {
			this.OnSharedObjectUpdated = aListeners.OnSharedObjectUpdated;
		}
		if( aListeners.OnSharedObjectsInit !== undefined ) {
			this.OnSharedObjectsInit = aListeners.OnSharedObjectsInit;
		}
	},

	initSharedObjects: function( aOptions ) {
		var lRes = this.createDefaultResult();
		if( this.isConnected() ) {
			var lToken = {
				ns: jws.SharedObjectsPlugIn.NS,
				type: "init"
			};
			this.sendToken( lToken,	aOptions );
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	}

}

// add the JWebSocket Shared Objects PlugIn into the TokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.SharedObjectsPlugIn );
//	---------------------------------------------------------------------------
//	jWebSocket Streaming PlugIn (uses jWebSocket Client and Server)
//	(C) 2010 jWebSocket.org, Alexander Schulze, Innotrade GmbH, Herzogenrath
//	---------------------------------------------------------------------------
//	This program is free software; you can redistribute it and/or modify it
//	under the terms of the GNU Lesser General Public License as published by the
//	Free Software Foundation; either version 3 of the License, or (at your
//	option) any later version.
//	This program is distributed in the hope that it will be useful, but WITHOUT
//	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
//	FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
//	more details.
//	You should have received a copy of the GNU Lesser General Public License along
//	with this program; if not, see <http://www.gnu.org/licenses/lgpl.html>.
//	---------------------------------------------------------------------------


//	---------------------------------------------------------------------------
//  jWebSocket Streaming Plug-In
//	---------------------------------------------------------------------------

//:package:*:jws
//:class:*:jws.StreamingPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.StreamingPlugIn[/tt] class. This _
//:d:en:plug-in provides the methods to register and unregister at certain _
//:d:en:stream sn the server.
jws.StreamingPlugIn = {

	//:const:*:NS:String:org.jwebsocket.plugins.streaming (jws.NS_BASE + ".plugins.streaming")
	//:d:en:Namespace for the [tt]StreamingPlugIn[/tt] class.
	// if namespace changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.streaming",

	//:m:*:registerStream
	//:d:en:Registers the client at the given stream on the server. _
	//:d:en:After this operation the client obtains all messages in this _
	//:d:en:stream. Basically a client can register at multiple streams.
	//:d:en:If no stream with the given ID exists on the server an error token _
	//:d:en:is returned. Depending on the type of the stream it may take more _
	//:d:en:or less time until you get the first token from the stream.
	//:a:en::aStream:String:The id of the server side data stream.
	//:r:*:::void:none
	// TODO: introduce OnResponse here too to get noticed on error or success.
	registerStream: function( aStream, aOptions ) {
		var lRes = this.createDefaultResult();
		if( this.isConnected() ) {
			this.sendToken({
				ns: jws.StreamingPlugIn.NS,
				type: "register",
				stream: aStream
			}, aOptions );
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	},

	//:m:*:unregisterStream
	//:d:en:Unregisters the client from the given stream on the server.
	//:a:en::aStream:String:The id of the server side data stream.
	//:r:*:::void:none
	// TODO: introduce OnResponse here too to get noticed on error or success.
	unregisterStream: function( aStream, aOptions ) {
		var lRes = this.createDefaultResult();
		if( this.isConnected() ) {
			this.sendToken({
				ns: jws.StreamingPlugIn.NS,
				type: "unregister",
				stream: aStream
			}, aOptions );
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	}
};

// add the StreamingPlugIn PlugIn into the jWebSocketTokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.StreamingPlugIn );
//	---------------------------------------------------------------------------
//	jWebSocket Test PlugIn (uses jWebSocket Client and Server)
//	(C) 2010 jWebSocket.org, Alexander Schulze, Innotrade GmbH, Herzogenrath
//	---------------------------------------------------------------------------
//	This program is free software; you can redistribute it and/or modify it
//	under the terms of the GNU Lesser General Public License as published by the
//	Free Software Foundation; either version 3 of the License, or (at your
//	option) any later version.
//	This program is distributed in the hope that it will be useful, but WITHOUT
//	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
//	FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
//	more details.
//	You should have received a copy of the GNU Lesser General Public License along
//	with this program; if not, see <http://www.gnu.org/licenses/lgpl.html>.
//	---------------------------------------------------------------------------

//	---------------------------------------------------------------------------
//  jWebSocket Test Client Plug-In
//	---------------------------------------------------------------------------

//:package:*:jws
//:class:*:jws.TestPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.TestPlugIn[/tt] class.
jws.TestPlugIn = {

	//:const:*:NS:String:org.jwebsocket.plugins.test (jws.NS_BASE + ".plugins.test")
	//:d:en:Namespace for the [tt]TestPlugIn[/tt] class.
	// if namespace is changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.test",

	processToken: function( aToken ) {
		// check if namespace matches
		if( aToken.ns == jws.TestPlugIn.NS ) {
			// here you can handle incoming tokens from the server
			// directy in the plug-in if desired.
			if( "event" == aToken.type ) {
				// callback when a server started a certain test
				if( "testStarted" == aToken.name && this.OnTestStarted ) {
					this.OnTestStarted( aToken );
				// callback when a server stopped a certain test
				} else if( "testStopped" == aToken.name && this.OnTestStopped ) {
					this.OnTestStopped( aToken );
				// event used to run a test triggered by the server
				} else if( "startTest" == aToken.name && this.OnStartTest ) {
					this.OnStartTest( aToken );
				}
			}
		}
	},

	testTimeout: function( aDelay, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.TestPlugIn.NS,
				type: "delay",
				delay: aDelay
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	testS2CPerformance: function( aCount, aMessage, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.TestPlugIn.NS,
				type: "testS2CPerformance",
				count: aCount,
				message: aMessage
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	execTests: function() {
		setTimeout( function () {
			var lReporter = new jasmine.TrivialReporter();
			jasmine.getEnv().addReporter( lReporter );
			jasmine.getEnv().execute();
		}, 1000 );
	},


	setTestCallbacks: function( aListeners ) {
		if( !aListeners ) {
			aListeners = {};
		}
		// event used to run a test triggered by the server
		if( aListeners.OnStartTest !== undefined ) {
			this.OnStartTest = aListeners.OnStartTest;
		}
		// callback when a server started a certain test
		if( aListeners.OnTestStarted !== undefined ) {
			this.OnTestStarted = aListeners.OnTestStarted;
		}
		// callback when a server stopped a certain test
		if( aListeners.OnTestStopped !== undefined ) {
			this.OnTestStopped = aListeners.OnTestStopped;
		}
	}

}

// add the JWebSocket Test PlugIn into the TokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.TestPlugIn );


jws.StopWatchPlugIn = {

	//:const:*:NS:String:org.jwebsocket.plugins.stopwatch (jws.NS_BASE + ".plugins.stopwatch")
	//:d:en:Namespace for the [tt]StopWatchPlugIn[/tt] class.
	// if namespace is changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.stopwatch",

	mLog: {},

	startWatch: function( aId, aSpec ) {
		// create new log item
		var lItem = {
			spec: aSpec,
			started: new Date().getTime()
		};
		// if an item which the given already exists
		// then simply overwrite it
		this.mLog[ aId ] = lItem;
		// and return the item
		return lItem;
	},

	stopWatch: function( aId ) {
		var lItem = this.mLog[ aId ];
		if( lItem ) {
			lItem.stopped = new Date().getTime();
			lItem.millis = lItem.stopped - lItem.started;
			return lItem;
		} else {
			return null;
		}
	},

	logWatch: function( aId, aSpec, aMillis ) {
		var lItem = {
			spec: aSpec,
			millis: aMillis
		};
		this.mLog[ aId ] = lItem ;
		return lItem;
	},

	resetWatches: function() {
		this.mLog = {};
	},

	printWatches: function() {
		for( var lField in this.mLog ) {

			var lItem = this.mLog[ lField ];
			var lOut = lItem.spec + " (" + lField + "): " + lItem.millis + "ms";

			if( window.console ) {
				console.log( lOut );
			} else {
				document.write( lOut + "<br>" );
			}
		}
	}
	
}

// add the JWebSocket Stop-Watch Plug-in into the TokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.StopWatchPlugIn );
//	---------------------------------------------------------------------------
//	jWebSocket Twitter PlugIn (uses jWebSocket Client and Server)
//	(C) 2010 jWebSocket.org, Alexander Schulze, Innotrade GmbH, Herzogenrath
//	---------------------------------------------------------------------------
//	This program is free software; you can redistribute it and/or modify it
//	under the terms of the GNU Lesser General Public License as published by the
//	Free Software Foundation; either version 3 of the License, or (at your
//	option) any later version.
//	This program is distributed in the hope that it will be useful, but WITHOUT
//	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
//	FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
//	more details.
//	You should have received a copy of the GNU Lesser General Public License along
//	with this program; if not, see <http://www.gnu.org/licenses/lgpl.html>.
//	---------------------------------------------------------------------------


//	---------------------------------------------------------------------------
//  jWebSocket Twitter Client Plug-In
//	---------------------------------------------------------------------------

//:package:*:jws
//:class:*:jws.TwitterPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.TwitterPlugIn[/tt] class.
jws.TwitterPlugIn = {

	//:const:*:NS:String:org.jwebsocket.plugins.twitter (jws.NS_BASE + ".plugins.twitter")
	//:d:en:Namespace for the [tt]TwitterPlugIn[/tt] class.
	// if namespace is changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.twitter",

	processToken: function( aToken ) {
		// check if namespace matches
		if( aToken.ns == jws.TwitterPlugIn.NS ) {
			// here you can handle incoming tokens from the server
			// directy in the plug-in if desired.
			if( "getTimeline" == aToken.reqType ) {
				if( this.OnGotTwitterTimeline ) {
					this.OnGotTwitterTimeline( aToken );
				}
			} else if( "requestAccessToken" == aToken.reqType ) {
				if( this.OnTwitterAccessToken ) {
					this.OnTwitterAccessToken( aToken );
				}
			} else if( "event" == aToken.type ) {
				if( "status" == aToken.name && this.OnTwitterStatus ) {
					this.OnTwitterStatus( aToken );
				}
			}
		}
	},

	tweet: function( aMessage, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.TwitterPlugIn.NS,
				type: "tweet",
				message: aMessage
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	twitterRequestAccessToken: function( aCallbackURL, aOptions ) {
		// check websocket connection status
		var lRes = this.checkConnected();
		// if connected to websocket network...
		if( 0 == lRes.code ) {
			// Twitter API calls Twitter Login screen,
			// hence here no user name or password are required.
			// Pass the callbackURL to notify Web App on successfull connection
			// and to obtain OAuth verifier for user.
			var lToken = {
				ns: jws.TwitterPlugIn.NS,
				type: "requestAccessToken",
				callbackURL: aCallbackURL
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	twitterSetVerifier: function( aVerifier, aOptions ) {
		// check websocket connection status
		var lRes = this.checkConnected();
		// if connected to websocket network...
		if( 0 == lRes.code ) {
			// passes the verifier from the OAuth window
			// to the jWebSocket server.
			var lToken = {
				ns: jws.TwitterPlugIn.NS,
				type: "setVerifier",
				verifier: aVerifier
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	twitterLogin: function( aCallbackURL, aOptions ) {
		// check websocket connection status
		var lRes = this.checkConnected();
		// if connected to websocket network...
		if( 0 == lRes.code ) {
			// Twitter API calls Twitter Login screen,
			// hence here no user name or password are required.
			// Pass the callbackURL to notify Web App on successfull connection
			// and to obtain OAuth verifier for user.
			var lToken = {
				ns: jws.TwitterPlugIn.NS,
				type: "login",
				callbackURL: aCallbackURL
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	twitterLogout: function( aUsername, aPassword, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.TwitterPlugIn.NS,
				type: "logout"
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	twitterTimeline: function( aUsername, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.TwitterPlugIn.NS,
				type: "getTimeline",
				username: aUsername
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	twitterQuery: function( aQuery, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.TwitterPlugIn.NS,
				type: "query",
				query: aQuery
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	twitterTrends: function( aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.TwitterPlugIn.NS,
				type: "getTrends"
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	twitterStatistics: function( aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.TwitterPlugIn.NS,
				type: "getStatistics"
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	twitterPublicTimeline: function( aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.TwitterPlugIn.NS,
				type: "getPublicTimeline"
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	twitterSetStream: function( aFollowers, aKeywords, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.TwitterPlugIn.NS,
				type: "setStream",
				keywords: aKeywords,
				followers: aFollowers
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	twitterUserData: function( aUsername, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.TwitterPlugIn.NS,
				type: "getUserData",
				username: aUsername
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	setTwitterCallbacks: function( aListeners ) {
		if( !aListeners ) {
			aListeners = {};
		}
		if( aListeners.OnGotTwitterTimeline !== undefined ) {
			this.OnGotTwitterTimeline = aListeners.OnGotTwitterTimeline;
		}
		if( aListeners.OnTwitterStatus !== undefined ) {
			this.OnTwitterStatus = aListeners.OnTwitterStatus;
		}
		if( aListeners.OnTwitterAccessToken !== undefined ) {
			this.OnTwitterAccessToken = aListeners.OnTwitterAccessToken;
		}
	}

}

// add the JWebSocket Twitter PlugIn into the TokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.TwitterPlugIn );
//	---------------------------------------------------------------------------
//	jWebSocket XMPP PlugIn (uses jWebSocket Client and Server)
//	(C) 2010 jWebSocket.org, Alexander Schulze, Innotrade GmbH, Herzogenrath
//	---------------------------------------------------------------------------
//	This program is free software; you can redistribute it and/or modify it
//	under the terms of the GNU Lesser General Public License as published by the
//	Free Software Foundation; either version 3 of the License, or (at your
//	option) any later version.
//	This program is distributed in the hope that it will be useful, but WITHOUT
//	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
//	FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
//	more details.
//	You should have received a copy of the GNU Lesser General Public License along
//	with this program; if not, see <http://www.gnu.org/licenses/lgpl.html>.
//	---------------------------------------------------------------------------


//	---------------------------------------------------------------------------
//  jWebSocket XMPP Client Plug-In
//	---------------------------------------------------------------------------

//:package:*:jws
//:class:*:jws.XMPPPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.XMPPPlugIn[/tt] class.
jws.XMPPPlugIn = {

	//:const:*:NS:String:org.jwebsocket.plugins.xmpp (jws.NS_BASE + ".plugins.xmpp")
	//:d:en:Namespace for the [tt]XMPPPlugIn[/tt] class.
	// if namespace is changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.xmpp",

	// presence flags
	// Status: free-form text describing a user's presence (i.e., gone to lunch).
	// Priority: non-negative numerical priority of a sender's resource.
	//		The highest resource priority is the default recipient
	//		of packets not addressed to a particular resource.
	// Mode: one of five presence modes: available (the default), chat, away, xa (extended away), and dnd (do not disturb).

	MODE_AVAILABLE: "available",		// default
	MODE_AWAY: "away",					// away
	MODE_CHAT: "chat",					// free to chat
	MODE_DND: "dnd",					// do not disturb
	MODE_XA: "xa",						// away for an extended period of time

	TYPE_AVAILABLE: "available",		// (Default) indicates the user is available to receive messages.
	TYPE_UNAVAILABLE: "unavailable",	// the user is unavailable to receive messages.
	TYPE_SUBSCRIBE: "subscribe",		// request subscription to recipient's presence.
	TYPE_SUBSCRIBED: "subscribed",		// grant subscription to sender's presence.
	TYPE_UNSUBSCRIBE: "unsubscribe",	// request removal of subscription to sender's presence.
	TYPE_UNSUBSCRIBED: "unsubscribed",	// grant removal of subscription to sender's presence.
	TYPE_ERROR: "error",				// the presence packet contains an error message.

	processToken: function( aToken ) {
		// check if namespace matches
		if( aToken.ns == jws.XMPPPlugIn.NS ) {
			// here you can handle incoming tokens from the server
			// directy in the plug-in if desired.
			if( "event" == aToken.type ) {
				if( "chatMessage" == aToken.name ) {
					if( this.OnXMPPChatMessage ) {
						this.OnXMPPChatMessage( aToken );
					}
				} 
			} else if( "getRoster" == aToken.reqType) {
				if( this.OnXMPPRoster ) {
					this.OnXMPPRoster( aToken );
				}
			}
		}
	},

	xmppConnect: function( aHost, aPort, aDomain, aUseSSL, aOptions ) {
		// check websocket connection status
		var lRes = this.checkConnected();
		// if connected to websocket network...
		if( 0 == lRes.code ) {
			// XMPP API calls XMPP Login screen,
			// hence here no user name or password are required.
			// Pass the callbackURL to notify Web App on successfull connection
			// and to obtain OAuth verifier for user.
			var lToken = {
				ns: jws.XMPPPlugIn.NS,
				type: "connect",
				host: aHost,
				port: aPort,
				domain: aDomain,
				useSSL: aUseSSL
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	xmppDisconnect: function( aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.XMPPPlugIn.NS,
				type: "disconnect"
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	xmppLogin: function( aUsername, aPassword, aOptions ) {
		// check websocket connection status
		var lRes = this.checkConnected();
		// if connected to websocket network...
		if( 0 == lRes.code ) {
			// XMPP API calls XMPP Login screen,
			// hence here no user name or password are required.
			// Pass the callbackURL to notify Web App on successfull connection
			// and to obtain OAuth verifier for user.
			var lToken = {
				ns: jws.XMPPPlugIn.NS,
				type: "login",
				username: aUsername,
				password: aPassword
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	xmppLogout: function( aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.XMPPPlugIn.NS,
				type: "logout"
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	xmppRoster: function( aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.XMPPPlugIn.NS,
				type: "getRoster"
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	xmppSetPresence: function( aMode, aType, aStatus, aPriority, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.XMPPPlugIn.NS,
				type: "setPresence",
				pmode: aMode,
				ptype: aType,
				ppriority: aPriority,
				pstatus: aStatus
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	xmppOpenChat: function( aUserId, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.XMPPPlugIn.NS,
				type: "openChat",
				userId: aUserId
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	xmppSendChat: function( aUserId, aMessage, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.XMPPPlugIn.NS,
				type: "sendChat",
				userId: aUserId,
				message: aMessage
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	xmppCloseChat: function( aUserId, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.XMPPPlugIn.NS,
				userId: aUserId,
				type: "closeChat"
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	xmpp: function( aUserId, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.XMPPPlugIn.NS,
				userId: aUserId,
				type: "closeChat"
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	setXMPPCallbacks: function( aListeners ) {
		if( !aListeners ) {
			aListeners = {};
		}
		if( aListeners.OnXMPPChatMessage !== undefined ) {
			this.OnXMPPChatMessage = aListeners.OnXMPPChatMessage;
		}
		if( aListeners.OnXMPPRoster !== undefined ) {
			this.OnXMPPRoster = aListeners.OnXMPPRoster;
		}
	}

}

// add the JWebSocket XMPP PlugIn into the TokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.XMPPPlugIn );
//	---------------------------------------------------------------------------
//	jWebSocket Worker (supports multithreading and background processes
//	on the browser clients, if they support the HTML5 WebWorker standard)
//	Copyright (c) 2011 Alexander Schulze, Innotrade GmbH, Herzogenrath
//	---------------------------------------------------------------------------
//	This program is free software; you can redistribute it and/or modify it
//	under the terms of the GNU Lesser General Public License as published by the
//	Free Software Foundation; either version 3 of the License, or (at your
//	option) any later version.
//	This program is distributed in the hope that it will be useful, but WITHOUT
//	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
//	FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
//	more details.
//	You should have received a copy of the GNU Lesser General Public License along
//	with this program; if not, see <http://www.gnu.org/licenses/lgpl.html>.
//	---------------------------------------------------------------------------

//:i:en:This method is executed if postmessage is invoked by the caller.
onmessage = function( aEvent ) {
	// console.log( "started!" );
	// here computationally intensive processes can be run as thread.
	// aEvent.data contains the Object from the caller (application)
	var lMethod;
	eval( "lMethod=" + aEvent.data.method );

	// run the method and return the result via postmessage to the application.
	// in the application the onmessage listener of the worker is invoked
	postMessage( lMethod( aEvent.data.args ) );

};
