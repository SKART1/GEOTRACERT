//	---------------------------------------------------------------------------
//	jWebSocket JcManager (Community Edition, CE)
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

/***
* This component handle the communication with the JavaCard controller applet ("JcControllerApplet")
* 
* 
* 
*/
var JcManager = {
	//Store JcManager listeners
	listeners: [],
                
	/**
	* Transmit a CommandAPDU to a target terminal
    * aCommandAPDU param require to be a Base64 encoded string
    *
    * @return Base64 encoded string with the response or null
    * if failure
    */
	transmit: function (aTerminalName, aCommandAPDU){
		var jc = document.getElementById('JcControllerApplet');
             
		return jc.transmit(aTerminalName, aCommandAPDU);
	},
                
	/**
    * @return The name's list of the active terminals
    */
	getActiveTerminalNames: function(){
		var jc = document.getElementById('JcControllerApplet');
		var result = jc.getActiveTerminalNames();

		if ("" == result) return [];

		return result.split(",")
	},

	OnTerminalReady: function (aTerminalName){
		console.log(">> Connected: " + aTerminalName);

		var end = this.listeners.length;
		for (i = 0; i < end; i++) {
			if (this.listeners[i]['OnTerminalReady']){
				this.listeners[i].OnTerminalReady(aTerminalName);
			}
		}
	},
                
	OnTerminalNotReady: function(aTerminalName){
		console.log("<< Disconnected: " + aTerminalName);

		var end = this.listeners.length;
		for (i = 0; i < end; i++) {
			if (this.listeners[i]['OnTerminalNotReady']){
				this.listeners[i].OnTerminalNotReady(aTerminalName);
			}
		}
	},

	/*
    * Register a JcManager listener
    */
	addListener: function(aListener){
		this.listeners.push(aListener);
	},

	/**
    * Removes a listener from JcManager
    */
	removeListener: function(aListener){
		var index = this.listeners.indexOf(aListener);
		if(-1 != index){
			this.listeners.splice(index, 1);
		}
	}
};

/**
* This methods are called from the java applet
* and cannot be renamed.
*/

//Terminal ready notification
function JcOnTerminalReady(aTerminalName){
	JcManager.OnTerminalReady(aTerminalName);
}

//Terminal not ready notification
function JcOnTerminalNotReady(aTerminalName){
	JcManager.OnTerminalNotReady(aTerminalName);
}
