//	---------------------------------------------------------------------------
//	jWebSocket Sample Client PlugIn (Community Edition, CE)
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

jws.SamplesPlugIn = {

	// namespace for shared objects plugin
	// if namespace is changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.samples",

	processToken: function( aToken ) {
		// check if namespace matches
		if( aToken.ns == jws.SamplesPlugIn.NS ) {
			// here you can handle incomimng tokens from the server
			// directy in the plug-in if desired.
			if( "requestServerTime" == aToken.reqType ) {
				// this is just for demo purposes
				// don't use blocking calls here which block the communication!
				// like alert( "jWebSocket Server returned: " + aToken.time );
				if( this.OnSamplesServerTime ) {
					this.OnSamplesServerTime( aToken );
				}
			}
		}
	},

	requestServerTime: function( aOptions ) {
		var lRes = this.createDefaultResult();
		if( this.isConnected() ) {
			var lToken = {
				ns: jws.SamplesPlugIn.NS,
				type: "requestServerTime"
			};
			this.sendToken( lToken,	aOptions );
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	},

	setSamplesCallbacks: function( aListeners ) {
		if( !aListeners ) {
			aListeners = {};
		}
		if( aListeners.OnSamplesServerTime !== undefined ) {
			this.OnSamplesServerTime = aListeners.OnSamplesServerTime;
		}
	}

}

// add the JWebSocket Samples PlugIn into the TokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.SamplesPlugIn );
