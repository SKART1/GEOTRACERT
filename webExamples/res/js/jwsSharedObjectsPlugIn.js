//	---------------------------------------------------------------------------
//	jWebSocket Shared Objects Plug-in (Community Edition, CE)
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

jws.SharedObjectsPlugIn = {

	// namespace for shared objects plugin
	// if namespace is changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.sharedObjs",
	// if data types are changed update server plug-in accordingly!
	DATA_TYPES: [ "number", "string", "boolean", "object", "set", "list", "map", "table" ],

	fObjects: {},

	processToken: function( aToken ) {
		// console.log( "jws.SharedObjectsPlugIn: Processing token " + aToken.ns + "/" + aToken.type + "..." );
		if( aToken.ns == jws.SharedObjectsPlugIn.NS ) {
			if( aToken.name == "created" ) {
				// create a new object on the client
				if( this.OnSharedObjectCreated ) {
					this.OnSharedObjectCreated( aToken );
				}
			} else if( aToken.name == "destroyed" ) {
				// destroy an existing object on the client
				if( this.OnSharedObjectDestroyed ) {
					this.OnSharedObjectDestroyed( aToken );
				}
			} else if( aToken.name == "updated" ) {
				// update an existing object on the client
				if( this.OnSharedObjectUpdated ) {
					this.OnSharedObjectUpdated( aToken );
				}
			} else if( aToken.name == "init" ) {
				// init all shared object on the client
				if( this.OnSharedObjectsInit ) {
					var lObj = JSON.parse( aToken.value );
					this.OnSharedObjectsInit( aToken, lObj );
				}
			}
		}
	},

	createSharedObject: function( aId, aDataType, aValue, aOptions ) {
		var lRes = this.createDefaultResult();
		if( this.isConnected() ) {
			var lToken = {
				ns: jws.SharedObjectsPlugIn.NS,
				type: "create",
				id: aId,
				datatype: aDataType,
				value: aValue
			};
			this.sendToken( lToken,	aOptions );
			if( this.OnSharedObjectCreated ) {
				this.OnSharedObjectCreated( lToken );
			}
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	},

	destroySharedObject: function( aId, aDataType, aOptions ) {
		var lRes = this.createDefaultResult();
		if( this.isConnected() ) {
			var lToken = {
				ns: jws.SharedObjectsPlugIn.NS,
				type: "destroy",
				id: aId,
				datatype: aDataType
			};
			this.sendToken( lToken, aOptions );
			if( this.OnSharedObjectDestroyed ) {
				this.OnSharedObjectDestroyed( lToken );
			}
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	},

	getSharedObject: function( aId, aDataType, aOptions ) {
		var lRes = this.createDefaultResult();
		if( this.isConnected() ) {
			var lToken = {
				ns: jws.SharedObjectsPlugIn.NS,
				type: "get",
				id: aId,
				datatype: aDataType
			};
			this.sendToken( lToken,	aOptions );
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	},

	updateSharedObject: function( aId, aDataType, aValue, aOptions ) {
		var lRes = this.createDefaultResult();
		if( this.isConnected() ) {
			var lToken = {
				ns: jws.SharedObjectsPlugIn.NS,
				type: "update",
				id: aId,
				datatype: aDataType,
				value: aValue
			};
			this.sendToken( lToken,	aOptions );
			if( this.OnSharedObjectUpdated ) {
				this.OnSharedObjectUpdated( lToken );
			}
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	},

	setSharedObjectsCallbacks: function( aListeners ) {
		if( !aListeners ) {
			aListeners = {};
		}
		if( aListeners.OnSharedObjectCreated !== undefined ) {
			this.OnSharedObjectCreated = aListeners.OnSharedObjectCreated;
		}
		if( aListeners.OnSharedObjectDestroyed !== undefined ) {
			this.OnSharedObjectDestroyed = aListeners.OnSharedObjectDestroyed;
		}
		if( aListeners.OnSharedObjectUpdated !== undefined ) {
			this.OnSharedObjectUpdated = aListeners.OnSharedObjectUpdated;
		}
		if( aListeners.OnSharedObjectsInit !== undefined ) {
			this.OnSharedObjectsInit = aListeners.OnSharedObjectsInit;
		}
	},

	initSharedObjects: function( aOptions ) {
		var lRes = this.createDefaultResult();
		if( this.isConnected() ) {
			var lToken = {
				ns: jws.SharedObjectsPlugIn.NS,
				type: "init"
			};
			this.sendToken( lToken,	aOptions );
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	}

}

// add the JWebSocket Shared Objects PlugIn into the TokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.SharedObjectsPlugIn );
