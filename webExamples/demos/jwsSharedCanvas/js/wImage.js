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
$.widget( "jws.image", {
	_init: function( ) {
		//Images
		this.eImageTools = [ ];
		this.eBtnClear = this.element.find( "#clear_image" );
		this.eBtnUndo = this.element.find( "#undo" );
		this.eBtnRedo = this.element.find( "#redo" );
		this.eCanvas = document.getElementById( "image_canvas" );
		this.eContext = this.eCanvas.getContext( "2d" );
		this.mActiveImage = 1;
		this.mCanvasWidth = this.eCanvas.width;
		this.mCanvasHeight = this.eCanvas.height;

		w.img = this;
		w.img.CANVAS_ID = "img_canvas";
		w.img.CANVAS_ELEM_ID = "image_canvas";
		w.img.registerEvents( );

		mWSC.canvasOpen( w.img.CANVAS_ID, w.img.CANVAS_ELEM_ID );
	},
	registerEvents: function( ) {
		$( w.img.eCanvas ).mousedown( w.img.mouseDownLsnr );
		$( w.img.eCanvas ).mousemove( w.img.mouseMoveLsnr );
		$( w.img.eCanvas ).mouseup( w.img.mouseUpLsnr );
		$( w.img.eCanvas ).mouseout( w.img.mouseUpLsnr );
		w.img.eBtnUndo.click( w.img.notifyUndo );
		w.img.eBtnRedo.click( w.img.notifyRedo );
		w.img.eBtnClear.click( w.img.notifyClear );

		// There are 9 images in the dom that should be catched and binded to 
		// on click event to know which image the user wants to paint
		for ( var lIdx = 0; lIdx <= 9; lIdx++ ) {
			var lImage = w.img.element.find( "#image0" + lIdx + "_small" );
			lImage.attr( "name", lIdx ).click( function( ) {
				w.img.setActiveImage( $( this ).attr( "name" ) );
			} );
			var lObj = { };
			lObj["img0" + lIdx ] = lImage;
			w.img.eImageTools.push( lObj );
		}
	},
	mouseDownLsnr: function( aEvent ) {
		aEvent.preventDefault( );
		if ( mWSC.isConnected( ) ) {
			w.img.isCreatingImage = true;

			var lX1 = aEvent.clientX - w.img.eCanvas.offsetLeft,
					lY1 = aEvent.clientY - w.img.eCanvas.offsetTop,
					lWidth = 0,
					lHeight = 0;
			jws.CanvasPlugIn.notifyBeginImage( w.img.CANVAS_ID, lX1, lY1, lWidth, lHeight, w.img.mActiveImage );
		}
	},
	mouseMoveLsnr: function( aEvent ) {
		aEvent.preventDefault( );
		if ( mWSC.isConnected( ) && w.img.isCreatingImage ) {
			var lX2 = aEvent.clientX - w.img.eCanvas.offsetLeft,
					lY2 = aEvent.clientY - w.img.eCanvas.offsetTop;

			jws.CanvasPlugIn.notifyResize( w.img.CANVAS_ID, lX2, lY2 );
		}
	},
	mouseUpLsnr: function( aEvent ) {
		aEvent.preventDefault( );
		if ( mWSC.isConnected( ) && w.img.isCreatingImage ) {
			w.img.isCreatingImage = false;
		}
	},
	setActiveImage: function( aNumber ) {
		w.img.mActiveImage = aNumber;
	},
	notifyUndo: function( ) {
		jws.CanvasPlugIn.notifyUndo(w.img.CANVAS_ID );
	},
	notifyRedo: function( ) {
		jws.CanvasPlugIn.notifyRedo( w.img.CANVAS_ID );
	},
	notifyClear: function( ) {
		if ( mWSC.isConnected( ) ) {
			jws.CanvasPlugIn.notifyClearImage( w.img.CANVAS_ID );
		}
	}
} );