//	---------------------------------------------------------------------------
//	jWebSocket Reporting Client Plug-in (Community Edition, CE)
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

//:package:*:jws
//:class:*:jws.ReportingPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.ReportingPlugIn[/tt] class.
jws.ReportingPlugIn = {

	//:const:*:NS:String:org.jwebsocket.plugins.reporting (jws.NS_BASE + ".plugins.reporting")
	//:d:en:Namespace for the [tt]ReportingPlugIn[/tt] class.
	// if namespace is changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.reporting",

	processToken: function( aToken ) {
		// check if namespace matches
		if( aToken.ns == jws.ReportingPlugIn.NS ) {
			// here you can handle incomimng tokens from the server
			// directy in the plug-in if desired.
			if( "createReport" == aToken.reqType ) {
				if( this.OnReport ) {
					this.OnReport( aToken );
				}
			} else if( "getReports" == aToken.reqType ) {
				if( this.OnReports ) {
					this.OnReports( aToken );
				}
			} else if( "getReportParams" == aToken.reqType ) {
				if( this.OnReportParams ) {
					this.OnReportParams( aToken );
				}
			}
		}
	},

	reportingCreateReport: function( aReportId, aParams, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lOutputType = "pdf";
			if( aOptions ) {
				if( aOptions.outputType ) {
					lOutputType = aOptions.outputType;
				} 
			}
			var lToken = {
				ns: jws.ReportingPlugIn.NS,
				type: "createReport",
				reportId: aReportId,
				outputType: lOutputType,
				params: aParams
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},
	
	reportingGetReports: function( aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.ReportingPlugIn.NS,
				type: "getReports"
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},
	
	reportingGetReportParams: function( aReportId, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.ReportingPlugIn.NS,
				type: "getReportParams",
				reportId: aReportId
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},
	
	setReportingCallbacks: function( aListeners ) {
		if( !aListeners ) {
			aListeners = {};
		}
		if( aListeners.OnReportAvail !== undefined ) {
			this.OnReportAvail = aListeners.OnReportAvail;
		}
		if( aListeners.OnReports !== undefined ) {
			this.OnReports = aListeners.OnReports;
		}
		if( aListeners.OnReportParams !== undefined ) {
			this.OnReportParams = aListeners.OnReportParams;
		}
	},
	
	displayPDF: function( aElem, aURL, width, height ) {
		if( jws.isIExplorer() ) {
			var lContent =
				'<object ' +
					'classid="clsid:CA8A9780-280D-11CF-A24D-444553540000" ' +
					'width="' + width + '" ' +
					'height="' + height + '" >' +
					'<param name="src" value="' + encodeURI( aURL ) + '">' +
					'<embed src="' + encodeURI( aURL ) + '" ' +
						'width="' + width + '" ' +
						'height="' + height + '" >' +
						'<noembed> Your browser does not support embedded PDF files. </noembed>' +
					'</embed>' +
				'</object>';
			// is there already a pdf for the selected element?
			if( aElem.pdf ) {
				aElem.removeChild( aElem.pdf );
			}
			// reset pdf to collect garbage
			aElem.pdf = null;
			// set the pdf to the element
			aElem.innerHTML = lContent;
			// and save the reference to allow overwriting
			aElem.pdf = aElem.firstChild;
		} else {
			var lNeedToCreateNewInstance = true;
			/*
			var lNeedToCreateNewInstance = (
				( aElem.pdf === null ) || ( aElem.pdf === undefined ) ||
				( jws.isFirefox() && jws.getBrowserVersion() < 3 )
			);
			*/
			var lEmbed = ( lNeedToCreateNewInstance ? document.createElement( "embed" ) : aElem.pdf );
			lEmbed.setAttribute( "id", aElem.id + ".embPdf" );
			lEmbed.setAttribute( "style", "position:relative;padding:0px;margin:0px;border:0px;left:0px;top:0px;width:"+width+"px;height:"+height+"px" );
			lEmbed.setAttribute( "type", "application/pdf" );
			lEmbed.setAttribute( "width", "\"" + width + "\"" );
			lEmbed.setAttribute( "height", "\"" + height + "\"" );
			lEmbed.setAttribute( "src", aURL );
			if( lNeedToCreateNewInstance ) {
				if( aElem.pdf ) {
					aElem.removeChild( aElem.pdf );
				}
			}
			aElem.pdf = lEmbed;
			aElem.appendChild( aElem.pdf );
		}
	}
	
}

// add the JWebSocket Reporting PlugIn into the TokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.ReportingPlugIn );
