//	---------------------------------------------------------------------------
//	jWebSocket System Plug-in test specs (Community Edition, CE)
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

jws.tests.Load = {

	NS: "jws.tests.load", 
	
	// this spec tests the speed of a complete client connection to the server
	testConcurrentConnections: function( aAmount ) {
		var lSpec = this.NS + ": Trying to establish " + aAmount + " concurrent connections...";
		it( lSpec, function () {

			var lConnected = 0;

			var lConns = [];
			for( var lIdx = 0; lIdx < aAmount; lIdx++ ) {
				lConns[ lIdx ] = new jws.jWebSocketJSONClient();
				lConns[ lIdx ].setParam( "connectionIndex", lIdx );
				lConns[ lIdx ].open( jws.getDefaultServerURL(), {
					OnWelcome: function ( aToken ) {
						lConnected++;
					}
				});
			}
			
			waitsFor(
				// wait a maximum of 300ms per connection
				function() {
					return( lConnected == aAmount );
				},
				lSpec,
				aAmount * 300
			);

			runs( function() {
				expect( lConnected ).toEqual( aAmount );
				for( var lIdx = 0, lCnt = lConns.length; lIdx < lCnt; lIdx++ ) {
					lConns[ lIdx ].close();
				}
			});
		});
	},




	// this spec tests the send method of the system plug-in by sending
	// this spec requires an established connection
	testEcho: function() {
		var lSpec = this.NS + ": Send and Loopback";
		it( lSpec, function () {

			// we need to "control" the server to broadcast to all connections here
			var lResponse = {};
			var lMsg = "This is my message";

			// open a separate control connection
			var lToken = {
				ns: jws.NS_SYSTEM,
				type: "send",
				targetId: jws.Tests.getAdminConn().getId(),
				sourceId: jws.Tests.getAdminConn().getId(),
				sender: jws.Tests.getAdminConn().getUsername(),
				data: lMsg
			};

			var lListener = function( aToken ) {
				if( "org.jwebsocket.plugins.system" == aToken.ns
					&& "send" == aToken.type) {
					lResponse = aToken;
				}
			};

			jws.Tests.getAdminConn().addListener( lListener );
			jws.Tests.getAdminConn().sendToken( lToken );

			waitsFor(
				function() {
					return( lResponse.data == lMsg );
				},
				lSpec,
				1500
			);

			runs( function() {
				expect( lResponse.data ).toEqual( lMsg );
				jws.Tests.getAdminConn().removeListener( lListener );
			});

		});
	},

	runSpecs: function() {
		// jws.tests.System.testEcho();
		for( var lIdx = 0; lIdx < 10; lIdx++ ) {
			jws.tests.Load.testConcurrentConnections( 20 );
		}
	},

	runSuite: function() {
		var lThis = this;
		describe( "Performing test suite: " + this.NS + "...", function () {
			lThis.runSpecs();
		});
	}	

}

