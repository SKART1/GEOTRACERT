//	---------------------------------------------------------------------------
//	jWebSocket - JWebSocketTokenListenerSample (Community Edition, CE)
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
package com.github.skart123.geotracert.geotracertserver;

import org.apache.log4j.Logger;
import org.jwebsocket.api.WebSocketPacket;
import org.jwebsocket.config.JWebSocketCommonConstants;
import org.jwebsocket.config.JWebSocketServerConstants;
import org.jwebsocket.console.SampleTokenizable;
import org.jwebsocket.kit.WebSocketServerEvent;
import org.jwebsocket.listener.WebSocketServerTokenEvent;
import org.jwebsocket.listener.WebSocketServerTokenListener;
import org.jwebsocket.logging.Logging;
import org.jwebsocket.token.Token;

/**
 * This shows an example of a simple WebSocket listener
 *
 * @author aschulze
 */
public class JWebSocketTokenListenerSample implements WebSocketServerTokenListener {

	private static Logger mLog = Logging.getLogger(null);
                
	/**
	 *
	 * @param aEvent
	 */
	@Override
	public void processOpened(WebSocketServerEvent aEvent) {
		if (mLog.isDebugEnabled()) {
			mLog.debug("Client '" + aEvent.getConnector() + "' connected.");
		}
	}

	/**
	 *
	 * @param aEvent
	 * @param aPacket
	 */
	@Override
	public void processPacket(WebSocketServerEvent aEvent, WebSocketPacket aPacket) {
		if (mLog.isDebugEnabled()) {
			mLog.debug("Processing data packet '" + aPacket.getUTF8() + "'...");
		}
		// Here you can answer an arbitrary text package...
		// this is how to easily respond to a previous client's request
		// aEvent.sendPacket(aPacket);
		// this is how to send a packet to any connector
		// aEvent.getServer().sendPacket(aEvent.getConnector(), aPacket);
	}

	/**
	 *
	 * @param aEvent
	 * @param aToken
	 */
	@Override
	public void processToken(WebSocketServerTokenEvent aEvent, Token aToken) {
		if (mLog.isDebugEnabled()) {
			mLog.debug("Client '" + aEvent.getConnector() + "' sent Token: '" + aToken.toString() + "'.");
		}
		// here you can simply interpret the token type sent from the client
		// according to your needs.
		String lNS = aToken.getNS();
		String lType = aToken.getType();

		// check if token has a type and a matching namespace
		if (lType != null && "my.namespace".equals(lNS)) {
			// if type is "getInfo" return some server information
			Token lResponse = aEvent.createResponse(aToken);
			if ("getInfo".equals(lType)) {
				lResponse.setString("vendor", JWebSocketCommonConstants.VENDOR);
				lResponse.setString("version", JWebSocketServerConstants.VERSION_STR);
				lResponse.setString("copyright", JWebSocketCommonConstants.COPYRIGHT);
				lResponse.setString("license", JWebSocketCommonConstants.LICENSE);
			} else if ("getTokenizable".equals(lType)) {
				// create a new tokenizable object and put it to the token
				SampleTokenizable lTokenizable = new SampleTokenizable(
						"Alex", "Schulze",
						"An Vieslapp 29",
						"D-52134", "Herzogenrath");
				lResponse.set(lTokenizable);
			} else {
				// if unknown type in this namespace, return corresponding error message
				lResponse.setInteger("code", -1);
				lResponse.setString("msg", "Token type '" + lType + "' not supported in namespace '" + lNS + "'.");
			}
			aEvent.sendToken(lResponse);
		}
	}

	/**
	 *
	 * @param aEvent
	 */
	@Override
	public void processClosed(WebSocketServerEvent aEvent) {
		if (mLog.isDebugEnabled()) {
			mLog.debug("Client '" + aEvent.getConnector() + "' disconnected.");
		}
	}
}
