//	---------------------------------------------------------------------------
//	jWebSocket Mail Plug-in (Community Edition, CE)
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

//:package:*:jws
//:class:*:jws.MailPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.MailPlugIn[/tt] class.
//:d:en:This jWebSocket mail plug-in allows to send text or html mails _
//:d:en:including uploading of attachments.
jws.MailPlugIn = {

	//:const:*:NS:String:org.jwebsocket.plugins.mail (jws.NS_BASE + ".plugins.mail")
	//:d:en:Namespace for the [tt]MailPlugIn[/tt] class.
	// if namespace is changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.mail",
	HTML_MAIL: true,
	TEXT_MAIL: false,

	//:m:*:processToken
	//:d:en:Processes an incoming token from the server side Mail plug-in and _
	//:d:en:checks if certains events have to be fired. _
	//:d:en:If e.g. the request type was [tt]sendMail[/tt] and data is _
	//:d:en:returned the [tt]OnMailSent[/tt] event is fired. Normally this _
	//:d:en:method is not called by the application directly.
	//:a:en::aToken:Object:Token to be processed by the plug-in in the plug-in chain.
	//:r:*:::void:none
	processToken: function( aToken ) {
		// check if namespace matches
		if( aToken.ns == jws.MailPlugIn.NS ) {
			// here you can handle incomimng tokens from the server
			// directy in the plug-in if desired.
			if( "sendMail" == aToken.reqType ) {
				if( this.OnMailSent ) {
					this.OnMailSent( aToken );
				}
			} else if( "createMail" == aToken.reqType ) {
				if( this.OnMailCreated ) {
					this.OnMailCreated( aToken );
				}
			}
		}
	},

	//:m:*:sendMail
	//:d:en:Sends the mail identified by the given Id to the mail server. _
	//:d:en:To create please refer to the [tt]createMail[/tt] method, which _
	//:d:en:delivers an id to be used to refer to the mail to be sent. _
	//:d:en:You can add attachments with [tt]addAttachment[/tt] or drop the mail with [tt]dropMail[/tt] before sending.
	//:a:en::aId:String:Id of the mail to be sent to the mail server.
	//:a:en::aOptions:Object:Optional arguments, please refer to the [tt]sendToken[/tt] method of the [tt]jWebSocketTokenClient[/tt] class for details.
	//:r:*:::void:none
	sendMail: function( aId, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.MailPlugIn.NS,
				type: "sendMail",
				id: aId
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	//:m:*:createMail
	//:d:en:Creates a new mail on the server and returns its id to the client to add attachment
	//:d:en:You can directly send the mail by using the [tt]sendMail[/tt] method, 
	//:d:en:add attachments with [tt]addAttachment[/tt] before sending or _
	//:d:en:drop the mail with [tt]dropMail[/tt].
	//:a:en::aFrom:String:From e-mail address of the sender (attention: this field may by defaulted/ignored by certain mailserves).
	//:a:en::aTo:String:To e-mail address of the recepient(s).
	//:a:en::aCC:String:CC (Carbon Copy) addresses of the recepient(s).
	//:a:en::aCC:String:BCC (Blind Carbon Copy) addresses of the recepient(s).
	//:a:en::aSubject:String:Subject (title) of the e-mail.
	//:a:en::aSubject:String:Body (message) of the e-mail, can be either plain text or HTML, identified by aIsHTML.
	//:a:en::aIsHTML:Boolean:Specifies if the body is passed as plain text ([tt]false[/tt]) or as formatted HTML ([tt]true[/tt]).
	//:a:en::aOptions:Object:Optional arguments, please refer to the [tt]sendToken[/tt] method of the [tt]jWebSocketTokenClient[/tt] class for details.
	//:r:*:::void:none
	createMail: function( aFrom, aTo, aCC, aBCC, aSubject, aBody, aIsHTML, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.MailPlugIn.NS,
				type: "createMail",
				from: aFrom,
				to: aTo,
				cc: aCC,
				bcc: aBCC,
				subject: aSubject,
				body: aBody,
				isHTML: aIsHTML
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	//:m:*:dropMail
	//:d:en:Drops the mail identified by the given Id to the mail server. All _
	//:d:en:attachments and other references like embedded images are also _
	//:d:en:removed from the server. If the no mail with the given Id exists _
	//:d:en:on the server an error token will be returned.
	//:a:en::aId:String:Id of the mail to be sent to the mail server.
	//:a:en::aOptions:Object:Optional arguments, please refer to the [tt]sendToken[/tt] method of the [tt]jWebSocketTokenClient[/tt] class for details.
	//:r:*:::void:none
	dropMail: function( aId, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.MailPlugIn.NS,
				type: "dropMail",
				id: aId
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	//:m:*:addAttachment
	//:d:en:Add an attachment (file) to the mail on the server identified _
	//:d:en:by its Id.
	//:a:en::aId:String:Id of the mail to add an attachment.
	//:a:en::aFilename:String:name of the file to be attached.
	//:a:en::aData:String:Data of the file to be attached (base64 encoded).
	//:a:en::aOptions:Object:Optional arguments, please refer to the [tt]sendToken[/tt] method of the [tt]jWebSocketTokenClient[/tt] class for details.
	//:a:en:aOptions:archiveName:String:Optional, if given all attachments will be archived (e.g. in a .rar or .zip file), needs to be configured accordingly on the server.
	//:a:en:aOptions:volumeSize:Integer:Optional, if an archive is choosen it will be automatically splitted in mutliple volumes to avoid e-mail size limitations.
	//:r:*:::void:none
	addAttachment: function( aId, aFilename, aData, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lEncoding = "base64";
			var lSuppressEncoder = false;
			var lScope = jws.SCOPE_PRIVATE;
			var lVolumeSize = null;
			var lArchiveName = null;
			if( aOptions ) {
				if( aOptions.scope != undefined ) {
					lScope = aOptions.scope;
				}
				if( aOptions.encoding != undefined ) {
					lEncoding = aOptions.encoding;
				}
				if( aOptions.suppressEncoder != undefined ) {
					lSuppressEncoder = aOptions.suppressEncoder;
				}
				if( aOptions.volumeSize != undefined ) {
					lVolumeSize = aOptions.volumeSize;
				}
				if( aOptions.archiveName != undefined ) {
					lArchiveName = aOptions.archiveName;
				}
			}
			if( !lSuppressEncoder ) {
				if( lEncoding == "base64" ) {
					aData = Base64.encode( aData );
				}
			}
			var lToken = {
				ns: jws.MailPlugIn.NS,
				type: "addAttachment",
				encoding: lEncoding,
				id: aId,
				data: aData,
				filename: aFilename
			};
			if( lVolumeSize ) {
				lToken.volumeSize = lVolumeSize;
			}
			if( lArchiveName ) {
				lToken.archiveName = lArchiveName;
			}
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
		
	},

	removeAttachment: function( aId, aOptions ) {
		
	},

	getMail: function( aId, aOptions ) {
		
	},

	moveMail: function( aId, aOptions ) {
		
	},

	setMailCallbacks: function( aListeners ) {
		if( !aListeners ) {
			aListeners = {};
		}
		if( aListeners.OnMailSent !== undefined ) {
			this.OnMailSent = aListeners.OnMailSent;
		}
		if( aListeners.OnMailCreated !== undefined ) {
			this.OnMailCreated = aListeners.OnMailCreated;
		}
	}

}

// add the jWebSocket Mail PlugIn into the TokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.MailPlugIn );
