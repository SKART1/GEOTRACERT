/* 
 * @author yasma0926
 */

function init(){
	w                   = {};
	mLog                = {};
	mLog.isDebugEnabled = true;
    
	//executing widgets
	$("#container").RemoteShell();
	$("#log_box").log();
	
	//Configuring tooltip as we wish
	$("[title]").tooltip({
		position: "bottom center", 
		onShow: function() {
			var lTip = this.getTip();
			var lTop = ("<div class='top'></div>");
			var lMiddle = $("<div class='middle'></div>").text(lTip.text());
			var lBottom = ("<div class='bottom'></div>");
			lTip.html("").append(lTop).append(lMiddle).append(lBottom);
			this.getTrigger( ).mouseout( function( ) {
				lTip.hide( ).hide( );
			});
			this.getTrigger( ).mousemove( function( ) {
				lTip.show( );
			});
		}
	});
}

$(document).ready(function(){
	init();
});