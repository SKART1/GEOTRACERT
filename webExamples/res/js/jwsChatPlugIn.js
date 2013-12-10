//	---------------------------------------------------------------------------
//	jWebSocket Chat Plug-in (Community Edition, CE)
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
