//	---------------------------------------------------------------------------
//	jWebSocket JMS Plug-in  (Community Edition, CE)
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

//:author:*:Johannes Smutny

//:package:*:jws
//:class:*:jws.JMSPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.JMSPlugIn[/tt] class. This _
//:d:en:plug-in provides the methods to subscribe and unsubscribe at certain _
//:d:en:channel on the server.
jws.JMSPlugIn = {
	// :const:*:NS:String:org.jwebsocket.plugins.channels (jws.NS_BASE +
	// ".plugins.jms")
	// :d:en:Namespace for the [tt]ChannelPlugIn[/tt] class.
	// if namespace changes update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.jms",
	SEND_TEXT: "sendJmsText",
	SEND_TEXT_MESSAGE: "sendJmsTextMessage",
	SEND_MAP: "sendJmsMap",
	SEND_MAP_MESSAGE: "sendJmsMapMessage",
	LISTEN: "listenJms",
	LISTEN_MESSAGE: "listenJmsMessage",
	UNLISTEN: "unlistenJms",
	listenJms: function(aConnectionFactoryName, aDestinationName,
			aPubSubDomain, aOptions) {
		var lRes = this.checkConnected();
		if (0 === lRes.code) {
			this.sendToken({
				ns: jws.JMSPlugIn.NS,
				type: jws.JMSPlugIn.LISTEN,
				connectionFactoryName: aConnectionFactoryName,
				destinationName: aDestinationName,
				pubSubDomain: aPubSubDomain
			}, aOptions);
		}
		return lRes;
	},
	listenJmsMessage: function(aConnectionFactoryName, aDestinationName,
			aPubSubDomain, aOptions) {
		var lRes = this.checkConnected();
		if (0 === lRes.code) {
			this.sendToken({
				ns: jws.JMSPlugIn.NS,
				type: jws.JMSPlugIn.LISTEN_MESSAGE,
				connectionFactoryName: aConnectionFactoryName,
				destinationName: aDestinationName,
				pubSubDomain: aPubSubDomain
			}, aOptions);
		}
		return lRes;
	},
	unlistenJms: function(aConnectionFactoryName, aDestinationName,
			aPubSubDomain, aOptions) {
		var lRes = this.checkConnected();
		if (0 === lRes.code) {
			this.sendToken({
				ns: jws.JMSPlugIn.NS,
				type: jws.JMSPlugIn.UNLISTEN,
				connectionFactoryName: aConnectionFactoryName,
				destinationName: aDestinationName,
				pubSubDomain: aPubSubDomain
			}, aOptions);
		}
		return lRes;
	},
	sendJmsText: function(aConnectionFactoryName, aDestinationName,
			aPubSubDomain, aText, aOptions) {
		var lRes = this.checkConnected();
		if (0 === lRes.code) {
			this.sendToken({
				ns: jws.JMSPlugIn.NS,
				type: jws.JMSPlugIn.SEND_TEXT,
				connectionFactoryName: aConnectionFactoryName,
				destinationName: aDestinationName,
				pubSubDomain: aPubSubDomain,
				msgPayLoad: aText
			}, aOptions);
		}
		return lRes;
	},
	sendJmsTextMessage: function(aConnectionFactoryName, aDestinationName,
			aPubSubDomain, aText, aJmsHeaderProperties, aOptions) {
		var lRes = this.checkConnected();
		if (0 === lRes.code) {
			this.sendToken({
				ns: jws.JMSPlugIn.NS,
				type: jws.JMSPlugIn.SEND_TEXT_MESSAGE,
				connectionFactoryName: aConnectionFactoryName,
				destinationName: aDestinationName,
				pubSubDomain: aPubSubDomain,
				msgPayLoad: aText,
				jmsHeaderProperties: aJmsHeaderProperties
			}, aOptions);
		}
		return lRes;
	},
	sendJmsMap: function(aConnectionFactoryName, aDestinationName,
			aPubSubDomain, aMap, aOptions) {
		var lRes = this.checkConnected();
		if (0 === lRes.code) {
			this.sendToken({
				ns: jws.JMSPlugIn.NS,
				type: jws.JMSPlugIn.SEND_MAP,
				connectionFactoryName: aConnectionFactoryName,
				destinationName: aDestinationName,
				pubSubDomain: aPubSubDomain,
				msgPayLoad: aMap
			}, aOptions);
		}
		return lRes;
	},
	sendJmsMapMessage: function(aConnectionFactoryName, aDestinationName,
			aPubSubDomain, aMap, aJmsHeaderProperties, aOptions) {
		var lRes = this.checkConnected();
		if (0 === lRes.code) {
			this.sendToken({
				ns: jws.JMSPlugIn.NS,
				type: jws.JMSPlugIn.SEND_MAP_MESSAGE,
				connectionFactoryName: aConnectionFactoryName,
				destinationName: aDestinationName,
				pubSubDomain: aPubSubDomain,
				msgPayLoad: aMap,
				jmsHeaderProperties: aJmsHeaderProperties
			}, aOptions);
		}
		return lRes;
	},
	processToken: function(aToken) {
		// check if namespace matches
		if (aToken.ns === jws.JMSPlugIn.NS) {
			// here you can handle incoming tokens from the server
			// directy in the plug-in if desired.
			if ("event" === aToken.type) {
				if ("handleJmsText" === aToken.name) {
					if (this.OnHandleJmsText) {
						this.OnHandleJmsText(aToken);
					}
				} else if ("handleJmsTextMessage" === aToken.name) {
					if (this.OnHandleJmsTextMessage) {
						this.OnHandleJmsTextMessage(aToken);
					}
				} else if ("handleJmsMap" === aToken.name) {
					if (this.OnHandleJmsMap) {
						this.OnHandleJmsMap(aToken);
					}
				} else if ("handleJmsMapMessage" === aToken.name) {
					if (this.OnHandleJmsMapMessage) {
						this.OnHandleJmsMapMessage(aToken);
					}
				}
			}
		}
	},
	setJMSCallbacks: function(aListeners) {
		if (!aListeners) {
			aListeners = {};
		}
		if (aListeners.OnHandleJmsText !== undefined) {
			this.OnHandleJmsText = aListeners.OnHandleJmsText;
		}
		if (aListeners.OnHandleJmsTextMessage !== undefined) {
			this.OnHandleJmsTextMessage = aListeners.OnHandleJmsTextMessage;
		}
		if (aListeners.OnHandleJmsMap !== undefined) {
			this.OnHandleJmsMap = aListeners.OnHandleJmsMap;
		}
		if (aListeners.OnHandleJmsMapMessage !== undefined) {
			this.OnHandleJmsMapMessage = aListeners.OnHandleJmsMapMessage;
		}
	}

};
// add the JMSPlugIn PlugIn into the jWebSocketTokenClient class
jws.oop.addPlugIn(jws.jWebSocketTokenClient, jws.JMSPlugIn);
