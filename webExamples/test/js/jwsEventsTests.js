//	---------------------------------------------------------------------------
//	jWebSocket Event Plug-in test specs (Community Edition, CE)
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

jws.tests.Events = {

	NS: "jws.tests.events", 
	authenticated: false,

	// this spec tests the login operation of the test application
	testLogon: function() {
		
		var lSpec = this.NS + ": logon";
		
		it( lSpec, function () {

			var lResponse = null;
			var lUsername = "kyberneees";
			auth.logon({
				args: {
					username: lUsername,
					password: "123"
				},
				OnResponse: function(aResponse){
					lResponse = aResponse;
				}
			});

			waitsFor(
				function() {
					return( lResponse != null );
				},
				lSpec,
				5000
				);

			runs( function() {
				expect( lResponse.code ).toEqual( 0 );
				expect( lResponse.username ).toEqual( lUsername );
				expect( lResponse.uuid ).toEqual( lUsername );
				expect( lResponse.roles instanceof Array ).toEqual( true );
				jws.tests.Events.authenticated = true;
			});
		});
	},
	
	// this spec tests the logoff operation of the test application
	testLogoff: function() {
		
		var lSpec = this.NS + ": logoff";
		
		it( lSpec, function () {
			var lResponse = null;
			
			waitsFor(function(){
				return jws.tests.Events.authenticated;
			});
			
			auth.logoff({
				OnResponse: function(aResponse){
					lResponse = aResponse;
				}
			});

			waitsFor(
				function() {
					return( lResponse != null );
				}, lSpec, 5000
				);

			runs( function() {
				expect( lResponse.code ).toEqual( 0 );
				jws.tests.Events.authenticated = false;
			});
		});
	},
	
	// this spec tests the getEventsInfo operation of the test application
	testGetEventsInfo: function() {
		
		var lSpec = this.NS + ": getEventsInfo";
		
		it( lSpec, function () {
			var lResponse = null;
			
			test.getEventsInfo({
				OnResponse: function(aResponse){
					lResponse = aResponse;
				}
			});

			waitsFor(
				function() {
					return( lResponse != null );
				}, lSpec, 5000
				);

			runs( function() {
				expect( lResponse.code ).toEqual( 0 );
				expect( lResponse.table ).toBeTypeOf("object");
				expect( lResponse.table.name ).toBeTypeOf("string");
				expect( lResponse.table.version ).toBeTypeOf("string");
			});
		});
	},
	
	// this spec tests the S2C event notification operation of the test application
	testS2CEventNotification: function() {
		
		var lSpec = this.NS + ": S2CEventNotification";
		
		it( lSpec, function () {
			var lX = 0;
			var lY = 0;
			var lCalled = false;
			
			test.plusXY = function(e){
				lX = e.x;
				lY = e.y;
				lCalled = true;
				
				return e.x + e.y;
			}
			
			test.s2cNotification();

			waitsFor(
				function() {
					return lCalled;
				}, lSpec, 5000
				);

			runs( function() {
				expect( lX + lY ).toEqual( 10 );
			});
		});
	},

	
	runSpecs: function() {
		jws.tests.Events.testLogon();
		jws.tests.Events.testLogoff();
		jws.tests.Events.testGetEventsInfo();
		jws.tests.Events.testS2CEventNotification();
	},

	runSuite: function() {
		var lThis = this;
		describe( "Performing test suite: " + this.NS + "...", function () {
			lThis.runSpecs();
		});
	}	

}

