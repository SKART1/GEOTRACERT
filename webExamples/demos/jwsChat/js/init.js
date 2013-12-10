/*
 * jWebSocket Chat Initialization script 
 * @author vbarzana
 */

function init( ) {
	w                   = {};
	mLog                = {};
	mLog.isDebugEnabled = true;
	
	// Setting the styles to the buttons, avoiding to fill the HTML code 
	// with unnecessary data
	$( '.button' ).each( function( ) {
		var lBtn = $( this );
		var lRightClass = lBtn.hasClass( 'download' ) ? 'r_download' : 'btn_right';
		lBtn.attr( "class", "button onmouseup" )
		.attr( "onmouseover", "this.className='button onmouseover'" )
		.attr( "onmousedown", "this.className='button onmousedown'"  )
		.attr( "onmouseup", "this.className='button onmouseup'"  )
		.attr( "onmouseout", "this.className='button onmouseout'"  )
		.attr( "onclick", "this.className='button onmouseover'"  );
		lBtn.html( '<div class="btn_left"/>'+'<div class="btn_center">' +
			lBtn.html( )+ '</div>' + '<div class="' + lRightClass + '"></div>' );
	});
	
	//Configuring tooltip
	$( "[title]" ).tooltip({
		position: "bottom center", 
		onShow: function( ) {
			var lTip = this.getTip( );
			var lTop = ( "<div class='top'></div>" );
			var lMiddle = $( "<div class='middle'></div>" ).text( lTip.text( ) );
			var lBottom = ( "<div class='bottom'></div>" );
			lTip.html( "" ).append( lTop ).append( lMiddle ).append( lBottom );
			this.getTrigger( ).mouseout( function( ) {
				lTip.hide( ).hide( );
			});
			this.getTrigger( ).mousemove( function( ) {
				lTip.show( );
			});
		}
	});
	
	
	// Options
	// @maxLogLines: maximum number of lines that will be logged
	// @linesToDelete: quantity of lines that will be deleted from 
	// the log window each time the log exceeds the maxLogLines
	$( "#log_box" ).log({
		maxLogLines: 500, 
		linesToDelete: 20
	});
	
	//applying our widgets
	$( "#main_content" ).chat( );
}

$( document ).ready( function( ) {
	init( );
});

/**
 * This function is called to refresh the jQuery tooltip assigned
 * to each $("[title]") element
 */
function refreshTooltips( ) {
	$( '.tooltip' ).hide( ).remove( );
	//Configuring tooltip as we wish
	$( "[title]" ).tooltip({
		position: "bottom center", 
		onShow: function( ) {
			var lTip = this.getTip( );
			var lTop = ( "<div class='top'></div>" );
			var lMiddle = $( "<div class='middle'></div>" ).text( lTip.text( ) );
			var lBottom = ( "<div class='bottom'></div>" );
			lTip.html( "" ).append( lTop ).append( lMiddle ).append( lBottom );
			lTip.mouseover( function( ) {
				$( this ).hide( );
			});
		}
	});
}