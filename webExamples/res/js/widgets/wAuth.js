//	---------------------------------------------------------------------------
//	jWebSocket jQuery Authentication Widget (Community Edition, CE)
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
 * @author Victor Antonio Barzana Crespo
 */
$.widget( "jws.auth", {
	_init: function( ) {
		w.auth = this;

		// Stores the jWebSocketJSONClient
		mWSC = null;
		AUTO_USER_AND_PASSWORD = false;
		this.eLogoffArea = this.element.find( "#logoff_area" );
		this.eLogonArea = this.element.find( "#login_area" );
		this.eUsername = this.element.find( "#user_text" );
		this.ePassword = this.element.find( "#user_password" );
		this.eClientStatus = this.element.find( "#client_status" );
		this.eUserInfoName = this.element.find( "#user_info_name" );
		this.eWebSocketType = this.element.find( "#websocket_type" );
		this.eClientId = this.element.find( "#client_id" );
		this.eLoginButton = this.element.find( '#login_button' );
		this.eLogoffButton = this.element.find( '#logoff_button' );
		this.eConnectButton = this.element.find( '#connect_button' );
		this.eDisConnectButton = this.element.find( '#disconnect_button' );
		this.mUsername = null;

		this.eDisConnectButton.hide( );
		this.eLogoffArea.hide( );

		this.mUsername = null;

		this.checkWebSocketSupport( );

		this.registerEvents( );
	},
	checkWebSocketSupport: function( ) {
		if ( jws.browserSupportsWebSockets( ) ) {
			mWSC = new jws.jWebSocketJSONClient( );
			// Setting the type of WebSocket
			w.auth.eWebSocketType.text( "WebSocket: " +
					(jws.browserSupportsNativeWebSockets ? "(native)" : "(flashbridge)") );
		} else {
			var lMsg = jws.MSG_WS_NOT_SUPPORTED;
			alert( lMsg );
			if ( mLog.isDebugEnabled ) {
				log( lMsg );
			}
		}
	},
	registerEvents: function( ) {
		//adding click functions
		w.auth.eLoginButton.click( function( ) {
			// If there is not a connect button
			if ( !w.auth.eConnectButton.attr( "id" ) ) {
				// we open the connection and then login
				w.auth.logon( );
			} else {
				// must be connected, otherwise it won't work
				w.auth.login( );
			}
		} );
		w.auth.eLogoffButton.click(
				function( ) {
					// If there is not a connect button
					if ( !w.auth.eConnectButton.attr( "id" ) ) {
						// logout and close the connection
						w.auth.disconnect( );
					} else {
						// just logout
						w.auth.logoff( );
					}
				}
		);

		w.auth.eConnectButton.click( w.auth.connect );
		w.auth.eDisConnectButton.click( w.auth.disconnect );

		w.auth.eUsername.keypress( w.auth.eUsernameKeypress );
		w.auth.ePassword.keypress( w.auth.ePasswordKeypress );
	},
	// Logs in, only if there is connection with the server, otherwise it won't work
	login: function( ) {
		if ( mWSC && mWSC.isConnected( ) ) {
			if ( mLog.isDebugEnabled ) {
				log( "Logging in..." );
			}
			try {
				// you can choose the username entered by the user or 
				// jWebSocket defalut jws.GUEST_USER_LOGINNAME
				var lUsername = w.auth.eUsername.val( );
				// jWebSocket defalut jws.GUEST_USER_PASSWORD
				var lPassword = w.auth.ePassword.val( );

				var lRes = mWSC.login(
						lUsername,
						lPassword
						);

				if ( lRes.code == 0 ) {
					if ( mLog.isDebugEnabled ) {
						log( "Asychronously waiting for response..." );
					}

				} else {
					if ( mLog.isDebugEnabled ) {
						log( lRes.msg );
					}
				}
			} catch ( ex ) {
				jws.console.log( ex.message );
				if ( mLog.isDebugEnabled ) {
					log( "Exception: " + ex.message );
				}
			}
		} else {
			log( "Not connected, please click 'Connect button'" );
		}
	},
	getCallbacks: function( ) {
		return {
			// use JSON sub protocol
			subProtocol: (w.auth.options.subProtocol) ? w.auth.options.subProtocol : jws.WS_SUBPROT_JSON,
			// connection timeout in ms
			openTimeout: (w.auth.options.timeout) ? w.auth.options.timeout : 3000,
			OnOpen: function( aEvent, aToken ) {
				// starting keepAlive mechanism (required)
				mWSC.startKeepAlive();

				if ( w.auth.options.OnOpen ) {
					w.auth.options.OnOpen( aEvent, aToken );
				}
				if ( mLog.isDebugEnabled ) {
					log( "<font color='green'>jWebSocket connection established.</font>" );
				}

				w.auth.eConnectButton.hide( );
				w.auth.eDisConnectButton.show( );

				mIsConnected = true;
				// Setting the status connected
				w.auth.eClientStatus.attr( "class", "online" ).text( "connected" );
			},
			// OnOpenTimeout callback
			OnOpenTimeout: function( aEvent ) {
				if ( mLog.isDebugEnabled ) {
					log( "Opening timeout exceeded!" );
				}

				if ( w.auth.options.OnOpenTimeout ) {
					w.auth.options.OnOpenTimeout( aEvent );
				}

			},
			// OnReconnecting callback
			OnReconnecting: function( aEvent ) {
				if ( mLog.isDebugEnabled ) {
					log( "Re-establishing jWebSocket connection..." );
				}
			},
			OnWelcome: function( aToken ) {
				if ( w.auth.options.OnWelcome ) {
					w.auth.options.OnWelcome( aToken );
				}
				if ( mLog.isDebugEnabled ) {
					log( "<font color='green'>jWebSocket Welcome received.</font>" );
					if ( aToken.sourceId ) {
						w.auth.eClientId.text( "Client-ID: " + aToken.sourceId );
					}
				}
			},
			OnLogon: function( aToken ) {
				if ( w.auth.options.OnLogon ) {
					w.auth.options.OnLogon( aToken );
				}
				if ( mLog.isDebugEnabled ) {
					log( "<font color='green'>Successfully authenticated as: "
							+ aToken.username + "</font>" );
				}
				w.auth.eLogonArea.hide( );
				w.auth.eLogoffArea.fadeIn( 300 );
				w.auth.eUserInfoName.text( aToken.username );
				w.auth.mUsername = aToken.username;
				w.auth.eClientStatus.attr( "class", "authenticated" ).text( "authenticated" );
			},
			OnLogoff: function( aToken ) {
				if ( w.auth.options.OnLogoff ) {
					w.auth.options.OnLogoff( aToken );
				}
				w.auth.eLogoffArea.hide( );
				w.auth.eLogonArea.fadeIn( 200 );

				w.auth.eConnectButton.hide( );
				w.auth.eDisConnectButton.show( );

				w.auth.mUsername = null;
				w.auth.eUserInfoName.text( "" );
				w.auth.eClientStatus.attr( "class", "online" ).text( "online" );
			},
			OnGoodBye: function( aEvent ) {
				if ( w.auth.options.OnGoodBye ) {
					w.auth.options.OnGoodBye( aEvent );
				}
				if ( mLog.isDebugEnabled ) {
					log( "<font color='green'>jWebSocket GoodBye received.</font>" );
				}
			},
			// OnMessage callback
			OnMessage: function( aEvent, aToken ) {
				if ( aToken && aToken.code == -1 ) {
					if ( mLog.isDebugEnabled ) {
						log( "<font color='red'>The following error" +
								" was returned by the server: " + aToken.msg + "</font>" );
					}
				}
				
				// Debug if the user doesn't have an OnMessage method
				if ( w.auth.options.OnMessage ) {
					w.auth.options.OnMessage( aEvent, aToken );
				} else {
					var lDate = "";
					if ( aToken.date_val ) {
						lDate = jws.tools.ISO2Date( aToken.date_val );
					}

					if ( mLog.isDebugEnabled ) {
						log( "<font color='green'>jWebSocket '" + aToken.type
								+ "' token received, full message: </font>'" + aEvent.data + "' "
								+ lDate );
					}
				}
			},
			// OnClose callback
			OnClose: function( aEvent ) {
				if ( mLog.isDebugEnabled ) {
					log( "<font color='red'>jWebSocket connection closed.</font>" );
				}
				w.auth.eLogoffArea.hide( );
				w.auth.eLogonArea.fadeIn( 200 );

				w.auth.eDisConnectButton.hide( );
				w.auth.eConnectButton.show( );

				w.auth.mUsername = null;
				w.auth.eUserInfoName.text( "" );
				w.auth.eClientId.text( "Client-ID: -" );
				w.auth.eClientStatus.attr( "class", "offline" ).text( "disconnected" );
				w.auth.eUsername.focus( );

				if ( w.auth.options.OnClose ) {
					w.auth.options.OnClose( aEvent );
				}
			}
		};
	},
	// If there is not connection with the server, opens a connection and then 
	// tries to log the user in the system
	logon: function( aUser, aPassword ) {
		var lURL = (w.auth.options.lURL) ? w.auth.options.lURL : jws.getAutoServerURL( );

		var lUsername;
		var lPassword;
		if ( AUTO_USER_AND_PASSWORD ) {
			lUsername = aUser || jws.DEMO_ROOT_LOGINNAME;
			lPassword = aPassword || jws.DEMO_ROOT_PASSWORD;
		} else {
			lUsername = w.auth.eUsername.val( );
			lPassword = w.auth.ePassword.val( );
		}

		if ( lUsername == "" || lPassword == "" ) {
			if ( mLog.isDebugEnabled ) {
				log( "<font color='red'>User or password can not be empty,\n\
						please check your login information.</font>" )
			}
			return;
		}

		if ( mLog.isDebugEnabled ) {
			log( "Connecting to " + lURL + " and logging in as '" + lUsername + "'..." );
		}

		var lRes = mWSC.logon( lURL, lUsername, lPassword, w.auth.getCallbacks( ) );

		if ( mLog.isDebugEnabled ) {
			log( mWSC.resultToString( lRes ) );
		}
	},
	logoff: function( ) {
		if ( mWSC ) {
			if ( mLog.isDebugEnabled ) {
				log( "Logging off " + (w.auth.mUsername != null ? "'" +
						w.auth.mUsername + "'" : "") + " and disconnecting..." );
			}
			// the timeout below  is optional,
			// if you use it you'll get a good-bye message.
			var lRes = mWSC.logout( {
				timeout: 3000
			} );

			if ( mLog.isDebugEnabled ) {
				log( mWSC.resultToString( lRes ) );
			}
		}
	},
	connect: function( ) {
		var lURL = (w.auth.options.lURL) ? w.auth.options.lURL : jws.getAutoServerURL( );
		if ( mLog.isDebugEnabled ) {
			log( "Connecting to " + lURL + " ..." );
		}

		if ( mWSC.isConnected( ) ) {
			if ( mLog.isDebugEnabled ) {
				log( "Already connected." );
			}
			return;
		}

		try {
			mWSC.open( lURL, w.auth.getCallbacks( ) );
		} catch ( ex ) {
			jws.console.log( ex );
			if ( mLog.isDebugEnabled ) {
				log( "Exception: " + ex.message );
			}
		}
	},
	disconnect: function( ) {
		if ( mWSC ) {
			if ( mLog.isDebugEnabled ) {
				log( "Disconnecting..." );
			}
			try {
				var lRes = mWSC.close( {
					timeout: 3000
				} );

				if ( lRes.code != 0 ) {
					if ( mLog.isDebugEnabled ) {
						log( lRes.msg );
					}
				}
			} catch ( ex ) {
				jws.console.log( ex );
				if ( mLog.isDebugEnabled ) {
					log( "Exception: " + ex.message );
				}
			}
		}
	},
	auth: function( ) {
		if ( mWSC ) {
			if ( mLog.isDebugEnabled ) {
				log( "Authenticating..." );
			}
			try {
				var lRes = mWSC.systemLogon(
						jws.GUEST_USER_LOGINNAME,
						jws.GUEST_USER_PASSWORD
						);
				if ( lRes.code == 0 ) {
					if ( mLog.isDebugEnabled ) {
						log( "Asychronously waiting for response..." );
					}
				} else {
					if ( mLog.isDebugEnabled ) {
						log( lRes.msg );
					}
				}
			} catch ( ex ) {
				jws.console.log( ex.message );
				if ( mLog.isDebugEnabled ) {
					log( "Exception: " + ex.message );
				}
			}
		}
	},
	deauth: function( ) {
		if ( mWSC ) {
			if ( mLog.isDebugEnabled ) {
				log( "Deauthenticating..." );
			}
			try {
				var lRes = mWSC.systemLogoff( );
				if ( lRes.code == 0 ) {
					if ( mLog.isDebugEnabled ) {
						log( "Asychronously waiting for response..." );
					}
				} else {
					if ( mLog.isDebugEnabled ) {
						log( lRes.msg );
					}
				}
			} catch ( ex ) {
				jws.console.log( ex.message );
				if ( mLog.isDebugEnabled ) {
					log( "Exception: " + ex.message );
				}
			}
		}
	},
	getAuth: function( ) {
		if ( mWSC ) {
			if ( mLog.isDebugEnabled ) {
				log( "Getting authorities..." );
			}
			try {
				var lRes = mWSC.systemGetAuthorities( );
				if ( lRes.code == 0 ) {
					if ( mLog.isDebugEnabled ) {
						log( "Asychronously waiting for response..." );
					}
				} else {
					if ( mLog.isDebugEnabled ) {
						log( lRes.msg );
					}
				}
			} catch ( ex ) {
				if ( mLog.isDebugEnabled ) {
					log( "Exception: " + ex.message );
				}
			}
		}
	},
	// EVENTS FUNCTIONS
	eUsernameKeypress: function( aEvent ) {
		if ( aEvent.keyCode == 13 || aEvent.keyChar == 13 ) {
			w.auth.ePassword.focus( );
		}
	},
	ePasswordKeypress: function( aEvent ) {
		if ( aEvent.keyCode == 13 || aEvent.keyChar == 13 ) {
			w.auth.logon( );
		}
	},
	cleanHTML: function( aMsg ) {
		var lResult = "", lEnd = aMsg.length, lChar = '';
		for ( var lIdx = 0; lIdx < lEnd; lIdx++ ) {
			lChar = aMsg.charAt( lIdx );
			if ( lChar == '<' ) {
				lResult += '%3c';
			} else if ( lChar == '>' ) {
				lResult += '%3e';
			} else if ( lChar == '&' ) {
				lResult += '%26';
			} else {
				lResult += lChar;
			}
		}
		return lResult;
	}
} );
