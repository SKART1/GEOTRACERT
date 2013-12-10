//	---------------------------------------------------------------------------
//	jWebSocket Gaming Plug-in (Community Edition, CE)
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

/**
 * This demo does not use an own implementation in the server side, that's why 
 * it uses two different namespaces. The channels namespace will allow to publish 
 * in real time through the channel it's movements, so the other users will see 
 * a new movement message through the channel and they will repaint it's position
 * The system namespace will be used to receive personal messages when the user 
 * is new in the channel. the other clients will send their positions directly to
 * the new one connected and he will have to paint them as the messages arrive.
 * jWebSocket Gaming Widget
 * @author Victor Antonio Barzana Crespo
 */

$.widget( "jws.gaming", {
	_init: function() {
		// Default namespace for the demo
		this.NS_CHANNELS = jws.NS_BASE + ".plugins.channels";
		this.NS_SYSTEM = jws.NS_BASE + ".plugins.system";

		// ELEMENTS
		this.ePlayGround = this.element.find( "#players_area" );
		this.eTotalPlayers = this.element.find( "#total_red" );
		this.eTotalGreen = this.element.find( "#total_green" );
		this.eDebug = this.element.find( "#debug" );
		this.eMoveRandom = this.element.find( "#random" );
		
		// VARIABLES
		this.mChannelId = "jWebSocketGamingDemo";
		this.mChannelName = "jWebSocket Gaming Demo";
		this.mChannelIsPrivate = false;
		this.mChannelIsSystem = true;
		this.mChannelAccessKey = "gaming";
		this.mChannelSecretKey = "64m1n6D3m0!";
		this.mDefaultX = 0;
		this.mDefaultY = 0;
		
		this.mAuthenticatedUser = null;
		this.mOnlineClients = { };

		// Represents each connected user using a different color
		this.mUserColors = {
		//	01.38649.1: "#0000FF"
		};
		// this is the location of the green player
		this.mPlayer = {
			loc_x: 100,
			loc_y: 100,
			speed: 10
		};

		w.gaming = this;
		w.gaming.registerEvents();
	},
	registerEvents: function() {
		$( document ).keydown( w.gaming.processKeyDown );
		// Registering mousemove of the playground
		//		$( w.gaming.ePlayGround ).mousemove( w.gaming.playGroundMouseMove );
		w.gaming.eMoveRandom.click(function(aCheck, aState){
			if( $(this).get(0).checked ) {
				w.gaming.startMovingRandom();
			} else{
				w.gaming.stopMovingRandom();
			}
		});
		// Registers all callbacks for jWebSocket basic connection
		// For more information, check the file ../../res/js/widget/wAuth.js
		var lCallbacks = {
			//			OnOpen: function( aEvent) { },
			OnWelcome: function( aToken ) {
				w.gaming.mAuthenticatedUser = aToken.sourceId;
				// Registering the callbacks for the channels
				mWSC.setChannelCallbacks( {
					// When any subscription arrives from the server
					OnChannelSubscription: w.gaming.onChannelSubscription,
					OnChannelUnsubscription: w.gaming.onChannelUnsubscription
				} );
			},
			OnLogon: function( aToken ) {
				w.gaming.getSubscribers();
				// Authenticating against the channel
				w.gaming.auth();
				// Subscribing against the channel
				mWSC.channelSubscribe( w.gaming.mChannelId,
					w.gaming.mChannelAccessKey );
			},
			OnClose: function() {
				w.gaming.destroy();
			},
			OnGoodBye: function( aToken ) {
				w.gaming.destroy();
			},
			OnMessage: function( aEvent, aToken ) {
				w.gaming.onMessage( aEvent, aToken );
			}
		};
		// This is an authentication widget for all demos
		// you can find it here ../res/js/widgets/wAuth.js
		$( "#demo_box" ).auth( lCallbacks );
	},
	onChannelSubscription: function( aSubscriptionTk ) {
		// Get the location of the subscriber
		var aSubscriber = aSubscriptionTk.subscriber;
		if ( aSubscriber != w.gaming.mAuthenticatedUser ) {
			// TODO: Ask for the position to the client depends on ChannelStorage
			// which is not created yet
			w.gaming.addRedClient( aSubscriber, w.gaming.mDefaultX, w.gaming.mDefaultY );
		}
	},
	onChannelUnsubscription: function( aEvent ) {
		w.gaming.removeClient( aEvent.subscriber );
	},
	onChannelPublish: function( aEvent ) {
		var lX = aEvent.map.x;
		var lY = aEvent.map.y;
		var lPublisher = aEvent.publisher;
		w.gaming.moveTo( lPublisher, lX, lY );
	},
	// try to authenticate against the channel to publish data
	auth: function() {
		log( "Authenticating against channel '" + w.gaming.mChannelId + "'..." );
		// use access key and secret key for this channel to authenticate
		// required to publish data only
		var lRes = mWSC.channelAuth( w.gaming.mChannelId,
			w.gaming.mChannelAccessKey, w.gaming.mChannelSecretKey, {
				OnSuccess: function( aToken ) {
					w.gaming.initGame();
				}
			});
		log( mWSC.resultToString( lRes ) );
	},
	getSubscribers: function() {
		log( "Trying to obtain subscribers for channel '" +
			w.gaming.mChannelId + "'..." );
		// try to obtain all subscribers for a certain channel
		var lRes = mWSC.channelGetSubscribers(
			w.gaming.mChannelId, w.gaming.mChannelAccessKey, {
				// On subscrihers arrive
				OnSuccess: function( aToken ) {
					for ( var lIndex in aToken.subscribers ) {
						
						if ( aToken.subscribers[ lIndex ].id != w.gaming.mAuthenticatedUser ) {
							// TODO: As a temporal solution we place all the 
							// clients in the same place but here we need to 
							// find a way to get the position from each client, 
							// we need to create a channelStorage
							w.gaming.addRedClient( aToken.subscribers[ lIndex ].id, 
								w.gaming.mDefaultX + (lIndex * 30), 
								w.gaming.mDefaultY + (lIndex * 30) );
						}
					}
				}
			} );
		log( mWSC.resultToString( lRes ) );
	},
	publish: function( aData, aMessage ) {
		mWSC.channelPublish( w.gaming.mChannelId, aMessage || "jws-gaming", aData );
	},
	startMovingRandom: function() {
		// return if not (yet) connected
		if ( !mWSC.isLoggedIn() ) {
			// TODO: provide reasonable result here!
			return;
		}
		var lInterval = 500;
		var lImmediate = true;

		if ( lImmediate ) {
			// start moving immediately, if requested
			w.gaming.moveGreenPlayerRandom();
		}
		// and then initiate interval...
		w.gaming.hSimulation = setInterval(
			function() {
				if ( mWSC.isLoggedIn() ) {
					w.gaming.moveGreenPlayerRandom();
				} else {
					w.gaming.stopMovingRandom();
				}
			},
			lInterval
			);
	},
	stopMovingRandom: function() {
		clearInterval( w.gaming.hSimulation );
		w.gaming.hSimulation = null;
	},
	destroy: function() {
		if ( w.gaming.hSimulation ) {
			w.gaming.stopMovingRandom();
		}

		for ( var lKey in w.gaming.mOnlineClients ) {
			w.gaming.mOnlineClients[ lKey ].detach().remove();
		}

		w.gaming.mOnlineClients = { };

		w.gaming.eTotalPlayers.text( 0 );
		w.gaming.eTotalGreen.text( 0 );
	},
	moveGreenPlayerRandom: function( aSpeed ) {
		aSpeed = aSpeed || 4;
		var lPlusMinus = (w.gaming.getRandomNumber( 2 ) >= 1 ) ? "+" : "-",
		lNextX = w.gaming.getRandomNumber( aSpeed + 30 ),
		lNextY = w.gaming.getRandomNumber( aSpeed + 10 );
		
		if( lPlusMinus == "+" ) {
			w.gaming.mPlayer.loc_x += lNextX;
			w.gaming.mPlayer.loc_y += lNextY;
		} else {
			if( w.gaming.mPlayer.loc_x - lNextX > 0 ) {
				w.gaming.mPlayer.loc_x -= lNextX;
			}
			if( w.gaming.mPlayer.loc_y - lNextY > 0 ) {
				w.gaming.mPlayer.loc_y -= lNextY;
			}
		}
		
		var lPlaygroundWidth = w.gaming.ePlayGround.width() - 80;
		var lPlaygroundHeight = w.gaming.ePlayGround.height() - 60;
		if( w.gaming.mPlayer.loc_y <= 0 ){
			w.gaming.mPlayer.loc_y = 1;
			return false;
		}
		if( w.gaming.mPlayer.loc_y > lPlaygroundHeight ) {
			w.gaming.mPlayer.loc_y = lPlaygroundHeight;
			return false;
		}
		if( w.gaming.mPlayer.loc_x <= 0 ){
			w.gaming.mPlayer.loc_x = 1;
			return false;
		}
		if( w.gaming.mPlayer.loc_x > lPlaygroundWidth ) {
			w.gaming.mPlayer.loc_x = lPlaygroundWidth;
			return false;
		}

		w.gaming.notifyMovement( w.gaming.mAuthenticatedUser,
			w.gaming.mPlayer.loc_x, w.gaming.mPlayer.loc_y );
	},
	/**
	 * Executed every time the server sends a message to the client
	 * @param aEvent
	 * @param aToken
	 **/
	onMessage: function( aEvent, aToken ) {

		if ( w.gaming.eDebug.get( 0 ).checked ) {
			log( "<font style='color:#888'>" + aEvent.data + "</font>" );
		}
		if ( aToken.ns === w.gaming.NS_CHANNELS ) {
			// When the channel authorizes the user to publish on it
			if ( aToken.reqType === "authorize" && aToken.code === 0 ) {
				

			// When information published through the channel
			} else if ( aToken.type == "data" ) {
				w.gaming.onChannelPublish( aToken );
			}
		}
		else if ( aToken.type == "event" ) {
			if ( "logout" == aToken.name || "disconnect" == aToken.name ) {
				w.gaming.removeClient( aToken.sourceId );
			}
		}
	},
	/**
	 * All the basi configuration to initialize the game
	 * this method is executed only when the user is authorized 
	 * to publish its movements through the channel
	 */
	initGame: function( ) {
		// Getting the coordinates of the position of the player
		var lX = w.gaming.getRandomNumber( 400 );
		var lY = w.gaming.getRandomNumber( 150 );

		w.gaming.mPlayer.loc_x = lX;
		w.gaming.mPlayer.loc_y = lY;
		
		var lData = {
			x: lX,
			y: lY
		};
		//TODO: store the position of the player to be able to get it when 
		//another user goes online
		w.gaming.addGreenClient( w.gaming.mAuthenticatedUser, lX, lY );
	},
	processKeyDown: function( aEvent ) {
		// here the "gaming" event is broadcasted to all other clients
		//some firefox versions need keyChar event
		var lCode = aEvent.keyCode || aEvent.keyChar;
		switch ( lCode ) {
			case 13:
				if ( !mWSC.isLoggedIn() ) {
					w.auth.logon();
				}
				return;
			case 38: // up
				if ( w.gaming.mPlayer.loc_y - w.gaming.mPlayer.speed >= 0 ) {
					w.gaming.mPlayer.loc_y -= w.gaming.mPlayer.speed;
				}
				break;
			case 40: // down
				w.gaming.mPlayer.loc_y += w.gaming.mPlayer.speed;
				break;
			case 37: // left
				if ( w.gaming.mPlayer.loc_x - w.gaming.mPlayer.speed >= 0 ) {
					w.gaming.mPlayer.loc_x -= w.gaming.mPlayer.speed;
				}
				break;
			case 39: // right
				w.gaming.mPlayer.loc_x += w.gaming.mPlayer.speed;
				break;
			default:
				return;
		}
		var lPlaygroundWidth = w.gaming.ePlayGround.width() - 70;
		var lPlaygroundHeight = w.gaming.ePlayGround.height() - 50;
		if( w.gaming.mPlayer.loc_y <= 0 ){
			w.gaming.mPlayer.loc_y = 1;
			return false;
		}
		if( w.gaming.mPlayer.loc_y > lPlaygroundHeight ) {
			w.gaming.mPlayer.loc_y = lPlaygroundHeight;
			return false;
		}
		if( w.gaming.mPlayer.loc_x <= 0 ){
			w.gaming.mPlayer.loc_x = 1;
			return false;
		}
		if( w.gaming.mPlayer.loc_x > lPlaygroundWidth ) {
			w.gaming.mPlayer.loc_x = lPlaygroundWidth;
			return false;
		}
		
		w.gaming.notifyMovement( w.gaming.mAuthenticatedUser,
			w.gaming.mPlayer.loc_x,
			w.gaming.mPlayer.loc_y );

		aEvent.preventDefault();

	// This action requires no server side PlugIn, 
	// It broadcasts all movements of a client but all 
	// demos in the client are notified here
	/*lWSC.broadcastGamingEvent({
		 keycode: aEvent.keyCode,
		 x: w.gaming.mPlayer.loc_x,
		 y: w.gaming.mPlayer.loc_x
		 });*/
	},
	/**
	 * adds the green client automatically
	 * @param aClientId 
	 * Identifier of the client guest@01.38649.1
	 * @param aX
	 * position of the x axis
	 * @param aY
	 * position of the y axis
	 * 
	 **/
	addGreenClient: function( aClientId, aX, aY ) {
		if ( aClientId ) {
			var lPlayer = $( '<div class="player green_player" id="' + aClientId +
				'">' + aClientId + '</div>' );

			// Use a default color for each client
			var lColor = w.gaming.getClientColor( aClientId );

			lPlayer.css( {
				color: lColor,
				left: aX + "px",
				top: aY + "px"
			} );

			// jQuery-ui method, enables dragging an element
			lPlayer.draggable({
				drag: function(event, ui) {
					var lClient = $( '.ui-draggable-dragging' );
					// If the element is been dragged
					if ( lClient.get( 0 ) ) {
						var lTop = lClient.css( "top" );
						var lLeft = lClient.css( "left" );
						
						w.gaming.mPlayer.loc_x = parseInt( lLeft.substr( 0, lLeft.length - 1 ) );
						w.gaming.mPlayer.loc_y = parseInt( lTop.substr( 0, lTop.length - 1 ) );
						if( w.gaming.mPlayer.loc_y <= 0 ) {
							w.gaming.mPlayer.loc_y = 1;
							lClient.css({
								top: "1px"
							});
							return false;
						} 
						if( w.gaming.mPlayer.loc_x <= 0 ) {
							w.gaming.mPlayer.loc_x = 1;
							lClient.css({
								left: "1px"
							});
							return false;
						}
						var lPlaygroundWidth = w.gaming.ePlayGround.width() - lClient.width() - 30;
						var lPlaygroundHeight = w.gaming.ePlayGround.height() - lClient.height() - 45;
						
						if(w.gaming.mPlayer.loc_y > lPlaygroundHeight ) {
							w.gaming.mPlayer.loc_y = lPlaygroundHeight;
							lClient.css({
								top: lPlaygroundHeight+ "px"
							});
							return false;
						}
						
						if(w.gaming.mPlayer.loc_x > lPlaygroundWidth ) {
							w.gaming.mPlayer.loc_y = lPlaygroundWidth;
							lClient.css({
								left: lPlaygroundWidth+ "px"
							});
							return false;
						}
						w.gaming.notifyMovement( w.gaming.mAuthenticatedUser,
							w.gaming.mPlayer.loc_x,
							w.gaming.mPlayer.loc_y );
					}
				}
			});

			// Add the user in a random location in the playGround
			w.gaming.ePlayGround.append( lPlayer );

			// Saving the client in the onlineClients array
			w.gaming.mOnlineClients[ aClientId ] = lPlayer;

			// Notify others of the new player and it's location
			w.gaming.notifyMovement( aClientId, aX, aY );
			w.gaming.eTotalGreen.text( parseInt( w.gaming.eTotalGreen.text() ) + 1 );
		}
	},

	notifyMovement: function( aClientId, aX, aY ) {
		if ( mWSC.isConnected() ) {
			var lData = {
				x: aX,
				y: aY
			};
			// Notify the other clients with the movement of this player 
			// inside the current channel
			w.gaming.publish( lData );

		// Store the new position of the player to be sent to the new 
		// connected clients to know the position of each player
		//			mWSC.sessionPut( aClientId, lData, true );
		} else {
			jwsDialog( "Sorry, you are not connected with jWebSocket server, " +
				"try clicking in the login button!",
				"jWebSocket detected an error", false, null, null, "alert" );
		}
	},
	/**
	 * Moves a client in the current playGround
	 **/
	moveTo: function( aClientId, aX, aY ) {
		var lClient = $( '.ui-draggable-dragging' );
		// don't move it if is been dragged by jQuery, 
		// the drag event is responsible for that
		if ( !lClient.get( 0 ) ) {
			w.gaming.mOnlineClients[ aClientId ].stop().animate( {
				"left": aX + "px",
				"top": aY + "px"
			}, 150, function( ) {
				if ( aClientId == w.gaming.mAuthenticatedUser ) {
					var lHeight = w.gaming.mOnlineClients[ aClientId ].get( 0 ).height;
					lHeight = (lHeight) ? lHeight.substr( 0, lHeight.length ) : 70;

					var lWidth = w.gaming.mOnlineClients[ aClientId ].get( 0 ).width;
					lWidth = (lWidth) ? lWidth.substr( 0, lWidth.length ) : 65;
				
				//				w.gaming.ePlayGround.scrollTop( eval( aY + lHeight ) -
				//					w.gaming.ePlayGround.get( 0 ).clientHeight );
				//
				//				w.gaming.ePlayGround.scrollLeft( eval( aX + lWidth ) -
				//					w.gaming.ePlayGround.get( 0 ).clientWidth );
				}
			} );
		}
	},
	/**
	 * Shows connected clients in the playground
	 * @param aSubscribers 
	 *  The list of all connected players
	 **/
	loadClientsList: function( aSubscribers ) {
		for ( var aClient in aSubscribers ) {
			// Remove green player from the subscribers list
			if ( w.gaming.mAuthenticatedUser == aClient ) {
				delete aSubscribers[ aClient ];
				continue;
			}
			var lClientId = aClient;

			var lPlayerItem = $( '<div class="player red_player" id="' + lClientId +
				'">' + lClientId + '</div>' );

			// Use a default color for each client
			var lColor = w.gaming.getClientColor( lClientId );

			lPlayerItem.css( {
				color: lColor,
				left: aClient.x + "px",
				top: aClient.y + "px"
			} );

			// Add the user in a random location in the playGround
			w.gaming.ePlayGround.append( lPlayerItem );

			// Saving the client in the onlineClients array
			w.gaming.mOnlineClients[ lClientId ] = lPlayerItem;
		}
		w.gaming.eTotalPlayers.text( aSubscribers.length );
	},
	/**
	 * Adds a new incoming client to the playGround
	 * @param aClientId 
	 * Identifier of the client guest@01.38649.1
	 * @param aX
	 * position of the x axis
	 * @param aY
	 * position of the y axis
	 * 
	 **/
	addRedClient: function( aClientId, aX, aY ) {
		if( aClientId ) {
			var lPlayerItem = $( '<div class="player red_player" id="' + aClientId +
				'">' + aClientId + '</div>' );

			// Use a default color for each client
			var lColor = w.gaming.getClientColor( aClientId );

			lPlayerItem.css( {
				color: lColor,
				left: aX + "px",
				top: aY + "px"
			} );

			// Add the user in a random location in the playGround
			w.gaming.ePlayGround.append( lPlayerItem );

			// Saving the client in the onlineClients array
			w.gaming.mOnlineClients[ aClientId ] = lPlayerItem;
			w.gaming.eTotalPlayers.text( parseInt( w.gaming.eTotalPlayers.text() ) + 1 );
		}
	},
	/**
	 * Removes a client from the playGround
	 * @param aClients 
	 *  The list of clients to be shown to the users
	 **/
	removeClient: function( aClientId ) {

		if ( w.gaming.mOnlineClients ) {
			var lFoundKey = null;
			for ( var lKey in w.gaming.mOnlineClients ) {
				if ( aClientId == lKey ) {
					w.gaming.mOnlineClients[ lKey ].detach().remove();
					delete w.gaming.mOnlineClients[ lKey ];
					w.gaming.eTotalPlayers.text( parseInt( w.gaming.eTotalPlayers.text() ) - 1 );
					return;
				}
			}

		}
	},
	/**
	 * Gets a color for a given clientID
	 * @param aClientID
	 **/
	getClientColor: function( aClientID ) {
		var lColor = null;
		if ( aClientID != undefined ) {
			do {
				// Change the color if it is assigned to other client
				lColor = w.gaming.getRandomColor( 12 );
			} while ( w.gaming.isColorUsed( lColor ) );

			w.gaming.mUserColors[ aClientID ] =
			w.gaming.mUserColors[ aClientID ] || lColor;

			return w.gaming.mUserColors[ aClientID ];
		}
		return null;
	},
	/**
	 * Removes a defined color for a given clientID
	 * @param aClientID
	 **/
	removeClientColor: function( aClientID ) {
		if ( w.gaming.mUserColors ) {
			for ( var lIdx = 0; lIdx < w.gaming.mUserColors.length; lIdx++ ) {
				for ( var lElem in w.gaming.mUserColors[ lIdx ] ) {
					if ( aClientID == lElem ) {
						w.gaming.mUserColors.splice( lIdx, 1 );
						break;
					}
				}
			}
		}
	},
	/**
	 * Determines wether a given color is assigned to a user
	 * @param aColor
	 **/
	isColorUsed: function( aColor ) {
		var lFound = false;
		$( w.gaming.mUserColors ).each( function( aIndex, aElem ) {
			for ( var aKey in aElem ) {
				if ( aElem[ aKey ] == aColor ) {
					lFound = true;
					break;
				}
			}
		} );
		return lFound;
	},
	/**
	 * Returns a color using a given intensity
	 * @param aIntensity
	 * 0 -  5  low intensity	(dark)
	 * 5 -  10 medium intensity (half dark)
	 * 10 - 15 high intensity   (light)
	 * default intensity = 10
	 */
	getRandomColor: function( aIntensity ) {
		var lColorChars = [
		'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'
		];

		aIntensity = aIntensity || 10;

		var lRed = lColorChars[ w.gaming.getRandomNumber( aIntensity ) ] +
		lColorChars[ w.gaming.getRandomNumber( aIntensity ) ];

		var lGreen = lColorChars[ w.gaming.getRandomNumber( aIntensity ) ] +
		lColorChars[ w.gaming.getRandomNumber( aIntensity ) ];

		var lBlue = lColorChars[ w.gaming.getRandomNumber( aIntensity ) ] +
		lColorChars[ w.gaming.getRandomNumber( aIntensity ) ];

		return "#" + lRed + lGreen + lBlue;
	},
	getRandomNumber: function( aNumber ) {
		return Math.floor( Math.random( aNumber ) * aNumber );
	}
} );
