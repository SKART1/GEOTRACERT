//	---------------------------------------------------------------------------
//	jWebSocket Ping Pong Demo (connect) (Community Edition, CE)
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
 * @author armando
 */
$.widget( "jws.connected", {
        
	_init: function(  ) {
		
		w.conn					= this;
		 	
		w.conn.ePlayerslist		= w.conn.element.find( '#players_list' );
		w.conn.ePopupOk			= w.conn.element.find( '#popup_ok' );
		
		w.conn.onMessage(  );
		
	},
	onMessage: function(  ) {
		//crear la lista de los que estan conectados
		$.jws.bind( NS + ':usser', function( aEvt, aToken ) {
			w.auth.eClientStatus.hide(  ).attr( "class", "" )
			.addClass( "authenticated" ).text( "authenticated" ).show( );
			
			w.conn.ePlayerslist.html( "" );
			for ( i = 0; i < aToken.available.length; i++ ) {
				w.conn.initConnected( aToken.available[i], aToken.state );
			}
            
			for ( i = 0; i < aToken.playing.length; i++ ) {
				w.conn.initPlaying( aToken.playing[i] );
			}
			if( aToken.available && aToken.playing ) {
				if( aToken.available.length == 0 && ( aToken.playing.length == 0 ) ) {
					w.conn.element.append( $( "<div id='no_users'>No users online, please wait for someone!</div>" ) );
				}
				else{
					w.conn.element.find( "#no_users" ).remove(  );
				}
			}
            
		} );
		//recive quien te manda la solicitud de juego
		$.jws.bind( NS + ':sendrequest', function( ev, aToken ) {	
			var lButtons = [{
				id: "buttonNo",
				text: "No",
				aFunction: function(  ) {
					w.conn.has_accepted_request( false,aToken.username );
				}
			}, {
				id: "buttonYes",
				text: "Yes",
				aFunction: function(  ) {
					w.conn.has_accepted_request( true, aToken.username );
				}
			}];
			dialog( "Ping Pong Game", "<b>" + aToken.username + "</b>"+' wants to play Ping Pong with you. Would you like to proceed?',true, function(  ) {}, lButtons );
		} );
		$.jws.bind( NS + ':deleteusser', function( ev, aToken ) {
			w.conn.ePlayerslist.html( "" );              
		} );
		//recive la respuesta donde dice que no asecta la solicitud		
		$.jws.bind( NS + ':submitsequestno', function( ev, aToken ) {
			dialog( "Ping Pong Game", aToken.username+' does not want to start a game',true );
		} );
        
	},
	initConnected: function(  text, state  ) {
		if( !state ) {
			var $text;
			var $O_p   =$(  '<li class="available">'  ).text( text ).click( function(  ) { 
				$text=$( this ).text(  );
				w.conn.send_request( $text );  
				var lButtons = [{
					id: "buttonCancel",
					text: "Cancel",
					aFunction: function(  ) {
						w.conn.has_accepted_request( false,$text );
					}
				}];
				dialog( "Ping Pong Game", ' Waiting for request confirmation',true, function(  ) { }, lButtons );
			} );
		}else{
			$O_p   = $( '<li class="available">' ).text( text );
		}
		w.conn.ePlayerslist.append( $O_p );
	},
	initPlaying: function( text ) {
		var $O_p   = $( '<li class="playing">' ).text( text );
		w.conn.ePlayerslist.append( $O_p );
	},
	//envio la solicitud para jugar
	send_request: function ( username ) {
		var args = {
			username:username
		};
		$.jws.submit( NS, 'sendrequest', args );
	},//ha aceptado o no la solicitud
	has_accepted_request: function( accepted, username ) {
              
		var args = {
			username: username,
			accepted: accepted
		};
		$.jws.submit( NS, 'submitsequest', args );        
	}        
} );