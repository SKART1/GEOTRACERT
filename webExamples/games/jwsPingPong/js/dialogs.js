//	---------------------------------------------------------------------------
//	jWebSocket Ping Pong Demo (dialog) (Community Edition, CE)
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
/**
 * @param aTitle
 * @param aMessage
 * @param aIsModal
 * @param aCloseFunction
 * @param aButtons
 *    [{
 *		id: "buttonId",
 *		text: "buttonText",
 *		aFunction: function(  ) {//default click action};
 *    }, 
 *    {...}
 *    ]
 */
function dialog( aTitle, aMessage, aIsModal, aCloseFunction, aButtons, aWidth ) {
	var lDialog = $( '<div id="dialog"></div>' );
	//for the ping pong game is necessary to close all dialogs if there is a new one
	closeDialog(  );
	var lContent = $( "<p>" + aMessage + "</p>" );
	var lButtonsArea = $( "<div class='ui-dialog-buttonpane ui-widget-content ui-helper-clearfix'></div>" );
	
	var lButton = $( '<div style="float: right;" class="button onmouseup" onmouseover="this.className=\'button onmouseover\'" onmousedown="this.className=\'button onmousedown\'"onmouseup="this.className=\'button onmouseup\'"onmouseout="this.className=\'button onmouseout\'" onclick="this.className=\'button onmouseover\'">' );
	
	if( aButtons ) {
		$( aButtons ).each( function( aIndex, aElement ) {
			var lText = aElement.text || "aButton";
			var lFunction = aElement.aFunction;
			var lNewButton = $( '<div style="float: right;" class="button onmouseup" onmouseover="this.className=\'button onmouseover\'" onmousedown="this.className=\'button onmousedown\'" onmouseup="this.className=\'button onmouseup\'" onmouseout="this.className=\'button onmouseout\'" onclick="this.className=\'button onmouseover\'">' )
			.click( function(  ) {
				lFunction(  );
				lDialog.dialog( "close" );
				$( ".ui-dialog" ).remove(  );
			} );
			if (  aElement.id  ) {
				lNewButton.attr( "id", aElement.id );
			}

			lNewButton.append( $( '<div class="btn_left"></div>' ) ).append( $( '<div class="btn_center">'+lText+'</div>' ) ).append( $( '<div class="btn_right"></div>' ) );
			lButtonsArea.append( lNewButton );
		} );
	}else{
		lButton.append( $( '<div class="btn_left"></div>' ) ).append( $( '<div class="btn_center">Ok</div>' ) ).append( $( '<div class="btn_right"></div>' ) );
		lButton.click( function(  ) {
			if( aCloseFunction ) {
				aCloseFunction(  );
			}
			lDialog.dialog( "close" );
			$( ".ui-dialog" ).remove(  );
		} );
		lButtonsArea.append( lButton );
	}
	
	lDialog.append( lContent );
	
	lDialog.prependTo( "body" );
    
	lDialog.dialog( {
		autoOpen: true,
		resizable: false,
		modal: aIsModal || false,
		width: aWidth || 300,
		title: aTitle
	} );
	lDialog.append( lButtonsArea );
}

function closeDialog(  ) {
	var	lDialog = $( '<div id="dialog"></div>' );
	lDialog.dialog( "close" ); 
	$( ".ui-dialog" ).remove(  );
}