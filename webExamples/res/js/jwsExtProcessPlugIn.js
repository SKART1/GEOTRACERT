//	---------------------------------------------------------------------------
//	jWebSocket External Processes Plug-in (Community Edition, CE)
//	---------------------------------------------------------------------------
//	Copyright 2010-2013 Innotrade GmbH (jWebSocket.org)
//  Alexander Schulze, Germany (NRW)
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
//:class:*:jws.ExtProcessPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.ExtProcessPlugIn[/tt] class.
//:d:en:This client-side plug-in provides the API to access the features of the _
//:d:en:ExtProcess plug-in on the jWebSocket server.
jws.ExtProcessPlugIn = {

	//:const:*:NS:String:org.jwebsocket.plugins.extprocess (jws.NS_BASE + ".plugins.extprocess")
	//:d:en:Namespace for the [tt]ExtProcessPlugIn[/tt] class.
	// if namespace is changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.extprocess",
	
	//:m:*:processToken
	//:d:en:Processes an incoming token from the server side ExtProcess plug-in and _
	//:d:en:checks if certains events have to be fired. _
	//:d:en:If e.g. the request type was [tt]selectSQL[/tt] and data is _
	//:d:en:returned the [tt]OnExtProcessRowSet[/tt] event is fired. Normally this _
	//:d:en:method is not called by the application directly.
	//:a:en::aToken:Object:Token to be processed by the plug-in in the plug-in chain.
	//:r:*:::void:none
	processToken: function( aToken ) {
		// check if namespace matches
		if( aToken.ns === jws.ExtProcessPlugIn.NS ) {
			// here you can handle incomimng tokens from the server
			// directy in the plug-in if desired.
			if( "selectSQL" === aToken.reqType ) {
				if( this.OnExtProcessRowSet ) {
					this.OnExtProcessRowSet( aToken );
				}
			}
		}
	},

	//:m:*:ExtProcessCall
	//:d:en:Pending...
	//:a:en::aQuery:String:Single SQL query string to be executed by the server side ExtProcess plug-in.
	//:a:en::aOptions:Object:Optional arguments, please refer to the [tt]sendToken[/tt] method of the [tt]jWebSocketTokenClient[/tt] class for details.
	//:r:*:::void:none
	extProcessCall: function( aAlias, aArgs, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 === lRes.code ) {
			var lToken = {
				ns: jws.ExtProcessPlugIn.NS,
				type: "call",
				alias: aAlias,
				args: aArgs
			};
			this.sendToken( lToken, aOptions );
		}
		return lRes;
	},

	setExtProcessCallbacks: function( aListeners ) {
		if( !aListeners ) {
			aListeners = {};
		}
		if( aListeners.OnExtProcessMsg !== undefined ) {
			this.OnExtProcessMsg = aListeners.OnExtProcessMsg;
		}
	}

};

// add the JWebSocket ExtProcess PlugIn into the TokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.ExtProcessPlugIn );
