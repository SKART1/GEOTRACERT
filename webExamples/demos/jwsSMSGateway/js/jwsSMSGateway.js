//	---------------------------------------------------------------------------
//	jWebSocket SMS Gateway (Community Edition, CE)
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
 * @author mayra, vbarzana, aschulze
 */
$.widget( "jws.SMSGateway", {
	
	_init: function() {
		
		NS_SMS = jws.NS_BASE + ".plugins.sms";
		NS_JCAPTCHA = jws.NS_BASE + ".plugins.jcaptcha";

		this.ePhoneNumber = this.element.find("#phoneNumberInput");
		this.eInputFrom = this.element.find("#fromInput");
		this.eInputSMS = this.element.find("#smsInput");
		this.eTextCaptcha = this.element.find("#captchaText");
		this.eJCaptcha = this.element.find("#jcaptcha");
		this.eBtnUpdate = this.element.find("#update");
		this.eBtnSend = this.element.find("#send_button");
		this.eRSMS = this.element.find("#rsms");
		this.eBSMS = this.element.find("#bsms");
		this.eImg = this.element.find('#img');
		this.eLoginArea = this.element.find('#login_area');
		this.eCCounterArea = this.element.find('#character_counter');
		this.eCCounter = this.element.find('#character_counter .count');
		this.MAX_COUNT = 160;
		this.mCount = 0;
		this.mTXT_CAPTCHA = "Type the words here...";
		this.mMSG_CAPTCHA_ERROR = "Error found in the Captcha, the server will" +
				" send you other captcha, please try again!";
		this.mMSG_ERROR = "The following error has been encoutered: ";
		this.mMSG_SMS_SENT = "Congratulations!, you have sent a free SMS" +
				" using jWebSocket Framework";

		w.SMSGateway = this;

		// Update the counter of characters for if any change in the html
		w.SMSGateway.countCharacters();
		w.SMSGateway.doWebSocketConnection();
		w.SMSGateway.registerEvents();
	},
			
	doWebSocketConnection: function( ) {
		// Each demo will configure its own callbacks to be passed to the login widget
		// Default callbacks { OnOpen | OnClose | OnMessage | OnWelcome | OnGoodBye}
		// For more information, check the file ../../res/js/widget/wAuth.js
		var lCallbacks = {
			
			OnWelcome: function(aEvent) {
				// Ask for a new captcha image
				w.SMSGateway.getCaptcha();
			},
					
			OnClose: function(aEvent) {
				w.SMSGateway.eImg.attr("src", "css/images/blank.png");
			}
		};

		$("#demo_box").auth(lCallbacks);
	},
			
	getCaptcha: function() {

		var lToken = {
			ns: NS_JCAPTCHA,
			type: "getcaptcha",
			args: {
				imagetype: "jpg"
			}
		};

		var lCallbacks = {
			OnSuccess: function(aToken) {
				log("<b style='color:green;'>Getting a new captcha</b>");
				w.SMSGateway.eImg.attr("src", "data:image/jpg;base64," + aToken.image);
				w.SMSGateway.eTextCaptcha.focus( );
			}
		};
		
		mWSC.sendToken(lToken, lCallbacks);
	},
			
	registerEvents: function() {

		w.SMSGateway.eBtnUpdate.click(function() {
			w.SMSGateway.getCaptcha();
		});
		
		w.SMSGateway.eTextCaptcha.bind({
			
			'click | focus': function( ) {
				if ($(this).val() === w.SMSGateway.mTXT_CAPTCHA) {
					$(this).val("");
				}
			},
					
			blur: function( ) {
				if ($(this).val() === "") {
					$(this).val(w.SMSGateway.mTXT_CAPTCHA);
				}
			}
		});
		
		w.SMSGateway.eBtnSend.click(function() {
			
			var lToken = {
				ns: NS_JCAPTCHA,
				type: "validate",
				inputChars: w.SMSGateway.eTextCaptcha.val()
			};

			var lOptions = {
				
				args: {
					inputChars: w.SMSGateway.eTextCaptcha.val()
				},
				
				OnSuccess: function(aToken) {
					log("Success in the captcha validation...");
					var lSMSToken = {
						ns: NS_SMS,
						type: "sendSMS",
						to: w.SMSGateway.ePhoneNumber.val(),
						from: w.SMSGateway.eInputFrom.val(),
						message: w.SMSGateway.eInputSMS.val(),
						state: $('input[name=messageRadio]:checked').val()
					};
					log("Sending SMS...");
					var lCallbacks = {
						OnSuccess: function(aToken) {
							//function dialog(aTitle, aMessage, aIsModal, aCloseFunction)
							jwsDialog(w.SMSGateway.mMSG_SMS_SENT, "SMS sent correctly");
						},
						OnFailure: function(aToken) {
							jwsDialog(w.SMSGateway.mMSG_ERROR + aToken.msg,
									"Error sending the SMS", true);
						}
					};
					mWSC.sendToken(lSMSToken, lCallbacks);
				},
						
				OnFailure: function(aToken) {
					$("#imgCaptcha").effect("shake", {
						times: 3
					}, 100);

					log("<b style='color:red;'>Wrong captcha validation, " +
							"try another captcha</b>");
					var lGetNewCaptcha = function() {
						w.SMSGateway.getCaptcha();
						w.SMSGateway.eTextCaptcha.val("").focus();
					};
					//function dialog(aTitle, aMessage, aIsModal, aCloseFunction)
					jwsDialog(w.SMSGateway.mMSG_CAPTCHA_ERROR, "Captcha error",
							true, "alert", lGetNewCaptcha);
				}
			};
			mWSC.sendToken(lToken, lOptions);
		});

		// Handle keydown and keyup of the textarea to count the characters
		w.SMSGateway.eInputSMS.keydown(w.SMSGateway.updateCounter);
		w.SMSGateway.eInputSMS.keyup(w.SMSGateway.updateCounter);
	},
	
	countCharacters: function( ) {
		var lCount = w.SMSGateway.eInputSMS.val().length;
		w.SMSGateway.mCount = lCount;
		var lValue = w.SMSGateway.MAX_COUNT - lCount;
		// Update the counter
		w.SMSGateway.eCCounter.text(lValue > 0 ? lValue : 0);
	},
			
	// Updates the counter when a key is pressed
	updateCounter: function(aEvent) {
		w.SMSGateway.countCharacters();
		if (w.SMSGateway.mCount >= w.SMSGateway.MAX_COUNT) {
			w.SMSGateway.eInputSMS.val(w.SMSGateway.eInputSMS.val( ).substr(
					0, w.SMSGateway.MAX_COUNT));
			w.SMSGateway.eCCounterArea.attr("class", "error");
		} else {
			w.SMSGateway.eCCounterArea.attr("class", "");
		}
	}
});
