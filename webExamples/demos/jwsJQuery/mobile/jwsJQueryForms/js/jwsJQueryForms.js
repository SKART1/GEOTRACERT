//	---------------------------------------------------------------------------
//	jWebSocket jQuery Mobile Demo (Community Edition, CE)
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
 * @author vbarzana
 */

w = { };

$.widget( "jws.pager", {
	_init: function( ) {
		// ------------- VARIABLES -------------
		// Number of elements per page
		this.mPageSize	= 4; 
		this.mCurrPage	= 1;
		this.mMaxPages	= 0;
		
		// ------------- DOM ELEMENTS -------------
		this.eBtnNext	= this.element.find( "#pager #btn_next" );
		this.eBtnPrev	= this.element.find( "#pager #btn_prev" );
		this.eBtnFirst	= this.element.find( "#pager #btn_first" );
		this.eBtnLast	= this.element.find( "#pager #btn_last" );
		this.eCurrPage	= this.element.find( "#page_counter .current_page" );
		this.eMaxPages	= this.element.find( "#page_counter .max_pages" );
		
		// Keeping a reference of the widget, when a websocket message
		// comes from the server the scope "this" doesnt exist anymore
		w.pager = this;
		
		w.pager.registerEvents( );
	},
	
	/**
	 * Registers all callbacks, and assigns all buttons and dom elements actions
	 * also starts up some specific things needed at the begining
	 **/
	registerEvents: function( ) {
		// Registering click events of DOM elements
		w.pager.eBtnNext.click( w.pager.nextPage );
		w.pager.eBtnPrev.click( w.pager.prevPage );
		w.pager.eBtnFirst.click( w.pager.firstPage );
		w.pager.eBtnLast.click( w.pager.lastPage );
		// The same events should be registered as Touch events
		w.pager.eBtnNext.live( "touchend", w.pager.nextPage );
		w.pager.eBtnPrev.live( "touchend", w.pager.prevPage );
		w.pager.eBtnFirst.live( "touchend", w.pager.firstPage );
		w.pager.eBtnLast.live( "touchend", w.pager.lastPage );
		// This is the standard way to listen all incoming messages from the 
		// server using jWebSocket jQuery Plug-in
		$.jws.bind( "all:all", w.pager.onMessage );
	},
	
	/**
	 * Executed every time the server sends a message to the client
	 * @param aEvent
	 * @param aToken
	 **/
	onMessage: function( aEvent, aToken ) {
		//		console.log( "onmessage pager" );
		//		console.log( aToken );
		if( aToken ) {
			// is it a response from a previous request of this client?
			if( aToken.type == "response" ) {
				
				// If anything went wrong in the server show information error
				if( aToken.code == -1 ){
					jwsDialog( aToken.msg, "jWebSocket error", true, null, null, "error" );
				}
			}
		}
	},
	
	loadPage: function( pageNumber ) {
		var lArgs = {
			pagesize: w.pager.mPageSize,
			page: pageNumber - 1
		};
		
		var lCallbacks = {
			success: function( aToken ) {
				w.pager.mMaxPages = aToken.maxpages;
				w.pager.eMaxPages.text( aToken.maxpages );
				w.pager.eCurrPage.text( aToken.currentpage + 1 );
				w.pager.mCurrPage = aToken.currentpage + 1;
				$( w.pager ).trigger( "pageChange", aToken );
				// sometimes in IE7 the text is not correctly shown and if you 
				// click in the document or press any key this problem is solved ;)
				if( jws.isIE_LE7() ) {
					$(document).click();
					$(document).click();
				}
			}
		};
		
		$.jws.submit( w.forms.NS, "getpage", lArgs, lCallbacks );
		
	},
	nextPage: function( ) {
		if( w.pager.mCurrPage < w.pager.mMaxPages ) {
			w.pager.loadPage( ++w.pager.mCurrPage );
		}
	},
	prevPage: function( ) {
		if( w.pager.mCurrPage > 1 ) {
			w.pager.loadPage( --w.pager.mCurrPage );
		}
	},
	firstPage: function( ) {
		if( w.pager.mCurrPage != 1 ) {
			w.pager.mCurrPage = 1;
			w.pager.loadPage( 1 );
		}
	},
	lastPage: function( ) {
		if( w.pager.mCurrPage != w.pager.mMaxPages ) {
			w.pager.mCurrPage = w.pager.mMaxPages;
			w.pager.loadPage( w.pager.mMaxPages );
		}
	},
	destroy: function( ) {
		w.pager.mMaxPages = 0;
		w.pager.mCurrPage = 1;
		w.pager.eMaxPages.text( 0 );
		w.pager.eCurrPage.text( 0 );
	}
});

