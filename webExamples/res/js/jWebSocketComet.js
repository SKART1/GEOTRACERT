//	---------------------------------------------------------------------------
//	jWebSocket Comet PlugIn (Community Edition, CE)
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

// @author Osvaldo Aguilar Lauzurique @email osvaldo2627@hab.uci.cu
// @author kyberneees (issues fixes)

(function() {

	XHRWebSocket = function(aUrl, aSubprotocol) {
		var self              = this;
		self.url              = (aUrl.substr(0, 2) == "ws")? "http" + aUrl.substr(2) : aUrl;
		self.subPrcol         = aSubprotocol;
		self.readyStateValues = {
			CONNECTING:0, 
			OPEN:1, 
			CLOSING:2, 
			CLOSED:3
		}
        
		self.readyState = self.readyStateValues.CONNECTING;
		self.bufferedAmount = 0;
		self.__events = {};
        
		self.__ableToSend = true;
		self.__pendingMessages = [];
		XHRWebSocket.prototype.__already = false;
        
		XHRWebSocket.prototype.addEventListener = function(aType, aListener){
			if (!(aType in this.__events)){
				this.__events[aType] = [];
			}
			this.__events[aType].push(aListener);
		};
        
		XHRWebSocket.prototype.removeEventListener = function(aType, aListener, aUseCapture) {
			if (!(aType in this.__events)) return;
			var lEvents = this.__events[aType];
			for (var lIndex = lEvents.length - 1; lIndex >= 0; --lIndex) {
				if (lEvents[lIndex] === aListener) {
					lEvents.splice(lIndex, 1);
					break;
				}
			}
		}
        
		XHRWebSocket.prototype.dispatchEvent = function(aEvent) {
			var lEvents = this.__events[aEvent.type] || [];
			for (var lIndex = 0; lIndex < lEvents.length; ++lIndex) {
				lEvents[lIndex](aEvent);
			}
			var lHandler = self["on" + aEvent.type];
			if (lHandler) lHandler(aEvent);
		}
        
		XHRWebSocket.prototype.send=function(aData){
			this.__pendingMessages.push(aData);
			if (true == this.__ableToSend){
				this.__sendMessage(this.__pendingMessages.shift());
			}
		}
        
		XHRWebSocket.prototype.close = function(){
			if (this.readyState == this.readyStateValues.CONNECTING)
				throw "The websocket connection is closing";
			else if (this.readyState == this.readyStateValues.CLOSED)
				throw "The websocket connection is already closed";
			else {
				var lMessage = this.__messageFactory({
					cometType:"message",
					readyState:3
				});
				var lJSONMessage = JSON.stringify(lMessage);
                 
				this.__handleEvent({
					type:"close"
				});
                    
				var lXHR = this.__getXHRTransport();
				lXHR.open("POST", this.url, true);
				lXHR.setRequestHeader("Content-Type", "application/x-javascript;");
      
				lXHR.onreadystatechange = function(){

					if (lXHR.readyState >= 4 && lXHR.status == 200) {				
						if (lXHR.responseText) {
							self.readyState = self.readyStateValues.CLOSED;
							setTimeout(function(){
								self.__handleEvent({
									type:"close"
								});
							}, 0)
						}	      
					}
				};
				
				lXHR.send(lJSONMessage);
			}
		}    
    
		self.__handleEvent = function(aXHREvent){
			var lEvent;
			if ( aXHREvent.type == "close" || aXHREvent.type == "open" || aXHREvent.type == "error") {
				lEvent = this.__createSimpleEvent(aXHREvent.type);
			} else if (aXHREvent.type == "message") {
				lEvent = this.__createMessageEvent("message", aXHREvent.data);
			} else {
				throw "unknown event type: " + aXHREvent.type;
			}

			this.dispatchEvent(lEvent);
		}
        
    
		self.__createSimpleEvent = function(lType) {
			if (document.createEvent && window.Event) {
				var lEvent = document.createEvent("Event");
				lEvent.initEvent(lType, false, false);
				
				return lEvent;
			} else {
				return {
					type: lType, 
					bubbles: false, 
					cancelable: false
				};
			}
		};
        
    
		self.__createMessageEvent = function(aType, aData) {
			if (document.createEvent && window.MessageEvent && !window.opera) {
				var lEvent = document.createEvent("MessageEvent");
				lEvent.initMessageEvent("message", false, false, aData, null, null, window, null);
				return lEvent;
			} else {
				// IE and Opera, the latter one truncates the data parameter after any 0x00 bytes.
				return {
					type: aType, 
					data: aData, 
					bubbles: false, 
					cancelable: false
				};
			}
		};
        
		this.__checkPendingMessage = function(){
			if (this.__pendingMessages.length > 0){
				var lData = this.__pendingMessages.shift()
				this.__sendMessage(lData);
			}
		}
       
		this.open = function(){
			if (this.readyState == this.readyStateValues.OPEN)
				throw "the connection is already opened";
			else
				this.__handleConnectionChannel();
		}
    
		this.keepConnection = function(){
			this.__handleConnectionChannel();
		}

		this.__handleConnectionChannel = function(){
            
			var lXHR = this.__getXHRTransport();
			this.__xhr = lXHR;
            
			lXHR.open("POST", this.url, true);
			lXHR.setRequestHeader("Content-Type", "application/x-javascript;");

			lXHR.onreadystatechange = function(){
				if (lXHR.readyState >= 4){
					if (lXHR.status == 200) {				
						if (lXHR.responseText) {
							var lResponse = JSON.parse(lXHR.responseText);
						
							if (lResponse.data != ""){
								setTimeout(function(){
									for (var lIndex = 0; lIndex < lResponse.data.length; lIndex++) {
										self.__handleEvent({
											type:"message",
											data: lResponse.data[lIndex]
										});
									}
								}, 0);
							}
							
							// process response from the server
							self.handleConnectionState(lResponse);
							
							// IMPORTANT: wait for the XHR connection close
							if (1 == self.readyState){
								setTimeout(function(){
									self.keepConnection();
								}, 50);
							}
						} 
					}
				}
			};
			var lMessage = this.__messageFactory({
				cometType:"connection"
			});
			var lJSONMessage = JSON.stringify(lMessage);
			
			lXHR.send(lJSONMessage);
		}
                
		this.__objectMessageBasePrototype = function(){
			var lMessage = {
				subPl: "json", //jWebSocket subprotocol support
				cometType: undefined,
				data: undefined,
				readyState: self.readyState
			}
			return lMessage;
		} 
        
		this.__sendMessage = function(aData){
			if (this.readyState == this.readyStateValues.CONNECTING){
				throw "The websocket connection has not been stablished";
			} else if (this.readyState == this.readyStateValues.CLOSED) {
				throw "The websocket connection has been closed, the message can not be sent to the server";
			} else if (this.__ableToSend == true){  
				// basic synchronism
				this.__ableToSend = false;
				
				var lMessage = this.__messageFactory({
					cometType:"message",
					data:aData
				});
				var lJSONMessage = JSON.stringify(lMessage);
				var lXHR = this.__getXHRTransport();
            
				lXHR.open("POST", this.url, true);
				lXHR.setRequestHeader("Content-Type", "application/x-javascript;");
            
				lXHR.onreadystatechange = function(){
					// the channel is released
					self.__ableToSend = true;
					
					if (lXHR.readyState >= 4 && lXHR.status == 200) {				
						if (lXHR.responseText) {
							var lResponse  = JSON.parse(lXHR.responseText)
							
							setTimeout(function(){
								for (var lIndex = 0; lIndex < lResponse.data.length; lIndex++) {
									self.__handleEvent({
										type:"message",
										data: lResponse.data[lIndex]
									});
									
								}
							}, 0);
						}
						self.__checkPendingMessage();
					}
				};
				
				// sending XHR message
				lXHR.send(lJSONMessage);
			}else{
				this.__pendingMessages.push(aData);
			}

		}
        
		this.__messageFactory = function(aArgs){
            
			var lMessage = this.__objectMessageBasePrototype();
			if (aArgs != undefined)
				if (aArgs.cometType == undefined)
					throw "Error up, type message not found";
				else{
					lMessage.cometType = aArgs.cometType;
					if (aArgs.data != undefined)
						lMessage.data = aArgs.data;
					else
						lMessage.data = undefined;
					if (aArgs.readyState != undefined)
						lMessage.readyState = aArgs.readyState;
				}
                
			return lMessage;
		}
    
		this.handleConnectionState = function(lResponse){
			if (this.readyState == this.readyStateValues.CONNECTING 
				&& lResponse.readyState == this.readyStateValues.OPEN){
				// require to affect the readyState flag before call the onopen callback
				this.readyState = lResponse.readyState;
				this.__handleEvent({
					type:"open"
				}); 
			}

			if (lResponse.readyState)
				this.readyState = lResponse.readyState;
			else
				throw "Missing 'readyState' argument from the server";

			if (this.readyState == 2 || this.readyState == 3){
				this.__handleEvent({
					type:"close"
				}); 
			}
		}
        
		this.__getXHRTransport = function(){

			var lXHR;
			if (window.XMLHttpRequest) { // Mozilla, Safari, ...
				ie = 0;
				lXHR = new XMLHttpRequest();
				if (lXHR.overrideMimeType) 
					lXHR.overrideMimeType('text/xml');
			}
			else { // IE
				ie = 1;
				try {
					lXHR = new ActiveXObject("Msxml2.XMLHTTP");
				}
				catch (e) {}
				if ( typeof httpRequest == 'undefined' ) {
					try {
						lXHR = new ActiveXObject("Microsoft.XMLHTTP");
					}
					catch (f) {}
				}
			}
			if (!lXHR) {
				throw "Cannot create an XMLHTTP instance";
				return false;
			}
			
			return lXHR ;
		}
               
		this.open();
	}

})();

