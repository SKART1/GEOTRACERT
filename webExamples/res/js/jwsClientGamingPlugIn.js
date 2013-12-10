//	---------------------------------------------------------------------------
//	jWebSocket Client Gaming Plug-in (Community Edition, CE)
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
