//	---------------------------------------------------------------------------
//	jWebSocket Remote Shell Demo (Community Edition, CE)
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
 * @author Yasmany
 */
$.widget( "jws.RemoteShell",{
    
	_init: function(){
		w.rShell = this;
		
		// Variables
		w.rShell.mNS = "remote.plugin";
		w.rShell.mIsShellConnected = false;
		w.rShell.mLineCount = 0;
		w.rShell.mHistoryCount = 0;
		w.rShell.mHistory = [];
		
		// Elements
		w.rShell.eConsole       = w.rShell.element.find( "#console textarea" );
		w.rShell.eLogin         = w.rShell.element.find( "#shell_login_form" );
		w.rShell.eLogout        = w.rShell.element.find( "#logoff_area" ).hide();
		w.rShell.eHostName       = w.rShell.element.find( "#host_name" );
		w.rShell.eUserName       = w.rShell.element.find( "#user_name" );
		w.rShell.ePassword       = w.rShell.element.find( "#user_pass" );
		
		// Buttons
		w.rShell.eBtnConnect    = w.rShell.element.find( "#shell_login_btn" );
		w.rShell.eBtnDisconnect = w.rShell.element.find( "#shell_logout_btn" ).hide();
		w.rShell.eBtnBackground = w.rShell.element.find( "#backcolor_fields div" );
		w.rShell.eBtnFont       = w.rShell.element.find( "#fontcolor_fields div" );
                
		// Some startup functions
		w.rShell.eConsole.focus();
		w.rShell.registerEvents();
	},
    
	registerEvents: function(){
		// This widget automatically handles all login/logout, connect/disconnect
		// functionalities from jWebSocket, see res/js/widgets/wAuth.js
		$( "#demo_box" ).auth( );
		
		// jQuery plugIn for jWebSocket receives a TokenClient already opened
		// and binds all events coming from this client
		$.jws.setTokenClient( mWSC );
		
		w.rShell.onMessage();
		
		// when a user try to connect to a machine
		w.rShell.eBtnConnect.click( w.rShell.openSSHConnection );
        
		// Closes an opened ssh connection
		w.rShell.eBtnDisconnect.click( w.rShell.closeSSHConnection );
        
		//When a key is pressed
		w.rShell.eConsole.keydown( w.rShell.consoleKeyDown );
        
		//Change shell color
		w.rShell.eBtnBackground.click( w.rShell.setBackground );
		
		//Change font color
		w.rShell.eBtnFont.click( w.rShell.setFont );
	},
    
	history: function( el ){
		var oldContent = el.val().split( "\n" );
		var temp = "";
		for ( var i in oldContent ) {
			if ( i < oldContent.length-1 ) {
				temp += oldContent[i] + "\n"; 
			}                    
		}
		el.val( temp + w.rShell.mHistory[w.rShell.mHistoryCount] );
	},
	
	openSSHConnection: function(){
		if ( !w.rShell.eHostName.val() || !w.rShell.eUserName.val() || 
			!w.rShell.ePassword.val() ) {
			jwsDialog( "Please complete all fields" );
		}
		else
		{
			var aArgs = {
				host: w.rShell.eHostName.val(),
				user: w.rShell.eUserName.val(),
				password: w.rShell.ePassword.val()
			};
			
			$.jws.submit( w.rShell.mNS, "register", aArgs );
			w.rShell.mIsShellConnected = true;
			$( "#user_info_name" ).text( $( ".user" ).val() );
			w.rShell.mHistoryCount = 0;
			w.rShell.eLogin.fadeOut( 500,function(){
				w.rShell.eBtnDisconnect.fadeIn( 500 );
			});
		}
	},
	
	closeSSHConnection: function(){
		$.jws.submit( w.rShell.mNS, "disconnect" );
		w.rShell.eConsole.val( "" );
		w.rShell.eBtnDisconnect.fadeOut( 500,function(){
			w.rShell.eLogin.fadeIn( 500 );
		});
	},
	
	consoleKeyDown: function( aEvt ){
		if ( !w.rShell.mIsShellConnected ) {
			jwsDialog( "You must be connected" );
			aEvt.preventDefault();
		}else if( aEvt.which === 13 ){//enter
			w.rShell.mLineCount = 0;
			var content = $( this ).val().split( "\n" );
			var line = content[content.length-1] === "" ? content[content.length-2] : content[content.length-1];
			
			w.rShell.mHistory.unshift( line );

			w.rShell.mHistoryCount = 0;
			w.rShell.mLineCount = 0;
			
			var lArgs = {
				command:line
			};
			$.jws.submit( w.rShell.mNS, "exec_command", lArgs );
		}
		else if ( aEvt.which === 38 ){//up arrow
			//console.log( eHistoryCount );
			aEvt.preventDefault();
			if ( w.rShell.mHistoryCount < w.rShell.mHistory.length ) {
				//this.history( $( this ) );
				w.rShell.history( $( this ) );
				w.rShell.mHistoryCount++;
			}
		}else if ( aEvt.which === 40 ){//down arrow
			//console.log( eHistoryCount );
			aEvt.preventDefault();
			if ( w.rShell.mHistoryCount > 0 ) {
				w.rShell.mHistoryCount--;
				//this.history( $( this ) ); 
				w.rShell.history( $( this ) );
			}
		}
		//left arrow or backspace
		else if ( aEvt.which === 37 || aEvt.which === 8 ) { 
			if ( w.rShell.mLineCount <= 0 ) {
				aEvt.preventDefault();
			}
			else{
				w.rShell.mLineCount--;
			}
		}else if ( aEvt.which === 9 ) {//tab
			aEvt.preventDefault();
		}else{
			w.rShell.mLineCount++;
		}
	//console.log( aEvt.which );
	},
	
	setBackground: function(){
		if ( $( this ).attr( "id" ) != "bkcolor_text" ) {
			var color = $( this ).css( "background-color" );
			w.rShell.eConsole.css( "background-color",color );
		}
	},
	
	/**
	 * 
	 **/
	setFont: function(){
		if ( $( this ).attr( "id" ) != "fncolor_text" ) {
			var color = $( this ).css( "background-color" );
			w.rShell.eConsole.css( "color",color );
		}
	},
	
	/** OnMessage, Listen for execution results
	*   jQuery PlugIn for jWebSocket receives websocket messages and throws 
	*   an event for each incoming message, it can be catched as follows
	*   $.jws.bind( "namespace:type_of_token", function(aEvent, aToken){
	*		// The function to be processed here, the token comes in the
	*		// aToken object
	*   });
	**/
	onMessage: function(){
		$.jws.bind( "all:response", function( aEvt, aToken ) {
			// figure out of which request
			if( aToken.reqType == "login" ) {
				// if successfully logged in
				if( aToken.code == 0 ) {
					// Enabling textfields
					w.rShell.eHostName.attr( "disabled", false );
					w.rShell.eUserName.attr( "disabled", false );
					w.rShell.ePassword.attr( "disabled", false );
				}
			}
		});
		
		$.jws.bind( "all:goodBye", function( aEvt, aToken ){
			// On good bye disable all textfields
			w.rShell.eHostName.attr( "disabled", true );
			w.rShell.eUserName.attr( "disabled", true );
			w.rShell.ePassword.attr( "disabled", true );
		});
		
		$.jws.bind( w.rShell.mNS + ':exec_command',function( aEvt, aToken ){
			var oldContent = w.rShell.eConsole.val().split( "\n" );
			w.rShell.eConsole.val( oldContent[oldContent.length-2] + "\n" + aToken.result );
		});
	}
});