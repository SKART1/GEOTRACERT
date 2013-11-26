/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// example how to exchange data with a server side listener
var lToken = {
  ns: "my.namespace",
  type: "getInfo"
};
jWebSocketClient.sendToken( lToken, {
  OnResponse: function( aToken ) {
    log("Server responded: "
      + "vendor: " + aToken.vendor
      + ", version: " + aToken.version
    );
  }
});

