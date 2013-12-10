//	---------------------------------------------------------------------------
//	jWebSocket Video Streaming Presenter (Community Edition, CE)
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
 * @author vbarzana
 */
$.widget( "jws.vplayer", {
	_init: function() {
		this.NS_CHANNELS = jws.NS_BASE + '.plugins.channels';
		this.NS_SYSTEM = jws.NS_BASE + '.plugins.system';
		this.TITLE = "Presenter window";
		// ------ DOM ELEMENTS --------
		this.eBtnFullScreen = this.element.find( "#fullscreen_btn_presenter" );
		this.ePresenters = this.element.find( "#presenters" );
		this.eViewers = this.element.find( "#viewers" );
		this.eVideo = this.element.find( "#slide_presenter" );
		this.eFullScreenArea = this.element.find( "#fullscreen" );
		this.eStatusbarArea = this.element.find( "#demo_box_statusbar" );
		this.eFullToolbarArea = this.element.find( "#toolbar" );
		this.eContainer = $( ".container" );
		// ------ VARIABLES --------
		this.mPresenters = 0;
		this.mViewers = 0;
		this.mChannelId = "jWebSocketVideoStreamingDemo";
		this.mChannelAccessKey = "stream";
		this.mChannelSecretKey = "5tr34m53cr3t!";
		this.TT_SEND = "send";
		this.TT_VIDEO = "video";
		this.mClientId = "";
		this.mIsFS = false;
		this.mInterval = null;
		this.mPresentersList = { };
		w.vplayer = this;
		w.vplayer.registerEvents();
	},
	registerEvents: function() {
		$( window ).resize( function() {
			var lHeight = $( window ).height() - (w.vplayer.mIsFS ? 0 : 130);
			w.vplayer.eVideo.css( {
				height: lHeight,
				width: $( window ).width()
			} );
		} );

		w.vplayer.eBtnFullScreen.click( w.vplayer.toggleFullScreen );
		w.vplayer.eBtnFullScreen.fadeTo( 400, 0.4 );
//		w.vplayer.eFullToolbarArea.mouseover( function() {
//			clearInterval( w.vplayer.mInterval );
//		} );
		w.vplayer.eVideo.bind( {
//			mousemove: function( ) {
//				if ( w.vplayer.mIsFS ) {
//					w.vplayer.eFullToolbarArea.stop( true, true ).show( 300 );
//					w.vplayer.eStatusbarArea.stop( true, true ).show( 300 );
//					w.vplayer.eBtnFullScreen.fadeTo( 100, 0.8 );
//					clearInterval( w.vplayer.mInterval );
//					w.vplayer.mInterval = setInterval( function() {
//						w.vplayer.eFullToolbarArea.stop( true, true ).hide( 800 );
//						w.vplayer.eStatusbarArea.stop( true, true ).hide( 800 );
//						w.vplayer.eBtnFullScreen.fadeTo( 100, 0.3 );
//					}, 4000 );
//				}
//			},
			mouseover: function() {
				w.vplayer.eBtnFullScreen.fadeTo( 100, 0.8 );

			},
			mouseout: function( aEvent ) {
				if ( aEvent.relatedTarget == w.vplayer.eBtnFullScreen.get( 0 ) ) {
					return false;
				}
				w.vplayer.eBtnFullScreen.stop( true, true ).fadeTo( 400, 0.4 );
			}
		} )
		$( document ).keydown( w.vplayer.keydown );

		// When closing the window notify the other clients about who is 
		// leaving the conference room
		$( window ).bind( {
			'beforeunload': function() {
				jws.channelUnsubscribe( w.vplayer.mChannelId );
			}
		} );
		$( document ).bind( 'webkitfullscreenchange mozfullscreenchange fullscreenchange', function() {
			if ( !w.vplayer.isFullScreen() ) {
				w.vplayer.mIsFS = false;
				clearInterval( w.vplayer.mInterval );
				w.vplayer.eFullToolbarArea.show();
				w.vplayer.eStatusbarArea.show();
			}
		} );
		// Registers all callbacks for jWebSocket basic connection
		// For more information, check the file ../../res/js/widget/wAuth.js
		var lCallbacks = {
			OnMessage: function( aEvent, aToken ) {
				w.vplayer.onMessage( aEvent, aToken );
			},
			OnWelcome: function( aToken ) {
				// Registering the callbacks for the channels
				mWSC.setChannelCallbacks( {
					// When any subscription arrives from the server
					OnChannelUnsubscription: w.vplayer.onChannelUnsubscription,
					OnChannelSubscription: w.vplayer.onChannelSubscription
				} );
				w.vplayer.mClientId = aToken.sourceId;
			}
		};
		w.vplayer.eContainer.auth( lCallbacks );
		AUTO_USER_AND_PASSWORD = true;
		w.auth.logon();
	},
	onMessage: function( aEvent, aToken ) {
		if ( aToken.type === "response" && aToken.reqType === "login" ) {
			mWSC.sessionPut( "presenter", aToken.sourceId, true );
			mWSC.channelSubscribe( w.vplayer.mChannelId,
				w.vplayer.mChannelAccessKey, {
					OnSuccess: function() {
						w.vplayer.authenticateChannel();
					}
				} );
		}
		if ( aToken.ns === w.vplayer.NS_CHANNELS ) {
			if ( mLog.isDebugEnabled ) {
				log( " <b>" + w.vplayer.TITLE + " new message received: </b>" +
					JSON.stringify( aToken ) );
			}
			// When the channel authorizes the user to publish on it
			if ( aToken.reqType === "authorize" ) {
				if ( aToken.code === 0 ) {
					var lData = {
						value: "presenter_" + mWSC.getUsername() + "@" +
						w.vplayer.mClientId
					};
					// We send a notification trough the channel to inform about
					// a new presenter online
					w.vplayer.publish( w.vplayer.TT_USER_REGISTER, lData );
				}
			// When information is published in the channel the data is sent
			// in a map inside the token and the type of the token comes in 
			// the key "data"
			} else if ( aToken.type === "data" ) {
				switch ( aToken.data ) {
					// Whenever a new user goes subscribed on the channel
					// through the channel is published the number of presenters
					// the number of viewers and the current slide, so the 
					// new registered client or publisher will automatically  
					// synchronize itself the existing clients
					case w.vplayer.TT_SEND:
						w.vplayer.updateUsers( aToken.map );
						break;
				}
			}
		}
	},
	startStreaming: function() {
		navigator.getUserMedia = navigator.getUserMedia ||
		navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia ||
		navigator.msGetUserMedia;
		;
		window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

		navigator.getUserMedia( {
			video: true
		}, function( aStream ) {
			var lVideo = w.vplayer.eVideo.get( 0 );

			lVideo.src = (window.URL && window.URL.createObjectURL( aStream )) || aStream;

			videoRec = new VideoRecorder( {
				video: lVideo,
				quality: 0.5,
				width: w.vplayer.eFullScreenArea.width(),
				height: w.vplayer.eFullScreenArea.height()
			} );

			videoRec.start();
			setInterval( function() {
				videoRec.getStream( function( aBase64 ) {
					w.vplayer.publish( w.vplayer.TT_VIDEO, {
						stream: jws.tools.zip( aBase64, true )
					} );
				} );
			}, 1000 );
		}, function( aError ) {
			console.log( aError );
		} );
	},
	updateUsers: function( aData ) {
		aData = aData || { };
		w.vplayer.mViewers = aData.viewers || w.vplayer.mViewers;
		w.vplayer.eViewers.text( w.vplayer.mViewers );
		// copying the presenters elements to our list
		for ( var lIdx in aData.presentersList ) {
			w.vplayer.mPresentersList[lIdx] = aData.presentersList[lIdx];
		}
		var lCounter = 0;
		// Counting how many presenters we have
		for ( var lIdx in w.vplayer.mPresentersList ) {
			lCounter++;
		}
		w.vplayer.mPresenters = lCounter;
		w.vplayer.ePresenters.text( w.vplayer.mPresenters );

	},
	onChannelSubscription: function( aToken ) {
		var lSubscriber = aToken.subscriber;
		mWSC.sessionGetAll( lSubscriber, true, {
			OnSuccess: function( aToken ) {
				var lId = "";
				var lIsPresenter = false, lIsViewer = false;
				for ( var lKey in aToken.data ) {
					lId = lKey.split( "::" )[1];
					if ( lId === 'presenter' && lSubscriber === aToken.data[lKey] ) {
						lIsPresenter = true;
					}
					if ( lId === 'viewer' && lSubscriber === aToken.data[lKey] ) {
						lIsViewer = true;
					}
				}

				var lData = {
					viewers: lIsViewer ? w.vplayer.mViewers + 1 :
					w.vplayer.mViewers
				};

				if ( lIsPresenter ) {
					w.vplayer.mPresenters++;
					lData.presenters = w.vplayer.mPresenters;
					w.vplayer.mPresentersList[lSubscriber] = true;
					lData.presentersList = w.vplayer.mPresentersList;
					// In case that the presenter arrives after the viewers and there 
					// are no more presenters to send him the information he should
					// request for the clients from the server
					if ( w.vplayer.mPresenters === 1 ) {
						mWSC.channelGetSubscribers( w.vplayer.mChannelId,
							w.vplayer.mChannelAccessKey, {
								OnSuccess: function( aToken ) {
									var lViewers = aToken.subscribers.length -
									w.vplayer.mPresenters;
									lData.viewers = lViewers > 0 ? lViewers :
									w.vplayer.mViewers;
								
									// The presenter will only be able to publish 
									// information when there are not more 
									// presenters in the conference and his 
									// information is correct
									w.vplayer.publish( w.vplayer.TT_SEND, lData );
								}
							} );
					} else {
						w.vplayer.publish( w.vplayer.TT_SEND, lData );
					}
				} else if ( lIsViewer ) {
					lData.presenters = w.vplayer.mPresenters;
					lData.presentersList = w.vplayer.mPresentersList;
					mWSC.channelGetSubscribers( w.vplayer.mChannelId,
							w.vplayer.mChannelAccessKey, {
						OnSuccess: function( aToken ) {
							var lViewers = aToken.subscribers.length -
									w.vplayer.mPresenters;
							lData.viewers = lViewers > 0 ? lViewers :
									w.vplayer.mViewers;
							// The presenter will only be able to publish 
							// information when there are not more 
							// presenters in the conference and his
							// information is correct
							w.vplayer.publish( w.vplayer.TT_SEND, lData );
						}
					} );
				}
			}
		} );
	},
	onChannelUnsubscription: function( aToken ) {
		var lUnsubscriber = aToken.subscriber;
		if ( w.vplayer.mPresentersList[lUnsubscriber] ) {
			delete w.vplayer.mPresentersList[lUnsubscriber];
			w.vplayer.mPresenters > 0 && w.vplayer.mPresenters--;
		} else {
			w.vplayer.mViewers > 0 && w.vplayer.mViewers--;
		}
		w.vplayer.updateUsers();
	},
	// try to authenticate against the channel to publish data
	authenticateChannel: function() {
		// use access key and secret key for this channel to authenticate
		// required to publish data only
		mWSC.channelAuth( w.vplayer.mChannelId,
			w.vplayer.mChannelAccessKey, w.vplayer.mChannelSecretKey, {
				// When the channel authorizes the user to publish data start streaming
				OnSuccess: function( ) {
					w.vplayer.startStreaming();
				}
			} );
	},
	publish: function( aType, aData ) {
		mWSC.channelPublish( w.vplayer.mChannelId, aType, aData );
	},
	isFullScreen: function() {
		return  (document.fullScreen && document.fullScreen != null) ||
		(document.mozFullScreen || document.webkitIsFullScreen);
	},
	toggleFullScreen: function() {
		if ( w.vplayer.isFullScreen() ) {
			w.vplayer.exitFullScreen( document );
			w.vplayer.mIsFS = false;
		} else {
			w.vplayer.initFullScreen( w.vplayer.eFullScreenArea.get( 0 ) );
			w.vplayer.mIsFS = true;
		}
		return false;
	},
	exitFullScreen: function( aElement ) {
		// Exit full-screen mode, supported by Firefox 9 || + or Chrome 15 || +
		var lNativeMethod = aElement.cancelFullScreen ||
		aElement.webkitCancelFullScreen ||
		aElement.mozCancelFullScreen ||
		aElement.exitFullscreen;
		if ( lNativeMethod ) {
			lNativeMethod.call( aElement );
		// Support for IE old versions
		} else if ( typeof window.ActiveXObject !== "undefined" ) {
			var lAXScript = new ActiveXObject( "WScript.Shell" );
			if ( lAXScript !== null ) {
				lAXScript.SendKeys( "{F11}" );
			}
		}
	},
	initFullScreen: function( aElement ) {
		// Full-screen mode, supported by Firefox 9 || + or Chrome 15 || +
		var lNativeMethod = aElement.requestFullScreen ||
		aElement.webkitRequestFullScreen ||
		aElement.mozRequestFullScreen ||
		aElement.msRequestFullScreen;

		if ( lNativeMethod ) {
			lNativeMethod.call( aElement );
		} else if ( typeof window.ActiveXObject !== "undefined" ) { // Older IE.
			var lAXScript = new ActiveXObject( "WScript.Shell" );
			if ( lAXScript !== null ) {
				lAXScript.SendKeys( "{F11}" );
			}
		}
		return false;
	}
} );