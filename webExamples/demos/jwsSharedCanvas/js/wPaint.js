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
 * @author Daimi Mederos Llanes, vbarzana
 */
$.widget( "jws.paint", {
	_init: function( ) {
		// Getting some elements from the dom
		this.lJWSID = "jWebSocket Canvas";
		this.eCanvas = document.getElementById( "paint_canvas" );
		this.ctx = this.eCanvas.getContext( "2d" );
		this.eBtnClear = this.element.find( "#clear_paint" );

		this.color = {
			blue: this.element.find( "#color_blue" ),
			green: this.element.find( "#color_green" ),
			red: this.element.find( "#color_red" ),
			yellow: this.element.find( "#color_yellow" ),
			orange: this.element.find( "#color_orange" ),
			darkblue: this.element.find( "#color_darkblue" ),
			purple: this.element.find( "#color_purple" ),
			gray: this.element.find( "#color_gray" ),
			black: this.element.find( "#color_black" )
		}

		this.eStatus = null;
		this.mColor = "#000000";
		this.CANVAS_ID = "p_canvas";
		this.CANVAS_ELEM_ID = "paint_canvas";

		IN = 0;
		OUT = 1;
		EVT = 2;
		SYS = "SYS";
		USR = null;

		this.mIsPainting = false;
		mX1 = -1;
		mY1 = -1;

		this.eAvg = null;
		this.loops = 0;
		this.total = 0;

		w.paint = this;
		w.paint.registerEvents( );
		mWSC.canvasOpen( w.paint.CANVAS_ID, w.paint.CANVAS_ELEM_ID );
	},
	registerEvents: function( ) {
		$( w.paint.eCanvas ).mousedown( w.paint.mouseDownLsnr );
		$( w.paint.eCanvas ).mousemove( w.paint.mouseMoveLsnr );
		$( w.paint.eCanvas ).mouseup( w.paint.mouseUpLsnr );
		$( w.paint.eCanvas ).mouseout( w.paint.mouseOutLsnr );
		w.paint.eBtnClear.click( w.paint.doClear );

		for ( var lColor in w.paint.color ) {
			w.paint.color[lColor].click( function( ) {
				w.paint.selectColor( $( this ).get( 0 ).id.split( "_" )[1] );
			} );
		}
		$( window ).bind( { "unload": function( ) {
				mWSC.canvasClose( w.paint.CANVAS_ID );
			} } );
	},
	mouseDownLsnr: function( aEvent ) {
		jws.events.preventDefault( aEvent );
		if ( mWSC.isConnected( ) ) {
			w.paint.mIsPainting = true;
			mX1 = aEvent.clientX - w.paint.eCanvas.offsetLeft;
			mY1 = aEvent.clientY - w.paint.eCanvas.offsetTop;
		}
	},
	mouseMoveLsnr: function( aEvent ) {
		aEvent.preventDefault( );
		if ( mWSC.isConnected( ) && w.paint.mIsPainting ) {
			var lX2 = aEvent.clientX - w.paint.eCanvas.offsetLeft;
			var lY2 = aEvent.clientY - w.paint.eCanvas.offsetTop;

			mWSC.canvasLine( w.paint.CANVAS_ID, mX1, mY1, lX2, lY2, {
				color: w.paint.mColor
			} );

			mX1 = lX2;
			mY1 = lY2;
		}
	},
	mouseUpLsnr: function( aEvent ) {
		// aEvent.preventDefault( );
		jws.events.preventDefault( aEvent );
		if ( mWSC.isConnected( ) && w.paint.mIsPainting ) {
			lX2 = aEvent.clientX - w.paint.eCanvas.offsetLeft;
			lY2 = aEvent.clientY - w.paint.eCanvas.offsetTop;
			mWSC.canvasLine( w.paint.CANVAS_ID, mX1, mY1, lX2, lY2, {
				color: w.paint.mColor
			} );
			w.paint.mIsPainting = false;
		}
	},
	mouseOutLsnr: function( aEvent ) {
		w.paint.mouseUpLsnr( aEvent );
	},
	selectColor: function( aColor ) {
		w.paint.mColor = aColor;
	},
	doClear: function( ) {
		if ( mWSC.isConnected( ) ) {
			mWSC.canvasClear( w.paint.CANVAS_ID );
		}
	}
} );