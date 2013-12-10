//	---------------------------------------------------------------------------
//	jWebSocket jQuery dialog widget (Community Edition, CE)
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
 * @function jwsDialog
 * @example
 *	jwsDialog( "Are you sure?", "title", true, "error", 
 *			function( ) {alert( "closing" )}, lButtons );
 * @param aTitle
 * @param aMessage
 * @param aIsModal
 * @param aIconType 
 *	 Optional, { error|information|alert|important|warning }
 * @param aCloseFunction
 * @param aMoreButtons
 *   var lButtons = [{
 *		id: "buttonYes",
 *		text: "Yes",
 *		aFunction: function( ) {
 *			alert( "you clicked YES button" );
 *		}
 *	},{
 *		id: "buttonNo",
 *		text: "No",
 *		aFunction: function( ) {
 *			alert( "you clicked button NO" );
 *		}
 *	}];
 * This is an example of how to use this function:
 * @param aWidth Optional, the width of the dialog window
 */
function jwsDialog( aMessage, aTitle, aIsModal, aIconType, aCloseFunction, aMoreButtons, aWidth ) {
	var lDialog = $(  "<div id='dialog'></div>"  ).css({overflow:'hidden'}), 
	lContentWidth = aIconType?"80%":"99%",
	lContent = $(  "<div><p>" + aMessage + "</p></div>"  ).css({
		"width": lContentWidth,
		"float": "left"
	}),
	lButtonsArea = $( "<div class='ui-dialog-buttonpane "+ 
		"ui-widget-content ui-helper-clearfix'></div>" ),
	lButton = $( '<div style="float: right;" '+
		'class="button onmouseup" '+
		'onmouseover="this.className=\'button onmouseover\'" '+
		'onmousedown="this.className=\'button onmousedown\'" ' +
		'onmouseup="this.className=\'button onmouseup\'"' + 
		'onmouseout="this.className=\'button onmouseout\'" ' + 
		'onclick="this.className=\'button onmouseover\'">' );
	
	if( aMoreButtons ) {
		$( aMoreButtons ).each( function( aIndex, aElement ) {
			var lText = aElement.text || "aButton";
			var lFunction = aElement.aFunction;
			var lNewButton = lButton.clone( )
			
			.click( function( ) {
				lFunction( );
				lDialog.dialog( "close" );
				$( this ).parent( ).parent( ).remove( );
			});
			if (  aElement.id  ) {
				lNewButton.attr( "id", aElement.id );
			}

			lNewButton.append( $( '<div class="btn_left"></div>' ) )
			.append( $( '<div class="btn_center">' + lText + '</div>' ) )
			.append( $( '<div class="btn_right"></div>' ) );
			lButtonsArea.prepend( lNewButton );
		});
	}else{
		lButton.append( $( '<div class="btn_left"></div>' ) )
		.append( $( '<div class="btn_center">Ok</div>' ) )
		.append( $( '<div class="btn_right"></div>' ) );
		lButton.click( function( ) {
			if( aCloseFunction ) {
				aCloseFunction( );
			}
			lDialog.dialog( "close" );
			$( this ).parent( ).parent( ).remove( );
		});
		lButtonsArea.append( lButton );
	}
	if( aIconType ) {
		if(  aIconType == "error" || aIconType == "information" || 
			aIconType == "warning" || aIconType == "alert" || 
			aIconType == "important"  ) {
			var lIcon = $( "<div id='icon' class='"+ "icon_" +
				aIconType + "'></div>" );
			lDialog.append( lIcon );
		}
		else {
			console.log( "Unrecognized type of icon+' " + aIconType + 
				"', the allowed types are { error|information|warning|alert }" )
		}
	}
	lDialog.append( lContent );
	lDialog.prependTo( "body" );
	
	lDialog.dialog({
		autoOpen: true,
		resizable: false,
		modal: aIsModal || false,
		width: aWidth || 300,
		title: aTitle || "jWebSocket Message"
	});
	lDialog.append( lButtonsArea );
}

function closeDialog( ) {
	var	lDialog = $( '<div id="dialog"></div>' );
	lDialog.dialog( "close" ); 
	$( ".ui-dialog" ).remove( );
}