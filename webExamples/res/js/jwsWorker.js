//	---------------------------------------------------------------------------
//	jWebSocket WebWorker Support (Community Edition, CE)
//	(supports multithreading and background processes on browser clients,
//	 given if they already support the HTML5 WebWorker standard)
//	---------------------------------------------------------------------------
//	Copyright 2010-2013 Innotrade GmbH (jWebSocket.org), Germany (NRW), Herzogenrath
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

//:i:en:This method is executed if postmessage is invoked by the caller.
onmessage = function( aEvent ) {
	// console.log( "started!" );
	// here computationally intensive processes can be run as thread.
	// aEvent.data contains the Object from the caller (application)
	var lMethod;
	eval( "lMethod=" + aEvent.data.method );

	// run the method and return the result via postmessage to the application.
	// in the application the onmessage listener of the worker is invoked
	postMessage( lMethod( aEvent.data.args ) );
};
