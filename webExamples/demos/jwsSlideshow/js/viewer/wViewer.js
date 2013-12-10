//	---------------------------------------------------------------------------
//	jWebSocket Slideshow Viewer ( Community Edition, CE )
//	---------------------------------------------------------------------------
//	Copyright 2010-2013 Innotrade GmbH ( jWebSocket.org )
//  Alexander Schulze, Germany ( NRW )
//
//	Licensed under the Apache License, Version 2.0 ( the "License" );
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
	_init: function( ) {
		this.NS_CHANNELS = jws.NS_BASE + '.plugins.channels';
		this.NS_SYSTEM = jws.NS_BASE + '.plugins.system';
		this.TITLE = "Viewer window ";
		// ------ DOM ELEMENTS --------
		this.ePresenters = this.element.find( "#presenters" );
		this.eViewers = this.element.find( "#viewers" );
		this.eSlide = this.element.find( "#slide" );
		this.eContainer = $( ".container" );
		this.eBtnFullScreen = this.element.find( "#fullscreen_btn_viewer" );
		this.eFullScreenArea = this.element.find( "#fullscreen" );
		this.eStatusbarArea = this.element.find( "#demo_box_statusbar" );
		this.eBtnNewViewer = this.element.find( "#new_viewer_window_btn" );
		this.mNextWindowId = 1;
		// ------ VARIABLES --------
		this.mCurrSlide = 1;
		this.mOldSlide = 0;
		this.mViewers = 0;
		this.mPresenters = 0;
		this.mChannelId = "jWebSocketSlideShowDemo";
		this.mChannelAccessKey = "5l1d35h0w";
		this.TT_SEND = "send";
		this.TT_SLIDE = "slide";
		this.mIsFS = false;
		this.mClientId = "";

		w.viewer = this;
		w.viewer.registerEvents( );
	},
	registerEvents: function( ) {
		$( document ).keydown( w.viewer.keydown );
		w.viewer.eBtnFullScreen.click( w.viewer.toggleFullScreen );
		w.viewer.eBtnFullScreen.fadeTo( 400, 0.4 );
		w.viewer.eSlide.bind({
			mousemove: function( ) {
				if ( w.viewer.mIsFS ) {
					w.viewer.eStatusbarArea.stop( true, true ).show( 300 );
					w.viewer.eBtnFullScreen.stop( true, true ).fadeTo( 400, 0.8 );
					clearInterval( w.viewer.mInterval );
					w.viewer.mInterval = setInterval( function( ) {
						w.viewer.eStatusbarArea.stop( true, true ).hide( 800 );
						w.viewer.eBtnFullScreen.stop( true, true ).fadeTo( 400, 0.3 );
					}, 4000 );
				}
			},
			mouseover: function( ) {
				w.viewer.eBtnFullScreen.fadeTo( 100, 0.8 );
			},
			mouseout: function( aEvent ) {
				if ( aEvent.relatedTarget == w.viewer.eBtnFullScreen.get( 0 ) ) {
					return false;
				}
				w.viewer.eBtnFullScreen.stop( true, true ).fadeTo( 400, 0.4 );
			}
		} )

		$( document ).bind( 'webkitfullscreenchange mozfullscreenchange fullscreenchange', function( ) {
			if ( !w.viewer.isFullScreen( ) ) {
				w.viewer.mIsFS = false;
				clearInterval( w.viewer.mInterval );
				w.viewer.eStatusbarArea.show( );
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
				mWSC.setChannelCallbacks({
					// When any unsubscription arrives from the server
					OnChannelSubscription: w.viewer.onChannelSubscription,
					OnChannelUnsubscription: w.viewer.onChannelUnsubscription
				} );
				w.viewer.mClientId = aToken.sourceId;
			},
			OnLogon: function( aToken ) {
				mWSC.channelSubscribe( w.viewer.mChannelId,
					w.viewer.mChannelAccessKey );
			}
		};
		w.viewer.eContainer.auth( lCallbacks );
		AUTO_USER_AND_PASSWORD = true;
		w.auth.logon( );
	},
	onMessage: function( aEvent, aToken ) {
		if ( aToken.ns === w.viewer.NS_CHANNELS ) {
			if ( mLog.isDebugEnabled ) {
				log( " <b>" + w.viewer.TITLE + " new message received: </b>" +
					JSON.stringify( aToken ) );
			}
			// When information is published in the channel the data is sent
			// in a map inside the token and the type of the token comes in 
			// the key "data"
			if ( aToken.type === "data" ) {
				switch ( aToken.data ) {
					case w.viewer.TT_SLIDE:
						// Pass the current slide
						w.viewer.updateData( aToken.map );
						break;
				}
			}
		}
	},
	goTo: function( aSlide ) {
		if ( aSlide != w.viewer.mCurrSlide ) {
			w.viewer.eSlide.attr( "src", "slides/Slide" +
				jws.tools.zerofill( aSlide, 4 ) + ".gif" );
			w.viewer.mCurrSlide = aSlide;
		}
	},
	updateData: function( aData ) {
		aData = aData || { };

		if( aData.slide ) {
			w.viewer.goTo( aData.slide );
		}
		
		if ( aData.viewers != undefined && w.viewer.mViewers != aData.viewers ) {
			w.viewer.mViewers = aData.viewers || w.viewer.mViewers;
			w.viewer.eViewers.text( w.viewer.mViewers );
		}
	
		if ( aData.presenters != undefined && w.viewer.mPresenters != aData.presenters ) {
			w.viewer.mPresenters = aData.presenters || w.viewer.mPresenters;
			w.viewer.ePresenters.text( w.viewer.mPresenters );
		}
		console.log( aData );
	},
	onChannelSubscription: function( aToken ) {
		mWSC.channelGetPublishers(
			w.viewer.mChannelId,
			w.viewer.mChannelAccessKey, {
				OnSuccess: function( aToken ) {
					if( aToken.publishers.length <= 0 ) {
						// we set the publishers number here
						var lData = { };
						lData.presenters = aToken.publishers.length ;
						mWSC.channelGetSubscribers( w.viewer.mChannelId,
							w.viewer.mChannelAccessKey, {
								OnSuccess: function( aToken ) {
									lData.viewers = 
									aToken.subscribers.length - lData.presenters;
									w.viewer.updateData( lData );
								// and we set the subscribers here
								}
							});
					} // else wait till the publisher send us the data
				}
			});
	},
	onChannelUnsubscription: function( aToken ) {
		var lData = {};
		if( aToken.isPublisher && w.viewer.mPresenters > 0 ) {
			lData.presenters = w.viewer.mPresenters - 1;
		} else if( !aToken.isPublisher && w.viewer.mViewers > 0 ) {
			lData.viewers = w.viewer.mViewers - 1;
		}
		w.viewer.updateData( lData );
	},
	toggleFullScreen: function( ) {
		if ( w.viewer.isFullScreen( ) ) {
			w.viewer.exitFullScreen( document );
			w.viewer.mIsFS = false;
		} else {
			w.viewer.initFullScreen( w.viewer.eFullScreenArea.get( 0 ) );
			w.viewer.mIsFS = true;
		}
		return false;
	},
	isFullScreen: function( ) {
		return  ( document.fullScreen && document.fullScreen != null ) ||
		( document.mozFullScreen || document.webkitIsFullScreen );
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
	},
	openViewerWindow: function( ) {
		var lDate = new Date( );
		w.viewer.mNextWindowId = lDate.getMilliseconds( );
		window.open( 
			// "http://www.jwebsocket.org/demos/jwsSlideshow/viewerIframe.htm"
			"viewerIframe.htm",
			"viewerWindow" + w.viewer.mNextWindowId,
			"width=400,height=420,left=" +
			( 1000 - w.viewer.mNextWindowId ) + ", top=" +
			( 1000 - w.viewer.mNextWindowId )/2 );
	}
} );