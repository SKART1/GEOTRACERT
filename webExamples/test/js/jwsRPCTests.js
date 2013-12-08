//	---------------------------------------------------------------------------
//	jWebSocket RPC-Plug-in test specs (Community Edition, CE)
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

jws.tests.RPC = {

	NS: "jws.tests.rpc", 
	
	TEST_STRING: "This is a string to be MD5'ed", 

	// this spec tests the file save method of the fileSystem plug-in
	testMD5Demo: function() {
		
		var lSpec = this.NS + ": MD5 demo (admin)";
		
		it( lSpec, function () {
			
			// init response
			var lResponse = {};

			var lClassName = "org.jwebsocket.rpc.sample.SampleRPCLibrary";
			var lMethodName = "getMD5";
			var lArguments = jws.tests.RPC.TEST_STRING;
			var lMD5 = jws.tools.calcMD5( jws.tests.RPC.TEST_STRING );

			// perform the Remote Procedure Call...
			jws.Tests.getAdminConn().rpc(
				// pass class, method and argument for server java method:
				lClassName,
				lMethodName,
				lArguments,
				{	// run it within the main thread
					spawnThread: false,
					// new easy-to-use response callback
					OnResponse: function( aToken ) {
						lResponse = aToken;
					}
				}
			);
			
			// wait for result, consider reasonably timeout
			waitsFor(
				function() {
					// check response
					return( lResponse.code !== undefined );
				},
				lSpec,
				3000
			);

			// check result if ok
			runs( function() {
				expect( lResponse.code ).toEqual( 0 );
				expect( lResponse.result ).toEqual( lMD5 );
			});

		});
	},

	runSpecs: function() {
		// run alls tests within an outer test suite
		this.testMD5Demo();
	},

	runSuite: function() {
		
		// run alls tests as a separate test suite
		var lThis = this;
		describe( "Performing test suite: " + this.NS + "...", function () {
			lThis.runSpecs();
		});
	}	

};