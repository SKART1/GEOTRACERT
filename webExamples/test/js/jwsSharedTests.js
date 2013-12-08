//	---------------------------------------------------------------------------
//	jWebSocket Shared test specs (Community Edition, CE)
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

// namespace
jws.tests = {};

// main test class
jws.Tests = {

	NS: "jws.tests", 

	MAX_CONNECTIONS: 50,
	OPEN_CONNS_TIMEOUT: 30000,
	CLOSE_CONNS_TIMEOUT: 30000,

	ADMIN_USER: "root",
	ADMIN_PWD: "root",

	GUEST_USER: "guest",
	GUEST_PWD: "guest",

	mAdminConn: null,
	mGuestConn: null,
	
	mAdminConnSSL: null,
	mGuestConnSSL: null,
	
	mTestConnsOpened: 0,
	mTestConns: [],
	
	getAdminConn: function() {
		return this.mAdminConn;
	},
	
	setAdminConn: function( aConn ) {
		this.mAdminConn = aConn;
	},
	
	getGuestConn: function() {
		return this.mGuestConn;
	},
	
	setGuestConn: function( aConn ) {
		this.mGuestConn = aConn;
	},

	getAdminConnSSL: function() {
		return this.mAdminConnSSL;
	},
	
	setAdminConnSSL: function( aConn ) {
		this.mAdminConnSSL = aConn;
	},
	
	getGuestConnSSL: function() {
		return this.mGuestConnSSL;
	},
	
	setGuestConnSSL: function( aConn ) {
		this.mGuestConnSSL = aConn;
	},

	getTestConns: function() {
		return this.mTestConns;
	},

	// this spec tries to open a connection to be shared across multiple tests
	testOpenSharedAdminConn: function() {
		var lSpec = this.NS + ": Opening shared connection with administrator role";
		it( lSpec, function () {

			// we need to "control" the server to broadcast to all connections here
			jws.Tests.setAdminConn( new jws.jWebSocketJSONClient() );
			var lResponse = {};

			// open a separate control connection
			jws.Tests.getAdminConn().logon( jws.getDefaultServerURL(), 
				jws.Tests.ADMIN_USER, 
				jws.Tests.ADMIN_PWD, {
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
				3000
			);

			runs( function() {
				expect( lResponse.username ).toEqual( jws.Tests.ADMIN_USER );
			});
		});
	},

	// this spec tries to open a SSL connection to be shared across multiple tests
	testOpenSharedAdminConnSSL: function() {
		var lSpec = this.NS + ": Opening shared SSL connection with administrator role";
		it( lSpec, function () {

			// we need to "control" the server to broadcast to all connections here
			jws.Tests.setAdminConnSSL( new jws.jWebSocketJSONClient() );
			var lResponse = {};

			// open a separate control connection
			jws.Tests.getAdminConnSSL().logon( jws.getDefaultSSLServerURL(), 
				jws.Tests.ADMIN_USER, 
				jws.Tests.ADMIN_PWD, {
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
				3000
			);

			runs( function() {
				expect( lResponse.username ).toEqual( jws.Tests.ADMIN_USER );
			});
		});
	},

	// this spec tries to open a connection to be shared across multiple tests
	testCloseSharedAdminConn: function() {
		var lSpec = this.NS + ": Closing shared connection with administrator role";
		it( lSpec, function () {

			// open a separate control connection
			jws.Tests.getAdminConn().close({
				timeout: 3000
			});

			waitsFor(
				function() {
					return( !jws.Tests.getAdminConn().isOpened() );
				},
				lSpec,
				3000
			);

			runs( function() {
				expect( jws.Tests.getAdminConn().isOpened() ).toEqual( false );
			});
		});
	},

	// this spec tries to open a SSL connection to be shared across multiple tests
	testCloseSharedAdminConnSSL: function() {
		var lSpec = this.NS + ": Closing shared SSL connection with administrator role";
		it( lSpec, function () {

			// open a separate control connection
			jws.Tests.getAdminConnSSL().close({
				timeout: 3000
			});

			waitsFor(
				function() {
					return( !jws.Tests.getAdminConnSSL().isOpened() );
				},
				lSpec,
				3000
			);

			runs( function() {
				expect( jws.Tests.getAdminConnSSL().isOpened() ).toEqual( false );
			});
		});
	},

	// this spec tries to open a connection to be shared across multiple tests
	testOpenSharedGuestConn: function() {
		var lSpec = this.NS + ": Opening shared connection with guest role";
		it( lSpec, function () {

			// we need to "control" the server to broadcast to all connections here
			jws.Tests.setGuestConn( new jws.jWebSocketJSONClient() );
			var lResponse = {};

			// open a separate control connection
			jws.Tests.getGuestConn().logon( jws.getDefaultServerURL(), 
				jws.Tests.GUEST_USER, 
				jws.Tests.GUEST_PWD, {
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
				3000
			);

			runs( function() {
				expect( lResponse.username ).toEqual( jws.Tests.GUEST_USER );
			});
		});
	},

	// this spec tries to open a connection to be shared across multiple tests
	testOpenSharedGuestConnSSL: function() {
		var lSpec = this.NS + ": Opening shared SSL connection with guest role";
		it( lSpec, function () {

			// we need to "control" the server to broadcast to all connections here
			jws.Tests.setGuestConnSSL( new jws.jWebSocketJSONClient() );
			var lResponse = {};

			// open a separate control connection
			jws.Tests.getGuestConnSSL().logon( jws.getDefaultSSLServerURL(), 
				jws.Tests.GUEST_USER, 
				jws.Tests.GUEST_PWD, {
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
				3000
			);

			runs( function() {
				expect( lResponse.username ).toEqual( jws.Tests.GUEST_USER );
			});
		});
	},

	// this spec tries to open a connection to be shared across multiple tests
	testCloseSharedGuestConn: function() {
		var lSpec = this.NS + ": Closing shared connection with guest role";
		it( lSpec, function () {

			// open a separate control connection
			jws.Tests.getGuestConn().close({
				timeout: 3000
			});

			waitsFor(
				function() {
					return( !jws.Tests.getGuestConn().isOpened() );
				},
				lSpec,
				3000
			);

			runs( function() {
				expect( jws.Tests.getGuestConn().isOpened() ).toEqual( false );
			});
		});
	},

	// this spec tries to open a connection to be shared across multiple tests
	testCloseSharedGuestConnSSL: function() {
		var lSpec = this.NS + ": Closing shared SSL connection with guest role";
		it( lSpec, function () {

			// open a separate control connection
			jws.Tests.getGuestConnSSL().close({
				timeout: 3000
			});

			waitsFor(
				function() {
					return( !jws.Tests.getGuestConnSSL().isOpened() );
				},
				lSpec,
				3000
			);

			runs( function() {
				expect( jws.Tests.getGuestConnSSL().isOpened() ).toEqual( false );
			});
		});
	},

	// this spec opens all connections
	testOpenConnections: function() {
		var lSpec = "Opening " + jws.Tests.MAX_CONNECTIONS + " connections";
		it( lSpec, function () {

			// reset all watches
			jws.StopWatchPlugIn.resetWatches();

			// start stop watch for this spec
			jws.StopWatchPlugIn.startWatch( "openConn", lSpec );

			for( var lIdx = 0; lIdx < jws.Tests.MAX_CONNECTIONS; lIdx++ ) {

				this.getTestConns()[ lIdx ] = new jws.jWebSocketJSONClient();
				this.getTestConns()[ lIdx ].open( jws.getDefaultServerURL(), {

					OnOpen: function () {
						this.mTestConnsOpened++;
					},

					OnClose: function () {
						this.mTestConnsOpened--;
					},

					OnToken: function( aToken ) {
						if ( "s2c_performance" == aToken.type
								&& NS_BENCHMARK == aToken.ns ) {
							lPacketsReceived++;
						}
					}

				});
			}

			// wait for expected connections being opened
			waitsFor(
				function() {
					return this.mTestConnsOpened == jws.Tests.MAX_CONNECTIONS;
				},
				"opening connection...",
				jws.Tests.OPEN_CONNS_TIMEOUT
			);

			runs(
				function () {
					expect( this.mTestConnsOpened ).toEqual( jws.Tests.MAX_CONNECTIONS );
					// stop watch for this spec
					jws.StopWatchPlugIn.stopWatch( "openConn" );
				}
			);

		});
	},

	// this spec closes all connections
	testCloseConnections: function() {
		var lSpec = "Closing " + jws.Tests.MAX_CONNECTIONS + " connections";
		it( lSpec, function () {

			// start stop watch for this spec
			jws.StopWatchPlugIn.startWatch( "closeConn", lSpec );

			for( var lIdx = 0; lIdx < jws.Tests.MAX_CONNECTIONS; lIdx++ ) {
				this.getTestConns()[ lIdx ].close({
					timeout: 3000,
					// fireClose: true,
					// noGoodBye: true,
					noLogoutBroadcast: true,
					noDisconnectBroadcast: true
				});
			}

			// wait for expected connections being opened
			waitsFor(
				function() {
					return this.mTestConnsOpened == 0;
				},
				"closing connections...",
				jws.Tests.CLOSE_CONNS_TIMEOUT
			);

			runs(
				function () {
					expect( this.mTestConnsOpened ).toEqual( 0 );

					// stop watch for this spec
					jws.StopWatchPlugIn.stopWatch( "closeConn" );

					// print all watches to the console
					jws.StopWatchPlugIn.printWatches();

					// reset all watches
					jws.StopWatchPlugIn.resetWatches();
				}
			);
		});
	}
	

};