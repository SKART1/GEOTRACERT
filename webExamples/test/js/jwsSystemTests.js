//	---------------------------------------------------------------------------
//	jWebSocket System plug-in test specs (Community Edition, CE)
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

jws.tests.System = {

	NS: "jws.tests.system", 

	// this spec tests the login function of the system plug-in
	testLoginValidCredentials: function() {
		var lSpec = this.NS + ": Logging in with valid credentials";
		it( lSpec, function () {

			// we need to "control" the server to broadcast to all connections here
			var lConn = new jws.jWebSocketJSONClient();
			var lResponse = {};

			// open a separate control connection
			lConn.logon( jws.getDefaultServerURL(), "guest", "guest", {
				OnToken: function ( aToken ) {
					if( "org.jwebsocket.plugins.system" == aToken.ns
						&& "login" == aToken.reqType) {
						lResponse = aToken;
					}
				}
			});

			waitsFor(
				function() {
					return( lResponse.code != undefined );
				},
				lSpec,
				1500
				);

			runs( function() {
				expect( lResponse.code ).toEqual( 0 );
				lConn.close();
			});
		});
	},


	// this spec tests the login function of the system plug-in
	testLoginInvalidCredentials: function() {
		var lSpec = this.NS + ": Logging in with invalid credentials";
		it( lSpec, function () {

			// we need to "control" the server to broadcast to all connections here
			var lConn = new jws.jWebSocketJSONClient();
			var lResponse = {};

			// open a separate control connection
			lConn.logon( jws.getDefaultServerURL(), "InVaLiD", "iNvAlId", {
				OnToken: function ( aToken ) {
					if( "org.jwebsocket.plugins.system" == aToken.ns
						&& "login" == aToken.reqType) {
						lResponse = aToken;
					}
				}
			});

			waitsFor(
				function() {
					return( lResponse.code != undefined );
				},
				lSpec,
				1500
				);

			runs( function() {
				expect( lResponse.code ).toEqual( -1 );
				lConn.close();
			});
		});
	},


	// this spec tests the send method of the system plug-in by sending
	// this spec requires an established connection
	testSendLoopBack: function() {
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

	// this spec tests the connect timeout behaviour of the client
	testConnectTimeout: function( aURL, aOpenTimeout, aExpectedResult ) {
		var lSpec = this.NS + ": connect timeout" 
		+ " (timeout: " + aOpenTimeout + "ms)";
		
		it( lSpec, function () {

			// we need to "control" the server to broadcast to all connections here
			var lConn = new jws.jWebSocketJSONClient();
			var lStatus = jws.CONNECTING;

			// open a separate control connection
			lConn.open( aURL ? aURL : jws.getDefaultServerURL(), {
				
				openTimeout: aOpenTimeout,
				OnOpenTimeout: function ( aToken ) {
					debugger;
					lStatus = jws.OPEN_TIMED_OUT;
				},
				
				OnOpen: function ( aToken ) {
					// prevent screwing up result 
					// if timeout has been fired before
					if( lStatus == jws.CONNECTING ) {
						lStatus = jws.OPEN;
					}
				},
				
				OnClose: function ( aToken ) {
					lStatus = jws.CLOSED;
				}
			});

			waitsFor(
				function() {
					return( lStatus != jws.CONNECTING );
				},
				lSpec,
				aOpenTimeout + 500
				);

			runs( function() {
				expect( lStatus ).toEqual( aExpectedResult );
				lConn.close();
			});
		});
	},

	// this spec tests the response timeout behaviour of the client
	testResponseTimeout: function( aServerDelay, aClientTimeout ) {
		var lSpec = this.NS + ": response timeout" 
		+ " (Server: " + aServerDelay + "ms," 
		+ " client: " + aClientTimeout + "ms)";
		
		it( lSpec, function () {

			var lResponse = {};
			var lExpectTimeout = aServerDelay > aClientTimeout;
			var lTimeoutFired = false;
			jws.Tests.getAdminConn().testTimeout( 
				aServerDelay,
				{
					OnResponse: function( aToken ) {
						lResponse = aToken;
					},
					
					timeout: aClientTimeout,
					OnTimeout: function( aToken ) {
						lTimeoutFired = true;
					}
				}
				);

			waitsFor(
				function() {
					if( lExpectTimeout ) {
						return( lTimeoutFired === true );
					} else {
						return( lResponse.code == 0 );
					}	
				},
				lSpec,
				aClientTimeout + 1000
				);

			runs( function() {
				if( lExpectTimeout ) {
					expect( lTimeoutFired ).toEqual( true );
				} else {
					expect( lResponse.code ).toEqual( 0 );
				}	
			});

		});
	},
	
	testSessionPut: function(aKey, aValue, aPublic){
		var lSpec = this.NS + ": putting data on the server session of the client" 
		it( lSpec, function () {
			var lResponse = null;
		
			waitsFor(
				function() {
					return jws.Tests.getAdminConn() != null;
				},
				this.NS + ": waiting for admin connection",
				1000
				);

			runs(function () {
				jws.Tests.getAdminConn().sessionPut(aKey, aValue, aPublic, {
					OnResponse: function(aResponse){
						lResponse = aResponse;
					} 
				});
			})
		
			waitsFor(
				function() {
					return lResponse != null;
				},
				lSpec,
				3000
				);
		
			runs( function() {
				expect( lResponse.code ).toEqual( 0 );
			});
		});
	},

	testSessionGet: function(aKey, aPublic, aExpectedValue){
		var lSpec = this.NS + ": getting data from the server session of a given client"
		it( lSpec, function () {
			var lResponse = null;
		
			runs(function () {
				jws.Tests.getAdminConn().sessionGet(jws.Tests.getAdminConn().getId(), 
					aKey, aPublic, {
						OnResponse: function(aResponse){
							lResponse = aResponse;
						} 
					});
			})
		
			waitsFor(
				function() {
					return lResponse != null;
				},
				lSpec,
				3000
				);
		
			runs( function() {
				expect( lResponse.code ).toEqual( 0 );
				expect( lResponse.data.key ).toEqual( (aPublic) ? "public::" + aKey : aKey );
				expect( lResponse.data.value ).toEqual( aExpectedValue );
			});
		});
	},
	
	testSessionHas: function(aKey, aPublic, aExpectedValue){
		var lSpec = this.NS + ": checking if the server session of a given client has a given entry"
		it( lSpec, function () {
			var lResponse = null;
		
			runs(function () {
				jws.Tests.getAdminConn().sessionHas(jws.Tests.getAdminConn().getId(), 
					aKey, aPublic, {
						OnResponse: function(aResponse){
							lResponse = aResponse;
						} 
					});
			})
		
			waitsFor(
				function() {
					return lResponse != null;
				},
				lSpec,
				1000
				);
		
			runs( function() {
				expect( lResponse.code ).toEqual( 0 );
				expect( lResponse.data.key ).toEqual( (aPublic) ? "public::" + aKey : aKey );
				expect( lResponse.data.exists ).toEqual( aExpectedValue );
			});
		});
	},
	
	testSessionKeys: function(aPublic, aExpectedValue){
		var lSpec = this.NS + ": getting the server session keys of a given client"
		it( lSpec, function () {
			var lResponse = null;
		
			runs(function () {
				jws.Tests.getAdminConn().sessionKeys(jws.Tests.getAdminConn().getId(), 
					aPublic, {
						OnResponse: function(aResponse){
							lResponse = aResponse;
						} 
					});
			})
		
			waitsFor(
				function() {
					return lResponse != null;
				},
				lSpec,
				2000
				);
		
			runs( function() {
				expect( lResponse.code ).toEqual( 0 );
				if (!aPublic){
					// the server adds a session entry (session creation time)
					// KEEP THIS
					aExpectedValue++;
				}
				expect( lResponse.data.length >= aExpectedValue ).toEqual( true );
			});
		});
	},
	
	testSessionRemove: function(aKey, aPublic, aExpectedCode){
		var lSpec = this.NS + ": removing server session entry"
		it( lSpec, function () {
			var lResponse = null;
		
			runs(function () {
				jws.Tests.getAdminConn().sessionRemove(aKey, aPublic, {
					OnResponse: function(aResponse){
						lResponse = aResponse;
					} 
				});
			})
		
			waitsFor(
				function() {
					return lResponse != null;
				},
				lSpec,
				1000
				);
		
			runs( function() {
				expect( lResponse.code ).toEqual( aExpectedCode );
				if (0 == aExpectedCode){
					expect( lResponse.data.key ).toEqual( (aPublic) ? "public::" + aKey : aKey );
					expect( lResponse.data.value != null ).toEqual( true );
				}
			});
		});
	},
	
	testSessionGetAll: function(aPublic, aExpectedResult){
		var lSpec = this.NS + ": getting the server session keys of a given client"
		it( lSpec, function () {
			var lResponse = null;
		
			runs(function () {
				jws.Tests.getAdminConn().sessionGetAll(jws.Tests.getAdminConn().getId(), 
					aPublic, {
						OnResponse: function(aResponse){
							lResponse = aResponse;
						} 
					});
			})
		
			waitsFor(
				function() {
					return lResponse != null;
				},
				lSpec,
				3000
				);
		
			runs( function() {
				expect( lResponse.code ).toEqual( 0 );
				for (var lProp in aExpectedResult){
					expect( lResponse.data[lProp] ).toEqual( aExpectedResult[lProp] );
				}
			});
		});
	},
	
	testSessionGetMany: function(aKeys, aExpectedResult){
		var lSpec = this.NS + ": getting multiple public session entries for a given collection of clients"
		it( lSpec, function () {
			var lResponse = null;
			var lClients = [jws.Tests.getAdminConn().getId()];
			runs(function () {
				jws.Tests.getAdminConn().sessionGetMany(lClients, 
					aKeys, {
						OnResponse: function(aResponse){
							lResponse = aResponse;
						} 
					});
			})
		
			waitsFor(
				function() {
					return lResponse != null;
				},
				lSpec,
				3000
				);
		
			runs( function() {
				var lExpected = {};
				lExpected[jws.Tests.getAdminConn().getId()] = aExpectedResult;
				expect( lResponse.code ).toEqual( 0 );
				for (var i = 0; i < lClients.length; i++) {
					for (var j = 0; j < aKeys.length; j++) {
						expect( lResponse.data[lClients[i]][aKeys[j]] ).
						toEqual( lExpected[lClients[i]][aKeys[j]] );
					}
				}
			});
		});
	},
	
	runSpecs: function() {
		jws.tests.System.testLoginValidCredentials();
		jws.tests.System.testLoginInvalidCredentials();
		jws.tests.System.testSendLoopBack();

		jws.tests.System.testConnectTimeout( null, 5000, jws.OPEN );
		// jws.tests.System.testConnectTimeout( null, 20, jws.OPEN_TIMED_OUT );
		 
		// use an invalid port to simulate "server not available" case
		// jws.tests.System.testConnectTimeout( "ws://jwebsocket.org:1234", 10000, jws.CLOSED );
		// jws.tests.System.testConnectTimeout( "ws://jwebsocket.org:1234", 1000, jws.OPEN_TIMED_OUT );
	   
		// should return a result within timeout
		jws.tests.System.testResponseTimeout( 500, 100 );
		// should exceed the timeout and fire timeout event
		jws.tests.System.testResponseTimeout( 1000, 500 );
		
		// server side session management support
		jws.tests.System.testSessionPut("myVar", "myVarValue", true);
		jws.tests.System.testSessionPut("myPrivateVar", "myPrivateVarValue", false);
		jws.tests.System.testSessionGet("myVar", true, "myVarValue");
		jws.tests.System.testSessionHas("myVar", true, true);
		jws.tests.System.testSessionHas("myNonExistingVar", true, false);
		jws.tests.System.testSessionHas("myNonExistingVar", false, false);
		jws.tests.System.testSessionKeys(false, 2);
		jws.tests.System.testSessionKeys(true, 1);
		jws.tests.System.testSessionRemove("myVar", true, 0);
		jws.tests.System.testSessionRemove("myNonExistingVar", true, -1);
		jws.tests.System.testSessionRemove("myNonExistingVar", false, -1);
		jws.tests.System.testSessionKeys(false, 1);
		jws.tests.System.testSessionKeys(true, 0);
		jws.tests.System.testSessionPut("myVar2", "myVarValue2", true);
		jws.tests.System.testSessionGetAll(false, {
			"myPrivateVar": "myPrivateVarValue",
			"public::myVar2": "myVarValue2"
		});
		jws.tests.System.testSessionGetMany(["myVar2"], {
			"myVar2": "myVarValue2"
		});
		jws.tests.System.testSessionRemove("myVar2", true, 0);
		
	},

	runSuite: function() {
		var lThis = this;
		describe( "Performing test suite: " + this.NS + "...", function () {
			lThis.runSpecs();
		});
	}	

}

