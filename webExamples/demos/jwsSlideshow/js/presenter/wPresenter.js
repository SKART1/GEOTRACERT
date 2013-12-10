//	---------------------------------------------------------------------------
//	jWebSocket Slideshow presenter (Community Edition, CE)
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
$.widget( "jws.presenter", {
	_init: function( ) {
		this.NS_CHANNELS = jws.NS_BASE + '.plugins.channels';
		this.NS_SYSTEM = jws.NS_BASE + '.plugins.system';
		this.TITLE = "Presenter window";
		// ------ DOM ELEMENTS --------
		this.eBtnNext = this.element.find( "#btn_next" );
		this.eBtnPrev = this.element.find( "#btn_prev" );
		this.eBtnFirst = this.element.find( "#btn_first" );
		this.eBtnLast = this.element.find( "#btn_last" );
		this.eBtnFullScreen = this.element.find( "#fullscreen_btn" );
		this.ePresenters = this.element.find( "#presenters" );
		this.eViewers = this.element.find( "#viewers" );
		this.eSlide = this.element.find( "#slide" );
		this.eFullScreenArea = this.element.find( "#fullscreen" );
		this.eStatusbarArea = this.element.find( "#demo_box_statusbar" );
		this.eFullToolbarArea = this.element.find( "#toolbar" );
		this.eContainer = $( ".container" );
		// ------ VARIABLES --------
		this.mCurrSlide = -1;
		this.mMaxSlides = 22;
		this.mViewers = 0;
		this.mPresenters = 0;
		this.mChannelId = "jWebSocketSlideShowDemo";
		this.mChannelAccessKey = "5l1d35h0w";
		this.mChannelSecretKey = "5l1d35h0w53cr3t!";
		this.TT_SEND = "send";
		this.TT_SLIDE = "slide";
		this.mClientId = "";
		this.mIsFS = false;
		this.mInterval = null;
		this.mViewersList = { };
		w.presenter = this;
		w.presenter.registerEvents( );
	},
	registerEvents: function( ) {
		w.presenter.eBtnNext.click( w.presenter.nextSlide );
		w.presenter.eBtnPrev.click( w.presenter.prevSlide );
		w.presenter.eBtnLast.click( w.presenter.lastSlide );
		w.presenter.eBtnFirst.click( w.presenter.firstSlide );
		w.presenter.eBtnFullScreen.click( w.presenter.toggleFullScreen );
		w.presenter.eBtnFullScreen.fadeTo( 400, 0.4 );
		w.presenter.eFullToolbarArea.mouseover( function( ) {
			clearInterval( w.presenter.mInterval );
		});
		// Enable the first slide
		w.presenter.goTo( 1 );
		w.presenter.eSlide.bind( {
			mousemove: function( ) {
				if ( w.presenter.mIsFS ) {
					w.presenter.eFullToolbarArea.stop( true, true ).show( 300 );
					w.presenter.eStatusbarArea.stop( true, true ).show( 300 );
					w.presenter.eBtnFullScreen.fadeTo( 100, 0.8 );
					clearInterval( w.presenter.mInterval );
					w.presenter.mInterval = setInterval( function( ) {
						w.presenter.eFullToolbarArea.stop( true, true ).hide( 800 );
						w.presenter.eStatusbarArea.stop( true, true ).hide( 800 );
						w.presenter.eBtnFullScreen.fadeTo( 100, 0.3 );
					}, 4000 );
				}
			},
			mouseover: function( ) {
				w.presenter.eBtnFullScreen.fadeTo( 100, 0.8 );

			},
			mouseout: function( aEvent ) {
				if ( aEvent.relatedTarget == w.presenter.eBtnFullScreen.get( 0 ) ) {
					return false;
				}
				w.presenter.eBtnFullScreen.stop( true, true ).fadeTo( 400, 0.4 );
			}
		})
		$( document ).bind({
			"keydown": w.presenter.keydown,
			'webkitfullscreenchange mozfullscreenchange fullscreenchange': function( ) {
				if ( !w.presenter.isFullScreen( ) ) {
					w.presenter.mIsFS = false;
					clearInterval( w.presenter.mInterval );
					w.presenter.eFullToolbarArea.show( );
					w.presenter.eStatusbarArea.show( );
				}
			}
		});
			
		// Registers all callbacks for jWebSocket basic connection
		// For more information, check the file ../../res/js/widget/wAuth.js
		var lCallbacks = {
			OnMessage: function( aEvent, aToken ) {
				w.presenter.onMessage( aEvent, aToken );
			},
			OnWelcome: function( aToken ) {
				// Registering the callbacks for the channels
				mWSC.setChannelCallbacks( {
					// When any subscription arrives from the server
					OnChannelUnsubscription: w.presenter.onChannelUnsubscription,
					OnChannelSubscription: w.presenter.onChannelSubscription
				});
				w.presenter.mClientId = aToken.sourceId;
			},
			OnLogon: function( aToken ) {
				w.presenter.authenticateChannel({
					OnSuccess: function( ) {
						console.log("successfully authenticated");
						mWSC.channelSubscribe( w.presenter.mChannelId,
							w.presenter.mChannelAccessKey );
					}
				});
				
			}
		};
		w.presenter.eContainer.auth( lCallbacks );
		AUTO_USER_AND_PASSWORD = true;
		w.auth.logon( );
	},
	onMessage: function( aEvent, aToken ) {
		if ( aToken.ns === w.presenter.NS_CHANNELS ) {
			if ( mLog.isDebugEnabled ) {
				log( " <b>" + w.presenter.TITLE + " new message received: </b>" +
					JSON.stringify( aToken ) );
			}
			// When information is published in the channel the data is sent
			// in a map inside the token and the type of the token comes in 
			// the key "data"
			if ( aToken.type === "data" ) {
				switch ( aToken.data ) {
					// When the slides pass
					case w.presenter.TT_SLIDE:
						w.presenter.updateData( aToken.map );
						break;
				}
			}
		} else if ( aToken.ns === w.presenter.NS_SYSTEM ) {
			if ( aToken.type === w.presenter.TT_SEND ) {
				if ( aToken.data && aToken.data.action === w.presenter.TT_SLIDE ) {
					w.presenter.updateData( aToken.data );
				}
			}
		}
	},
	nextSlide: function( ) {
		if( w.presenter.mCurrSlide <= 0 ) {
			w.presenter.mCurrSlide = 1;
		}
		if ( w.presenter.mCurrSlide < w.presenter.mMaxSlides ) {
			w.presenter.updateSlide( w.presenter.mCurrSlide + 1 );
		}
	},
	prevSlide: function( ) {
		if ( w.presenter.mCurrSlide > 1 ) {
			w.presenter.updateSlide( w.presenter.mCurrSlide - 1 );
		}
	},
	lastSlide: function( ) {
		w.presenter.updateSlide( w.presenter.mMaxSlides );
	},
	firstSlide: function( ) {
		w.presenter.updateSlide( 1 );
	},
	goTo: function( aSlide ) {
		w.presenter.eSlide.attr( "src", "slides/Slide" +
			jws.tools.zerofill( aSlide, 4 ) + ".gif" );
		w.presenter.eBtnLast.isDisabled && w.presenter.eBtnLast.enable( );
		w.presenter.eBtnNext.isDisabled && w.presenter.eBtnNext.enable( );
		w.presenter.eBtnFirst.isDisabled && w.presenter.eBtnFirst.enable( );
		w.presenter.eBtnPrev.isDisabled && w.presenter.eBtnPrev.enable( );
		if ( aSlide <= 1 ) {
			w.presenter.eBtnPrev.disable( );
			w.presenter.eBtnFirst.disable( );
		} else if ( aSlide == w.presenter.mMaxSlides ) {
			w.presenter.eBtnNext.disable( );
			w.presenter.eBtnLast.disable( );
		}
	},
	updateSlide: function( aSlide ) {
		if ( aSlide != w.presenter.mCurrSlide ) {
			w.presenter.mCurrSlide = aSlide;
			w.presenter.publish( w.presenter.TT_SLIDE, {
				slide: aSlide,
				presenter: w.presenter.mClientId
			});
		}
	},
	updateData: function( aData ) {
		aData = aData || { };
		if( aData.viewers != undefined && aData.viewers != w.presenter.mViewers ) {
			w.presenter.mViewers = aData.viewers;
			w.presenter.eViewers.text( aData.viewers );
		}
		if( aData.presenters != undefined && aData.presenters != w.presenter.mPresenters ) {
			w.presenter.mPresenters = aData.presenters;
			w.presenter.ePresenters.text(aData.presenters );
		}
		
		if( aData.slide ) {
			w.presenter.mCurrSlide = aData.slide;
			w.presenter.goTo( aData.slide );
		}
	},
	onChannelSubscription: function( aToken ) {
		var lToken = aToken, lData = { };
		mWSC.channelGetSubscribers( w.presenter.mChannelId,
			w.presenter.mChannelAccessKey, {
				OnSuccess: function( aToken ) {
					var lSubscribers = aToken.subscribers.length;
					mWSC.channelGetPublishers(
						w.presenter.mChannelId,
						w.presenter.mChannelAccessKey, {
							OnSuccess: function( aToken ) {
								var lPublishers = aToken.publishers.length;
								
								lData.viewers = lSubscribers - lPublishers;
								lData.presenters = lPublishers;
								if( w.presenter.mCurrSlide > 0 ) {
									lData.slide = w.presenter.mCurrSlide;
								}
								
								// Now we send the current slide to the new 
								// connected presenter in order that he be able 
								// to synchronize his current slide
								if( lToken.isPublisher ) {
									if( lPublishers == 1 ) {
										w.presenter.publish( w.presenter.TT_SLIDE, lData );
									} else if ( lToken.subscriber != w.presenter.mClientId ) {
										// Then we send to him an update of the 
										// slides that we have
										if( w.presenter.mCurrSlide > 0 ) {
											mWSC.sendText( lToken.subscriber, {
												action: w.presenter.TT_SLIDE,
												slide: w.presenter.mCurrSlide
											});
										}
									}
								} else {
									w.presenter.publish( w.presenter.TT_SLIDE, lData );
								}
							}
						})
				}
			});
	},
	onChannelUnsubscription: function( aToken ) {
		var lData = {};
		if( aToken.isPublisher && w.presenter.mPresenters > 0 ) {
			lData.presenters = w.presenter.mPresenters - 1;
		} else if( !aToken.isPublisher && w.presenter.mViewers > 0 ) {
			lData.viewers = w.presenter.mViewers - 1;
		}
		w.presenter.updateData( lData );
	},
	keydown: function( aEvent ) {
		if ( mWSC.isConnected( ) ) {
			var lKeyCode = aEvent.keyCode || aEvent.keyChar;
			switch ( lKeyCode ) {
				case 37:
				{
					// Left Arrow (Ctrl key pressed takes you to the First slide)
					aEvent.ctrlKey && w.presenter.firstSlide( )
					|| w.presenter.prevSlide( );
					aEvent.preventDefault( );
					break;
				}
				case 39:
				{
					// Right Arrow (Ctrl key pressed takes you to the First slide)
					aEvent.ctrlKey && w.presenter.lastSlide( )
					|| w.presenter.nextSlide( );
					aEvent.preventDefault( );
					break;
				}
			}
		}
	},
	// try to authenticate against the channel to publish data
	authenticateChannel: function( aOptions ) {
		// use access key and secret key for this channel to authenticate
		// required to publish data only
		var lRes = mWSC.channelAuth( w.presenter.mChannelId,
			w.presenter.mChannelAccessKey, w.presenter.mChannelSecretKey, aOptions );
	},
	publish: function( aType, aData ) {
		mWSC.channelPublish( w.presenter.mChannelId, aType, aData );
	},
	isFullScreen: function( ) {
		return  (document.fullScreen && document.fullScreen != null) ||
		(document.mozFullScreen || document.webkitIsFullScreen);
	},
	toggleFullScreen: function( ) {
		if ( w.presenter.isFullScreen( ) ) {
			w.presenter.exitFullScreen( document );
			w.presenter.mIsFS = false;
		} else {
			w.presenter.initFullScreen( w.presenter.eFullScreenArea.get( 0 ) );
			w.presenter.mIsFS = true;
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
});
(function( $ ) {
	$.fn.buttons = { };
	$.fn.disable = function( ) {
		var lButton = this;
		var lId = lButton.attr( "id" );
		lButton.isDisabled = true;
		$.fn.buttons[lId] = lButton.clone( );
		var lEvents = [ "onmouseover", "onmousedown", "onmouseup", "onmouseout", "onclick" ];
		$( lEvents ).each( function( aIndex, aElem ) {
			lButton.attr( aElem, null );
		});
		lButton.attr( "class", "button onmousedown" );
	};
	$.fn.enable = function( ) {
		var lButton = this;
		var lId = lButton.attr( "id" );
		var lEvents = [ "onmouseover", "onmousedown", "onmouseup", "onmouseout", "onclick" ];
		$( lEvents ).each( function( aIndex, aAttribute ) {
			lButton.attr( aAttribute, $.fn.buttons[ lId ].attr( aAttribute ) );
		});
		lButton.attr( "class", "button onmouseout" );
		lButton.isDisabled = false;
	};
})( jQuery );