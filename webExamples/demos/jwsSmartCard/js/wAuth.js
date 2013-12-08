//	---------------------------------------------------------------------------
//	jWebSocket Smartcard Demo (Community Edition, CE)
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

/*
 * 
 */
$.widget("jws.auth",{
    
	_init:function(){
		w.auth   = this;
        
		w.auth.logoffArea      = w.auth.element.find("#logoff_area");
		w.auth.logonArea       = w.auth.element.find("#login_area");
		w.auth.eUsername       = w.auth.element.find("#user_text");
		w.auth.ePassword       = w.auth.element.find("#user_password");
		w.auth.eClientStatus   = w.auth.element.find("#client_status");
		w.auth.eUserInfoName   = w.auth.element.find("#user_info_name");
		w.auth.eWebSocketType  = w.auth.element.find("#websocket_type");
		w.auth.eClientId       = w.auth.element.find("#client_id");
		w.auth.eLoginButton    = w.auth.element.find('#login_button');
		w.auth.eLogoffButton   = w.auth.element.find('#logoff_button');
        
		w.auth.logoffArea.hide();
        
		w.auth.eLoginButton.click(w.auth.logon);
		w.auth.eLogoffButton.click(w.auth.logoff);
	},
	
	logoff: function(){
		auth.logoff();
		lWSC.fUsername = null;
		w.auth.eUsername.val("");
		w.auth.ePassword.val("");
		
		resetDetails();
	},
	
	logon: function(){
		var lUsername = w.auth.eUsername.val();
		var lPassword = w.auth.ePassword.val();
		if(lUsername == "" || lPassword == ""){
			jwsDialog( "User or password are not correct, please check", "Incorrect Data" );
			return;
		}
	
		auth.logon({
			args: {
				username: lUsername,
				password: lPassword
			},
			OnFailure: function(aResponseEvent){
				log( "<font style='color:red'>Invalid credentials. Try again.</font>" );
			},
			OnSuccess: function(aResponseEvent){
				log( "<font style='color:red'>User authenticated successfully.</font>" );
				lWSC.fUsername = aResponseEvent.username;
				setTimeout(function(){
					jc.getUserInfo({
						OnSuccess: function(aResponse){
							$("#text").find("p").html("Welcome: "+ aResponse.firstname + "<br/>You are authenticated!&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
							$("#img").attr("style", "background: url(css/images/" + lWSC.fUsername + ".png)");
							$(".firstname").attr("value", aResponse.firstname);
							$(".secondname").attr("value", aResponse.secondname);
							$(".address").text(aResponse.address);
						}
						
					});
				}, 50);
			}
		});
	}
});

