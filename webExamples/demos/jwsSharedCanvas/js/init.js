/* 
 * @author vbarzana
 */

function init( ) {
	w = typeof(w) == "undefined" ? { } : w;
	mLog = { };
	mLog.isDebugEnabled = false;

	NS = jws.NS_BASE + ".plugins.sharedcanvas";
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

	//Configuring tooltip
	$( "[title]" ).tooltip( {
		position: "bottom center",
		onShow: function( ) {
			var lTip = this.getTip( );
			var lTop = ("<div class='top'></div>");
			var lMiddle = $( "<div class='middle'></div>" ).text( lTip.text( ) );
			var lBottom = ("<div class='bottom'></div>");
			lTip.html( "" ).append( lTop ).append( lMiddle ).append( lBottom );
			this.getTrigger( ).mouseout( function( ) {
				lTip.hide( ).hide( );
			} );
			this.getTrigger( ).mousemove( function( ) {
				lTip.show( );
			} );
		}
	} );

	jws.CanvasPlugIn.init( $( "#clients" ) );

	$( "#clients" ).switcher( );
	$( "#image_area" ).image( );
	$( "#paint_area" ).paint( );
}

$( document ).ready( function( ) {
	init( );
} );