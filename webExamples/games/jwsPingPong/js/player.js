//	---------------------------------------------------------------------------
//	jWebSocket Ping Pong Demo (player) (Community Edition, CE)
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
$.widget( "jws.player",  {
        
	_init: function(  ) {
		w.player			    = this;
       
		w.player.eAracket		= w.player.element.find( '#playerA_racket' );
		w.player.eBracket		= w.player.element.find( '#playerB_racket' );
		w.player.eAname		    = w.player.element.find( '#playerA_name' );
		w.player.eBname		    = w.player.element.find( '#playerB_name' );
		w.player.eApoints		= w.player.element.find( '#playerA_points' );
		w.player.eBpoints		= w.player.element.find( '#playerB_points' );
		
		//	w.player.registerEvents(  );
		w.player.onMessage(  );
	}, 
	
	//Sends the event that has been moved,  the number and if was the keyboard 
	//or the mouse to variate the speed
	broadcastPlayer: function( aKeyNumber,  aIdentifier ) {
        
		var lArgs = {
			e: parseInt( aKeyNumber ), 
			v: aIdentifier
		};            
		$.jws.submit( NS, 'moveplayer',  lArgs );
	}, 
	
	//all incoming messages from the server
	onMessage: function(  ) {
		//Initializing rackets of both players
		$.jws.bind( NS + ':submitrequest',  function( aEvt,  aToken ) {
			w.player.initPlayer( aToken.player, aToken.width, aToken.Heigth, aToken.posX, aToken.posY );          
		} ); 
		//To update the scores
		$.jws.bind( NS + ':score',  function( aEvt,  aToken ) {
			w.player.scoreUpdate( aToken.username1, aToken.score1, aToken.username2, aToken.score2 );          
		} );
	}, 
	initPlayer: function( aPlayer, aWidth, aHeight, aPosX, aPosY ) {
		if( aPlayer == "playLeft" ) {
			w.player.eAracket.css( { 
				'top': aPosY+'px', 
				'left': aPosX+'px'
			} );
		}else if( aPlayer == "playRight" ) {
			w.player.eBracket.css( { 
				'width': aWidth+'px',  
				'height': aHeight+'px', 
				'top': aPosY +'px', 
				'left': aPosX+'px'        
			} );
		}else{
            
			w.player.eAracket.css( { 
				'top': aPosY+'px', 
				'left': aPosX+'px'
        
			} );
			w.player.eAracket.css( { 
				'width': aWidth+'px',  
				'height': aHeight+'px', 
				'top': aPosY +'px', 
				'left': aPosX+'px'        
			} );
		}
	}, 
	registerEvents: function(  ) {
		$( 'html' ).bind( {
			'keydown': function( e ) {
				if( e.keyCode == 38 ||e.keyCode == 40 ) {                           
					w.player.broadcastPlayer( e.keyCode,  "k" ); 
					e.stopPropagation(  );
					e.preventDefault(  );
				}
			}, 
			'mousewheel DOMMouseScroll': function(  aEvt  ) {
				if( (  aEvt.originalEvent.wheelDelta > 0 || aEvt.originalEvent.detail < 0 ) ) {                
					w.player.broadcastPlayer(  38,  "m"  ); 
				} else {
					w.player.broadcastPlayer( 40, "m" ); 
				}
				aEvt.stopPropagation(   );
				aEvt.preventDefault(  );
			}            
		} );  
	}, 
	decouplingEvent: function(  ) { 
		$( 'html' ).unbind( 'keydown' );
		$( 'html' ).unbind( 'mousewheel' );       
	}, 
	scoreUpdate: function( aUsername1, aScore1, aUsername2, aScore2 ) {
		w.player.eAname.text( aUsername1 ); 
		w.player.eBname.text( aUsername2 );
		w.player.eApoints.text( aScore1 );
		w.player.eBpoints.text( aScore2 );
	}    
} );