$.widget( "jws.forms", {
	_init: function( ) {
		// ------------- VARIABLES -------------
		this.NS = jws.NS_BASE + ".plugins.jquerydemo";
		this.NS_SYSTEM	= jws.NS_BASE + ".plugins.system";
		this.mCountNewUsers	= 0;
		
		// ------------- DOM ELEMENTS -------------
		this.eUsersList	= this.element.find( "#users_list #list" );
		this.eClientStatus		= $( ".client_status" );
		this.eClientId			= $( ".client_id" );
		this.eNewUsersCounter	= this.element.find( "#new_users" );
		
		// ----------- DEFAULT MESSAGES ---------
		this.MSG_NOTCONNECTED = "Sorry, you are not connected to the " +
		"server, try updating your browser or clicking the login button";
		
		this.MSG_NO_ITEMS = "There are not items to show";
		// Keeping a reference of the widget, when a websocket message
		// comes from the server the scope "this" doesnt exist anymore
		w.forms = this;
		
		w.forms.registerEvents( );
	},
	
	/**
	 * Registers all callbacks, and assigns all buttons and dom elements actions
	 * also starts up some specific things needed at the begining
	 **/
	registerEvents: function( ) {
		// This is the standard way to listen all incoming messages from the 
		// server using jWebSocket jQuery Plug-in
		$.jws.bind({
			"open": w.forms.login, 
			"close": w.forms.onClose
		});
		
		w.forms.eNewUsersCounter.hide( );
		w.forms.eNewUsersCounter.click( w.forms.userCounterClick );
		$.jws.bind( "all:all", w.forms.onMessage );
		$.jws.bind( w.forms.NS + ":userdeleted", w.forms.userDeleted );
		$.jws.bind( w.forms.NS + ":usercreated", w.forms.userCreated );
		$( w.pager ).bind( "pageChange", w.forms.usersReceived );
	},
	
	registerToDemo: function( ) {
		// Sending a register token to register in the broadcasting 
		// clients list of the demo
		$.jws.submit( w.forms.NS, "register" );
	},
	
	unregisterFromDemo: function( ) {
		$.jws.submit( w.forms.NS, "unregister" );
	},
	
	login: function( aToken ) {
		w.forms.eClientId.text( "Client-ID: " + aToken.sourceId );
		w.forms.eClientStatus.attr( "class", 
			"client_status online" ).text( "connected" );
		$.jws.submit( w.forms.NS_SYSTEM, "login", {
			username: jws.GUEST_USER_LOGINNAME,
			password: jws.GUEST_USER_PASSWORD
		}, {
			// Authenticated successfully, handle statusbar information
			success: function( aToken ) {
				w.forms.registerToDemo( );
				w.pager.loadPage( w.pager.mCurrPage );
				w.forms.eClientId.text( "Client-ID: " + aToken.sourceId );
				w.forms.eClientStatus.attr( "class", 
					"client_status authenticated" ).text( "authenticated" );
			}
		});
	},
	
	onClose: function( ) {
		w.forms.eClientId.text( "Client-ID: - " );
		w.forms.eClientStatus.attr( "class", 
			"client_status offline" ).text( "disconnected" );
		w.forms.destroy( );
	},
	
	/**
	 * Executed every time the server sends a message to the client
	 * @param aEvent
	 * @param aToken
	 **/
	onMessage: function( aEvent, aToken ) {
		if( aToken ) {
			// is it a response from a previous request of this client?
			if( aToken.type == "response" ) {
				// When the list comes update the listview
				if(aToken.reqType == "getall") {
					w.forms.usersReceived( aToken );
				}
			}
		}
	},
	
	userCreated: function( aEvt, aToken ) {
		console.log(w.forms.eNewUsersCounter);
		w.forms.mCountNewUsers++;
		w.forms.eNewUsersCounter.show( ).text( "New users: " + w.forms.mCountNewUsers );
	},
	
	usersReceived: function( aEvt, aToken ) {
		w.forms.removeNoElementsClass( );
		w.forms.clearList( );
		var lUsers = aToken.users;
		for( var i = 0; end = lUsers.length, i < end; i++ ) {
			w.forms.addUserToList( lUsers[ i ] );
		}
		if( lUsers.length == 0 ) {
			w.forms.addNoElementsClass( );
		}
		if( w.pager.mCurrPage == w.pager.mMaxPages ) {
			w.forms.mCountNewUsers = 0;
			w.forms.eNewUsersCounter
			.text( w.forms.mCountNewUsers ).hide( );
		}
		w.forms.eUsersList.listview( 'refresh' );
	},
	
	addUserToList: function( aUser ) {
		var lElement = $( "<li/>" ).attr( "id", aUser.username );
		var lSplitData =  $( "<a/>" );
		lSplitData.append( $( "<h3>" + aUser.username + "</h3>" ) );
		lSplitData.append( $( "<p>Name: <strong>" + aUser.name + "&nbsp;" + aUser.lastname + "</strong></p>" ) );
		lSplitData.append( $( "<p class='ui-li-aside'><strong>" + aUser.mail + "</strong></p>" ) );
		var lDeleteButton = $( "<a data-theme='b' data-icon='delete' title='Delete'/>" );
		lDeleteButton.click( function( ) {
			w.forms.deleteUser( aUser.username );
		});
		lDeleteButton.live( "touchend", function( ) {
			w.forms.deleteUser( aUser.username );
		});
		
		lElement.append( lSplitData ).append( lDeleteButton );
		w.forms.eUsersList.append( lElement );
	},
	
	deleteUser: function( aUsername ) {
		var lArgs = {
			username: aUsername
		};
		$.jws.submit( w.forms.NS, "delete", lArgs );
	},
	
	userDeleted: function( aEvent, aToken ) {
		// better to ask again for the updated page
		w.pager.loadPage( w.pager.mCurrPage );
	},
	
	addNoElementsClass: function( ) {
		if( w.forms.eUsersList.find( "li" ).length <= 1 ) {
			w.forms.eUsersList.append( $( "<li class='no_elements'/>" )
				.text( w.forms.MSG_NO_ITEMS ) );
		}
	},
	
	removeNoElementsClass: function( ) {
		w.forms.eUsersList.find( "li.no_elements" ).remove();
	},
	
	clearList: function( ) {
		var lItems = w.forms.eUsersList.find( "li" );
		lItems.each( function( ) {
			var lItem = $(this);
			if( !lItem.hasClass( "ui-li-divider" ) ) {
				lItem.remove( );
			}
		});
	},
	
	userCounterClick: function( ) {
		var lUsersCount = w.forms.eUsersList.find( "li" ).length - 1;
		// If the number of users in the list is equal of the number of the page
		if( lUsersCount <= w.pager.mPageSize && 
			w.pager.mMaxPages == w.pager.mCurrPage - 1 ) {
			w.pager.loadPage( w.pager.mMaxPages );
		} else {
			w.pager.loadPage( w.pager.mMaxPages + 1 );
		}
	},
	
	destroy: function( ) {
		w.forms.clearList( );
		w.forms.addNoElementsClass( );
		w.forms.mCountNewUsers = 0;
		w.forms.eNewUsersCounter
		.text( w.forms.mCountNewUsers ).hide( );
		w.forms.eUsersList.listview( 'refresh' );
		w.pager.destroy( );
	}
});

