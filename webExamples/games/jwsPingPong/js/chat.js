//	---------------------------------------------------------------------------
//	jWebSocket Ping Pong Demo (chat) (Community Edition, CE)
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
$.widget( "jws.chat", {
	_init:function(  ) {
		
		w.chat=this;
		
		w.chat.eChat			   = w.chat.element.find( '#chat' )       
		w.chat.eScenarioChat	   = w.chat.element.find( '#scenario_chat' )       
		w.chat.eWindow			   = w.chat.element.find( "#chat_text" );
		w.chat.eArea			   = w.chat.element.find( "#messages_area" );
		w.chat.eMinimized		   = w.chat.element.find( "#minimized" )
		w.chat.eMinimizeChatText   = w.chat.element.find( "#minimize_chat_text" );
		w.chat.eBallTimeout		   = 0;
		
		w.chat.hidden			   = true;		
		w.chat.minimized		   = false;
						
		w.chat.registerEvents(  );
		w.chat.onMessage(  );
		w.chat.eWindow.hide(  );
		w.chat.eScenarioChat.hide(  );
	}, 
    
	registerEvents:function(  ) {
		w.chat.eChat.bind( 'focus',function(  ) {
			w.chat.messageOnClick(  );
		} );
		w.chat.eChat.bind( 'blur',function(  ) {
			w.chat.messageOnBlur(  );
		} );
		
		w.chat.eChat.keypress( function( aEvt ) {
			if( aEvt.charCode == 13 || aEvt.keyCode == 13 ) {
				w.chat.broadcastMessage( $( this ).val(  ) );
				$( this ).val( "" );
				if( w.chat.hidden ) {
					w.chat.eWindow.fadeIn( 150 );
					w.chat.hidden = false;
				}
				else if( w.chat.minimized ) {
					w.chat.restore(  );
				}
			}
		} );
		w.chat.eMinimizeChatText.click( function(  ) {
			w.chat.minimize(  );
		} );
	},    
	minimize: function(  ) {
		w.chat.eWindow.slideUp(  );
		var elem = $( "<div id='minimized'>Back to chat</div>" ).click( function(  ) {
			w.chat.restore(  );
		} );
		eObjArea.prepend( elem );
		w.chat.minimized = true;
	},
	restore: function(  ) {
		w.chat.eWindow.slideDown(  );
		w.chat.eMinimized.fadeOut( function(  ) {
			$( this ).remove(  );
		} );
		w.chat.minimized = false;
	},
	addText: function( text, user, username ) {
		if( user=="0" ) {
			var $O_p   = $( "<div><p class='sms'><label id='user_name_a'>"+username+": "+"</label>"+text+"</p></div>" );
		}else{
			$O_p   = $( "<div><p class='sms'><label id='user_name_b'>"+username+": "+"</label>"+text+"</p></div>" );
		}
		w.chat.eArea.append( $O_p );       
		w.chat.eArea.scrollTop( w.chat.eArea.get( 0 ).scrollHeight - w.chat.eArea.get( 0 ).clientHeight );
		w.chat.eMinimized.fadeOut( function(  ) {
			$( this ).remove(  );
		} );
	},
	broadcastMessage: function( text ) {
		var lArgs = {
			text: text
		};
		$.jws.submit( NS,"sms", lArgs );
	},
	onMessage: function(  ) {
		$.jws.bind( NS + ':sms', function( aEvt, aToken ) {
			if( w.chat.hidden ) {
				w.chat.eWindow.fadeIn( 150 );
				w.chat.hidden = false;
			}
			else if( w.chat.minimized ) {
				w.chat.restore(  );
			}
			w.chat.addText( aToken.text,aToken.user,aToken.username );
			if(  w.chat.eBallTimeout ) clearTimeout(  w.chat.eBallTimeout );
			w.chat.eBallTimeout = setTimeout( 'w.chat.minimize()', 5000 );           
		} );
        
	},
	messageOnBlur:function(  ) {		
		if( w.chat.eChat.val(  ) == "" ) {
			w.chat.eChat.val( "Type your message..." ).css( 'color', 'graytext' );
		}
			
	},
	messageOnClick: function(  ) {       
		if(  w.chat.eChat.val(  ) == "Type your message..." ) {
			w.chat.eChat.val( "" ).css( 'color', 'black' );
		} 
	}
} );
