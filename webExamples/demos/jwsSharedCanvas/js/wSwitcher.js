//	---------------------------------------------------------------------------
//	jWebSocket Shared Canvas Plug-in (Community Edition, CE)
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
 * @author daimi, vbarzana
 */
$.widget( "jws.switcher", {
	_init: function( ) {
		this.eBoard = this.element.find( "#paint_area" );
		this.eImage = this.element.find( "#image_area" );
		this.eBtnImg = this.element.find( "#tab_insert_img" );
		this.eBtnPaint = this.element.find( "#tab_paint" );
		this.eClientStatus = this.element.find( "#client_status" );

		this.eImage.hide( );
		this.eBoard.show( );
		w.switcher = this;
		w.switcher.registerEvents( );
	},
	registerEvents: function( ) {
		w.switcher.eBtnImg.click( w.switcher.showImageArea );
		w.switcher.eBtnPaint.click( w.switcher.showPaintArea );
	},
	showImageArea: function( ) {
		w.switcher.eBtnImg.attr( "class", "" ).addClass( "enabled" );
		w.switcher.eBtnPaint.attr( "class", "" );
		w.switcher.eBoard.hide( );
		w.switcher.eImage.show( );
	},
	showPaintArea: function( ) {
		w.switcher.eBtnImg.attr( "class", "" );
		w.switcher.eBtnPaint.attr( "class", "" ).addClass( "enabled" );
		w.switcher.eImage.hide( );
		w.switcher.eBoard.show( );
	}
} );