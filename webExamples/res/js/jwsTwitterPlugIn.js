//	---------------------------------------------------------------------------
//	jWebSocket Twitter Plug-in (Community Edition, CE)
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
//:class:*:jws.TwitterPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.TwitterPlugIn[/tt] class.
jws.TwitterPlugIn = {

	//:const:*:NS:String:org.jwebsocket.plugins.twitter (jws.NS_BASE + ".plugins.twitter")
	//:d:en:Namespace for the [tt]TwitterPlugIn[/tt] class.
	// if namespace is changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.twitter",

	processToken: function( aToken ) {
		// check if namespace matches
		if( aToken.ns == jws.TwitterPlugIn.NS ) {
			// here you can handle incoming tokens from the server
			// directy in the plug-in if desired.
			if( "getTimeline" == aToken.reqType ) {
				if( this.OnGotTwitterTimeline ) {
					this.OnGotTwitterTimeline( aToken );
				}
			} else if( "requestAccessToken" == aToken.reqType ) {
				if( this.OnTwitterAccessToken ) {
					this.OnTwitterAccessToken( aToken );
				}
			} else if( "event" == aToken.type ) {
				if( "status" == aToken.name && this.OnTwitterStatus ) {
					this.OnTwitterStatus( aToken );
				}
			}
		}
	},

	tweet: function( aMessage, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.TwitterPlugIn.NS,
				type: "tweet",
				message: aMessage
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	twitterRequestAccessToken: function( aCallbackURL, aOptions ) {
		// check websocket connection status
		var lRes = this.checkConnected();
		// if connected to websocket network...
		if( 0 == lRes.code ) {
			// Twitter API calls Twitter Login screen,
			// hence here no user name or password are required.
			// Pass the callbackURL to notify Web App on successfull connection
			// and to obtain OAuth verifier for user.
			var lToken = {
				ns: jws.TwitterPlugIn.NS,
				type: "requestAccessToken",
				callbackURL: aCallbackURL
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	twitterSetVerifier: function( aVerifier, aOptions ) {
		// check websocket connection status
		var lRes = this.checkConnected();
		// if connected to websocket network...
		if( 0 == lRes.code ) {
			// passes the verifier from the OAuth window
			// to the jWebSocket server.
			var lToken = {
				ns: jws.TwitterPlugIn.NS,
				type: "setVerifier",
				verifier: aVerifier
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	twitterLogin: function( aCallbackURL, aOptions ) {
		// check websocket connection status
		var lRes = this.checkConnected();
		// if connected to websocket network...
		if( 0 == lRes.code ) {
			// Twitter API calls Twitter Login screen,
			// hence here no user name or password are required.
			// Pass the callbackURL to notify Web App on successfull connection
			// and to obtain OAuth verifier for user.
			var lToken = {
				ns: jws.TwitterPlugIn.NS,
				type: "login",
				callbackURL: aCallbackURL
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	twitterLogout: function( aUsername, aPassword, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.TwitterPlugIn.NS,
				type: "logout"
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	twitterTimeline: function( aUsername, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.TwitterPlugIn.NS,
				type: "getTimeline",
				username: aUsername
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	twitterQuery: function( aQuery, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.TwitterPlugIn.NS,
				type: "query",
				query: aQuery
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	twitterTrends: function( aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.TwitterPlugIn.NS,
				type: "getTrends"
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	twitterStatistics: function( aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.TwitterPlugIn.NS,
				type: "getStatistics"
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	twitterPublicTimeline: function( aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.TwitterPlugIn.NS,
				type: "getPublicTimeline"
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	twitterSetStream: function( aFollowers, aKeywords, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.TwitterPlugIn.NS,
				type: "setStream",
				keywords: aKeywords,
				followers: aFollowers
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	twitterUserData: function( aUsername, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.TwitterPlugIn.NS,
				type: "getUserData",
				username: aUsername
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	setTwitterCallbacks: function( aListeners ) {
		if( !aListeners ) {
			aListeners = {};
		}
		if( aListeners.OnGotTwitterTimeline !== undefined ) {
			this.OnGotTwitterTimeline = aListeners.OnGotTwitterTimeline;
		}
		if( aListeners.OnTwitterStatus !== undefined ) {
			this.OnTwitterStatus = aListeners.OnTwitterStatus;
		}
		if( aListeners.OnTwitterAccessToken !== undefined ) {
			this.OnTwitterAccessToken = aListeners.OnTwitterAccessToken;
		}
	}

}

// add the JWebSocket Twitter PlugIn into the TokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.TwitterPlugIn );
