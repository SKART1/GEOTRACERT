//	---------------------------------------------------------------------------
//	jWebSocket - Channels Plug-in (Community Edition, CE)
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
 * jWebSocket Channels Widget
 * @author Victor Antonio Barzana Crespo
 */

$.widget( "jws.channels", {
	_init: function( ) {
		// ------------- VARIABLES -------------
		// Persists the current selected channel
		this.mChannelsList = { };

		this.mSelectedChannel = null;
		this.mSelectedRow = null;

		// Messages to show in the demo
		this.MSG_NOCHANNELS = "There are not channels to show.";
		this.MSG_NOSUBSCRIPTIONS = "There are not subscriptions to show.";
		this.MSG_NOSUBSCRIBERS = "There are no subscribers for this channel yet.";
		this.MSG_ACCESSKEY = "access";
		this.MSG_SECRETKEY = "secret";
		this.MSG_CHANNELID = "channel id";
		this.MSG_CHANNELNAME = "channel name";
		this.MSG_MESSAGE = "message";
		this.MSG_PUBLISHMESSAGE = "Type your message...";
		this.MSG_PRIVATE = "private";
		this.MSG_PUBLIC = "public";
		this.MSG_NOTCONNECTED = "Sorry, you are not connected to the " +
				"server, try updating your browser or clicking the login button";

		// Class names used in the demo
		this.CLS_TH = "table_header";
		this.CLS_ACTIVE = "active";
		this.CLS_NOCHANNELS = "no_channels";
		this.CLS_ON = "bullet_on";
		this.CLS_OFF = "bullet_off";
		this.CLS_HOVER = "hover";
		this.CLS_STRIPE = "gray";
		this.CLS_GRAY_INPUT = "gray_input";

		// ------------- TEXT FIELDS -------------
		// Text field elements
		this.eTxtAccessKey = this.element.find( "#txt_access_key" );
		this.eTxtChannelId = this.element.find( "#txt_channel_id" );
		this.eTxtSecretKey = this.element.find( "#txt_secret_key" );
		this.eTxtChannelName = this.element.find( "#txt_channel_name" );
		this.eTxtMessage = this.element.find( "#txt_message" );

		// ------------- BUTTONS -------------
		this.eBtnSwitchChannels = this.element.find( "#switch_channels_btn" );
		this.eBtnSwitchSubscriptions = this.element.find( "#switch_subscriptions_btn" );
		this.eBtnSwitchSubscribers = this.element.find( "#switch_subscribers_btn" );
		this.eBtnGetChannels = this.element.find( "#getchannels_btn" );
		this.eBtnSubscribe = this.element.find( "#subscribe_btn" );
		this.eBtnUnsubscribe = this.element.find( "#unsubscribe_btn" );
		this.eBtnAuthenticate = this.element.find( "#authenticate_btn" );
		this.eBtnCreateChannel = this.element.find( "#createchannel_btn" );
		this.eBtnDeleteChannel = this.element.find( "#deletechannel_btn" );
		this.eBtnPublish = this.element.find( "#publish_btn" );

		// Radio elements
		this.eRbtnPublish = this.element.find( "input[name=visibility]" );

		// Combobox elements
		this.eCbSystem = this.element.find( "input[name=system]" );

		// Some other elements
		this.eChannelsArea = this.element.find( "#channels_area" );
		this.eSubscriptionsArea = this.element.find( "#subscriptions_area" );
		this.eSubscribersArea = this.element.find( "#subscribers_area" );
		this.eChannelsTable = this.element.find( "#channels_table" );
		this.eSubscriptionsTable = this.element.find( "#subscriptions_table" );
		this.eSubscribersTable = this.element.find( "#subscribers_table" );
		this.eBtnBiggerArea = this.element.find( "#resize_channels_area div" );
		this.eChannelsAreaResizable = this.element.find( "#channel_table_container" );
		this.eTables = this.element.find( "#channel_table_container table" );

		// Keeping a reference of the widget, when a websocket message
		// comes from the server the scope "this" doesnt exist anymore
		w.channels = this;
		w.channels.registerEvents( );
	},
	/**
	 * Registers all callbacks, and assigns all buttons and dom elements actions
	 * also starts up some specific things needed at the begining
	 **/
	registerEvents: function( ) {
		// The first time load by default channels area
		w.channels.switchChannelsArea( );

		// Registers all callbacks for jWebSocket basic connection
		// For more information, check the file ../../res/js/widget/wAuth.js
		var lCallbacks = {
			OnOpen: function( aEvent ) {
				// Registering the callbacks for the channels
				mWSC.setChannelCallbacks( {
//					OnChannelCreated: w.channels.onChannelCreated,
					OnChannelRemoved: w.channels.onChannelRemoved,
					OnChannelsReceived: w.channels.onChannelsReceived,
					OnChannelUnsubscription: w.channels.onChannelUnsubscription,
					// When any subscription arrives from the server
					OnChannelSubscription: w.channels.onChannelSubscription
							// OnChannelStarted: null,
							// OnChannelStopped: null
				} );
			},
			OnWelcome: function( aEvent ) {
			},
			OnLogon: function( aToken ) {
				w.channels.getChannels( );
				w.channels.eChannelsAreaResizable.animate( {
					"height": 160,
					"max-height": 160
				} );
				$( w.channels.eTables ).animate( {
					"width": "100%"
				} );
			},
			OnLogoff: function( aToken ) {
				w.channels.destroy( );
			},
			OnClose: function( ) {
				w.channels.destroy( );
			},
			OnGoodBye: function( aToken ) {
				w.channels.destroy( );
			},
			OnMessage: function( aEvent, aToken ) {
				if ( mLog.isDebugEnabled ) {
					log( "<font style='color:#888'>jWebSocket '" + aToken.type
							+ "' token received, full message: '" + aEvent.data + "' "
							+ "</font>" );
				}
				w.channels.onMessage( aEvent, aToken );
			}
		};
		$( "#demo_box" ).auth( lCallbacks );

		// This function loads all click, blur and focus events for text fields
		w.channels.registerElementsEvents( );

		w.channels.eBtnSwitchChannels.click( w.channels.switchChannelsArea );
		w.channels.eBtnSwitchSubscriptions.click( w.channels.switchSubscriptionsArea );
		w.channels.eBtnSwitchSubscribers.click( w.channels.getSubscribers );
		w.channels.eBtnGetChannels.click( w.channels.getChannels );
		w.channels.eBtnCreateChannel.click( w.channels.createChannel );
		w.channels.eBtnDeleteChannel.click( w.channels.removeChannel );
		w.channels.eBtnSubscribe.click( w.channels.subscribeChannel );
		w.channels.eBtnUnsubscribe.click( w.channels.unsubscribeChannel );
		w.channels.eBtnAuthenticate.click( w.channels.auth );
		w.channels.eBtnPublish.click( w.channels.publish );
		w.channels.eTxtMessage.keypress( w.channels.messageKeypress );
		w.channels.eBtnBiggerArea.click( w.channels.resizeChannelsArea );
	},
	/**
	 * Tries to obtain all available channels on the server, after the 
	 * request comes, the event w.channels.onChannelsReceived is fired
	 **/
	getChannels: function( ) {
		if ( mWSC.isConnected( ) ) {
			log( "Trying to obtain channels..." );
			var lRes = mWSC.channelGetIds( );
			log( mWSC.resultToString( lRes ) );
		} else {
			jwsDialog( w.channels.MSG_NOTCONNECTED, "jWebSocket error",
					true, "error" );
		}
	},
	/**
	 * Try to create a new channel if have, after that the callback 
	 * w.channels.onChannelCreated is fired
	 **/
	createChannel: function( ) {
		if ( mWSC.isConnected( ) ) {
			// Getting the data to create new channels
			var lChannelId = w.channels.eTxtChannelId.val( ),
					lChannelName = w.channels.eTxtChannelName.val( ),
					lAccessKey = w.channels.eTxtAccessKey.val( ),
					lSecretKey = w.channels.eTxtSecretKey.val( ),
					lIsSystem = (w.channels.eCbSystem.attr( "checked" ) == "checked") ? true : false,
					lIsPrivate = null;

			// Getting the radiobutton
			w.channels.eRbtnPublish.each( function( ) {
				if ( $( this ).attr( "checked" ) ) {
					lIsPrivate = ($( this ).val( ) == "private") ? true : false;
				}
			} );

			// Validating the data to create the channel
			var lError = "";
			if ( lChannelId == null || lChannelId == "" ||
					lChannelId == w.channels.MSG_CHANNELID ) {
				lError = w.channels.MSG_CHANNELID;
			}
			else if ( lChannelName == null || lChannelName == "" ||
					lChannelName == w.channels.MSG_CHANNELNAME ) {
				lError = w.channels.MSG_CHANNELNAME;
			}
			else if ( lSecretKey == null || lSecretKey == "" ) {
				lError = w.channels.MSG_SECRETKEY;
			}
			else if ( lAccessKey == null || lAccessKey == "" ) {
				lError = w.channels.MSG_ACCESSKEY;
			}

			if ( lError != "" ) {
				jwsDialog( " The field <b>" +
						lError + "</b> is required",
						"jWebSocket error", true, "error" );
			} else {
				log( "Creating channel '" + lChannelId + "'..." );
				var lRes = mWSC.channelCreate(
						lChannelId,
						lChannelName,
						{
							isPrivate: lIsPrivate,
							isSystem: lIsSystem,
							accessKey: lAccessKey,
							secretKey: lSecretKey,
							OnSuccess: function( aToken ) {
								w.channels.onChannelCreated( aToken );
							}
						} );
				log( mWSC.resultToString( lRes ) );
			}
		} else {
			jwsDialog( w.channels.MSG_NOTCONNECTED, "jWebSocket error",
					true, "error" );
		}
	},
	/**
	 * Removes a channel if have permission for that
	 * after that, the callback w.channels.onChannelRemoved is fired
	 **/
	removeChannel: function( ) {
		if ( mWSC.isConnected( ) ) {
			var lChannelId = w.channels.eTxtChannelId.val( ),
					lAccessKey = w.channels.eTxtAccessKey.val( ),
					lSecretKey = w.channels.eTxtSecretKey.val( ),
					lError = null;

			// Validating the data to subscribe to a channel
			if ( lChannelId == null || lChannelId == "" ||
					lChannelId == w.channels.MSG_CHANNELID ) {
				lError = w.channels.MSG_CHANNELID;
			} else if ( lAccessKey == null || lAccessKey == "" ) {
				lError = w.channels.MSG_ACCESSKEY;
			} else if ( lSecretKey == null || lSecretKey == "" ) {
				lError = w.channels.MSG_SECRETKEY;
			}

			if ( lError == null ) {
				log( "Removing channel '" + lChannelId + "'..." );
				var lRes = mWSC.channelRemove(
						lChannelId, {
					accessKey: lAccessKey,
					secretKey: lSecretKey
				} );
				log( mWSC.resultToString( lRes ) );
			} else {
				jwsDialog( "Incorrect value for <b>" + lError + "</b>. Please, check again",
						"jWebSocket error", true, "error" );
			}
		} else {
			jwsDialog( w.channels.MSG_NOTCONNECTED, "jWebSocket error",
					true, "error" );
		}
	},
	//Suscribe to the channel created for channels
	subscribeChannel: function( ) {
		if ( mWSC.isConnected( ) ) {
			var lChannelId = w.channels.eTxtChannelId.val( ),
					lChannelName = w.channels.eTxtChannelName.val( ),
					lAccessKey = w.channels.eTxtAccessKey.val( ),
					lError = null;

			// Validating the data to subscribe to a channel
			if ( lChannelId == null || lChannelId == "" ||
					lChannelId == w.channels.MSG_CHANNELID ) {
				lError = w.channels.MSG_CHANNELID;
			}
			else if ( lAccessKey == null || lAccessKey == "" ) {
				lError = w.channels.MSG_ACCESSKEY;
			}

			if ( lError == null ) {
				log( "Subscribing at channel '" + lChannelName + "'..." );
				var lRes = mWSC.channelSubscribe( lChannelId, lAccessKey );
				log( mWSC.resultToString( lRes ) );
			} else {
				jwsDialog( "Incorrect value for <b>" + lError + "</b>. Please, check again",
						"jWebSocket error", true, "error" );
			}
		} else {
			jwsDialog( w.channels.MSG_NOTCONNECTED, "jWebSocket error",
					true, "error" );
		}
	},
	unsubscribeChannel: function( ) {
		if ( mWSC.isConnected( ) ) {
			var lChannelId = w.channels.eTxtChannelId.val( );

			// Validating the data to subscribe to a channel
			if ( lChannelId != null && lChannelId != "" &&
					lChannelId != w.channels.MSG_CHANNELID ) {
				log( "Unsubscribing from channel '" + lChannelId + "'..." );
				var lRes = mWSC.channelUnsubscribe( lChannelId );
				log( mWSC.resultToString( lRes ) );
			} else {
				jwsDialog( "Incorrect value for <b>" + w.channels.MSG_CHANNELID +
						"</b>. Please, check again", "jWebSocket error", true,
						"error" );
			}
		} else {
			jwsDialog( w.channels.MSG_NOTCONNECTED, "jWebSocket error", true,
					"error" );
		}
	},
	/**
	 * Try to authenticate against the channel to publish data
	 **/
	auth: function( ) {
		if ( mWSC.isConnected( ) ) {
			var lChannelId = w.channels.eTxtChannelId.val( ),
					lAccessKey = w.channels.eTxtAccessKey.val( ),
					lSecretKey = w.channels.eTxtSecretKey.val( ),
					lError = null;

			// Validating the data to subscribe to a channel
			if ( lChannelId == null || lChannelId == "" ||
					lChannelId == w.channels.MSG_CHANNELID ) {
				lError = w.channels.MSG_CHANNELID;
			} else if ( lAccessKey == null || lAccessKey == "" ) {
				lError = w.channels.MSG_ACCESSKEY;
			} else if ( lSecretKey == null || lSecretKey == "" ) {
				lError = w.channels.MSG_SECRETKEY;
			}

			// If the user has typed the correct data, authenticate 
			// against the channel to publish information on it
			if ( lError == null ) {
				log( "Authenticating against channel '" + lChannelId + "'..." );
				// use access key and secret key for this channel to authenticate
				// required to publish data only
				var lRes = mWSC.channelAuth( lChannelId, lAccessKey, lSecretKey );
				log( mWSC.resultToString( lRes ) );
			} else {
				jwsDialog( "Incorrect value for <b>" + lError + "</b>. Please, check again",
						"jWebSocket error", true, "error" );
			}
		} else {
			jwsDialog( w.channels.MSG_NOTCONNECTED, "jWebSocket error", true,
					"error" );
		}
	},
	/**
	 * Try to obtain all subscribers for a certain channel
	 **/
	getSubscribers: function( ) {
		if ( mWSC.isConnected( ) ) {
			var lChannelId = w.channels.eTxtChannelId.val( ),
					lAccessKey = w.channels.eTxtAccessKey.val( ),
					lError = null;

			// Validating the data to subscribe to a channel
			if ( lChannelId == null || lChannelId == "" ||
					lChannelId == w.channels.MSG_CHANNELID ) {
				lError = w.channels.MSG_CHANNELID + ", you must select a channel";
			} else if ( lAccessKey == null || lAccessKey == "" ) {
				lError = w.channels.MSG_ACCESSKEY;
			}
			if ( lError == null ) {
				log( "Trying to obtain subscribers for channel '"
						+ w.channels.mSelectedChannel + "'..." );
				var lRes = mWSC.channelGetSubscribers(
						lChannelId, lAccessKey );
				log( mWSC.resultToString( lRes ) );
			} else {
				jwsDialog( "Incorrect value for <b>" + lError +
						"</b>. Please, check again", "jWebSocket error", true,
						"error" );
			}
		} else {
			jwsDialog( w.channels.MSG_NOTCONNECTED, "jWebSocket error", true,
					"error" );
			return false;
		}
	},
	publish: function( ) {
		if ( mWSC.isConnected( ) ) {
			var lChannelId = w.channels.eTxtChannelId.val( ),
					lMessage = w.channels.eTxtMessage.val( ),
					lError = null;

			// Validating the data to subscribe to a channel
			if ( lChannelId == null || lChannelId == "" ||
					lChannelId == w.channels.MSG_CHANNELID ) {
				lError = w.channels.MSG_CHANNELID;
			} else if ( lMessage == null || lMessage == "" ) {
				lError = w.channels.MSG_MESSAGE;
			}
			if ( lError == null ) {
				mWSC.channelPublish( lChannelId, lMessage );
				w.channels.eTxtMessage.val( "" ).focus( );
			} else {
				jwsDialog( "Incorrect value for <b>" + lError +
						"</b>. Please, check again", "jWebSocket error", true,
						"error" );
			}
		} else {
			jwsDialog( w.channels.MSG_NOTCONNECTED, "jWebSocket error", true,
					"error" );
		}
	},
	// this method is called when a new channel has been created on the server
	onChannelCreated: function( aEvent ) {
		// TODO: when channel is created only arrives channelId and channelName 
		// in the event, so, still have to be implemented to send from the server 
		// all data from the created channel		
		w.channels.getChannels( );
	},
	// this method is called when a channel has been removed from the server
	onChannelRemoved: function( aEvent ) {
		w.channels.removeChannelFromTable( aEvent.channelId );
		w.channels.removeChannelFromTable( aEvent.channelId,
				w.channels.eSubscriptionsTable );
		w.channels.switchChannelsArea( );
	},
	onChannelsReceived: function( aEvent ) {
		w.channels.clearChannelTable();
		w.channels.mChannelsList = { };

		// Sorting the channels by name
		var lLength = aEvent.channels.length, lAux, lIdx, lIdx1;
		for ( lIdx = 0; lIdx < lLength; lIdx++ ) {
			for ( lIdx1 = lIdx + 1; lIdx1 < lLength; lIdx1++ ) {
				if ( w.channels.compareTo( aEvent.channels[lIdx].name.toLowerCase(),
						aEvent.channels[lIdx1].name.toLowerCase() ) > 0 ) {
					lAux = aEvent.channels[lIdx];
					aEvent.channels[lIdx] = aEvent.channels[lIdx1];
					aEvent.channels[lIdx1] = lAux;
				}
			}
		}
		// Put all channels in the table
		for ( lIdx = 0, lCnt = aEvent.channels.length; lIdx < lCnt; lIdx++ ) {
			w.channels.addChannelToTable( aEvent.channels[ lIdx ],
					w.channels.eChannelsTable );
			w.channels.mChannelsList[ aEvent.channels[ lIdx ].id ] =
					aEvent.channels[ lIdx ];
		}
	},
	/**
	 * Fired when a user subscribes to a channel you are subscribed already
	 **/
	onChannelSubscription: function( aEvent ) {
		w.channels.addSubscriberToTable( aEvent );
		//		w.channels.addChannelToTable( w.channels.mChannelsList[ aEvent.channelId ], 
		//			w.channels.eSubscriptionsTable );
		w.channels.switchSubscriptionsArea( );
	},
	/**
	 * Fired when a user unsubscribes from a channel you are subscribed already
	 **/
	onChannelUnsubscription: function( aEvent ) {
		w.channels.removeSubscriberFromTable( aEvent );
		w.channels.removeSubscriptionFromTable( aEvent.channelId );
	},
	onChannelSubscribers: function( aToken ) {
		w.channels.clearSubscribersTable( );
		if ( aToken.subscribers ) {
			var lRow = null, lEnd = aToken.subscribers.length;
			if ( lEnd > 0 ) {
				w.channels.eSubscribersTable
						.find( "." + w.channels.CLS_NOCHANNELS ).remove( );
				for ( var i = 0; i < lEnd; i++ ) {
					lRow = $( "<tr></tr>" ).append( "<td>" +
							aToken.subscribers[ i ].id + "</td>" );
					w.channels.eSubscribersTable.append( lRow );
				}
			}
		}
		w.channels.eSubscribersTable.stripe( );
		w.channels.switchSubscribersArea( );
	},
	/**
	 * Executed every time the server sends a message to the client
	 * @param aEvent
	 * @param aToken
	 **/
	onMessage: function( aEvent, aToken ) {
		if ( aToken ) {
			// is it a response from a previous request of this client?
			if ( aToken.type == "response" ) {
				if ( aToken.reqType == "getSubscribers" ) {
					w.channels.onChannelSubscribers( aToken );
				} else if ( aToken.reqType == "subscribe" ) {
					w.channels.onChannelSubscription( aToken );
				} else if ( aToken.reqType == "unsubscribe" ) {
					w.channels.onChannelUnsubscription( aToken );
				}
				// If anything went wrong in the server show information error
				if ( aToken.code == -1 ) {
					jwsDialog( aToken.msg, "jWebSocket error", true, "error" );
				}
			}
		}
	},
	registerElementsEvents: function( ) {
		w.channels.eTxtChannelId.bind( {
			"click focus": function( ) {
				if ( $( this ).val( ) == w.channels.MSG_CHANNELID ) {
					$( this ).val( "" ).attr( "class", "" );
				}
			},
			"blur": function( ) {
				if ( $( this ).val( ) == "" ) {
					$( this ).val( w.channels.MSG_CHANNELID ).attr( "class",
							w.channels.CLS_GRAY_INPUT );
				}
			}
		} );
		w.channels.eTxtChannelName.bind( {
			"click focus": function( ) {
				if ( $( this ).val( ) == w.channels.MSG_CHANNELNAME ) {
					$( this ).val( "" ).attr( "class", "" );
				}
			},
			"blur": function( ) {
				if ( $( this ).val( ) == "" ) {
					$( this ).val( w.channels.MSG_CHANNELNAME ).attr( "class",
							w.channels.CLS_GRAY_INPUT );
				}
			}
		} );
		w.channels.eTxtMessage.bind( {
			"click focus": function( ) {
				if ( $( this ).val( ) == w.channels.MSG_PUBLISHMESSAGE ) {
					$( this ).val( "" ).attr( "class", "" );
				}
			},
			"blur": function( ) {
				if ( $( this ).val( ) == "" ) {
					$( this ).val( w.channels.MSG_PUBLISHMESSAGE ).attr( "class",
							w.channels.CLS_GRAY_INPUT );
				}
			}
		} );
	},
	switchChannelsArea: function( ) {
		// Add and remove active class to the switch buttons
		w.channels.eBtnSwitchSubscriptions.attr( "class", "" );
		w.channels.eBtnSwitchSubscribers.attr( "class", "" );
		w.channels.eBtnSwitchChannels.attr( "class", w.channels.CLS_ACTIVE );

		// Hide and show areas
		w.channels.eSubscriptionsArea.fadeOut( 100 );
		w.channels.eSubscribersArea.fadeOut( 100 );
		w.channels.eChannelsArea.fadeIn( 100 );
	},
	switchSubscriptionsArea: function( ) {
		if ( mWSC.isConnected( ) ) {
			mWSC.channelGetSubscriptions( {
				OnSuccess: function( aToken ) {
					w.channels.clearSubscriptionsTable( );
					var lChannels = aToken.channels, lChannel;
					//					console.log( aToken );
					for ( var lIdx in lChannels ) {
						lChannel = lChannels[ lIdx ];
						if ( w.channels.mChannelsList[ lChannel.id ] ) {
							w.channels.addChannelToTable(
									w.channels.mChannelsList[ lChannel.id ],
									w.channels.eSubscriptionsTable );
						}
					}

					// Add and remove active class to the switch buttons
					w.channels.eBtnSwitchChannels.attr( "class", "" );
					w.channels.eBtnSwitchSubscribers.attr( "class", "" );
					w.channels.eBtnSwitchSubscriptions.attr( "class",
							w.channels.CLS_ACTIVE );

					// Hide and show areas
					w.channels.eChannelsArea.fadeOut( 100 );
					w.channels.eSubscribersArea.fadeOut( 100 );
					w.channels.eSubscriptionsArea.fadeIn( 100 );
				}
			} );
		}
	},
	switchSubscribersArea: function( ) {
		// Add and remove active class to the switch buttons
		w.channels.eBtnSwitchSubscriptions.attr( "class", "" );
		w.channels.eBtnSwitchChannels.attr( "class", "" );
		w.channels.eBtnSwitchSubscribers.attr( "class", w.channels.CLS_ACTIVE );

		// Hide and show areas
		w.channels.eChannelsArea.fadeOut( 100 );
		w.channels.eSubscriptionsArea.fadeOut( 100 );
		w.channels.eSubscribersArea.fadeIn( 100 );
	},
	/**
	 * Adds a row with the new channel to the channelsTable
	 * @param aTable The table that will receive the channel
	 * @param aChannel represents the channel with the following structure
	 * Example: 
	 * { 
	 *   id: "publicB", 
	 *   isPrivate: false, 
	 *   isSystem: false, 
	 *   name: "Public B" 
	 * }
	 **/
	addChannelToTable: function( aChannel, aTable ) {
		// Getting the last row of the channels table
		var lLastRow = aTable.find( "tr:last" ),
				lNewRow = $( "<tr></tr>" );

		if ( lLastRow.attr( "class" ) == w.channels.CLS_NOCHANNELS ) {
			lLastRow.remove( );
		}

		lNewRow.append( $( "<td>" + aChannel.name + "</td>" ) );
		lNewRow.append( $( "<td>" + aChannel.id + "</td>" ) );
		lNewRow.append( $( "<td>" +
				((aChannel.isPrivate) ?
						w.channels.MSG_PRIVATE : w.channels.MSG_PUBLIC) + "</td>" ) );
		lNewRow.append( $( "<td></td>" )
				.attr( "class", (aChannel.isSystem) ?
				w.channels.CLS_ON : w.channels.CLS_OFF ) );

		// Registering click of each row
		lNewRow.click( function( ) {
			// Getting the text of the selected channel id
			var lChannelId = $( this ).children( ).first( ).next( ).text( ),
					lChannelName = $( this ).children( ).first( ).text( ),
					lType = $( this ).children( ).last( ).prev( ).text( ),
					lSystem = ($( this ).children( ).last( ).attr( "class" ) ==
					w.channels.CLS_ON) ? true : false;

			// Remove any hover class from all tr elements except the header
			aTable.find( "tr" ).each( function( ) {
				if ( $( this ).attr( "class" ) != w.channels.CLS_TH ) {
					if ( $( this ).hasClass( w.channels.CLS_HOVER ) )
						$( this ).removeClass( w.channels.CLS_HOVER );
				}
			} );
			// Adding class hover to the selected row
			$( this ).attr( "class", w.channels.CLS_HOVER );

			aTable.stripe( );

			// Updating text fields with the information of the selected channel
			w.channels.eTxtChannelName.val( lChannelName );
			w.channels.eTxtChannelId.val( lChannelId );
			w.channels.eRbtnPublish.each( function( ) {
				if ( $( this ).val( ) == lType ) {
					$( this ).attr( "checked", true );
				}
			} );
			w.channels.eCbSystem.attr( "checked", lSystem );
			w.channels.mSelectedChannel = lChannelId;
		} );

		// Adding the information row to the table
		aTable.append( lNewRow );
		aTable.stripe( );
	},
	addSubscriberToTable: function( aSubscriber ) {
		// Getting the last row of the table
		var lLastRow = w.channels.eSubscribersTable.find( "tr:last" ),
				lNewRow = $( "<tr></tr>" );

		if ( lLastRow.attr( "class" ) == w.channels.CLS_NOCHANNELS ) {
			lLastRow.remove( );
		}

		lNewRow.append( $( "<td>" + aSubscriber.subscriber + "</td>" ) );

		// Adding the information row to the table
		w.channels.eSubscribersTable.append( lNewRow );
		w.channels.eSubscribersTable.stripe( );
	},
	/**
	 * Removes a channel in the channels table
	 */
	removeChannelFromTable: function( aChannelId, aTable ) {
		var lChannelId = null,
				lRow = null,
				lTable = aTable || w.channels.eChannelsTable;
		lTable.find( "tr" ).each( function( ) {
			lRow = $( this );
			// Don't check in the header of the table
			if ( !lRow.hasClass( w.channels.CLS_TH ) ) {
				// Getting the channel id cell
				lChannelId = lRow.children( ).first( ).next( ).text( );
				if ( lChannelId == aChannelId ) {
					lRow.remove( );
					lTable.stripe( );
					return;
				}
			}
		} );
	},
	/**
	 * Removes a subscription in the subscriptions table
	 */
	removeSubscriptionFromTable: function( aChannelId ) {
		var lChannelId = null,
				lRow = null, lAllRows = w.channels.eSubscriptionsTable.find( "tr" );
		lAllRows.each( function( ) {
			lRow = $( this );
			// Don't check in the header of the table
			if ( !lRow.hasClass( w.channels.CLS_TH ) ) {
				// Getting the channel id cell
				lChannelId = lRow.children( ).first( ).next( ).text( );
				if ( lChannelId == aChannelId ) {
					lRow.remove( );
					w.channels.eSubscriptionsTable.stripe( );
				}
			}
		} );
		lAllRows = w.channels.eSubscriptionsTable.find( "tr" );
		if ( lAllRows.length <= 1 ) {
			var lNoSubscriptionsRow = $( "<tr class='" +
					w.channels.CLS_NOCHANNELS + "'></tr>" );
			lNoSubscriptionsRow.append( $( "<td rowspan='4'>" +
					w.channels.MSG_NOSUBSCRIPTIONS + "</td>" ) );
			w.channels.eSubscriptionsTable.append( lNoSubscriptionsRow );
		}
	},
	/**
	 * Removes a subscriber in the subscribers table
	 */
	removeSubscriberFromTable: function( aSubscriber ) {
		if ( aSubscriber.subscriberId ) {
			var lSubscriberId = null,
					lRow = null, lAllRows = w.channels.eSubscribersTable.find( "tr" );
			lAllRows.each( function( ) {
				lRow = $( this );
				// Don't check in the header of the table
				if ( !lRow.hasClass( w.channels.CLS_TH ) ) {
					// Getting the channel id cell
					lSubscriberId = lRow.children( ).first( ).text( );
					if ( lSubscriberId == aSubscriber.subscriberId ) {
						lRow.remove( );
						w.channels.eSubscribersTable.stripe( );
					}
				}
			} );
		} else {
			var lChannelId = aSubscriber.channelId;
			w.channels.eSubscribersTable.find( "#" + lChannelId ).remove( );
		}
		lAllRows = w.channels.eSubscribersTable.find( "tr" );
		if ( lAllRows.length <= 1 ) {
			var lNoSubscribersRow = $( "<tr class='" +
					w.channels.CLS_NOCHANNELS + "'></tr>" );
			lNoSubscribersRow.append( $( "<td rowspan='4'>" +
					w.channels.MSG_NOSUBSCRIBERS + "</td>" ) );
			w.channels.eSubscribersTable.append( lNoSubscribersRow );
		}
	},
	messageKeypress: function( aKeyEvent ) {
		if ( aKeyEvent ) {
			if ( aKeyEvent.keyCode ) {
				if ( aKeyEvent.keyCode == 13 ) {
					w.channels.publish( );
				}
			} else if ( aKeyEvent.keyChar ) {
				if ( aKeyEvent.keyChar == 13 ) {
					w.channels.publish( );
				}
			}
		}
	},
	clearChannelTable: function( ) {
		w.channels.eChannelsTable.find( "tr" ).each( function( ) {
			if ( $( this ).attr( "class" ) != w.channels.CLS_TH ) {
				$( this ).remove( );
			}
		} );

		var lNoChannelsRow = null;
		lNoChannelsRow = $( "<tr class='" + w.channels.CLS_NOCHANNELS +
				"'></tr>" );
		lNoChannelsRow.append( $( "<td rowspan='4'>" +
				w.channels.MSG_NOCHANNELS + "</td>" ) );

		w.channels.eChannelsTable.append( lNoChannelsRow );
		w.channels.eCbSystem.attr( "checked", false );
		w.channels.mSelectedChannel = null;
	},
	clearSubscriptionsTable: function( ) {
		w.channels.eSubscriptionsTable.find( "tr" ).each( function( ) {
			if ( $( this ).attr( "class" ) != w.channels.CLS_TH ) {
				$( this ).remove( );
			}
		} );

		var lNoSubscriptionsRow = null;
		lNoSubscriptionsRow = $( "<tr class='" + w.channels.CLS_NOCHANNELS +
				"'></tr>" );
		lNoSubscriptionsRow.append( $( "<td rowspan='4'>" +
				w.channels.MSG_NOSUBSCRIPTIONS + "</td>" ) );
		w.channels.eSubscriptionsTable.append( lNoSubscriptionsRow );
	},
	clearSubscribersTable: function( ) {
		w.channels.eSubscribersTable.find( "tr" ).each( function( ) {
			if ( $( this ).attr( "class" ) != w.channels.CLS_TH ) {
				$( this ).remove( );
			}
		} );

		var lNoSubscribersRow = null;
		lNoSubscribersRow = $( "<tr class='" +
				w.channels.CLS_NOCHANNELS + "'></tr>" );
		lNoSubscribersRow.append( $( "<td rowspan='4'>" +
				w.channels.MSG_NOSUBSCRIBERS + "</td>" ) );

		w.channels.eSubscribersTable.append( lNoSubscribersRow );
	},
	clearTextFields: function( ) {
		w.channels.eTxtAccessKey.val( w.channels.MSG_ACCESSKEY );
		w.channels.eTxtChannelId.val( w.channels.MSG_CHANNELID );
		w.channels.eTxtSecretKey.val( w.channels.MSG_SECRETKEY );
		w.channels.eTxtChannelName.val( w.channels.MSG_CHANNELNAME );
		w.channels.eTxtMessage.val( w.channels.MSG_PUBLISHMESSAGE );
	},
	resizeChannelsArea: function( aElement ) {
		var lTarget = $( aElement.currentTarget ),
				lText = lTarget.text( ), lArea = w.channels.eChannelsAreaResizable,
				lPixels = 150, lHeight = parseInt( lArea.css( "height" ) );

		if ( lText == '+' ) {
			lArea.animate( {
				"height": lHeight + lPixels,
				"max-height": lHeight + lPixels
			} );
		} else if ( lHeight - lPixels >= 100 ) {
			lArea.animate( {
				"height": lHeight - lPixels
			} );
		}
		$( w.channels.eTables ).animate( {
			"width": "100%"
		} );
	},
	compareTo: function( aStr1, aStr2 ) {
		if ( aStr1.toString() < aStr2.toString() )
			return -1;
		if ( aStr1.toString() > aStr2.toString() )
			return 1;
		return 0;
	},
	destroy: function( ) {
		w.channels.clearChannelTable( );
		w.channels.clearTextFields( );
		w.channels.eChannelsAreaResizable.animate( {
			"height": 50
		} );
	}
} );

/**
 * Creating an extension to stripe tables
 * The simplest way to use is $("#anytable").stripe( );
 * Note: this is especially adapted to the structure of the tables of this demo
 */
(function( $ ) {
	$.fn.stripe = function( ) {
		var lTable = this,
				lRow = null,
				lWhiteStripe = true;

		lTable.find( "tr" ).each( function( ) {
			lRow = $( this );
			if ( !lRow.hasClass( w.channels.CLS_TH ) &&
					!lRow.hasClass( w.channels.CLS_HOVER ) ) {
				if ( lWhiteStripe ) {
					lRow.attr( "class", "" );
					lWhiteStripe = false;
				} else {
					lRow.attr( "class", w.channels.CLS_STRIPE );
					lWhiteStripe = true;
				}
			}
		} );
	};
})( jQuery );
