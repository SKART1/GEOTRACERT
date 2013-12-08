//	---------------------------------------------------------------------------
//	jWebSocket Videostreaming viewer (Community Edition, CE)
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
$.widget( "jws.viewer", {
	_init: function() {
		this.NS_CHANNELS = jws.NS_BASE + '.plugins.channels';
		this.NS_SYSTEM = jws.NS_BASE + '.plugins.system';
		this.TITLE = "Viewer window ";
		// ------ DOM ELEMENTS --------
		this.ePresenters = this.element.find( "#presenters" );
		this.eViewers = this.element.find( "#viewers" );
		this.eVideo = this.element.find( "#slide_viewer" );
		this.eContainer = $( ".container" );
		this.eBtnFullScreen = this.element.find( "#fullscreen_btn_viewer" );
		this.eFullScreenArea = this.element.find( "#fullscreen" );
		this.eStatusbarArea = this.element.find( "#demo_box_statusbar" );
		this.eBtnNewViewer = this.element.find( "#new_viewer_window_btn" );
		this.mNextWindowId = 1;
		// ------ VARIABLES --------
		this.mPresenters = 0;
		this.mViewers = 0;
		this.mChannelId = "jWebSocketVideoStreamingDemo";
		this.mChannelAccessKey = "stream";
		this.TT_SEND = "send";
		this.mIsFS = false;
		this.TT_VIDEO = "video";
		this.mPresentersList = { };
		this.mClientId = "";
		this.mLoaded = false;

		w.viewer = this;
		w.viewer.registerEvents();
	},
	registerEvents: function() {
		w.viewer.eVideo.css( {
			width: w.viewer.eFullScreenArea.width(),
			height: w.viewer.eFullScreenArea.height()
		} );
		vOut = w.viewer.eVideo.get( 0 );
		streams = [ ];
		w.viewer.eVideo.bind( "ended", function() {
			vOut.src = streams[streams.length - 1];
			vOut.play();
		} );

		$( window ).resize( function() {
			var lHeight = $( window ).height() - (w.viewer.mIsFS ? 0 : 130);
			console.log( lHeight );
			w.viewer.eVideo.css( {
				height: lHeight + 15,
				width: $( window ).width() - 3
			} );
		} );
		$( document ).keydown( w.viewer.keydown );
		w.viewer.eBtnFullScreen.click( w.viewer.toggleFullScreen );
		w.viewer.eBtnFullScreen.fadeTo( 400, 0.4 );
		w.viewer.eVideo.bind( {
			mousemove: function( ) {
				if ( w.viewer.mIsFS ) {
					w.viewer.eStatusbarArea.stop( true, true ).show( 300 );
					w.viewer.eBtnFullScreen.stop( true, true ).fadeTo( 400, 0.8 );
					clearInterval( w.viewer.mInterval );
					w.viewer.mInterval = setInterval( function() {
						w.viewer.eStatusbarArea.stop( true, true ).hide( 800 );
						w.viewer.eBtnFullScreen.stop( true, true ).fadeTo( 400, 0.3 );
					}, 4000 );
				}
			},
			mouseover: function() {
				w.viewer.eBtnFullScreen.fadeTo( 100, 0.8 );
			},
			mouseout: function( aEvent ) {
				if ( aEvent.relatedTarget == w.viewer.eBtnFullScreen.get( 0 ) ) {
					return false;
				}
				w.viewer.eBtnFullScreen.stop( true, true ).fadeTo( 400, 0.4 );
			}
		} )

		$( document ).bind( 'webkitfullscreenchange mozfullscreenchange fullscreenchange', function() {
			if ( !w.viewer.isFullScreen() ) {
				w.viewer.mIsFS = false;
				clearInterval( w.viewer.mInterval );
				w.viewer.eStatusbarArea.show();
			}
		} );
		w.viewer.eBtnNewViewer.click( w.viewer.openViewerWindow );
		// Registers all callbacks for jWebSocket basic connection
		// For more information, check the file ../../res/js/widget/wAuth.js
		var lCallbacks = {
			OnMessage: function( aEvent, aToken ) {
				w.viewer.onMessage( aEvent, aToken );
			},
			OnWelcome: function( aToken ) {
				// Registering the callbacks for the channels
				mWSC.setChannelCallbacks( {
					// When any unsubscription arrives from the server
					OnChannelUnsubscription: w.viewer.onChannelUnsubscription
				} );
				w.viewer.mClientId = aToken.sourceId;
			}
		};
		w.viewer.eContainer.auth( lCallbacks );
		AUTO_USER_AND_PASSWORD = true;
		w.auth.logon();
	},
	onMessage: function( aEvent, aToken ) {
		if ( aToken.type === "response" && aToken.reqType === "login" ) {
			mWSC.sessionPut( "viewer", aToken.sourceId, true, {
				OnSuccess: function( aToken ) {
					mWSC.channelSubscribe( w.viewer.mChannelId,
							w.viewer.mChannelAccessKey );
				}
			} );
		}
		if ( aToken.ns === w.viewer.NS_CHANNELS ) {
//			if ( mLog.isDebugEnabled ) {
//				log( " <b>" + w.viewer.TITLE + " new message received: </b>" +
//						JSON.stringify( aToken ) );
//			}
			// When information is published in the channel the data is sent
			// in a map inside the token and the type of the token comes in 
			// the key "data"
			if ( aToken.type === "data" ) {
				switch ( aToken.data ) {
					case w.viewer.TT_VIDEO:
						// Pass the current slide
						w.viewer.playStream( aToken.map.stream );
						break;
					case w.viewer.TT_SEND:
						w.viewer.updateUsers( aToken.map );
						break;
				}
			}
		}
	},
	playStream: function( aStream ) {
		if ( aStream ) {
			streams.push( jws.tools.unzip( aStream, true ) );
			w.viewer.eVideo.get( 0 ).src = streams[streams.length - 1];
			w.viewer.eVideo.get( 0 ).play();
			w.viewer.mLoaded = true;
		}
	},
	updateUsers: function( aData ) {
		aData = aData || { };
		w.viewer.mViewers = aData.viewers || w.viewer.mViewers;
		w.viewer.eViewers.text( w.viewer.mViewers );
		// copying the presenters elements to our list
		for ( var lIdx in aData.presentersList ) {
			w.viewer.mPresentersList[lIdx] = aData.presentersList[lIdx];
		}
		var lCounter = 0;
		// Counting how many presenters we have
		for ( var lIdx in w.viewer.mPresentersList ) {
			lCounter++;
		}
		w.viewer.mPresenters = lCounter;
		w.viewer.ePresenters.text( w.viewer.mPresenters );
	},
	onChannelUnsubscription: function( aToken ) {
		var lUnsubscriber = aToken.subscriber;
		if ( w.viewer.mPresentersList[lUnsubscriber] ) {
			delete w.viewer.mPresentersList[lUnsubscriber];
			w.viewer.mPresenters > 0 && w.viewer.mPresenters--;
		} else {
			w.viewer.mViewers > 0 && w.viewer.mViewers--;
		}
		w.viewer.updateUsers();
	},
	toggleFullScreen: function() {
		if ( w.viewer.isFullScreen() ) {
			w.viewer.exitFullScreen( document );
			w.viewer.mIsFS = false;
		} else {
			w.viewer.initFullScreen( w.viewer.eFullScreenArea.get( 0 ) );
			w.viewer.mIsFS = true;
		}
		return false;
	},
	isFullScreen: function() {
		return  (document.fullScreen && document.fullScreen != null) ||
				(document.mozFullScreen || document.webkitIsFullScreen);
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
			console.log( "native" );
			console.log( aElement );
			lNativeMethod.call( aElement );
		} else if ( typeof window.ActiveXObject !== "undefined" ) { // Older IE.
			var lAXScript = new ActiveXObject( "WScript.Shell" );
			if ( lAXScript !== null ) {
				lAXScript.SendKeys( "{F11}" );
			}
		}
		return false;
	},
	openViewerWindow: function( ) {
		var lDate = new Date();
		w.viewer.mNextWindowId = lDate.getMilliseconds();
		window.open(
				// "http://www.jwebsocket.org/demos/jwsSlideshow/viewerIframe.htm"
				"viewerIframe.htm",
				"viewerWindow" + w.viewer.mNextWindowId,
				"width=400,height=420,left=" +
				(1000 - w.viewer.mNextWindowId) + ", top=" +
				(1000 - w.viewer.mNextWindowId) / 2 );
	}
} );