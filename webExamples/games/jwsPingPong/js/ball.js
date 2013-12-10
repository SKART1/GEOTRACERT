//	---------------------------------------------------------------------------
//	jWebSocket Ping Pong Demo (ball) (Community Edition, CE)
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
$.widget( "jws.ball", {
    _init: function(  ) {
        w.ball        = this; 
		
		w.ball.eBall   = w.ball.element.find( '#ball' );
        w.ball.eBall.hide(  );
	    w.ball.onMessage(  );
    }, 
    onMessage: function(  ) {
     
        $.jws.bind( NS + ':ball', function( aEvt, aToken ) {
            w.ball.updateBall( aToken.width, aToken.height );           
        } ); 
        $.jws.bind( NS + ':moveball', function( aEvt, aToken ) {
           w.ball.moveBall( aToken.posX,aToken.posY );           
        } );
        $.jws.bind( NS + ':sound', function( aEvt, aToken ) {
            $( "#sound" )[0].play(  );
        } );
    },
    updateBall: function( aWidth, aHeight ) {
        w.ball.eBall.css( { 
            'width': aWidth + 2 +'px', 
            'height': aHeight +3 +'px'                        
        } );        
    },
    moveBall: function( posX,posY ) {
       w.ball.eBall.css( { 
            'left' :posX+'px', 
            'top' :posY+'px'                        
        } );   
    }
} );