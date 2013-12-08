//	---------------------------------------------------------------------------
//	jWebSocket WebSite Tools (Community Edition, CE)
//	---------------------------------------------------------------------------
//	Copyright 2010-2013 Innotrade GmbH (jWebSocket.org)
//	Alexander Schulze, Germany (NRW)
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


function makeImgExp( aId ) {
	var lImg = document.getElementById( aId );
	if( lImg ) {
		var lP = document.createElement( "p" );
		lP.innerHTML = "Screenshot";
		lP.className = "screenshotPlus";
		lP.onclick = function() {
			if( lImg.className != "screenshotOff" ) {
				lImg.className = "screenshotOff" ;
				lP.className = "screenshotPlus";
			} else {
				lImg.className = "screenshotOn";
				lP.className = "screenshotMinus";
			}
		};
		lImg.parentNode.insertBefore( lP, lImg );
	}
}

function makeVidExp( aId, aVidId ) {
	var lImg = document.getElementById( aId );
	if( lImg ) {
		var lP = document.createElement( "p" );
		lP.innerHTML = "Video" + (aVidId?" "+aVidId:"");
		lP.className = "screenshotPlus";
		lP.onclick = function() {
			if( lImg.className != "screenshotOff" ) {
				lImg.className = "screenshotOff" ;
				lP.className = "screenshotPlus";
			} else {
				lImg.className = "screenshotOn";
				lP.className = "screenshotMinus";
			}
		};
		lImg.parentNode.insertBefore( lP, lImg );
	}
}


function checkRedir( aRedir ) {
	var lFrameElem = this.frameElement;
	if( !lFrameElem ) {
		location.replace( aRedir );
	}
}

function jump2Hash( aContext, aHash ) {
	aContext.location.hash = "page="+aHash;
}
