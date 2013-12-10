//	---------------------------------------------------------------------------
//	jWebSocket Jasmine Test Suites (Community Edition, CE)
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

// this is a suite
function runOpenCloseSuite () {

	describe( "Open/Close Test Suite", function () {
		testOpenConnections();
		testCloseConnections();
	});
}

function runBenchmarkSuite() {

	describe( "Benchmark Test Suite", function () {
		
		// open all connections
		jws.tests.Benchmarks.testOpenConnections();

		// run the benchmark
		jws.tests.Benchmarks.testBenchmark();

		// close all connections
		jws.tests.Benchmarks.testCloseConnections();
	});

}

function runDefaultAPISuite() {

	describe( "Default API test Suite", function () {

		// open all connections
		testOpenConnections();

		// get the default specs from the API
		testGetAPIDefaults();

		// run all the obtained default specs
		testRunAPIDefaults();

		// close all connections
		testCloseConnections();
	});

}

function runEventsSuite() {
	//run Events tests
	jws.myConn = new jws.jWebSocketJSONClient();
	jws.myConn.open(jws.JWS_SERVER_URL, {
		// jws.myConn.open("wss://localhost:9797/jWebSocket/jWebSocket", {
		OnWelcome: function (){
			console.log("Welcome received...");
			//Initializing events in the client... 
			//Creating the filter chain
			var securityFilter = new jws.SecurityFilter();
			securityFilter.OnNotAuthorized = function(aEvent){
			//Not Authorized global callback!
			}
			
			var cacheFilter = new jws.CacheFilter();
			cacheFilter.cache = new Cache();
			var validatorFiler = new jws.ValidatorFilter();
			
			//Creating a event notifier
			var notifier = new jws.EventsNotifier();
			notifier.ID = "notifier0";
			notifier.NS = "test";
			notifier.jwsClient = jws.myConn;
			notifier.filterChain = [securityFilter, cacheFilter, validatorFiler];
			notifier.initialize();
			  
			//Creating a plugin generator
			var generator = new jws.EventsPlugInGenerator();

			//Generating the auth & test plug-ins.
			auth = generator.generate("auth", notifier, function(){
				test = generator.generate("test", notifier, function(){
					/*
				 * Run the events test suite when generate the last plugin
				 */
					jws.tests.Events.runSuite();
				});
			});
		},
		OnClose: function(){
			if ( undefined != jwsDialog ) {
				jwsDialog( "You are not connected to the server!", "jWebSocket Message", true, "alert" );
			} else {
				alert( "You are not connected to the server!" );
			}
		},
		OnTimeout: function(){
			if ( undefined != jwsDialog ) {
				jwsDialog( "Timeout openning connection!", "jWebSocket Message", true, "alert" );
			} else {
				alert( "Timeout openning connection!" );
			}
		}
	});
}

function runFullTestSuite(aArgs) {

	/*
	debugger;
	jasmine.VERBOSE = true;
	 */
	var lIntv = jasmine.DEFAULT_UPDATE_INTERVAL;
	jasmine.DEFAULT_UPDATE_INTERVAL = 5;
	
	var lIncreaseTimeoutFactors = {
		generic: 3,
		generic_debug: 5,
		normal: 1,
		slow: 3,
		very_slow: 5,
		fast: 0.7,
		ultra_fast: 0.3,
		fastest: 0.08
	};
	jasmine.INCREASE_TIMEOUT_FACTOR = lIncreaseTimeoutFactors[aArgs.__speed] || 1;

   
	describe( "jWebSocket Test Suite", function () {
		
		if (aArgs.openConns){
			var lTestSSL = false;
			// open connections for admin and guest
			jws.Tests.testOpenSharedAdminConn();
			jws.Tests.testOpenSharedGuestConn();
			if( lTestSSL ) {
				jws.Tests.testOpenSharedAdminConnSSL();
				jws.Tests.testOpenSharedGuestConnSSL();
			}
		}
		
		if (aArgs.load){
			// run load tests
			jws.tests.Load.runSuite();
		}
		
		// run test suites for the various plug-ins
		if (aArgs.systemPlugIn){
			jws.tests.System.runSuite();
		}
		if (aArgs.filesystemPlugIn){
			jws.tests.FileSystem.runSuite();
		}
		if (aArgs.filesystemPlugInEE){
			jws.tests.enterprise.FileSystem.runSuite();
		}
		if (aArgs.itemstoragePlugIn){
			jws.tests.ItemStorage.runSuite();
		}
		if (aArgs.itemstoragePlugInEE){
			jws.tests.enterprise.ItemStorage.runSuite();
		}
		// jws.tests.Logging.runSuite();
		if (aArgs.automatedAPIPlugIn){
			jws.tests.AutomatedAPI.runSuite();
		}
		if (aArgs.rpcPlugIn){
			// run RPC tests
			jws.tests.RPC.runSuite();
		}
		// run JMS tests
		// jws.tests.JMS.runSuite();
   
		if (aArgs.channelsPlugIn){
			// run Channel tests
			jws.tests.Channels.runSuite();
		}
		
		if (aArgs.streamingPlugIn){
			// run Streaming tests
			jws.tests.Streaming.runSuite();
		}
		// run JDBC tests
		// jws.tests.JDBC.runSuite();
		
		if (aArgs.closeConns){
			// close connections for admin and guest
			jws.Tests.testCloseSharedAdminConn();
			jws.Tests.testCloseSharedGuestConn();
			if( lTestSSL ) {
				jws.Tests.testCloseSharedAdminConnSSL();
				jws.Tests.testCloseSharedGuestConnSSL();
			}
		}
		
		if (aArgs.ioc){
			//run IOC tests
			jws.tests.ioc.runSuite();
		}
		
		if (aArgs.events){
			runEventsSuite();
		}
		
		jasmine.DEFAULT_UPDATE_INTERVAL = lIntv;	
	});
}
