//	---------------------------------------------------------------------------
//	jWebSocket Test Plug-in (Community Edition, CE)
//	---------------------------------------------------------------------------
//	Copyright 2010-2013 Innotrade GmbH (jWebSocket.org)
//	Alexander Schulze, Germany (NRW)
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

//:package:*:jws
//:class:*:jws.TestPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.TestPlugIn[/tt] class.
jws.TestPlugIn = {

	//:const:*:NS:String:org.jwebsocket.plugins.test (jws.NS_BASE + ".plugins.test")
	//:d:en:Namespace for the [tt]TestPlugIn[/tt] class.
	// if namespace is changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.test",

	processToken: function( aToken ) {
		// check if namespace matches
		if( aToken.ns == jws.TestPlugIn.NS ) {
			// here you can handle incoming tokens from the server
			// directy in the plug-in if desired.
			if( "event" == aToken.type ) {
				// callback when a server started a certain test
				if( "testStarted" == aToken.name && this.OnTestStarted ) {
					this.OnTestStarted( aToken );
				// callback when a server stopped a certain test
				} else if( "testStopped" == aToken.name && this.OnTestStopped ) {
					this.OnTestStopped( aToken );
				// event used to run a test triggered by the server
				} else if( "startTest" == aToken.name && this.OnStartTest ) {
					this.OnStartTest( aToken );
				}
			}
		}
	},

	testTimeout: function( aDelay, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.TestPlugIn.NS,
				type: "delay",
				delay: aDelay
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	testS2CPerformance: function( aCount, aMessage, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.TestPlugIn.NS,
				type: "testS2CPerformance",
				count: aCount,
				message: aMessage
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	execTests: function() {
		setTimeout( function () {
			var lReporter = new jasmine.TrivialReporter();
			jasmine.getEnv().addReporter( lReporter );
			jasmine.getEnv().execute();
		}, 1000 );
	},


	setTestCallbacks: function( aListeners ) {
		if( !aListeners ) {
			aListeners = {};
		}
		// event used to run a test triggered by the server
		if( aListeners.OnStartTest !== undefined ) {
			this.OnStartTest = aListeners.OnStartTest;
		}
		// callback when a server started a certain test
		if( aListeners.OnTestStarted !== undefined ) {
			this.OnTestStarted = aListeners.OnTestStarted;
		}
		// callback when a server stopped a certain test
		if( aListeners.OnTestStopped !== undefined ) {
			this.OnTestStopped = aListeners.OnTestStopped;
		}
	}

}

// add the JWebSocket Test PlugIn into the TokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.TestPlugIn );


jws.StopWatchPlugIn = {

	//:const:*:NS:String:org.jwebsocket.plugins.stopwatch (jws.NS_BASE + ".plugins.stopwatch")
	//:d:en:Namespace for the [tt]StopWatchPlugIn[/tt] class.
	// if namespace is changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.stopwatch",

	mLog: {},

	startWatch: function( aId, aSpec ) {
		// create new log item
		var lItem = {
			spec: aSpec,
			started: new Date().getTime()
		};
		// if an item which the given already exists
		// then simply overwrite it
		this.mLog[ aId ] = lItem;
		// and return the item
		return lItem;
	},

	stopWatch: function( aId ) {
		var lItem = this.mLog[ aId ];
		if( lItem ) {
			lItem.stopped = new Date().getTime();
			lItem.millis = lItem.stopped - lItem.started;
			return lItem;
		} else {
			return null;
		}
	},

	logWatch: function( aId, aSpec, aMillis ) {
		var lItem = {
			spec: aSpec,
			millis: aMillis
		};
		this.mLog[ aId ] = lItem ;
		return lItem;
	},

	resetWatches: function() {
		this.mLog = {};
	},

	printWatches: function() {
		for( var lField in this.mLog ) {

			var lItem = this.mLog[ lField ];
			var lOut = lItem.spec + " (" + lField + "): " + lItem.millis + "ms";

			if( window.console ) {
				console.log( lOut );
			} else {
				document.write( lOut + "<br>" );
			}
		}
	}
	
}

// add the JWebSocket Stop-Watch Plug-in into the TokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.StopWatchPlugIn );
