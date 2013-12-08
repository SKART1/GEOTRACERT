//	---------------------------------------------------------------------------
//	jWebSocket Streaming Plug-in (Community Edition, CE)
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
//:class:*:jws.StreamingPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.StreamingPlugIn[/tt] class. This _
//:d:en:plug-in provides the methods to register and unregister at certain _
//:d:en:stream sn the server.
jws.StreamingPlugIn = {

	//:const:*:NS:String:org.jwebsocket.plugins.streaming (jws.NS_BASE + ".plugins.streaming")
	//:d:en:Namespace for the [tt]StreamingPlugIn[/tt] class.
	// if namespace changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.streaming",
			
	//:const:*:JWS_NS:String:streaming
	//:d:en:Namespace within the jWebSocketClient instance.
	// if namespace changed update the applications accordingly!
	JWS_NS: "streaming",

	//:m:*:registerStream
	//:d:en:Registers the client at the given stream on the server. _
	//:d:en:After this operation the client obtains all messages in this _
	//:d:en:stream. Basically a client can register at multiple streams.
	//:d:en:If no stream with the given ID exists on the server an error token _
	//:d:en:is returned. Depending on the type of the stream it may take more _
	//:d:en:or less time until you get the first token from the stream.
	//:a:en::aStream:String:The id of the server side data stream.
	//:r:*:::void:none
	// TODO: introduce OnResponse here too to get noticed on error or success.
	registerStream: function( aStream, aOptions ) {
		var lRes = this.createDefaultResult();
		if( this.isConnected() ) {
			this.sendToken({
				ns: jws.StreamingPlugIn.NS,
				type: "register",
				stream: aStream
			}, aOptions );
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	},

	//:m:*:unregisterStream
	//:d:en:Unregisters the client from the given stream on the server.
	//:a:en::aStream:String:The id of the server side data stream.
	//:r:*:::void:none
	// TODO: introduce OnResponse here too to get noticed on error or success.
	unregisterStream: function( aStream, aOptions ) {
		var lRes = this.createDefaultResult();
		if( this.isConnected() ) {
			this.sendToken({
				ns: jws.StreamingPlugIn.NS,
				type: "unregister",
				stream: aStream
			}, aOptions );
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	}
};

// add the StreamingPlugIn PlugIn into the jWebSocketTokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.StreamingPlugIn );
