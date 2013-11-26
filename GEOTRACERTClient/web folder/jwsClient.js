/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
if( jws.browserSupportsWebSockets() ) {
jWebSocketClient = new jws.jWebSocketJSONClient();
// Optionally enable GUI controls here
} else {
// Optionally disable GUI controls here
var lMsg = jws.MSG_WS_NOT_SUPPORTED;
alert( lMsg );
}

