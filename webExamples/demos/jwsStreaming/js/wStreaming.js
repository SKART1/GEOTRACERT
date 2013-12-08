//	---------------------------------------------------------------------------
//	jWebSocket Streaming Demo (Community Edition, CE)
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
 * @author vbarzana
 */
$.widget( "jws.streaming", {
	_init: function( ) {
		// DOM Elements
		this.eBtnRegister = this.element.find( "#register_btn" );
		this.eBtnUnregister = this.element.find( "#unregister_btn" );

		w.streaming = this;
		w.streaming.doWebSocketConnection( );
		w.streaming.registerEvents( );
	},
	doWebSocketConnection: function( ) {
		// Each widget uses the same authentication mechanism, please refer
		// to the public widget ../../res/js/widgets/wAuth.js
		var lCallbacks = {
			OnOpen: function( aEvent ) {
			},
			OnClose: function( aEvent ) {

			},
			OnMessage: function( aEvent ) {
				if ( mLog.isDebugEnabled ) {
					log( "<font style='color:#888'>jWebSocket message received: '" +
							aEvent.data + "'</font>" );
				}
			},
			OnWelcome: function( aEvent ) {
			},
			OnGoodBye: function( aEvent ) {
			}
		};
		// this widget will be accessible from the global variable w.auth
		$( "#demo_box" ).auth( lCallbacks );
	},
	registerEvents: function( ) {
		//BUTTON EVENTS
		w.streaming.eBtnUnregister.click( w.streaming.unregisterStream );
		w.streaming.eBtnRegister.click( w.streaming.registerStream );
	},
	registerStream: function( ) {
		if ( mWSC.isConnected( ) ) {
			var lStream = w.streaming.element
					.find( "input[name=streaming]:checked" ).val( ); // "timeStream";
			log( "Registering at stream '" + lStream + "'..." );
			var lRes = mWSC.streaming.registerStream( lStream );
			log( mWSC.resultToString( lRes ) );
		}
		else {
			jwsDialog( "Sorry, you are not connected to the server, you can't" +
					" execute this action", "jWebSocket Error", true, "error" );
		}
	},
	unregisterStream: function( ) {
		if ( mWSC.isConnected( ) ) {
			var lStream = w.streaming.element
					.find( "input[name=streaming]:checked" ).val( ); // "timeStream";
			log( "Unregistering from stream '" + lStream + "'..." );
			var lRes = mWSC.streaming.unregisterStream( lStream );
			log( mWSC.resultToString( lRes ) );
		}
		else {
			jwsDialog( "Sorry, you are not connected to the server, you can't" +
					" execute this action", "jWebSocket Error", true, "error" );
		}
	}
} );