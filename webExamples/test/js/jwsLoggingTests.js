//	---------------------------------------------------------------------------
//	jWebSocket Logging-Plug-in test specs (Community Edition, CE)
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

jws.tests.Logging = {

	NS: "jws.tests.logging", 
	TABLE: "SYSTEM_LOG",
	PRIMARY_KEY: "ID",
	SEQUENCE: "SQ_PK_SYSTEM_LOG",
	MESSAGE: "This is an message from the automated test suite.",
	
	mLogId: null,

	// this spec tests the file save method of the fileSystem plug-in
	testLog: function() {
		var lSpec = this.NS + ": LogEvent";
		
		it( lSpec, function () {

			var lResponse = {};
			var lNow = new Date();
			var lFlashBridgeVer = "n/a";
			if( swfobject) {
				var lInfo = swfobject.getFlashPlayerVersion();
				lFlashBridgeVer = lInfo.major + "." + lInfo.minor + "." + lInfo.release;
			}
			var lData = {
				"event_type": "loggingTest",
				"customer": "jWebSocket.org",
				"app_name": "jWebSocket",
				"app_version": jws.VERSION,
				"app_module": "test automation",
				"app_dialog": "full tests",
				"user_name": jws.Tests.getAdminConn().getUsername(),
				"data_size": jws.tests.Logging.MESSAGE.length,
				"url": jws.Tests.getAdminConn().getURL(),
				"message": jws.tests.Logging.MESSAGE,
				"browser": jws.getBrowserName(),
				"browser_version": jws.getBrowserVersionString(),
				"ws_version": (
					jws.browserSupportsNativeWebSockets 
					? "native" 
					: "flash " + lFlashBridgeVer
				),
				"json": JSON.stringify({
					userAgent: navigator.userAgent
				}),
				"ip": "${ip}",
				"time_stamp": 
					// jws.tools.dateToISO( lNow )
					/* oracle 
					"TO_DATE('" +
					lNow.getUTCFullYear().toString() + "/" +
					jws.tools.zerofill( lNow.getUTCMonth() + 1, 2 ) + "/" +
					jws.tools.zerofill( lNow.getUTCDate(), 2 ) + " " +
					jws.tools.zerofill( lNow.getUTCHours(), 2 ) + "/" +
					jws.tools.zerofill( lNow.getUTCMinutes(), 2 ) + "/" +
					jws.tools.zerofill( lNow.getUTCSeconds(), 2 ) +
					"','YYYY/MM/DD HH24/MI/SS')"
					*/
					/* mysql */
					lNow.getUTCFullYear().toString() + "-" +
					+ jws.tools.zerofill( lNow.getUTCMonth() + 1, 2 ) + "-"
					+ jws.tools.zerofill( lNow.getUTCDate(), 2 ) + " "
					+ jws.tools.zerofill( lNow.getUTCHours(), 2 ) + ":"
					+ jws.tools.zerofill( lNow.getUTCMinutes(), 2 ) + ":"
					+ jws.tools.zerofill( lNow.getUTCSeconds(), 2 ) + "."
					+ jws.tools.zerofill( lNow.getUTCMilliseconds(), 3 )
			};
			jws.Tests.getAdminConn().loggingEvent( jws.tests.Logging.TABLE, lData, {
				primaryKey: jws.tests.Logging.PRIMARY_KEY,
				sequence: jws.tests.Logging.SEQUENCE,
				OnResponse: function( aToken ) {
					lResponse = aToken;
					jws.tests.Logging.mLogId = lResponse.key;
				}
			});

			waitsFor(
				function() {
					return( lResponse.rowsAffected && lResponse.rowsAffected[0] == 1 && lResponse.key > 0 );
				},
				lSpec,
				1500
			);

			runs( function() {
				expect( lResponse.rowsAffected[0] ).toEqual( 1 );
			});

		});
	},

	// this spec tests the file save method of the fileSystem plug-in
	testGetLog: function() {
		var lSpec = this.NS + ": GetLog";
		
		it( lSpec, function () {

			var lResponse = {};
			var lDone = false;
			jws.Tests.getAdminConn().loggingGetEvents( jws.tests.Logging.TABLE, {
				primaryKey: jws.tests.Logging.PRIMARY_KEY,
				fromKey: jws.tests.Logging.mLogId,
				toKey: jws.tests.Logging.mLogId,
				OnResponse: function( aToken ) {
					lResponse = aToken;
					// check if only one row is returned
					if( lResponse.data.length == 1 ) {
						// check if the row contains the message previously sent.
						var lRow = lResponse.data[ 0 ];
						for( var lIdx = 0, lCnt = lRow.length; lIdx < lCnt; lIdx++ ) {
							if( lRow[ lIdx ] == jws.tests.Logging.MESSAGE ) {
								lDone = true;
								break;
							}
						}
					}
				}
			});

			waitsFor(
				function() {
					return( lDone == true );
				},
				lSpec,
				1500
			);

			runs( function() {
				expect( lDone ).toEqual( true );
			});

		});
	},

	runSpecs: function() {
		this.testLog();
		this.testGetLog();
	},

	runSuite: function() {
		var lThis = this;
		describe( "Performing test suite: " + this.NS + "...", function () {
			lThis.runSpecs();
		});
	}	

};