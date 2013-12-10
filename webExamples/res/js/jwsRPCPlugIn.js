//	---------------------------------------------------------------------------
//	jWebSocket Mail RPC/RRPC Plug-in (Community Edition, CE)
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
//:class:*:jws.RPCClientPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.RPCClientPlugIn[/tt] class.
jws.RPCClientPlugIn = {

	// granted rrpc's
	grantedProcs: [],

	// granted rrpc's
	spawnThreadDefault: false,

	//:const:*:NS:String:org.jwebsocket.plugins.rpc (jws.NS_BASE + ".plugins.rpc")
	//:d:en:Namespace for the [tt]RPCClientPlugIn[/tt] class.
	// if namespace changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.rpc",

	//:m:*:setSpawnThreadDefault
	//:d:en:set the default value of the spawnThread option
	//:a:en::aDefault:Boolean.
	//:r:*:::void:none
	setSpawnThreadDefault: function (aDefault) {
		this.spawnThreadDefault = aDefault;
	},

	//:m:*:addGrantedProcedure
	//:d:en:grant the access to a rrpc procedure
	//:a:en::aProcedure:String procedure name (including name space).
	//:r:*:::void:none
	addGrantedProcedure: function (aProcedure) {
		jws.RPCClientPlugIn.grantedProcs[ jws.RPCClientPlugIn.grantedProcs.length ] = aProcedure;
	},

	//:m:*:removeGrantedProcedure
	//:d:en:remove the access to a rrpc procedure
	//:a:en::aProcedure:String procedure name (including name space).
	//:r:*:::void:none
	removeGrantedProcedure: function (aProcedure) {
		var lIdx = jws.RPCClientPlugIn.grantedProcs.indexOf( aProcedure );
		if( lIdx >= 0 ) {
			jws.RPCClientPlugIn.grantedProcs.splice( lIdx, 1 );
		}
	},

	//:m:*:processToken
	//:d:en:Processes an incoming token from the server or a remote client. _
	//:d:en:Here the token is checked for type [tt]rrpc[/tt]. If such is _
	//:d:en:detected it gets processed by the [tt]onRRPC[/tt] method of this class.
	//:a:en::aToken:Object:Token received from the server or a remote client.
	//:r:*:::void:none
	processToken: function( aToken ) {
		// console.log( "jws.RPCClientPlugIn: Processing token " + aToken.ns + "/" + aToken.type + "..." );
		if( aToken.ns == jws.RPCClientPlugIn.NS ) {
			if( aToken.type == "rrpc" ) {
				this.onRRPC( aToken );
			}
		}
	},

	//:m:*:rpc
	//:d:en:Runs a remote procedure call (RPC) on the jWebSocket server. _
	//:d:en:The security mechanisms on the server require the call to be _
	//:d:en:granted, otherwise it gets rejected.
	//:a:en::aClass:String:Class of the method that is supposed to be called.
	//:a:en::aMthd:String:Name of the method that is supposed to be called.
	//:a:en::aArgs:Array:Arguments for method that is supposed to be called. Should always be an array, but also works with simple values. Caution with a simple array as parameter (args mus be: [[1,2..]]).
	//:a:en::aOptions:Object:Optional arguments. For details please refer to the [tt]sendToken[/tt] method.
	//:r:*:::void:none
	rpc: function( aClass, aMthd, aArgs, aOptions) {
		if (aArgs != null && !(aArgs instanceof Array)) {
			aArgs = [aArgs];
		}
		aOptions = this.setDefaultOption (aOptions) ;
		var lRes = this.createDefaultResult();
		if( this.isConnected() ) {
			this.sendToken({
				ns: jws.RPCClientPlugIn.NS,
				type: "rpc",
				classname: aClass,
				method: aMthd,
				args: aArgs
				},
				aOptions
			);
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	},

	setDefaultOption: function( aOptions ) {
		if (aOptions === undefined) {
			aOptions = {} ;
		}
		if (aOptions.spawnThread === undefined) {
			aOptions.spawnThread = this.spawnThreadDefault;
		}
		return aOptions ;
	},

	//:m:*:rrpc
	//:d:en:Runs a reverse remote procedure call (RRPC) on another client.
	//:a:en::aTarget:String:Id of the target remote client.
	//:a:en::aClass:String:Class of the method that is supposed to be called.
	//:a:en::aMthd:String:Name of the method that is supposed to be called.
	//:a:en::aArgs:Array:Arguments for method that is supposed to be called.
	//:a:en::aOptions:Object:Optional arguments. For details please refer to the [tt]sendToken[/tt] method.
	//:r:*:::void:none
	rrpc: function( aTarget, aClass, aMthd, aArgs, aOptions ) {
		if (aArgs != null && !(aArgs instanceof Array)) {
			aArgs = [aArgs];
		}
		aOptions = this.setDefaultOption (aOptions) ;
		var lRes = this.createDefaultResult();
		if( this.isConnected() ) {
			this.sendToken({
				ns: jws.RPCClientPlugIn.NS,
				type: "rrpc",
				targetId: aTarget,
				classname: aClass,
				method: aMthd,
				args: aArgs
			},
			aOptions
			);
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	},

	//:m:*:onRRPC
	//:d:en:Processes a remote procedure call from another client. _
	//:d:en:This method is called internally only and should not be invoked _
	//:d:en:by the application.
	//:a:en::aToken:Object:Token that contains the rrpc arguments from the source client.
	//:r:*:::void:none
	onRRPC: function( aToken ) {
		var lClassname = aToken.classname;
		var lMethod = aToken.method;
		var lArgs = aToken.args;
		var lPath = lClassname + "." + lMethod;
		// check if the call is granted on this client
		if( jws.RPCClientPlugIn.grantedProcs.indexOf( lPath ) >= 0 ) {
			var lFunctionSplit = lClassname.split( '.' );
			var lFunctionSplitSize = lFunctionSplit.length;
			var lTheFunction = window[ lFunctionSplit[ 0 ] ] ;
			for( var j = 1; j < lFunctionSplitSize; j++ ) {
				lTheFunction = lTheFunction[ lFunctionSplit[ j ] ];
			}
			var lRes;
			try {
				lRes = lTheFunction[ lMethod ].apply( null, lArgs);
			} catch (ex) {
				//TODO: send back the error under a better format
				lRes = ex
					+ "\nProbably a typo error (method called="
					+ lMethod
					+ ") or wrong number of arguments (args: "
					+ JSON.stringify(lArgs)
					+ ")";
			}
		} else {
			//TODO: send back the error under a better format
			lRes =
			+ "\nAcces not granted to the="
			+ lMethod;
		}
		this.sendToken({
				// ns: jws.SystemPlugIn.NS,
				type: "send",
				targetId: aToken.sourceId,
				result: lRes,
				reqType: "rrpc",
				code: 0
			},null // aOptions
		);
	}
}

// add the JWebSocket RPC PlugIn into the BaseClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.RPCClientPlugIn );
