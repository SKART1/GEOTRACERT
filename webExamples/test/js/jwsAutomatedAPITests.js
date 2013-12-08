//	---------------------------------------------------------------------------
//	jWebSocket Automated API test specs (Community Edition, CE)
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

jws.tests.AutomatedAPI = {

	NS: "jws.tests.automated", 
	mSpecs: [],

	testGetAPIDefaults: function() {

		var lSpec = this.NS + ": Running default API spec";

		it( lSpec, function () {

			var lDone = false;

			// start stop watch for this spec
			jws.StopWatchPlugIn.startWatch( "defAPIspec", lSpec );

			// we need to "control" the server to broadcast to all connections here
			var lConn = new jws.jWebSocketJSONClient();

			// open a separate control connection
			lConn.open(jws.getDefaultServerURL(), {

				OnWelcome: function () {
					var lAPIPlugIn = new jws.APIPlugIn();
					lConn.addPlugIn( lAPIPlugIn );
					// request the API of the benchmark plug-in
					lAPIPlugIn.getPlugInAPI(
						"jws.benchmark", {
						// if API received successfully run the tests...
						OnResponse: function( aServerPlugIn ) {
							jws.tests.AutomatedAPI.mSpecs = 
								lAPIPlugIn.createSpecFromAPI( lConn, aServerPlugIn );
							lDone = true;
						},
						OnTimeout: function() {
							lConn.close();
							lDone = true;
						}
					});
				}
			});

			waitsFor(
				function() {
					return lDone == true;
				},
				"Running against API...",
				3000
			);

			runs( function() {
				expect( lDone ).toEqual( true );

				// stop watch for this spec
				jws.StopWatchPlugIn.stopWatch( "defAPIspec" );
			});
		});
	},

	testRunAPIDefaults: function() {
		it( this.NS + ": Running default tests", function() {
			eval( 
				"  for( var i = 0; i < jws.tests.AutomatedAPI.mSpecs.length; i++ ) { "
				+ "  jws.tests.AutomatedAPI.mSpecs[ i ]();"
				+ "}"
			);
		});
	},

	runSpecs: function() {
		// get the default specs from the API
		this.testGetAPIDefaults();
		// run all the obtained default specs
		// this.testRunAPIDefaults();
	},

	runSuite: function() {
		var lThis = this;
		describe( "Performing test suite: " + this.NS + "...", function () {
			lThis.runSpecs();
		});
	}	

};