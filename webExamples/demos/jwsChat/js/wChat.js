//	---------------------------------------------------------------------------
//	jWebSocket Chat Plug-in (Community Edition, CE)
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


/**
 * jWebSocket Chat Widget
 * @author Victor Antonio Barzana Crespo
 */
$.widget( "jws.chat", {
	_init:function( ) {
		
		this.mIsPublicActive		= false;
		this.mUserColors			= {
			// Color RED for the system logs
			SYS: "#FF0000",
			// Color BLUE for the personal logs
			USR: "#0000FF"
		};
		this.mSelectionStart		= null;
		this.mSelectionEnd			= null;
		this.mOnlineClients			= [ ];
		this.mPrivateClients		= { };
		this.mPrivateUnreadMessages = 0;
		
		this.mEmoticons				= {
			// Faces with 2 chars
			":-)": "smile",
			":)": "smile",
			"=)": "smile",
			":(": "sad",
			"=(": "sad",
			":-(": "sad",
			":p": "tongue",
			"=p": "tongue",
			":-p": "tongue",
			";)": "wink",
			";-)": "wink",
			":d": "smile-big",
			"=d": "smile-big",
			":-d": "smile-big",
			":-*": "kiss",
			":*": "kiss",
			":o": "surprise",
			"{3": "heart",
			":]": "embarrassed",
			":{": "sick",
			"+1": "opinion-agree",
			"-1": "opinion-disagree",
			"{/3": "heart-broken",
			"(r)": "rose",
			":;(": "crying",
			":?": "confused",
			"-){": "jWebSocketLogo"
		};
		this.mEmoticonsPath			= "css/images/emoticons/";
		
		// Here will be stored the current ID that you are chatting with
		this.mPrivateChatWith		= null;
		
		this.mAuthenticatedUser		= null;
		
		// Default namespace for demos org.jwebsocket.plugins.chat
		this.NS						= jws.NS_BASE + ".plugins.chat";
		this.mNextWindowId			= 1;
		
		// MESSAGEBOX
		this.eMessageBoxArea		= this.element.find( "#message_box" );
		this.eMessageBox			= this.element.find( "#message_box_text" );
		this.eChatTitle				= this.element.find( "#chat_box_header" );
		this.ePublicUsersBox		= this.element.find( "#public_users_box_body" );
		this.ePrivateUsersBox		= this.element.find( "#users_box_body" );
		this.eLogPrivate			= this.element.find( "#chat_box_history .private" );
		this.eLogPublic				= this.element.find( "#chat_box_history .public" );
		// Area to show the new incoming messages
		this.eUnreadMessages		= this.element.find( "#new_message_notification" );
		
		// BUTTONS
		this.eBtnPrivateChat		= this.element.find( "#btn_private_chat" );
		this.eBtnPublicChat			= this.element.find( "#btn_public_chat" );
		this.eBtnBroadcast			= this.element.find( "#message_box_broadcast_btn" );
		this.eBtnClear				= this.element.find( "#message_box_clear_btn" );
		this.eBtnNewChatWindow		= this.element.find( "#new_box_chat_btn" );
		
		// EMOTICONS
		this.eEmoticonsWindow		= this.element.find( "#select_emoticon_window" );
		this.eBtnActiveEmoticon		= this.element.find( "#selected_emoticon" );
		this.eBtnMoreEmoticons		= this.element.find( "#show_more_emoticons" );
		this.eBtnCloseEmotWindow	= this.element.find( "#close_emoticon_window" );
		this.eMainContainer			= $( "#demo_box" );
		
		// Messages used in the widget
		this.MSG_NOT_CONNECTED_USERS= "There are not connected users";
		this.MSG_USER_OFFLINE		= "The user you are chatting with is offline";
		this.MSG_COULDNT_SEND_MSG	= "The message could not be sent";
		this.MSG_TYPE_YOUR_MSG		= "Type your message...";
		this.MSG_NOT_CONNECTED_JWS	= "Sorry, you are not connected with " + 
		"jWebSocket server, try clicking the login button!";
		
		// CSS RULES
		this.CSS_CLIENT_ID			= "client_id";
		this.CSS_NEW_MSG			= "new_message";
		this.CSS_NO_USERS_ONLINE	= "no_users_online";
		this.CSS_ACTIVE				= "active";
		this.CSS_ONLINE				= "online";
		this.CSS_OFFLINE			= "offline";
		this.CSS_PUBLIC_ONLINE		= "public_online";
		this.CSS_EMOTICON_BTN		= "emoticon_btn";
		this.CSS_OPAQUE				= "opaque";
		this.CSS_DARK				= "dark";
		this.CSS_REM_PRIV_CLIENT	= "remove_private_client";
		this.CSS_HISTORY			= "history";
		this.CSS_TITLE				= "title";
		
		w.chat = this;
		// Executing some init functions
		//		w.chat.switchPrivate( );
		w.chat.switchPublic( );
		w.chat.eUnreadMessages.hide( );
		w.chat.eEmoticonsWindow.hide( );
		w.chat.loadEmoticons( );
		w.chat.registerEvents( );
	},
    
	registerEvents: function( ) {
		//MESSAGE BOX EVENTS
		w.chat.eMessageBox.click( w.chat.messageBoxClick );
		w.chat.eMessageBox.blur( w.chat.messageBoxBlur );
		w.chat.eMessageBox.keypress( w.chat.messageBoxKeyPressed );
		w.chat.eMessageBox.focus( w.chat.messageBoxClick );
		
		//CHAT BOX SWITCHER
		w.chat.eBtnPrivateChat.click( w.chat.switchPrivate );
		w.chat.eBtnPublicChat.click( w.chat.switchPublic );
		
		// BUTTONS ACTIONS
		w.chat.eBtnBroadcast.click( w.chat.sendMessage );
		w.chat.eBtnClear.click( w.chat.clearChatLog );
		
		w.chat.eBtnNewChatWindow.click( w.chat.openNewChatWindow );
		
		// EMOTICONS
		w.chat.eBtnMoreEmoticons.click( function( ) {
			w.chat.eEmoticonsWindow.show( );
		});
		
		w.chat.eBtnActiveEmoticon.click( w.chat.addEmoticon );
		
		w.chat.eBtnCloseEmotWindow.click( function( ) {
			w.chat.eEmoticonsWindow.hide( );
		});
		
		// For more information, check the file ../../res/js/widget/wAuth.js
		var lCallbacks = {
			OnOpen: function( aEvent ) {
				// Enabling all elements in the chat window again
				w.chat.eMessageBoxArea.children( ).each( function( ) {
					$( this ).attr( "disabled", false );
				});
			},
			OnWelcome: function( aEvent ) {
			},
			OnGoodBye: function( aEvent ) {
			},
			OnMessage: function( aEvent, aToken ) {
				w.chat.processToken( aEvent, aToken );
			},
			// When closing clear all chat panels and users
			OnClose: function( aEvent ) {
				w.chat.cleanAll( );
				w.chat.eMessageBoxArea.children( ).each( function( ) {
					$( this ).attr( "disabled", true );
				});
			}
		};
		$( w.chat.eMainContainer ).auth( lCallbacks );
	},
	
	openNewChatWindow: function( ) {
		window.open( 
			// "http://www.jwebsocket.org/demos/jwsChat/jwsChat.htm"
			"jwsChat.htm",
			"chatWindow" + w.chat.mNextWindowId,
			"width=720,height=700,left=" + 
			( 50 + w.chat.mNextWindowId * 30 ) + ", top=" + 
			( 50 + w.chat.mNextWindowId * 25 ));
		w.chat.mNextWindowId++;
		if( w.chat.mNextWindowId > 10 ) {
			w.chat.mNextWindowId = 1;
		}
	},
	sendMessage: function( ) {
		if( mWSC.isConnected( ) ) {
//			if( w.chat.mOnlineClients.length > 0 ) {
				var lMessage = w.auth.cleanHTML( w.chat.eMessageBox.val( ) );
				if( lMessage &&  w.chat.MSG_TYPE_YOUR_MSG != lMessage ) {
					if( w.chat.mIsPublicActive ) {
						w.chat.sendBroadcastMessage( lMessage );
					// Only send if is chatting with someone
					} else if( w.chat.mPrivateChatWith ) {
						w.chat.sendPrivateMessage( w.chat.mPrivateChatWith, lMessage );
					}
				}
				w.chat.eMessageBox.val( "" ).focus( );
//			} else {
//				jwsDialog( w.chat.MSG_NOT_CONNECTED_USERS, 
//					"No users online", true, "alert" );
//			}
		} else {
			jwsDialog( w.chat.MSG_NOT_CONNECTED_JWS, "Not connected", true, 
				"alert" );
		}
	},
	
	sendBroadcastMessage: function( aMessage ) {
		// Preparing broadcast Token
		var lBroadcastToken = {
			ns: w.chat.NS,
			type: "broadcast",
			msg: aMessage
		};
		// If no message is defined an error comes from the server
		var lCallbacks = {
			OnFailure: function( aToken ) {
				jwsDialog( aToken.msg, "Empty Message" );
			}
		};
		// Sending the broadcast message to the server
		mWSC.sendToken( lBroadcastToken, lCallbacks );
	},
	
	sendPrivateMessage: function( aTargetId, aMessage ) {
		if( aTargetId ) {
			var lArray = w.chat.mPrivateChatWith.split( "@" );
			var lTargetId = lArray[ 1 ];
			
			if( w.chat.isUserOnline( lTargetId ) ) {
				if( aMessage != null || aMessage != "" ) {
					// Preparing broadcast Token
					var lMessageToken = {
						ns: w.chat.NS,
						type: "messageTo",
						msg: aMessage,
						targetId: lTargetId
					};
					// If no message is defined an error comes from the server
					var lCallbacks = {
						OnFailure: function( aToken ) {
							jwsDialog( aToken.msg, w.chat.MSG_COULDNT_SEND_MSG, 
								false, "alert" );
						}
					};
					// Sending the broadcast message to the server
					mWSC.sendToken( lMessageToken, lCallbacks );
					// w.chat.logChatMessage( aClientId, aMessage, aIsPrivate );
					var lOnlineId = mWSC.getUsername( ) + "@" + mWSC.getId( );
					w.chat.logChatMessage( lOnlineId, aMessage, true );
				}
			}else {
				jwsDialog( w.chat.MSG_USER_OFFLINE, "User offline",
					false, "alert" );
			}
			
			
		}
	},
	
	processToken: function( aEvent, aToken ) {
		if( aToken ) {
			// is it a response from a previous request of this client?
			if( aToken.type == "response" ) {
				// figure out of which request
				if( aToken.reqType == "login" ) {
					if( aToken.code == 0 ) {
						// logChatMessage( aID, aString )
						w.chat.logChatMessage( "SYS", "Welcome '" + 
							aToken.username + "'" );
						w.chat.mAuthenticatedUser = aToken.username + "@" + 
						aToken.sourceId;
						// Sending a register token to the server
						var lRegister = {
							ns: w.chat.NS,
							type: "register"
						};
						mWSC.sendToken( lRegister );
						
						// select message field for convenience
						w.chat.eMessageBox.focus( );
					}
				}
			// is it an event w/o a previous request ?
			} else if( aToken.type == "getChatClients" ) {
				w.chat.setClients( aToken.clients );
			} else if( aToken.type == "event" ) {
				if( "logout" == aToken.name || "disconnect" == aToken.name ) {
					if( w.chat.isUserOnline( aToken.sourceId ) ) {
						log( "The client " + aToken.sourceId + " has left the chat" );
					}
					w.chat.removeClient( aToken.sourceId );
				}
			} else if( aToken.type == "goodBye" ) {
				w.chat.logChatMessage( "SYS", 
					"Chat PlugIn says good bye ( reason: " + aToken.reason + " )!" );
				
			// is it any token from another client
			} else if( aToken.type == "broadcast" ) {
				if( aToken.msg && aToken.sourceId ) {
					//logChatMessage( aID, aString )
					log( "New <b>public </b>message received: " + 
						JSON.stringify( aToken ) );
					w.chat.logChatMessage( aToken.sourceId, 
						w.auth.cleanHTML( aToken.msg ) );
				}
			} else if( aToken.type == "newClientConnected" ) {
				log( aToken.msg + " " + aToken.sourceId );
				w.chat.addClient( aToken.sourceId );
			} else if( aToken.type == "messageTo" ) {
				log( "<b>New private message received:</b> " + 
					JSON.stringify( aToken ) );
				w.chat.onPrivateMessage( aToken );
			}
		}
	},
	
	onPrivateMessage: function( aToken ) {
		// If the user is in the public area, hint new message incoming
		if( w.chat.mIsPublicActive ) {
			var lQuantity = w.chat.eUnreadMessages.text( );
			
			w.chat.eUnreadMessages.text( parseInt( parseInt( lQuantity ) + 1 ) )
			.fadeIn( 300 ).fadeOut( 100 ).fadeIn( 300 ).fadeOut( 100 ).fadeIn( 100 );
			
			w.chat.addPrivateTab( aToken.sourceId );
			
		} else{
			// If the user is standing in the private area
			// add a Class to the unread tabs messages
			w.chat.addPrivateTab( aToken.sourceId );
			w.chat.notifyTabWithMessage( aToken.sourceId );
		}
		w.chat.logChatMessage( aToken.sourceId, aToken.msg, true );
	},
	
	addPrivateTab: function( aSourceId ) {
		var lMsgNoUsersOnline = w.chat.ePrivateUsersBox.find( '.' + 
			w.chat.CSS_NO_USERS_ONLINE );
		if( lMsgNoUsersOnline ) {
			lMsgNoUsersOnline.remove( );
		}
		
		var lFullId  = aSourceId.split( "@" );
		var lId  = lFullId[1];
		
		var lTab = null;
		w.chat.ePrivateUsersBox.children( ).each( function( ) {
			if( "_" + lId == $( this ).attr( "id" ) ) {
				lTab = $( this );
			}
		});
		
		// If exists the tab, don't create it
		if( !lTab ) {
			var lPrivateItem = $( '<div class="' + w.chat.CSS_ONLINE + 
				'" id="_'+ lId + '">'+ 
				'<div class="' + w.chat.CSS_CLIENT_ID + '">' + aSourceId +
				'</div></div>' );
			
			var lCloseButton = $( '<div class="' + w.chat.CSS_REM_PRIV_CLIENT + 
				'">x</div>' );
			lCloseButton.click( function( ) {
				$( '.tooltip' ).hide( ).remove( );
				var lNext = lPrivateItem.next( );
				var lPrev = lPrivateItem.prev( );
				
				if ( lNext.get( 0 ) ) {
					w.chat.setTabActive( 
						lNext.find( '.' + w.chat.CSS_CLIENT_ID ).text( ) );
				} else if( lPrev.get( 0 ) ) {
					w.chat.setTabActive( 
						lPrev.find( '.' + w.chat.CSS_CLIENT_ID ).text( ) );
				} else{
					w.chat.startConversationWith( null );
					w.chat.switchPublic( );
				}
				lPrivateItem.remove( );
			});
			
			lPrivateItem.append( lCloseButton );
			
			lPrivateItem.click( function( ) {
				w.chat.startConversationWith( aSourceId );
			});
			
			var lColor = w.chat.getClientColor( aSourceId );
			lPrivateItem.css( {
				color: lColor
			});
		
			lPrivateItem.click( function( ) {
				w.chat.addPrivateTab( aSourceId );
				w.chat.startConversationWith( aSourceId );
			});
			
			w.chat.ePrivateUsersBox.append( lPrivateItem );
		}
	
	},
	
	setTabActive: function( aClientId ) {
		var lFullId  = aClientId.split( "@" );
		var lId  = lFullId[1];
		
		w.chat.ePrivateUsersBox.children( ).each( function( ) {
			if( "_" + lId == $( this ).attr( "id" ) ) {
				$( this ).addClass( w.chat.CSS_ACTIVE ).removeClass( 
					w.chat.CSS_NEW_MSG );
			} else{
				$( this ).removeClass( w.chat.CSS_ACTIVE );
			}
		});
	},
	
	notifyTabWithMessage: function( aSourceId ) {
		if( aSourceId != w.chat.mPrivateChatWith ) {
			var lFullId  = aSourceId.split( "@" );
			var lId  = lFullId[1];
		
			var lTab = null;
			w.chat.ePrivateUsersBox.children( ).each( function( ) {
				if( "_" + lId == $( this ).attr( "id" ) ) {
					lTab = $( this );
				}
			});
			if( lTab.hasClass( w.chat.CSS_NEW_MSG ) ) {
				lTab.fadeTo( 300, 0.25 ).fadeTo( 300, 0.80 )
				.fadeTo( 300, 0.25 ).fadeTo( 300, 1 );
			}else {
				lTab.addClass( w.chat.CSS_NEW_MSG );
			}
		} else{
			
		}
		
	},
	
	startConversationWith: function( aClientId ) {
		if ( aClientId ) {
			w.chat.mPrivateChatWith = aClientId;
		
			w.chat.eChatTitle.html( "User: " + "<b>" + aClientId + "</b>" );
			
			// Change to the private area
			if( w.chat.mIsPublicActive ) {
				w.chat.switchPrivate( );
			}
			
			// Load the history for this user
			w.chat.switchHistory( aClientId );
			
			// Enable the tab of the client you want to chat with
			w.chat.setTabActive( aClientId );
			
			// Set the cursor to start typing
			w.chat.eMessageBox.focus( );
		} else {
			w.chat.eChatTitle.html( "User: ?" );
			w.chat.mPrivateChatWith = null;
			w.chat.switchHistory( null );
		}
	},
	
	isUserOnline: function( lTargetId ) {
		for( var lIndex in w.chat.mOnlineClients ) {
			if( w.chat.mOnlineClients[ lIndex ] == lTargetId ) {
				return true;
			}
		}
		return false;
	},
	
	/**
	 * Changes the history of the chat window between two users
	 **/
	switchHistory: function( aClientId ) {
		if( aClientId ) {
			var lHistory = w.chat.mPrivateClients[ aClientId ];
			if( lHistory ) {
				w.chat.eLogPrivate.html( lHistory );
				return;
			}
		}
		w.chat.eLogPrivate.html( "" );
	},
	
	/**
	 * Logs a message in the public window
	 **/
	logChatMessage: function( aClientId, aMessage, aIsPrivate ) {
		// set a default user name if not yet logged in
		if( !aClientId ) {
			aClientId = mWSC.getUsername( ) + "@" + mWSC.getId( );
		}
		var lHistoryItem = $( '<div class="' + w.chat.CSS_HISTORY + '"></div>' ),
		lIsMe = aClientId == w.chat.mAuthenticatedUser?"me":aClientId,
		lEUsername = $( '<div class="' + w.chat.CSS_TITLE + '">'+ 
			lIsMe + ": " + '</div>' ),
		lColor = w.chat.getClientColor( aClientId );
		
		if( lColor != null ) {
			lEUsername.css( {
				"color": lColor
			});
		}
		
		lHistoryItem.append( lEUsername );
		
		var lParsedMessage = w.chat.parseEmoticons( aMessage );
		lHistoryItem.append( '<div class="text">'+ lParsedMessage +'</div>' );
		
		// Save the history of all private messages
		if( aIsPrivate ) {
			// If the user selected someone to chat with
			var lPrivateHistory = $( '<div></div>' ).append( lHistoryItem );
			if( w.chat.mPrivateChatWith == aClientId || 
				aClientId == w.chat.mAuthenticatedUser ) {
				
				w.chat.eLogPrivate.append( lPrivateHistory );
				
				// Scroll to the bottom of the conversation
				w.chat.eLogPrivate.scrollTop( w.chat.eLogPrivate.get( 0 ).scrollHeight -
					w.chat.eLogPrivate.get( 0 ).clientHeight );
			
				// Save conversation in history
				if( w.chat.mPrivateClients[ w.chat.mPrivateChatWith ] ) {
					w.chat.mPrivateClients[ w.chat.mPrivateChatWith ] += 
					lPrivateHistory.html( );
				} else{
					w.chat.mPrivateClients[ w.chat.mPrivateChatWith ] = 
					lPrivateHistory.html( );
				}
				
			}
			// If you just pressed send button or the message 
			// comes from someone you are chatting with
			// Save conversation in history
			if( w.chat.mPrivateClients[ aClientId ] ) {
				w.chat.mPrivateClients[ aClientId ] += lPrivateHistory.html( );
			} else{
				w.chat.mPrivateClients[ aClientId ] = lPrivateHistory.html( );
			}
		} else{
			w.chat.eLogPublic.append( lHistoryItem );
			w.chat.eLogPublic.scrollTop( w.chat.eLogPublic.get( 0 ).scrollHeight -
				w.chat.eLogPublic.get( 0 ).clientHeight );
		}
	},
	
	/**
	 * Sets the list of connected clients
	 * @param aClients 
	 *  The list of clients to be shown to the users
	 **/
	setClients: function( aClients ) {
		w.chat.ePublicUsersBox.html( "" );
		
		if( aClients.length > 0 ) {
			$( aClients ).each( function( aIndex, aClientId ) {
				var lFullId  = aClientId.split( "@" );
				var lId  = lFullId[1];
			
				var lPublicItem = $( '<div class="' + w.chat.CSS_PUBLIC_ONLINE + 
					'" id="'+ lId + '">'+ aClientId +'</div>' );
				
				// Use a default color for each client
				var lColor = w.chat.getClientColor( aClientId );
				
				lPublicItem.css( {
					color: lColor
				});
				
				lPublicItem.click( function( ) {
					// Load the tab
					w.chat.addPrivateTab( aClientId );
					// Start a new conversation with this client
					w.chat.startConversationWith( aClientId );
				});
				
				w.chat.ePublicUsersBox.append( lPublicItem );
				
				w.chat.mOnlineClients.push( lId );
			});
		} else {
			w.chat.ePublicUsersBox.html( "" ).append( 
				'<div class="' + w.chat.CSS_NO_USERS_ONLINE + '">' +
				w.chat.MSG_NOT_CONNECTED_USERS + 
				'</div>' );
		}
	},
	
	/**
	 * Sets the list of connected clients
	 * @param aClients 
	 *  The list of clients to be shown to the users
	 **/
	addClient: function( aClientId ) {
		// if there are not users online remove the sign no_users_online
		var lENoUsersOnline = w.chat.ePublicUsersBox.find( '.' + 
			w.chat.CSS_NO_USERS_ONLINE );
		
		if( lENoUsersOnline ) {
			lENoUsersOnline.remove( );	
		}
		var lArray = aClientId.split( "@" );
		var lClientId = lArray[1];
		
		var lPublicItem = $( "<div class='" + w.chat.CSS_PUBLIC_ONLINE + 
			"' id='"+ lClientId +"'>" + aClientId +"</div>" );
		
		// Registering clicks of elements
		var lColor = w.chat.getClientColor( aClientId );
		
		lPublicItem.css( {
			color: lColor
		});
		
		lPublicItem.click( function( ) {
			// Load the tab
			w.chat.addPrivateTab( aClientId );
			// Start a new conversation with this client
			w.chat.startConversationWith( aClientId );
		});
		
		w.chat.ePublicUsersBox.append( lPublicItem );
		
		w.chat.mOnlineClients.push( lClientId );
	},
	
	/**
	 * Removes a client from the clients list
	 * @param aClients 
	 *  The list of clients to be shown to the users
	 **/
	removeClient: function( aClientId ) {
		if( w.chat.mOnlineClients ) {
			for( var lIdx = 0; lIdx < w.chat.mOnlineClients.length; lIdx++ ) {
				if( aClientId  ==  w.chat.mOnlineClients[ lIdx ] ) {
					w.chat.mOnlineClients.splice( lIdx, 1 );
					break;
				}
			}

			w.chat.ePublicUsersBox.children( ).each( function( ) {
				if( $( this ).attr( "id" ) == aClientId ) {
					$( this ).remove( );
				}
			});
			
			w.chat.ePrivateUsersBox.children( ).each( function( ) {
				if( $( this ).attr( "id" ) == "_" + aClientId ) {
					$( this ).removeClass( w.chat.CSS_ONLINE ).addClass( 
						w.chat.CSS_OFFLINE ).attr( "title", "User offline" );
					refreshTooltips( );
				}
			});
			
			if( w.chat.mOnlineClients.length <= 0 ) {
				w.chat.ePublicUsersBox.html( "" ).append( 
					'<div class="' + w.chat.CSS_NO_USERS_ONLINE + '">' + 
					w.chat.MSG_NOT_CONNECTED_USERS + 
					'</div>' );
			}
		}
	},
	
	/**
	 * Removes all elements from the clients list
	 **/
	cleanAll: function( ) {
		if( w.chat.mOnlineClients ) {
			w.chat.mOnlineClients = [ ];
		}
		var lNotConnected = '<div class="' + w.chat.CSS_NO_USERS_ONLINE + '">'+ 
		w.chat.MSG_NOT_CONNECTED_USERS +'</div>';
	
		w.chat.ePublicUsersBox.html( "" ).append( lNotConnected );
		w.chat.ePrivateUsersBox.html( "" ).append( lNotConnected );
		w.chat.eLogPublic.html( "" );
		w.chat.eLogPrivate.html( "" );
	},
	
	clearChatLog: function( ) {
		if( w.chat.mIsPublicActive ) {
			w.chat.eLogPublic.html( "" );
		} else {
			w.chat.eLogPrivate.html( "" );
		}
	},
	
	
	/**
	 * Gets a color for a given clientID
	 * @param aClientID
	 **/
	getClientColor: function( aClientID ) {
		var lColor = null;
		if( aClientID != undefined ) {
			do{
				// Change the color if it is assigned to other client
				lColor = w.chat.getRandomColor( 12 );
			} while( w.chat.isColorUsed( lColor ) );
			
			w.chat.mUserColors[ aClientID ] = w.chat.mUserColors[ aClientID ] || lColor;
			
			return w.chat.mUserColors[ aClientID ];
		}
		return null;
	},
	
	/**
	 * Removes a defined color for a given clientID
	 * @param aClientID
	 **/
	removeClientColor: function( aClientID ) {
		if( w.chat.mUserColors ) {
			for( var lIdx = 0; lIdx < w.chat.mUserColors.length; lIdx++ ) {
				for( var lElem in w.chat.mUserColors[ lIdx ] ) {
					if( aClientID ==  lElem ) {
						w.chat.mUserColors.splice( lIdx, 1 );
						break;
					}
				}
			}
		}
	},
	
	/**
	 * Determines wether a given color is assigned to a user
	 * @param aColor
	 **/
	isColorUsed: function( aColor ) {
		var lFound = false;
		$( w.chat.mUserColors ).each( function( aIndex, aElem ) {
			for ( var aKey in aElem ) {
				if( aElem[ aKey ] == aColor ) {
					lFound = true;
					break;
				}
			}
		});
		
		return lFound;
	},
	/**
	 * Returns a color using a given intensity
	 * @param aIntensity
	 * 0 -  5  low intensity	( dark )
	 * 5 -  10 medium intensity ( half dark )
	 * 10 - 15 high intensity   ( light )
	 * default intensity = 10
	 */
	getRandomColor: function( aIntensity ) {
		var lColorChars = [
		'0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'
		];
		
		aIntensity = aIntensity || 10;
		
		var lRed = lColorChars[ w.chat.getRandomNumber( aIntensity ) ] + 
		lColorChars[ w.chat.getRandomNumber( aIntensity ) ];
	
		var lGreen = lColorChars[ w.chat.getRandomNumber( aIntensity ) ] + 
		lColorChars[ w.chat.getRandomNumber( aIntensity ) ];
	
		var lBlue = lColorChars[ w.chat.getRandomNumber( aIntensity ) ] + 
		lColorChars[ w.chat.getRandomNumber( aIntensity ) ];

		return "#"+lRed + lGreen + lBlue;
	},
	getRandomNumber: function( aNumber ) {
		return Math.floor( Math.random( aNumber ) * aNumber );
		
	},
	
	/**
	 * Replaces all emoticons by their respective image
	 * @param aMessage
	 */
	parseEmoticons: function( aMessage ) {
		// TODO: Implement a better structure for this
		var lParsedMessage = aMessage,
		lPos = -1, lImg = "";
		for( var lIdx in w.chat.mEmoticons ) {
			while( ( lPos = lParsedMessage.search( new RegExp( lIdx.replace(
				/([.?*+^$[\]\\(){}|-])/g, "\\$1"), "i" ), "i" ) ) != -1 ) {
				lImg = "<img src='" + w.chat.mEmoticonsPath + 
				w.chat.mEmoticons[ lIdx ] + ".png" + "' title='"+ 
				w.chat.mEmoticons[ lIdx ] + "'>";
				lParsedMessage = lParsedMessage.substr( 0, lPos ) + lImg + 
				lParsedMessage.substr( lPos + lIdx.length, lParsedMessage.length - 1 );
			}
		}
		return lParsedMessage;
	},
	
	loadEmoticons: function( ) {
		//		w.chat.eEmoticonsWindow.hide( );
		w.chat.eEmoticonsWindow.find( '#icons' ).children( ).each( function( ) {
			var lId = $( this ).attr( "id" ),
			lImgPath = w.chat.mEmoticonsPath + lId;
			if( $( this ).hasClass( w.chat.CSS_EMOTICON_BTN ) ) {
				var lNormalStyle = {
					"background": "url(" + lImgPath + ".png ) no-repeat"
				};
				var lHoverStyle = {
					"background": "url(" + lImgPath + "_h.png ) no-repeat"
				};
			
				var lPressedStyle = {
					"background": "url( " + lImgPath + "_p.png ) no-repeat"
				};
				$( this ).css( lNormalStyle );
				$( this ).mouseover( function( ) {
					$( this ).css( lHoverStyle );
				});
				$( this ).mouseout( function( ) {
					$( this ).css( lNormalStyle );
				});
				$( this ).mousedown( function( ) {
					$( this ).css( lPressedStyle );
				});
				$( this ).click( function( ) {
					w.chat.eBtnActiveEmoticon.css( lNormalStyle )
					.attr( "title", lId );
					w.chat.eBtnActiveEmoticon.click( );
					w.chat.eEmoticonsWindow.hide( );
				});
			
			}
		});
	},
	
	addEmoticon: function( ) {
		if( mWSC.isConnected( ) ) {
			if( !$( this ).attr( "title" ) ) {
				$( this ).attr( "title", "wink" );
			}
			var lSymbol = null;
			for( var lKey in w.chat.mEmoticons ) {
				if( w.chat.mEmoticons[ lKey ] == $( this ).attr( "title" ) ) {
					lSymbol = lKey;
					break;
				}
			}
			if( lSymbol ) {
				var lMessage = w.chat.eMessageBox.val( );
				if( lMessage == w.chat.MSG_TYPE_YOUR_MSG ) {
					w.chat.eMessageBox.val( lSymbol );
				} else{
					if( w.chat.mSelectionStart >= 0 && w.chat.mSelectionEnd >= 0 ) {
						var lFirst = lMessage.slice( 0, w.chat.mSelectionStart );
						var lEnd = lMessage.slice( w.chat.mSelectionEnd, 
							lMessage.length );
						var lJoin = lFirst + lSymbol + lEnd;
						w.chat.eMessageBox.val( lJoin );
					}
				}
				w.chat.eMessageBox.focus( );
			}
		}
	},
	
	messageBoxBlur : function( aEvent ) {
		if( $( this ).val( ) == "" ) {
			$( this ).val( w.chat.MSG_TYPE_YOUR_MSG ).attr( "class", 
				w.chat.CSS_OPAQUE );
		}
		var lTarget = aEvent.target;
		if( lTarget ) {
			w.chat.mSelectionStart = lTarget.selectionStart;
			w.chat.mSelectionEnd = lTarget.selectionEnd;
		}
	},
	
	messageBoxClick: function( aEvent ) { 
		if( $( this ).val( ) == w.chat.MSG_TYPE_YOUR_MSG ) {
			$( this ).val( "" ).attr( "class", w.chat.CSS_DARK );
		}
	},
	
	messageBoxKeyPressed: function( aEvt ) {
		if( aEvt.keyCode == 13 && ( !aEvt.shiftKey ) ) {
			aEvt.preventDefault( );
			var lText = $( this ).val( );
			w.chat.sendMessage( lText );
			$( this ).val( "" );
		}
	},
	
	switchPrivate: function( ) {
		var lQuantity = parseInt( w.chat.eUnreadMessages.text( ) );
		if ( lQuantity > 0 ) {
			w.chat.eUnreadMessages.fadeOut( 500 ).text( 0 );
			if( w.chat.ePrivateUsersBox.children( ).length == 1 ) {
				var lActiveClient = w.chat.ePrivateUsersBox.first( )
				.find( '.' + w.chat.CSS_CLIENT_ID ).text( );
				
				w.chat.startConversationWith( lActiveClient );
			}
		}
		// Show the privateLogArea
		w.chat.eLogPrivate.show( );
		w.chat.eLogPublic.hide( );
		
		w.chat.eChatTitle.text( "User: " + 
			( w.chat.mPrivateChatWith || "?" ) );
		
		// Show the privateUsersBox
		w.chat.ePublicUsersBox.hide( );
		w.chat.ePrivateUsersBox.show( );
		
		w.chat.eBtnPublicChat.attr( "class", "" );
		w.chat.eBtnPrivateChat.attr( "class", w.chat.CSS_ACTIVE );
		w.chat.mIsPublicActive = false;
	},
	
	switchPublic: function( ) {
		// Show the publicLogArea
		w.chat.eLogPrivate.hide( );
		w.chat.eLogPublic.show( );
		
		w.chat.eChatTitle.text( "Public chat" );
		
		// Show the publicUsersBox
		w.chat.ePrivateUsersBox.hide( );
		w.chat.ePublicUsersBox.show( );
		
		w.chat.eBtnPublicChat.attr( "class", w.chat.CSS_ACTIVE );
		w.chat.eBtnPrivateChat.attr( "class", "" );
		w.chat.mIsPublicActive = true;
	}
});