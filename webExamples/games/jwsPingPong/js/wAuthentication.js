//	---------------------------------------------------------------------------
//	jWebSocket Ping Pong Demo (auth) (Community Edition, CE)
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
 * @author armando
 */
$.widget("jws.authentication", {
	_init: function(  ) {
		w.auth = this;
		NS = jws.NS_BASE + '.plugins.pingpong';
		w.auth.eLogoffArea = w.auth.element.find("#logoff_area");
		w.auth.eLogonArea = w.auth.element.find("#login_area");
		w.auth.eRegisterArea = w.auth.element.find("#register_area");

		w.auth.eUsername = w.auth.element.find("#user_text");
		w.auth.ePassword = w.auth.element.find("#user_password");
		w.auth.eRegUsername = w.auth.element.find("#register_user_text");
		w.auth.eRegPassword = w.auth.element.find("#register_user_password");
		w.auth.eRegPasswordRep = w.auth.element.find("#register_user_password_repeat");

		w.auth.eClientStatus = w.auth.element.find("#client_status");
		w.auth.eUserInfoName = w.auth.element.find("#user_info_name");
		w.auth.eWebSocketType = w.auth.element.find("#websocket_type");
		w.auth.eClientId = w.auth.element.find("#client_id");

		w.auth.eLoginButton = w.auth.element.find('#login_button');
		w.auth.eRegisterButton = w.auth.element.find('#register_button');
		w.auth.eLogoffButton = w.auth.element.find('#logoff_button');
		w.auth.eShowRegArButton = w.auth.element.find('#show_register_area_button');
		w.auth.eRegLoginButton = w.auth.element.find('#register_login_button');

		w.auth.eLogoffArea.hide(  );
		//w.auth.eLogonArea.hide(  );
		w.auth.eRegisterArea.hide(  );

		w.auth.checkWebSocketSupport(  );

		w.auth.registerEvents(  );
		w.auth.onMessage(  );
	},
	checkWebSocketSupport: function(  ) {
		if (jws.browserSupportsWebSockets(  )) {
			mWSC = new jws.jWebSocketJSONClient(  );
			$.jws.setTokenClient(mWSC);
			w.auth.open(  );
		} else {
			var lMsg = jws.MSG_WS_NOT_SUPPORTED;
			alert(lMsg);
			log(lMsg);
		}
	},
	onMessage: function(  ) {
		$.jws.bind(NS + ':loggedinfo', function(aEvt, aToken) {
			w.auth.showLoggedWindow(aToken.username);
		});

		$.jws.bind(NS + ':logoff', function(aEvt, aToken) {
			w.auth.logoff( );
		});
		$.jws.bind(NS + ':userincorrect', function(aEvt, aToken) {
			dialog('Ping Pong Game', aToken.message, true);
			w.auth.messageOnBlur( );
		});
	},
	registerEvents: function(  ) {
		//adding click functions
		w.auth.eLoginButton.click(w.auth.logon);
		w.auth.eLogoffButton.click(w.auth.disconnect);
		w.auth.eRegisterButton.click(w.auth.showRegisterWindow);
		w.auth.eRegLoginButton.click(w.auth.showLoginWindow);
		w.auth.eShowRegArButton.click(w.auth.registerAccount);

		w.auth.eUsername.bind({
			focus: function(  ) {
				w.auth.messageOnClick(0);
			},
			keypress: function(aEvt) {
				if (aEvt.charCode == 13 || aEvt.keyCode == 13) {
					w.auth.ePassword.focus(  );
					w.auth.ePassword.trigger("focus");
				}
			},
			blur: function(  ) {
				w.auth.messageOnBlur(  );
			}
		});

		w.auth.ePassword.bind({
			focus: function(  ) {
				w.auth.messageOnClick(1);
			},
			keypress: function(aEvt) {
				if (aEvt.charCode == 13 || aEvt.keyCode == 13) {
					w.auth.eLoginButton.click(  );
				}
			},
			blur: function(  ) {
				w.auth.messageOnBlur(  );
			}
		});

		w.auth.eRegUsername.bind({
			focus: function(  ) {
				w.auth.messageOnClick(0);
			},
			blur: function(  ) {
				w.auth.messageOnBlur(  );
			},
			keypress: function(aEvt) {
				if (aEvt.charCode == 13 || aEvt.keyCode == 13) {
					w.auth.eRegPassword.focus(  );
					w.auth.eRegPassword.trigger("focus");
				}
			}
		});

		w.auth.eRegPassword.bind({
			focus: function(  ) {
				w.auth.messageOnClick(1);
			},
			blur: function(  ) {
				w.auth.messageOnBlur(  );
			},
			keypress: function(aEvt) {
				if (aEvt.charCode == 13 || aEvt.keyCode == 13) {
					w.auth.eRegPasswordRep.focus(  );
					w.auth.eRegPasswordRep.trigger("focus");
				}
			}
		});

		w.auth.eRegPasswordRep.bind({
			focus: function(  ) {
				w.auth.messageOnClick(2);
			},
			blur: function(  ) {
				w.auth.messageOnBlur(  );
			},
			keypress: function(aEvt) {
				if (aEvt.charCode == 13 || aEvt.keyCode == 13) {
					w.auth.eShowRegArButton.click(  );
				}
			}
		});
	},
	logon: function(  ) {
		var lUser = w.auth.eUsername.val(  );
		var lPass = w.auth.ePassword.val(  );
		w.auth.eUsername.val("");
		w.auth.ePassword.val("");

		var lArgs = {
			pwsname: lPass,
			username: lUser
		};

		if (lUser == "User" || lPass == "Password") {
			dialog('Ping Pong Game', 'User or password incorrect, please try \n\
				login again or register if you don\'t have an account yet.', true);
			w.auth.messageOnBlur(  );
		}
		else {
			$.jws.submit(NS, 'usser', lArgs);
		}
	},
	messageOnBlur: function(  ) {
		if (w.auth.eUsername.val(  ) == "") {
			w.auth.eUsername.val("User").attr("class", "disabled");
		}
		if (w.auth.ePassword.val(  ) == "") {
			w.auth.ePassword.val("Password").attr("class", "disabled");
			document.getElementById("user_password").setAttribute("type", "text");
		}
		if (w.auth.eRegUsername.val(  ) == "") {
			w.auth.eRegUsername.val("User").attr("class", "disabled");
		}
		if (w.auth.eRegPassword.val(  ) == "") {
			w.auth.eRegPassword.val("Password").attr("class", "disabled");
			document.getElementById("register_user_password").setAttribute("type", "text");
		}
		if (w.auth.eRegPasswordRep.val(  ) == "") {
			w.auth.eRegPasswordRep.val("Password").attr("class", "disabled");
			document.getElementById("register_user_password_repeat").setAttribute("type", "text");
		}
	},
	messageOnClick: function(aElement) {

		if (w.auth.eUsername.val(  ) == "User" && aElement == 0) {
			w.auth.eUsername.val("").attr("class", "enabled");
		}
		if (w.auth.ePassword.val(  ) == "Password" && aElement == 1) {
			w.auth.ePassword.val("").attr("class", "enabled");
			document.getElementById("user_password").setAttribute("type", "password");
		}
		if (w.auth.eRegUsername.val(  ) == "User" && aElement == 0) {
			w.auth.eRegUsername.val("").attr("class", "enabled");
		}
		if (w.auth.eRegPassword.val(  ) == "Password" && aElement == 1) {
			w.auth.eRegPassword.val("").attr("class", "enabled");
			document.getElementById("register_user_password").setAttribute("type", "password");
		}
		if (w.auth.eRegPasswordRep.val(  ) == "Password" && aElement == 2) {
			w.auth.eRegPasswordRep.val("").attr("class", "enabled");
			document.getElementById("register_user_password_repeat").setAttribute("type", "password");
		}
	},
	logoff: function(  ) {
		w.auth.eClientStatus.hide(  ).attr("class", "")
				.addClass("online").text("online").show( );

		w.conn.element.find("#no_users").remove(  );
		w.auth.eLogoffArea.hide(  );
		w.auth.eLogonArea.show(  );
		w.auth.messageOnBlur(  );
	},
	open: function(  ) {
		$.jws.open(  );
	},
	disconnect: function(  ) {
		$.jws.submit(NS, 'logoff');
	},
	showLoggedWindow: function(username) {
		w.auth.eLogonArea.hide(  );
		w.auth.eUserInfoName.html(username);
		w.auth.eLogoffArea.show(  );
	},
	showRegisterWindow: function(  ) {
		w.auth.eLogoffArea.hide(  );
		w.auth.eLogonArea.hide(  );
		w.auth.eRegisterArea.show(  );
		w.auth.eUsername.val("");
		w.auth.ePassword.val("");
		w.auth.eRegUsername.val("");
		w.auth.eRegPassword.val("");
		w.auth.eRegPasswordRep.val("");
		w.auth.messageOnBlur(  );
	},
	showLoginWindow: function(  ) {
		w.auth.eRegisterArea.hide(  );
		w.auth.eLogoffArea.hide(  );
		w.auth.eLogonArea.show(  );
		w.auth.eUsername.val("");
		w.auth.ePassword.val("");
		w.auth.eRegUsername.val("");
		w.auth.eRegPassword.val("");
		w.auth.eRegPasswordRep.val("");
		w.auth.messageOnBlur(  );
	},
	registerAccount: function(  ) {
		var usser = w.auth.eRegUsername.val(  );
		var pass = w.auth.eRegPassword.val(  );
		var rpass = w.auth.eRegPasswordRep.val(  );
		w.auth.eRegUsername.val("");
		w.auth.eRegPassword.val("");
		w.auth.eRegPasswordRep.val("");
		var args = {
			pwsname: pass,
			username: usser,
			rpwsname: rpass
		};
		if (usser.length > 9) {
			dialog('Ping Pong Game', 'The user must be less than 12 characters', true);
			w.auth.messageOnBlur(  );
		} else
		if (usser == "User" || pass == "Password" || rpass == "Rep Password" || rpass != pass) {
			dialog('Ping Pong Game', 'Please, check the entered information, the \n\
				user or password are not correct', true);
			w.auth.messageOnBlur(  );

		} else {
			$.jws.submit(NS, 'createaccount', args);
		}

	}
});