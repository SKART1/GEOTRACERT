$.widget( "jws.log", {
	_init: function( ) {
		// Global variable that will contain all widgets reference
		// to allow a common communication poing among them
		w.log = this;
		w.log.logVisible = true;
		w.log.scrollLocked = false;
		w.log.eLog = w.log.element.find( "#log_box_content" );
		w.log.eBtnHide = w.log.element.find( '#show_hide_log' );
		w.log.mMaxLogLines = w.log.options.maxLogLines || 500;
		this.registerEvents( );
	},
	registerEvents: function( ) {
		//adding click functions
		if ( !w.log.options.embededIframe ) {
			w.log.eBtnHide.click( w.log.showHide );
		}

		w.log.element.find( '#clear_log' ).click( w.log.clearLog );
		w.log.eLog.scroll( function( aEvent ) {
			var lScrollTop = w.log.eLog.get( 0 ).scrollHeight - w.log.eLog.get( 0 ).clientHeight;
			if( w.log.eLog.scrollTop() != lScrollTop ) {
				w.log.scrollLocked = true;
			} else {
				w.log.scrollLocked = false;
			}
		});
	},
	showHide: function( ) {
		//if it's shown we have to hide it
		if ( w.log.logVisible ) {
			w.log.eBtnHide.attr( "class", "show" ).text( "Show Log" );
			w.log.eLog.slideUp( 500, function( ) {
				$( this ).attr( "class", "log_box_hidden" );
				$( this ).css( {
					height: 5,
					display: 'block'
				} )
			} );
			w.log.logVisible = false;
		}
		else {
			w.log.eBtnHide.attr( "class", "hide" ).text( "Hide Log" );
			w.log.eLog.fadeOut( 100, function( ) {
				$( this ).attr( "class", "log_box_visible" ).slideDown( 500,
					function( ) {
						w.log.eLog.scrollTop( 
							w.log.eLog.get( 0 ).scrollHeight -
							w.log.eLog.get( 0 ).clientHeight
							 );
					} );

			} );

			w.log.logVisible = true;
		}
	},
	clearLog: function( ) {
		w.log.eLog.text( "" );
	}
} );

function log( aString ) {
	w.log.eLog.append( aString + "<br/>" );

	var lLineHeight = 20; // This should match the line-height in the CSS
	var lScrollHeight = w.log.eLog.get( 0 ).scrollHeight;
	w.log.eLog.get( 0 ).style.height = lScrollHeight;
	var numberOfLines = Math.floor( lScrollHeight / lLineHeight );
	
	if ( numberOfLines >= w.log.mMaxLogLines ) {
		var lSplitted = w.log.eLog.html( ).split( "<br>" );
		var lHtml = "";
		$( lSplitted ).each( function( aIndex, aElement ) {
			var lLines = 10;
			if ( w.log.options.linesToDelete ) {
				lLines = w.log.options.linesToDelete;
			}
			if ( aIndex > lLines ) {
				lHtml += aElement + "<br/>";
			}
		} );
		w.log.eLog.html( lHtml );
	}
	var lScrollTop = w.log.eLog.get( 0 ).scrollHeight - w.log.eLog.get( 0 ).clientHeight;
	
	if( !w.log.scrollLocked ) {
		w.log.eLog.scrollTop( lScrollTop );
	}
}