/* 
 * @author vbarzana
 */

function init(){
	w                   = {};
	mLog                = {};
	mLog.isDebugEnabled = true;
    
	//executing widgets
	$("#log_box").log();
	$("#demo_box").auth();
	
	w.auth.eUsername.val("");
	w.auth.ePassword.val("");
	
	
	checkWebSocketSupport();	
}

function checkWebSocketSupport(){
	if( jws.browserSupportsWebSockets() ) {
		lWSC = new jws.jWebSocketJSONClient();
		lWSC.open(jws.JWS_SERVER_URL, {
			OnOpen: function(aToken){
				if(mLog.isDebugEnabled){
					log( "<font style='color:#888'>jWebSocket connection established.</font>" );
					log( "<font style='color:#888'>Generating server side plugins...</font>" );
				}
				//Creating the filter chain
				securityFilter = new jws.SecurityFilter();
				securityFilter.OnNotAuthorized = function(aEvent){
					log("<b><font color='red'>Failure: </font></b><br/>&nbsp;NOT AUTHORIZED to notify an event with id '" + aEvent.type + "'. Logon first!");
				}
			
				cacheFilter = new jws.CacheFilter();
				cacheFilter.cache = new Cache();
				validatorFiler = new jws.ValidatorFilter();
			
				//Creating a event notifier
				notifier = new jws.EventsNotifier();
				notifier.ID = "notifier0";
				notifier.NS = "jc";
				notifier.jwsClient = lWSC;
				
				notifier.filterChain = [securityFilter, cacheFilter, validatorFiler];
				notifier.initialize();
			  
				//Creating a plugin generator
				generator = new jws.EventsPlugInGenerator();

				//Generating the auth & test plug-ins.
				auth = generator.generate("auth", notifier, function(){
					log( "<font style='color:red'>Authentication plugin generated.</font>" );
				});
				jc = generator.generate("jc.auth", notifier, function(){
					log( "<font style='color:red'>SmartCard plugin generated.</font>" );			
					jc.transmit = function(e){
						var lResponseAPDU = JcManager.transmit(e.terminal, e.apdu);		
						return lResponseAPDU;
					}
								
					JcManager.addListener({
						OnTerminalReady: function(aTerminal){
							
							jc.terminalReady({
								args: {
									terminal: aTerminal
								},
								OnSuccess: function(aToken){
									if (!lWSC.isLoggedIn() || lWSC.getUsername() == "anonymous"){
										jc.login({
											OnSuccess: function(aToken){
												w.auth.eUsername.val(aToken.response.username);
												w.auth.ePassword.val(aToken.response.password);
											
												w.auth.logon();
											},
											OnFailure: function(aToken){
												log(JSON.stringify(aToken));
											}
										});
									}
								}
							});
						},
						OnTerminalNotReady: function(aTerminal){
							jc.terminalNotReady({
								args: {
									terminal: aTerminal
								}
							});
							
							if (lWSC.isLoggedIn() && lWSC.getUsername() != "anonymous")
								w.auth.logoff();
						}
					});
				});
				
			}, 
			OnWelcome: function( aEvent )  {
				w.auth.logonArea.hide();
				w.auth.logoffArea.fadeIn(200);
                
				if(mLog.isDebugEnabled){
					log( "<font style='color:red'>jWebSocket Welcome received.</font>" );
				}
			},
			OnGoodBye: function( aEvent )  {
				if(mLog.isDebugEnabled){
					log( "<font style='color:red'>jWebSocket GoodBye received.</font>" );
				}
			},

			OnToken: function( aToken ) {
				if( aToken.ns == "org.jwebsocket.auth" ) {
					console.log( "TYPE: " + JSON.stringify(aToken) );
					if( aToken.type == "logon" ) {
					console.log( "LOGIN" );
						w.auth.eUsername.val(aToken.user);
						w.auth.ePassword.val(aToken.password);
						w.auth.logon();
					} else if( aToken.type == "logoff" ) {
						console.log( "LOGOFF" );
						if (lWSC.isLoggedIn())
							w.auth.logoff();
					}
				}
			},
			
			OnMessage: function( aEvent, aToken ) {
				var lDate = "";
				if( aToken.date_val ) {
					lDate = jws.tools.ISO2Date( aToken.date_val );
				}
				log( "<font style='color:#888'>jWebSocket '" + aToken.type + "' token received, full message: '" + aEvent.data + "' " + lDate + "</font>" );
				if( lWSC.isLoggedIn() && lWSC.getUsername() != "anonymous" ) {
					w.auth.eUserInfoName.text(aToken.username);
					w.auth.eClientId.text("Client-ID: " + ( lWSC.getId()));
					w.auth.logonArea.hide();
					w.auth.logoffArea.fadeIn(300);
					w.auth.eClientStatus.hide().removeClass("offline").removeClass("online").addClass("authenticated").text("authenticated").show();
				} else {
					w.auth.eUserInfoName.text("-");
					w.auth.eClientId.text("Client-ID: " + ( lWSC.getId()));
					w.auth.logoffArea.hide();
					w.auth.logonArea.fadeIn(300);
					w.auth.eClientStatus.hide().removeClass("authenticated").removeClass("offline").addClass("online").text("connected").show();
				}
				w.auth.eWebSocketType.text("WebSocket: " + (jws.browserSupportsNativeWebSockets ? "(native)" : "(flashbridge)" ));
			},
			
			OnClose: function( aEvent ) {
				if(mLog.isDebugEnabled){
					log( "<font style='color:#888'>jWebSocket connection closed.</font>" );
				}
				w.auth.logoffArea.hide();
				w.auth.logonArea.fadeIn(300);
				w.auth.eUserInfoName.text("");
				w.auth.eClientId.text("Client-ID: -");
				w.auth.eClientStatus.removeClass("online").removeClass("online").addClass("offline").text("disconnected");
				w.auth.eUsername.focus();
			}
		})
	} else {
		var lMsg = jws.MSG_WS_NOT_SUPPORTED;
		alert( lMsg );
		log( lMsg );
	}
}

function resetDetails(){
	$("#text").find("p").html("Welcome: Anonymous<br/>You are not authenticated!&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
	$("#img").attr("style", "background: url(css/images/.png)");
	$(".firstname").attr("value", "");
	$(".secondname").attr("value", "");
	$(".address").text("");

}

$(document).ready(function(){
	init();
});
