/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
// This is the Online Battleship communication library for Javascript
var jWSC = null;

// Start the jWebSocket Stuff
// alert("Javascript is working! This is a good sign!");

// Initialize the jWebSocketClient
function initPage() {
  if (jws.browserSupportsWebSockets()) {
    jWSC = new jws.jWebSocketJSONClient();
  }
  else {
    var lMsg = lws.MSG_WS_NOT_SUPPORTED;
    alert (lMsg);
  }
}

// Close the Mage Function
function exitPage() {
  disconnect();
}

// Connection Method, but also select methods to handle everything
function connect() {
  var lURL = jws.getDefaultServerURL();

  if (jWSC.isConnected()) {
    return;
  }

  try {
    jWSC.open(lURL, {
      subProtocol: jws.WS_SUBPROT_JSON,
      openTimeout: 3000,
      OnOpenTimeout: function( aEvent ) {
        alert("Opening timeout exceeded!");
      },
      OnOpen: function ( aEvent ) {
        // alert("OnOpen Method. We are Open Now. Yay!");
      },
      OnWelcome: function ( aEvent ) {
        alert("Welcome!");
      },
      OnMessage: function (aEvent) {
        alert("We've got a message: \n" + aEvent.data);
      },
      OnReconnecting: function ( aEvent) {
        alert("Reconnecting? What does that even mean?");
      },
      OnClose: function ( aEvent ) {
        alert("Apparently I closed. Bummer");
      }
    });
  } catch (ex) {
    document.getElementById("response").innerHTML = "Connection Exception";
  }
}

// Send a message
function buttonPress()
{
  var lToken = {
    ns: "my.namespace",
    itype: "sendMove",
    data: document.getElementById("textbox").value,
    sourceId: 0,
    targetId: 0,
    responseRequested: true,
    sender: "me"
  };

  try {
    // var lRes = jWSC.echo(document.getElementById("textbox").value);
    var lRes = jWSC.sendToken(lToken);
    if ( lRes.code == 0) {
      alert("Message sent");
    }
    else {
      alert(lRes.msg);
    }
  } catch (ex ) { 
    alert("Exception: " + ex.message);
  }
}

