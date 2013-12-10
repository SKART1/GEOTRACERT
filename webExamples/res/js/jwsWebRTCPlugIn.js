//	---------------------------------------------------------------------------
//	jWebSocket WebRTC Plug-in (Community Edition, CE)
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
//  author: kyberneees
//
jws.WebRTC = function WebRTC(aWSC, aAppName) {
	this.WSC = aWSC;
	this.appName = aAppName;

	var self = this;
	aWSC.addPlugIn({
		processToken: function(aToken) {
			if ("event" === aToken["type"] && jws.ScriptingPlugIn.NS === aToken["ns"]) {
				if ("register" === aToken.name) {
					if (self.OnRegister) {
						self.OnRegister(aToken.user);
					}
				} else if ("unregister" === aToken.name) {
					if (self.OnUnregister) {
						self.OnUnregister(aToken.user);
					}
				}
			}
		}
	});
};

jws.WebRTC.prototype.connect = function(aUser, aOffer, aOptions) {
	this.WSC.callScriptMethod(this.appName, "Main", "connect", [aUser, aOffer], aOptions);
};

jws.WebRTC.prototype.disconnect = function(aUser, aOptions) {
	this.WSC.callScriptMethod(this.appName, "Main", "disconnect", [aUser], aOptions);
};

jws.WebRTC.prototype.register = function(aOptions) {
	this.WSC.callScriptMethod(this.appName, "Main", "register", [], aOptions);
};

jws.WebRTC.prototype.unregister = function(aOptions) {
	this.WSC.callScriptMethod(this.appName, "Main", "unregister", [], aOptions);
};

jws.WebRTC.prototype.getClients = function(aOptions) {
	this.WSC.callScriptMethod(this.appName, "Main", "getClients", [], aOptions);
};

jws.WebRTC.prototype.accept = function(aUser, aAnswer, aOptions) {
	this.WSC.callScriptMethod(this.appName, "Main", "accept", [aUser, aAnswer], aOptions);
};
