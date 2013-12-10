//	---------------------------------------------------------------------------
//	jWebSocket Hello World (Community Edition, CE)
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
$.widget( "jws.helloWorld", {
	_init: function( ) {
		this.eMessage = this.element.find( "#message_box_text" );
		this.eFunctionsArea = this.element.find( "#function_area" );
		this.eTokensArea = this.element.find( "#token_area" );
//		this.eFilesArea			= this.element.find( "#file_area" );

		//--------------- BUTTONS --------------------------------
		//Buttons
		this.eBtnBroadcast = this.element.find( "#message_box_broadcast_btn" );

		//Tokens buttons
		this.eBtnComplexObject = this.element.find( "#complex_object_btn" );
		this.eBtnGetTime = this.element.find( "#get_time_btn" );
		this.eBtnTokenizable = this.element.find( "#tokenizable_btn" );

		//Functions buttons 
		this.eBtnListener = this.element.find( "#listener_btn" );
		this.eBtnRPC = this.element.find( "#rpc_btn" );
		this.eBtnSelect = this.element.find( "#select_btn" );

		//File buttons
		this.eBtnSaveFile = this.element.find( "#save_file_btn" );
		this.eBtnFileList = this.element.find( "#file_list_btn" );
		this.eBtnLoadFile = this.element.find( "#load_file_btn" );

		this.eBtnTokens = this.element.find( "#tokens" );
		this.eBtnFunctions = this.element.find( "#functions" );
		this.eBtnFiles = this.element.find( "#files" );
		this.eMainContainer = $( "#demo_box" );

		w.HW = this;
		// Some initialization functions
		w.HW.eFunctionsArea.hide( );
//		w.HW.eFilesArea.hide( );
		w.HW.registerEvents( );
	},
	registerEvents: function( ) {
		// registering events
		w.HW.eBtnBroadcast.click( w.HW.broadcast );

		// Tokens
		w.HW.eBtnComplexObject.click( w.HW.exchangeComplexObjects );
		w.HW.eBtnGetTime.click( w.HW.sampleGetTime );
		w.HW.eBtnTokenizable.click( w.HW.sampleTokenizable );

		// Functions
		w.HW.eBtnListener.click( w.HW.sampleListener );
		w.HW.eBtnRPC.click( w.HW.sampleRPC );
		w.HW.eBtnSelect.click( w.HW.sampleSelect );

		// Files
		w.HW.eBtnSaveFile.click( w.HW.saveFile );
		w.HW.eBtnFileList.click( w.HW.getFilelist );
		w.HW.eBtnLoadFile.click( w.HW.loadFile );

		// Change functional_box_content
		w.HW.eBtnTokens.click( function( ) {
			w.HW.changeContent( "token_area" );
		} );
		w.HW.eBtnFunctions.click( function( ) {
			w.HW.changeContent( "function_area" );
		} );
		w.HW.eBtnFiles.click( function( ) {
			w.HW.changeContent( "file_area" );
		} );

		// Other actions
		w.HW.eMessage.blur( w.HW.messageOnBlur );
		w.HW.eMessage.click( w.HW.messageOnClick );

		//Each demo will configure its own callbacks to be passed to the login widget
		var lCallbacks = {
			// OnOpen: function( aEvent ) { },
			// OnClose: function( aEvent ) { },
			// OnMessage: function( aEvent, aToken ) { },
			// OnWelcome: function( aEvent ) { },
			// OnGoodBye: function( aEvent ) { }
		};
		w.HW.eMainContainer.auth( lCallbacks );

		mWSC.setSamplesCallbacks( {
			OnSamplesServerTime: getServerTimeCallback
		} );
//		mWSC.setFileSystemCallbacks({
//			OnFileLoaded: onFileLoadedObs,
//			OnFileSaved: onFileSavedObs,
//			OnFileError: onFileErrorObs
//		});

	},
	broadcast: function( ) {
		var lMsg = w.HW.eMessage.val( );
		if ( lMsg.length > 0 ) {
			log( "Broadcasting '" + lMsg + "'..." );
			var lRes = mWSC.broadcastText(
					"", // broadcast to all clients ( not limited to a certain pool )
					lMsg	// broadcast this message
					);
			// you may want log error only,
			// on success don't confuse the user
			// if( lRes.code != 0 ) {
			log( mWSC.resultToString( lRes ) );
			//  }
			//
			// optionally clear message to not accidentally send it twice
			// w.HW.eMessage.value = "";
		}
	},
	// example how to exchange arbitrary complex objects between clients
	// the processComplexObject method in the server side sample plug-in
	exchangeComplexObjects: function( ) {
		log( "Retreiving a complex object from the server via WebSockets..." );
		if ( mWSC.isConnected( ) ) {
			var lToken = {
				ns: jws.SamplesPlugIn.NS,
				type: "processComplexObject",
				int_val: 1234,
				float_val: 1234.5678,
				bool_val: true,
				date_val: jws.tools.date2ISO( new Date( ) ),
				object: {
					field1: "value1",
					field2: "value2",
					array1: [ "array1Item1", "array1Item2" ],
					array2: [ "array2Item1", "array2Item2" ],
					object1: {
						obj1field1: "obj1value1",
						obj1field2: "obj1value2"
					},
					object2: {
						obj2field1: "obj2value1",
						obj2field2: "obj2value2"
					}
				}
			};
			mWSC.sendToken( lToken, {
			} );
		} else {
			log( "Not connected." );
		}
	},
	// example how to exchange data with a server side listener
	sampleListener: function( ) {
		log( "Retreiving a token from the server via a jWebSocket listener..." );
		if ( mWSC.isConnected( ) ) {
			var lToken = {
				// ns: "my.namespace",
				// type: "getInfo"
				ns: "tld.domain.plugins.myplugin",
				type: "mydemo_function"
			};
			mWSC.sendToken( lToken, {
				OnResponse: function( aToken ) {
					log( "Server responded: "
							+ "vendor: " + aToken.vendor
							+ ", version: " + aToken.version
							);
				}
			} );
		} else {
			log( "Not connected." );
		}
	},
	// example how to obtain any tokenizable object fro the server
	sampleTokenizable: function( ) {
		log( "Retreiving a tokenizable object from the server via a jWebSocket listener..." );
		if ( mWSC.isConnected( ) ) {
			var lToken = {
				ns: "my.namespace",
				type: "getTokenizable"
			};
			mWSC.sendToken( lToken, {
				OnResponse: function( aToken ) {
					log( "Server responded: "
							+ "aToken: " + aToken
							);
				}
			} );
		} else {
			log( "Not connected." );
		}
	},
	// example how to request a result from a server side plugin
	sampleGetTime: function( ) {
		log( "Requesting server time via WebSockets..." );
		// call the getTime method of the client side plug-in
		var lRes = mWSC.requestServerTime( );
		// log error only, on success don't confuse the user
		if ( lRes.code != 0 ) {
			log( mWSC.resultToString( lRes ) );
		}
	},
	// example how to request a result from a server side plugin
	sampleRPC: function( ) {
		log( "Calling RPC via WebSockets..." );
		// call the getMD5 method of the server
		/*
		 var lRes = mWSC.rpc( 
		 "org.jwebsocket.rpc.sample.SampleRPCLibrary", // class
		 "getMD5", // method
		 [ w.HW.eMessage.value ],  // args
		 {
		 
		 }
		 );
		 */
		// call the getMD5 method of the server
		var lRes = mWSC.rpc(
				"org.jwebsocket.rpc.sample.SampleRPCLibrary", // class
				"runListDemo", // method
				[ // args, a list in an array of arguments
					// 1234	// int
					// w.HW.eMessage.value // string
					[ 1, 2, 3, 4, "a", "b", "c", "d" ] // array/list
				],
				{
				}
		);
		// log error only, on success don't confuse the user
		if ( lRes.code != 0 ) {
			log( mWSC.resultToString( lRes ) );
		}
	},
	// example how to request a result from a server side plugin
	sampleSelect: function( ) {

		// example how to request a database 
		// result from a server side plugin
		log( "Requesting JDBC data via WebSockets..." );
		// call the getTime method of the client side plug-in
		var lRes = mWSC.jdbcQuerySQL( "select * from demo_master" );
		// log error only, on success don't confuse the user
		if ( lRes.code != 0 ) {
			log( mWSC.resultToString( lRes ) );
		}

		/*
		 log( "Requesting JDBC data via WebSockets..." );
		 // call the getTime method of the client side plug-in
		 var lRes = mWSC.jdbcSelect( {
		 tables	: [ "demo_master" ],
		 fields	: [ "*" ],
		 orders	: [ "master_id" ],
		 where	: "",
		 group	: "",
		 having	: ""
		 });
		 // log error only, on success don't confuse the user
		 if( lRes.code != 0 ) {
		 log( mWSC.resultToString( lRes ) );
		 }
		 */
		/*
		 log( "Updating JDBC data via WebSockets..." );
		 // call the getTime method of the client side plug-in
		 var lRes = mWSC.jdbcUpdate( {
		 table	: "demo_master",
		 fields	: [ "master_string" ],
		 values	: [ "Master Row #1 ( updated )" ],
		 where	: "master_id=1"
		 });
		 // log error only, on success don't confuse the user
		 if( lRes.code != 0 ) {
		 log( mWSC.resultToString( lRes ) );
		 }
		 */
		/*
		 log( "Inserting JDBC data via WebSockets..." );
		 // call the getTime method of the client side plug-in
		 var lRes = mWSC.jdbcInsert( {
		 table	: "demo_master",
		 fields	: [ "master_string" ],
		 values	: [ "Master Row #1 ( updated )" ]
		 });
		 // log error only, on success don't confuse the user
		 if( lRes.code != 0 ) {
		 log( mWSC.resultToString( lRes ) );
		 }
		 */
		/*
		 log( "Deleting JDBC data via WebSockets..." );
		 // call the getTime method of the client side plug-in
		 var lRes = mWSC.jdbcDelete( {
		 table	: "demo_master",
		 where	: "master_id=6"
		 });
		 */
	},
	/*	getFilelist: function( ) {
	 log( "Retrieving file list from the server via WebSockets..." );
	 // call the getFilelist method of the client side plug-in
	 var lRes = mWSC.fileGetFilelist( 
	 "publicDir", [ "*.*" ],
	 {
	 recursive: true
	 }
	 );
	 // log error only, on success don't confuse the user
	 if( lRes.code != 0 ) {
	 log( mWSC.resultToString( lRes ) );
	 }
	 
	 log( "Creating a report via WebSockets..." );
	 // call the getReports method of the client side plug-in
	 var lRes = mWSC.reportingCreateReport( 
	 "Browser Usage",	// report id
	 null				// report params
	 );
	 // log error only, on success don't confuse the user
	 if( lRes.code != 0 ) {
	 log( mWSC.resultToString( lRes ) );
	 }
	 log( "Retrieving reports via WebSockets..." );
	 // call the getReports method of the client side plug-in
	 var lRes = mWSC.reportingGetReports				( 
	 [ "*.*" ],
	 );
	 // log error only, on success don't confuse the user
	 if( lRes.code != 0 ) {
	 log( mWSC.resultToString( lRes ) );
	 }
	 
	 },
	 loadFile: function( ) {
	 log( "Loading a file from the server via WebSockets..." );
	 // call the getTime method of the client side plug-in
	 var lRes = mWSC.fileLoad( 
	 "test.txt", {
	 scope: jws.SCOPE_PUBLIC
	 }, {decode: true});
	 // log error only, on success don't confuse the user
	 if( lRes.code != 0 ) {
	 log( mWSC.resultToString( lRes ) );
	 }
	 },
	 saveFile: function( ) {
	 log( "Saving a file from the server via WebSockets..." );
	 // call the getTime method of the client side plug-in
	 var lRes = mWSC.fileSave( 
	 "test.txt",
	 w.HW.eMessage.val( ),
	 {
	 scope: jws.SCOPE_PUBLIC
	 }
	 );
	 // log error only, on success don't confuse the user
	 if( lRes.code != 0 ) {
	 log( mWSC.resultToString( lRes ) );
	 }
	 },*/
	cgiTest: function( ) {
		mWSC.sendToken( {
			ns: "org.jwebsocket.plugins.system",
			type: "send",
			subType: "exec",
			unid: "ssal",
			cmd: "test( )"
		} );
	},
	messageOnBlur: function( ) {
		if ( w.HW.eMessage.val( ) == "" ) {
			w.HW.eMessage.val( "Type your message..." );
		}
	},
	messageOnClick: function( ) {
		if ( w.HW.eMessage.val( ) == "Type your message..." ) {
			w.HW.eMessage.val( "" );
		}
	},
	changeContent: function( lName ) {

		switch ( lName ) {
			case "token_area":
				{

					w.HW.eFunctionsArea.hide( );
//				w.HW.eFilesArea.hide( );
					w.HW.eTokensArea.fadeIn( "fast" );

					if ( !w.HW.eBtnTokens.hasClass( "pressed" ) )
						w.HW.eBtnTokens.addClass( "pressed" );
					w.HW.eBtnFiles.removeClass( "pressed" );
					w.HW.eBtnFunctions.removeClass( "pressed" );
					break;
				}
			case "function_area":
				{
					w.HW.eTokensArea.hide( );
//				w.HW.eFilesArea.hide( );
					w.HW.eFunctionsArea.fadeIn( "fast" );

					if ( !w.HW.eBtnFunctions.hasClass( "pressed" ) )
						w.HW.eBtnFunctions.addClass( "pressed" );
					w.HW.eBtnFiles.removeClass( "pressed" );
					w.HW.eBtnTokens.removeClass( "pressed" );
					break;
				}
			case "file_area":
				{
					w.HW.eTokensArea.hide( );
					w.HW.eFunctionsArea.hide( );
//				w.HW.eFilesArea.fadeIn( "fast" );

					if ( !w.HW.eBtnFiles.hasClass( "pressed" ) )
						w.HW.eBtnFiles.addClass( "pressed" );
					w.HW.eBtnFunctions.removeClass( "pressed" );
					w.HW.eBtnTokens.removeClass( "pressed" );
					break;
				}
			default:
				break;
		}
	}
} );

//CALLBACKS
function getServerTimeCallback( aToken ) {
	log( "Server time: " + aToken.time );
}
/*
 function onFileLoadedObs( aToken ) {
 log( "Loaded file: " + aToken.data );
 w.HW.eMessage.val( aToken.data );
 }
 function onFileErrorObs( aToken ) {
 log( "Error loading file: " + aToken.msg );
 }
 function onFileSavedObs( aToken ) {
 var lURL = aToken.filename.toLowerCase( );
 if( lURL.indexOf( ".png" ) > 0
 || lURL.indexOf( ".jpg" ) > 0
 || lURL.indexOf( ".jpeg" ) > 0
 || lURL.indexOf( ".gif" ) > 0 ) {
 var lHTML = "<img src=\"" + aToken.url + "\"/>";
 log( lHTML );
 } else {
 log( "File " + aToken.url + " has been stored on server." );
 }
 }*/