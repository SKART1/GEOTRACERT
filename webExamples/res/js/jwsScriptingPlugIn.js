//	---------------------------------------------------------------------------
//	jWebSocket Scripting Plug-in (Community Edition, CE)
//	---------------------------------------------------------------------------
//	Copyright 2010-2013 Innotrade GmbH (jWebSocket.org)
//  Alexander Schulze, Germany (NRW)
//
//	Licensed under the Apache License, Version 2.0 (the 'License');
//	you may not use this file except in compliance with the License.
//	You may obtain a copy of the License at
//
//	http://www.apache.org/licenses/LICENSE-2.0
//
//	Unless required by applicable law or agreed to in writing, software
//	distributed under the License is distributed on an 'AS IS' BASIS,
//	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//	See the License for the specific language governing permissions and
//	limitations under the License.
//	---------------------------------------------------------------------------

//:package:*:jws
//:class:*:jws.ScriptingPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.ScriptingPlugIn[/tt] class.
//:d:en:This client-side plug-in provides the API to access the features of the _
//:d:en:Scripting plug-in on the jWebSocket server.
jws.ScriptingPlugIn = {
	//:const:*:NS:String:org.jwebsocket.plugins.scripting (jws.NS_BASE + '.plugins.scripting')
	//:d:en:Namespace for the [tt]ScriptingPlugIn[/tt] class.
	// if namespace is changed update server plug-in accordingly!
	NS: jws.NS_BASE + '.plugins.scripting',
	//:const:*:JWS_NS:String:scripting
	//:d:en:Namespace within the jWebSocketClient instance.
	// if namespace changed update the applications accordingly!
	JWS_NS: 'scripting',
			
	//:m:*:callScriptMethod
	//:d:en:Calls an script application published object method. 
	//:a:en::aApp:String:The script application name
	//:a:en::aObjectId:String:The published object identifier
	//:a:en::aMethod:String:The method name
	//:a:en::aArgs:Array:The method calling arguments
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:r:*:::void:none
	callScriptMethod: function(aApp, aObjectId, aMethod, aArgs, aOptions) {
		var lRes = this.checkConnected();
		if (0 === lRes.code) {
			var lToken = {
				ns: jws.ScriptingPlugIn.NS,
				type: 'callMethod',
				method: aMethod,
				objectId: aObjectId,
				app: aApp,
				args: aArgs
			};
			this.sendToken(lToken, aOptions);
		}
		return lRes;
	},
			
	//:m:*:reloadScriptApp
	//:d:en:Reloads an script application in runtime.
	//:a:en::aApp:String:The script application name
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:r:*:::void:none
	reloadScriptApp: function(aApp, aOptions) {
		var lRes = this.checkConnected();
		if (0 === lRes.code) {
			var lToken = {
				ns: jws.ScriptingPlugIn.NS,
				type: 'reloadApp',
				app: aApp
			};
			this.sendToken(lToken, aOptions);
		}
		return lRes;
	},
			
	//:m:*:sendScriptToken
	//:d:en:Sends a token to an script application.
	//:a:en::aApp:String:The script application name
	//:a:en::aToken:Object:The token to be sent
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:r:*:::void:none		
	sendScriptToken: function(aApp, aToken, aOptions) {
		var lRes = this.checkConnected();
		if (0 === lRes.code && aToken) {
			aToken.app = aApp;
			aToken.ns = jws.ScriptingPlugIn.NS;
			aToken.type = 'token';

			this.sendToken(aToken, aOptions);
		}
		return lRes;
	}

};

// add the JWebSocket Scripting PlugIn into the TokenClient class
jws.oop.addPlugIn(jws.jWebSocketTokenClient, jws.ScriptingPlugIn);
