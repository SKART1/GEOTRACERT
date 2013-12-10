//	---------------------------------------------------------------------------
//	jWebSocket jQuery Timestream Demo (Community Edition, CE)
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

// authors: Victor and Carlos

w = { };
w.mobile = { };
w.mobile.NS_SYSTEM		= "org.jwebsocket.plugins.system";
w.mobile.NS_STREAMING_PLUGIN = "org.jwebsocket.plugins.streaming";

$( document ).bind({
	// Loaded second
	"ready": function() {
		w.mobile.eClientStatus		= $( "#client_status" );
		w.mobile.eClientId			= $( "#client_id" );
	},
	// Loaded first
	"mobileinit": function( ) {
		// Open jWebSocket connection using jQueryMobile Plug-in
		$.jws.open( );
	
		// Registering onOpen function, using jqueryPlugIn for 
		// jWebSocket the basic mechanism is easier to handle
		$.jws.bind({ 
			"open": function( aToken ) {
				w.mobile.eClientId.text( "Client-ID: - " );
				w.mobile.eClientStatus.attr( "class", "online").text("connected");
			},
			"close": function( ) {
				w.mobile.eClientId.text( "Client-ID: - " );
				w.mobile.eClientStatus.attr( "class", "offline").text("disconnected");
				$( "#time" ).text( "yyyy-mm-dd hh:mm:ss" ).css({
					"text-align":"center"
				});
			}
		});
    
		//BINDING THIS EVENT IS MORE RECOMMENDED THAN $( document ).ready( )
		$( "#mainPage" ).live( "pagecreate", function( aEvt ) {
		
			$( "#time" ).text( "yyyy-mm-dd hh:mm:ss" ).css({
				"text-align":"center"
			});
		
			// Every when a new message comes from the server, jQuery plug-in
			// fires an event with the structure "namespace:tokentype"
			$.jws.bind( w.mobile.NS_SYSTEM + ":welcome", function( aEvt, aToken ) {
				$.jws.submit( w.mobile.NS_SYSTEM, "login", {
					username: jws.GUEST_USER_LOGINNAME,
					password: jws.GUEST_USER_PASSWORD
				}, {
					// Authenticated successfully, handle statusbar information
					success: function( aToken ) {
						w.mobile.eClientId.text("Client-ID: " + aToken.sourceId);
						w.mobile.eClientStatus.attr( "class", "authenticated").text("authenticated");
					}
				});
			});		
		
			$.jws.bind( w.mobile.NS_SYSTEM + ":response", function( aEvt, aToken ) {
				if( "login" == aToken.reqType && 0 == aToken.code ) {
					$.jws.submit( w.mobile.NS_STREAMING_PLUGIN, "register",
					{
						stream: "timeStream"
					});
				}
			});
		
			$.jws.bind( w.mobile.NS_STREAMING_PLUGIN + ":event", function( aEvt, aToken ) {
				$( "#time" )
				.text( 
					aToken.year
					+ "-" + jws.tools.zerofill( aToken.month, 2 ) 
					+ "-" + jws.tools.zerofill( aToken.day, 2 )
					+ " " + jws.tools.zerofill( aToken.hours, 2 )
					+ ":" + jws.tools.zerofill( aToken.minutes, 2 ) 
					+ ":" + jws.tools.zerofill( aToken.seconds, 2 ) )
				.css({
					"text-align":"center"
				});
			});
		});
	}
});
