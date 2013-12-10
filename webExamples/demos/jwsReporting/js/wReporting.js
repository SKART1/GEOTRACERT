//	---------------------------------------------------------------------------
//	jWebSocket Reporting Plug-in (Community Edition, CE)
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


/**
 * jWebSocket Reporting Widget
 * @author vbarzana
 */

$.widget( "jws.reporting", {
	_init: function( ) {
		// ------------- VARIABLES -------------
		this.eBtnGetReports		= this.element.find("#get_reports_btn");
		this.eBtnGetParams		= this.element.find("#get_params_btn");
		this.eBtnCreateReport	= this.element.find("#create_report_btn");
		this.eCbReportType	= this.element.find("#report_type_cb");
		this.ePdfObject			= this.element.find("#pdf");
		
		// DEFAULT MESSAGES
		this.MSG_NOTCONNECTED = "Sorry, you are not connected to the " +
		"server, try updating your browser or clicking the login button";
		
		// Keeping a reference of the widget, when a websocket message
		// comes from the server the scope "this" doesnt exist anymore
		w.reporting = this;
		
		w.reporting.registerEvents( );
	},
	
	/**
	 * Registers all callbacks, and assigns all buttons and dom elements actions
	 * also starts up some specific things needed at the begining
	 **/
	registerEvents: function( ) {
		// Registers all callbacks for jWebSocket basic connection
		// For more information, check the file ../../res/js/widget/wAuth.js
		var lCallbacks = {
			OnOpen: function( aEvent ) {
				mWSC.setReportingCallbacks({
					OnReportAvail: w.reporting.handleReport,
					OnReports: w.reporting.handleReports
				//					OnReportParams: handleReportParams
				});
			},
			OnWelcome: function( aEvent ) { },
			OnClose: function( ) { },
			OnGoodBye: function( aToken ) { },
			OnMessage: function( aEvent, aToken ) {
				if( mLog.isDebugEnabled ) {
					log( "<font style='color:#888'>jWebSocket '" + aToken.type 
						+ "' token received, full message: '" + aEvent.data + "' " 
						+ "</font>" );
				}
				w.reporting.onMessage( aEvent, aToken );
			}
		};
		$( "#demo_box" ).auth( lCallbacks );
		
		// Registering click events of DOM elements
		w.reporting.eBtnGetReports.click( w.reporting.getReports );
		w.reporting.eBtnCreateReport.click( w.reporting.createReport );
	},
	
	/**
	 * Executed every time the server sends a message to the client
	 * @param aEvent
	 * @param aToken
	 **/
	onMessage: function( aEvent, aToken ) {
		if( aToken ) {
			// is it a response from a previous request of this client?
			if( aToken.type == "response" ) {
				// If the login data is ok
				if( aToken.reqType == "login" && aToken.code == 0) {
					var lSuccess = new PDFObject({
						url: "jwsReportSample.pdf"
					}).
					embed( "pdf" );
				}
				// If anything went wrong in the server show information error
				if( aToken.code == -1 ){
					jwsDialog( aToken.msg, "jWebSocket error", true, null, null, "error" );
				}
			}
		}
	},
	
	getReports: function( ) {
		log( "Retreiving list of reports via jWebSocket..." );
		if( mWSC.isConnected( ) ) {
			mWSC.reportingGetReports({
				OnResponse: function( aToken ) {
				// log("Reports " + JSON.stringify( aToken ) );
				}
			});
		} else {
			jwsDialog( w.reporting.MSG_NOTCONNECTED, "jWebSocket error", 
				true, null, null, "error" );
		}
	},
	
	getReportParams: function( ) {
		var lReportId = eReportSel.value;
		log( "Retreiving parameters for report '" + lReportId + "' via jWebSocket..." );
		if( mWSC.isConnected( ) ) {
			mWSC.reportingGetReportParams( lReportId, {
				OnResponse: function( aToken ) {
				// log("Reports " + JSON.stringify( aToken ) );
				}
			});
		} else {
			jwsDialog( w.reporting.MSG_NOTCONNECTED, "jWebSocket error", 
				true, null, null, "error" );
		}
	},
	
	createReport: function( ) {
		if( mWSC.isConnected( ) ) {
			var lReportId = w.reporting.eCbReportType.val( );
			log( "Creating Report..." );
				
			var lParams = [];
			/*
					for(var lIdx = 0, lCnt = gReportParams.length; lIdx < lCnt; lIdx++ ) {
						var lParam = gReportParams[ lIdx ];
						lParams.push({
							name: lParam.name,
							type: lParam.type,
							value: lParam.elem.value
						});
					}
					*/
			lParams.push({
				name: "aFrom",
				type: "datetime",
				value: "2011-05-20T13:04:00Z"
			});
			lParams.push({
				name: "aTo",
				type: "datetime",
				value: "2011-05-25T00:00:00Z"
			});
			mWSC.reportingCreateReport(lReportId, lParams, {
				OnResponse: function( aToken ) {
					console.log(aToken);
					var lW = jws.$("sdivPdf").scrollWidth;
					if( isNaN( lW ) || lW <= 10 ) {
						lW = 400;
					}
					if( aToken.code == 0) {
						jws.ReportingPlugIn.displayPDF( jws.$("sdivPdf"), aToken.url, lW, 300);
					// window.open( aToken.url, "jWebSocket Report", "" );
					} else {
						log("Report creation error: " + aToken.msg );
					}	
				}
			});
		} else {
			jwsDialog( w.reporting.MSG_NOTCONNECTED, "jWebSocket error", 
				true, null, null, "error" );
		}
	},
	
	handleReport: function( aToken ) {
		log("Report is available");
		console.log("Report is available");
		console.log( aToken );
	},
	
	handleReports: function( aToken ) {
		// remove all existing reports in drop down box
		w.reporting.clearReportsCombo( );
		
		// add all reports from incoming token
		for( var lIdx = 0, lCnt = aToken.reports.length; lIdx < lCnt; lIdx++ ) {
			w.reporting.addReportToCombo( aToken.reports[ lIdx ] );
		}
	},
	
	handleReportParams: function( aToken ) {
		// remove all existing reports in drop down box
				
		eFilterDiv.innerHTML = "";
		gReportParams = [];
		// analyze report params from incoming token
		var lTable = document.createElement("table");
		for( var lIdx = 0, lCnt = aToken.params.length; lIdx < lCnt; lIdx++ ) {
			var lParam = aToken.params[ lIdx ];
			var lDescr = lParam.description;
			if( lDescr ) {
				var lTR = document.createElement("tr");
				var lTD1 = document.createElement("td");
				var lTD2 = document.createElement("td");
				var lLbl = document.createElement("span");
				var lInp = document.createElement("input");
				lInp.id = "param." + lParam.name;

				gReportParams.push({
					name: lParam.name,
					type: lParam.type,
					elem: lInp
				});
						
				lTD1.appendChild(lLbl);
				lTD2.appendChild(lInp);
				lTR.appendChild(lTD1);
				lTR.appendChild(lTD2);
				lTable.appendChild(lTR);

				lLbl.innerHTML = lDescr;
			}	
		}
		eFilterDiv.appendChild(lTable);
	},
	
	clearReportsCombo: function( ) {
		w.reporting.eCbReportType.children( ).remove( );
	},
	
	addReportToCombo: function( aReport ) {
		var lOption = $( "<option/>" ).attr( "id", aReport.reportname )
		.text( aReport.reportname );
		
		w.reporting.eCbReportType.append( lOption );
	},
	
	removeReportFromCombo: function( aReportName ) {
		w.reporting.eCbReportType.children( ).each( function( ) {
			if( $( this ).attr( "id" ) == aReportName ) {
				$( this ).remove( );
			}
		});
	}
});