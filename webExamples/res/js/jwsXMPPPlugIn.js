//	---------------------------------------------------------------------------
//	jWebSocket XMPP Plug-in (Community Edition, CE)
//	---------------------------------------------------------------------------
//	Copyright 2010-2013 Innotrade GmbH (jWebSocket.org), Germany (NRW), Herzogenrath
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
