/* jWebSocket Plugin for jQuery
 * Examples and documentation at: http://jwebsocket.org/wiki/Projects/jQueryPlugin
 * Copyright ( c ) 2011-2012 M. Alsup
 * Version: 1.0 ( June-12-2011 )
 * Dual licensed under the MIT and GPL licenses.
 * http://jquery.malsup.com/license.html
 * Requires: jQuery v1.3.2 or later, jWebSocket.js
 */
( function( $ ){
	$.jws = $( { } );
    
	$.jws.open = function(  aJwsServerURL, aTokenClient, aTimeout ){
		if( jws.browserSupportsWebSockets() ){
			var lURL = aJwsServerURL || jws.getDefaultServerURL();
            
			if( aTokenClient ){
				$.jws.aTokenClient = aTokenClient;
			}
			else{
				$.jws.aTokenClient = new jws.jWebSocketJSONClient();
				$.jws.aTokenClient.open( lURL, {
					OnOpen: function( aToken ){
						$.jws.aTokenClient.addPlugIn( $.jws );
						$.jws.trigger( 'open', aToken );
					},
					OnClose: function(){
						$.jws.trigger( 'close' );
					},
					OnTimeout: function(){
						$.jws.trigger( 'timeout' );
					}
				} );
			}
			
			if( aTimeout )
				this.setDefaultTimeOut( aTimeout );
		}
		else{
			var lMsg = jws.MSG_WS_NOT_SUPPORTED;
			alert( lMsg );
		}
	};
	
	$.jws.submit = function( aNs, aType, aArgs, aCallbacks, aOptions ){
		var lToken = { };
		if ( aArgs ){
			lToken = aArgs;
		}
		lToken.ns   = aNs;
		lToken.type = aType;
                        
		var lTimeout;
                        
		if( aOptions )
			if( aOptions.timeout )
				lTimeout = aOptions.timeout;
                        
		this.aTokenClient.sendToken( lToken, {
			timeout: lTimeout,
			callbacks: aCallbacks,
			OnResponse: function( aToken ){
				if ( aToken.code == -1 ) {
					if( aCallbacks && aCallbacks.failure ) {
						return aCallbacks.failure( aToken );
					}
				}
				else if ( aToken.code == 0 ) {
					if( aCallbacks && aCallbacks.success ) {
						return aCallbacks.success( aToken );
					}
				}
			},
			OnTimeOut: function(){
				return aCallbacks.timeout();
			}
		} );
	};
        
	$.jws.processToken = function( aToken ){
		$.jws.trigger( 'all:all', aToken );
		$.jws.trigger( 'all:' + aToken.type, aToken );
		$.jws.trigger( aToken.ns + ':all', aToken );
		$.jws.trigger( aToken.ns + ':' + aToken.type, aToken );
	};
        
	$.jws.getDefaultServerURL = function(){
		if( this.aTokenClient )
			return this.aTokenClient.getDefaultServerURL();
		else
			return jws.getDefaultServerURL();
	};
        
	$.jws.setDefaultTimeOut = function( aTimeout ){
		if( this.aTokenClient )
			this.aTokenClient.DEF_RESP_TIMEOUT = aTimeout;
		else
			jws.DEF_RESP_TIMEOUT = aTimeout;
	};
        
	$.jws.close = function(){
		this.aTokenClient.close();
	};
	
	$.jws.setTokenClient = function( aTokenClient ){
		$.jws.aTokenClient = aTokenClient;
		$.jws.aTokenClient.addPlugIn( $.jws );
	};
	
} )( jQuery );
