/* 
 * @author vbarzana
 */

function init(  ) {
	w = typeof(w) == "undefined" ? { } : w;
	mLog = { };

	// Options
	// @maxLogLines: maximum number of lines that will be logged
	// @linesToDelete: quantity of lines that will be deleted from 
	// the log window each time the log exceeds the maxLogLines
	// the log window will log only if the parent exists
	if ( $( top.document ).find( "#log_box" ).get( 0 ) ) {
		mLog.isDebugEnabled = true;
		$( top.document ).find( "#log_box" ).log( {
			maxLogLines: 200,
			linesToDelete: 20,
			embededIframe: true
		} );
	}

	// Setting the styles to the buttons, avoiding to fill the HTML code 
	// with unnecessary data
	$( '.button' ).each( function( ) {
		var lBtn = $( this );
		var lRightClass = lBtn.hasClass( 'download' ) ? 'r_download' : 'btn_right';
		lBtn.attr( "class", "button onmouseup" )
				.attr( "onmouseover", "this.className='button onmouseover'" )
				.attr( "onmousedown", "this.className='button onmousedown'" )
				.attr( "onmouseup", "this.className='button onmouseup'" )
				.attr( "onmouseout", "this.className='button onmouseout'" )
				.attr( "onclick", "this.className='button onmouseover'" );
		lBtn.html( '<div class="btn_left"/>' + '<div class="btn_center">' +
				lBtn.html( ) + '</div>' + '<div class="' + lRightClass + '"></div>' );
	} );
	//starting the video player
	$( ".container" ).vplayer();
}

$( document ).ready( function(  ) {
	init( );
} );