$.widget( "jws.createUser", {
	_init: function( ) {
		// ------------- DOM ELEMENTS -------------
		this.eTxtName	= this.element.find( "#name" );
		this.eTxtUserName	= this.element.find( "#username" );
		this.eTxtLastName	= this.element.find( "#lastname" );
		this.eTxtMail	= this.element.find( "#mail" );
		this.eBtnSave	= this.element.find( "#senduser" );
		
		// Keeping a reference of the widget, when a websocket message
		// comes from the server the scope "this" doesnt exist anymore
		w.createUser = this;
		
		w.createUser.registerEvents( );
	},
	
	/**
	 * Registers all callbacks, and assigns all buttons and dom elements actions
	 * also starts up some specific things needed at the begining
	 **/
	registerEvents: function( ) {
		w.createUser.eBtnSave.click( w.createUser.save );
		w.createUser.eBtnSave.live( "touchend", w.createUser.save );
	},
	
	save: function( ) {
		var lArgs = {
			"name": w.createUser.eTxtName.val( ),
			"lastname": w.createUser.eTxtLastName.val( ),
			"username": w.createUser.eTxtUserName.val( ),
			"mail": w.createUser.eTxtMail.val( )
		};
		// if the user is created correctly a Token 
		// with the new user will be sent to all connectors, 
		// check the w.forms.userCreated
		$.jws.submit( w.forms.NS, "create", lArgs );
		$.mobile.changePage( "#mainPage" );
		// Load the last page where the user was added
		w.forms.userCounterClick( );
	}
});

$( document ).bind( {
	// Loaded second
	"ready": function() {
		$( "#mainPage" ).pager();
		$( "body" ).forms();
	},
	// Loaded first
	"mobileinit": function() {
		// Open jWebSocket connection using jQueryMobile Plug-in
		$.jws.open();
		
		$( '#createUserPage' ).live( 'pagecreate', function( aEvent ) {
			// Executing the widget
			$( "#createUserPage" ).createUser( );
		});
	}
});