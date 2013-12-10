//	---------------------------------------------------------------------------
//	jWebSocket Ping Pong Demo (stage) (Community Edition, CE)
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
$.widget( "jws.stage", {
        
	_init:function(  ) {
		eStage			= this;
		$eStage			= this.element;         
		eObjArea		= $eStage.find( '#obj_area' );
		eGameOver		= $eStage.find( '#game_over' );
		eSendPause		= $eStage.find( '#send_pause' );
		eMessagesArea	= $eStage.find( '#messages_area' );
		eBoard			= $eStage.find( '#board' );
		eCounter		= $eStage.find( '#counter' );
		
		$.jws.submit( NS,'stage' );
		
		eStage.onMessage(  );
		eObjArea.hide(  );
		eGameOver.hide(  );
                
	},
	
	onMessage: function(  ) {
		//Creating the scenario
		$.jws.bind( NS + ':stage', function( aEvt, aToken ) {
			eStage.initStage( aToken.width, aToken.height, aToken.gameBorder );
		} );
		$.jws.bind( NS + ':gameover', function( aEvt, aToken ) { 
			eStage.gameOver( aToken.gameover, aToken.message );           
		} );
		//Enable or disable the main area with all objects inside
		$.jws.bind( NS + ':objarea', function( aEvt, aToken ) {
			eStage.objArea( aToken.objarea );   
		} ); 
		//Enable or disable the counter
		$.jws.bind( NS + ':counter', function( aEvt, aToken ) {
			//show button pause because game already started
			w.menu.ePause.show(  );
			eStage.counter( aToken.counter );           
		} );
		$.jws.bind( NS + ':sendexit', function( aEvt, aToken ) {
			dialog( "Ping Pong Game", aToken.username + ' has left the game', true );
		} );
	},
	initStage:function( aWidth, aHeight, aGameBorder ) {
		eBoard.css( {
			'width': aWidth - aGameBorder * 2 + 'px', 
			'height': aHeight- aGameBorder * 2 + 'px'
		} );
	},
	gameOver: function( aGameOver, aMessage ) {
		if( aGameOver ) {  
			eGameOver.text( aMessage );
			eGameOver.show(  );
			w.ball.eBall.hide(  );
		}else{
			eGameOver.hide(  );
		}
	},
	objArea:function( aObjArea ) {
		if( aObjArea ) {
			eObjArea.show(  );
			w.menu.eScenarioMenu.show(  );
			w.chat.eScenarioChat.show(  );
			w.ball.eBall.hide(  );
			eCounter.hide(  );
			w.player.registerEvents(  );           
		}else{
			eObjArea.hide(  );
			eGameOver.hide(  );
			w.menu.eScenarioMenu.hide(  );
			w.chat.eScenarioChat.hide(  );
			w.player.decouplingEvent(  );
		}
		closeDialog(  );
		eSendPause.html( "" );
		eMessagesArea.html( "" );
		w.chat.minimize(  );
	},
	counter:function( aCounter ) {
		if( aCounter == 0 ) {
			eCounter.fadeOut( 200 );
			w.ball.eBall.fadeIn( 100 );
		}else{
			w.ball.eBall.hide(  );
			eCounter.show(  );
			eCounter.html( aCounter );
		}
	}
} );