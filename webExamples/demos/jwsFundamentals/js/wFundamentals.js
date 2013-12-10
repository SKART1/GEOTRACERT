//	---------------------------------------------------------------------------
//	jWebSocket Fundamentals (Community Edition, CE)
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

/*
 * @author vbarzana, ashulze
 */
$.widget( "jws.fundamentals", {
	_init:function( ) {
		
		// DOM Elements
		this.eMessageBox		= this.element.find( "#message_box_text" );
		this.eBtnEcho			= this.element.find( "#echo_btn" );
		this.eBtnThread			= this.element.find( "#thread_btn" );
		this.eBtnConectivity	= this.element.find( "#connectivity_btn" );
		this.eBtnAuth			= this.element.find( "#auth_btn" );
		this.eBtnDeauth			= this.element.find( "#deauth_btn" );
		this.eBtnGetAuth		= this.element.find( "#get_auth_btn" );
		this.eCbAutoReconn		= this.element.find( "#auto_reconnect" );
		this.eDemoBox			= $( "#demo_box" );
		
		this.mArgumentsOfThread	= [ "This was the passed argument" ];
		
		// Messages to be used
		this.MSG_TypeYourMessage= "Type your message...";
		this.MSG_StartingThread = "Starting method as thread..."
		this.MSG_DemoTitle		= "Fundamentals Demo";
		this.MSG_TypeSthg		= "Please you must type something in the field";
	
		//CSS classes
		this.CSS_DARK			= "dark";
		this.CSS_OPAQUE			= "opaque";
		
		w.fund = this;
		this.doWebSocketConnection( );
		this.registerEvents( );
	},
	
	doWebSocketConnection: function( ) {
		// Each widget utilizes the same authentication mechanism, please refer
		// to the public widget ../../res/js/widgets/wAuth.js
		var lCallbacks = {
			OnOpen: function( aEvent ) {
			},
			OnClose: function( aEvent ) {
			},
			OnMessage: function( aEvent, aToken ) {
				var lDate;
				if( aToken.date_val ) {
					lDate = jws.tools.ISO2Date( aToken.date_val );
				} else {
					lDate = new Date( );
				}
				
				if( mLog.isDebugEnabled ) {
					log( "<div style='color:#888'>jWebSocket '" + aToken.type 
						+ "' token received, full message: '" + aEvent.data + "' " 
						+ lDate + "</div>" );
				}
			},
			OnWelcome: function( aEvent ) {
			},
			OnGoodBye: function( aEvent ) {
			}
		};
		// For more information check the public login widget
		// ../../res/js/widgets/wAuth.js
		w.fund.eDemoBox.auth( lCallbacks );
	},
	
	registerEvents: function( ) {
		// SWITCHING THE EVENTS TO THE DOM ELEMENTS
		w.fund.eMessageBox.click( w.fund.messageBoxClick );
		w.fund.eMessageBox.blur( w.fund.messageBoxBlur );
		w.fund.eMessageBox.keypress( w.fund.messageBoxKeyPressed );
		w.fund.eMessageBox.focus( w.fund.messageBoxClick );
		
		w.fund.eCbAutoReconn.change( w.fund.toggleReconnect );
		w.fund.eBtnThread.click( w.fund.thread );
		w.fund.eBtnEcho.click( w.fund.echo );
		w.fund.eBtnConectivity.click( w.fund.showReliabilityOptions );
		w.fund.eBtnAuth.click( w.auth.auth );
		w.fund.eBtnDeauth.click( w.auth.deauth );
		w.fund.eBtnGetAuth.click( w.auth.getAuth );
		
	},

	toggleReconnect: function( ) {
		if( mWSC ) {
			var lReconnect = w.fund.eCbAutoReconn.get( 0 ).checked;
			if ( mLog.isDebugEnabled ) {
				log( "Turning auto-reconnect " + ( lReconnect ? "on" : "off" ) );
			}
			mWSC.setReliabilityOptions( lReconnect ? jws.RO_ON : jws.RO_OFF );
		}
	},
			
	showReliabilityOptions: function( ) {
		if( mWSC ) {
			var lOptions = mWSC.getReliabilityOptions( );
			var lQueue = mWSC.getOutQueue( );
			if ( mLog.isDebugEnabled ) {
				log( "Reliability Options: " 
					+ ( lQueue ? lQueue.length : "no" ) + " items in queue"
					+ ", auto-reconnect: " + lOptions.autoReconnect
					+ ", reconnectDelay: " + lOptions.reconnectDelay
					+ ", queueItemLimit: " + lOptions.queueItemLimit
					+ ", queueSizeLimit: " + lOptions.queueSizeLimit
					);
			}
		}
	},

	echo: function( ) {
		var lMsg = w.auth.cleanHTML( w.fund.eMessageBox.val( ) );
		
		if( lMsg && lMsg != w.fund.MSG_TypeYourMessage ) {
			if ( mLog.isDebugEnabled ) {
				log( "Sending '" + lMsg + "', waiting for echo..." );
			}
			try {
				var lRes = mWSC.echo( lMsg );
				if( lRes.code == 0 ) {
					if ( mLog.isDebugEnabled ) {
						log( "Message sent." );
					}
				} else {
					if ( mLog.isDebugEnabled ) {
						log( lRes.msg );
					}
				}
			} catch( ex ) {
				console.log( ex.message );
				if ( mLog.isDebugEnabled ) {
					log( "Exception: " + ex.message );
				}
			}
		} else {
			jwsDialog( w.fund.MSG_TypeSthg, w.fund.MSG_DemoTitle, true, "alert",
				function( ) {
					w.fund.eMessageBox.focus( );
				});
			
		}
	},

	thread: function( ) {
		if ( mLog.isDebugEnabled ) {
			log( w.fund.MSG_StartingThread );
		}
		var lRes = jws.runAsThread({
			method: function( aOut ) {
				return( "This method was called in a WebWorker " + 
					"thread and returned: " + aOut );
			},
			args: w.fund.mArgumentsOfThread,
			OnMessage: function( aToken ) {
				var lData = aToken.data;
				if ( mLog.isDebugEnabled ) {
					log( "Result: " + lData );
				}
			},
			OnError: function( aToken ) {
				if ( mLog.isDebugEnabled ) {
					log( "Error: " + aToken.message );
				}
			}
		});
		if ( mLog.isDebugEnabled ) {
			log( lRes.msg );
		}
	},
	
	// ------------- EVENTS ---------------------------
	messageBoxBlur : function( ) {
		if( $( this ).val( ) == "" ) {
			$( this ).val( w.fund.MSG_TypeYourMessage ).attr( "class", 
				w.fund.CSS_OPAQUE );
		}
	},
	
	messageBoxClick: function( ) {
		if( $( this ).val( ) == w.fund.MSG_TypeYourMessage ) {
			$( this ).val( "" ).attr( "class", w.fund.CSS_DARK );
		}
	},
	
	messageBoxKeyPressed: function( aEvt ) {
		if( aEvt.keyCode == 13 && ( !aEvt.shiftKey ) ) {
			aEvt.preventDefault( );
			w.fund.echo( );
			$( this ).val( "" );
		}
	}
});