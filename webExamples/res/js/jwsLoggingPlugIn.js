//	---------------------------------------------------------------------------
//	jWebSocket Logging Plug-in (Community Edition, CE)
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
