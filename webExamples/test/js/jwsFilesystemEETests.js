//	---------------------------------------------------------------------------
//	jWebSocket Filesystem Plug-in EE test specs (Community Edition, CE)
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

if ( undefined == jws.tests.enterprise ){
	jws.tests.enterprise = {};
}
jws.tests.enterprise.FileSystem = {

	NS: "jws.tests.enterprise.filesystem", 
	
	TEST_FILE_DATA: "This is a string to be saved into the test file!",
	TEST_FILE_DATA2: " The enterprise FileSystem plug-in supports ",
	TEST_FILE_DATA3: " saving files by chunks!",
	
	TEST_FOLDER: "privFolder",
	TEST_FILE_NAME: "test.txt",

	testFileSave: function(aFilename, aData, aScope) {
		var lSpec = this.NS + ": FileSave (admin, " + aFilename + ", " + aScope + ")";
		var lData = aData;
		var lFilename = aFilename;
		
		it( lSpec, function () {

			var lResponse = null;

			jws.Tests.getAdminConn().fileSave( lFilename, lData, {
				encode: true,
				scope: aScope,
				OnResponse: function( aToken ) {
					lResponse = aToken;
				}
			});

			waitsFor(
				function() {
					return( null != lResponse );
				},
				lSpec,
				3000
				);

			runs( function() {
				expect( lResponse.code ).toEqual( 0 );
			});

		});
	},
	
	testFileSaveByChunks: function(aFilename, aData, aIsChunk, aScope) {
		var lSpec = this.NS + ": FileSaveByChunks (admin, " + aFilename + ", " + aScope + ")";
		var lData = aData;
		var lFilename = aFilename;
		var lIsChunk = aIsChunk;
		
		it( lSpec, function () {

			var lResponse = null;

			jws.Tests.getAdminConn().fileSaveByChunks( lFilename, lData, lIsChunk, {
				encode: true,
				scope: aScope,
				OnResponse: function( aToken ) {
					lResponse = aToken;
				}
			});

			waitsFor(
				function() {
					return( null != lResponse );
				},
				lSpec,
				3000
				);

			runs( function() {
				expect( lResponse.code ).toEqual( 0 );
			});

		});
	},
	
	testFileRename: function(aFilename, aNewFilename, aScope, aExpectedCode){
		var lSpec = this.NS + ": FileRename (admin, " + aFilename + ", " + aNewFilename + ",  " + aScope + ")";
		
		it( lSpec, function () {

			var lResponse = null;
			
			jws.Tests.getAdminConn().fileRename( aFilename, aNewFilename, aScope, {
				OnResponse: function(aToken){
					lResponse = aToken;
				}
			});

			waitsFor(
				function() {
					return( null != lResponse );
				},
				lSpec,
				3000
				);

			runs( function() {
				expect( lResponse.code ).toEqual( aExpectedCode );
			});

		});
	},
	
	testFileSend: function(aFilename, aData) {
		var lSpec = this.NS + ": FileSend (admin, " + aFilename + ")";
		
		it( lSpec, function () {

			var lResponse = null;
			jws.Tests.getAdminConn().setFileSystemCallbacks({
				OnFileReceived: function(aToken){
					lResponse = aToken;
				}
			});
			jws.Tests.getAdminConn().fileSend( jws.Tests.getAdminConn().getId(), aFilename, aData, {
				encoding: "base64"
			});

			waitsFor(
				function() {
					return( null != lResponse );
				},
				lSpec,
				3000
				);

			runs( function() {
				expect( lResponse.filename ).toEqual( aFilename );
				expect( lResponse.data ).toEqual( aData );
			});

		});
	},
	
	testFileSendByChunks: function(aFilename, aDataArray) {
		var lSpec = this.NS + ": FileSendByChunks (admin, " + aFilename + ")";
		
		it( lSpec, function () {

			var lChunks = aDataArray;
			var lChunkPosition = 0;
			var lOK = true;
			
			jws.Tests.getAdminConn().setEnterpriseFileSystemCallbacks({
				OnChunkReceived: function(aToken){
					if (!(lChunks[lChunkPosition++] == aToken.data)){
						lOK = false;
					}
				}
			});
			for (var lIndex = 0; lIndex < aDataArray.length; lIndex++ ){
				var lIsLast = (lIndex + 1 == aDataArray.length);
				jws.Tests.getAdminConn().fileSendByChunks( jws.Tests.getAdminConn().getId(), 
					aFilename, aDataArray[lIndex], lIsLast, {
						encoding: "base64"
					});
			}

			waitsFor(
				function() {
					return( lChunkPosition == lChunks.length  );
				},
				lSpec,
				3000
				);

			runs( function() {
				expect( lOK ).toEqual( true );
			});

		});
	},

	testGetFilelist: function(aAlias, aFilemasks, aRecursive, aExpectedList){
		var lSpec = this.NS + ": GetFilelist (admin, " + aAlias + ", " + 
		JSON.stringify(aFilemasks) + ", " + aRecursive + ")";
		
		it( lSpec, function () {

			var lResponse = null;

			jws.Tests.getAdminConn().fileGetFilelist( aAlias, aFilemasks, {
				recursive: aRecursive,
				OnResponse: function( aToken ) {
					lResponse = aToken;
				}
			});

			waitsFor(
				function() {
					return( null != lResponse );
				},
				lSpec,
				3000
				);

			runs( function() {
				expect( lResponse.code ).toEqual( 0 );
				
				var lObtainedKeys = [];
				lResponse.files.forEach(function(aItem){
					lObtainedKeys.push(aItem.filename);
				});
					
				expect( lObtainedKeys.sort() ).toEqual( aExpectedList.sort() );
			})

		});
	},

	testFileLoad: function(aFilename, aAlias, aExpectedData) {
		var lSpec = this.NS + ": FileLoad (admin, " + aFilename + ", " + aAlias + ")";
		var lData = aExpectedData;
		var lFilename = aFilename;
		
		it( lSpec, function () {

			var lResponse = null;

			jws.Tests.getAdminConn().fileLoad( lFilename, aAlias, {
				decode: true,
				OnResponse: function( aToken ) {
					lResponse = aToken;
				}
			});

			waitsFor(
				function() {
					return( null != lResponse );
				},
				lSpec,
				3000
				);

			runs( function() {
				expect( lResponse.data ).toEqual( lData );
			});

		});
	},
	
	testStartObserve: function(aExpectedCode) {
		var lSpec = this.NS + ": startObserve (admin)";
		
		it( lSpec, function () {

			var lResponse = null;

			jws.Tests.getAdminConn().fsStartObserve({
				OnResponse: function( aToken ) {
					lResponse = aToken;
				}
			});

			waitsFor(
				function() {
					return( null != lResponse );
				},
				lSpec,
				3000
				);

			runs( function() {
				expect( lResponse.code ).toEqual( aExpectedCode );
			});

		});
	},
	
	testStopObserve: function(aExpectedCode) {
		var lSpec = this.NS + ": stopObserve (admin)";
		
		it( lSpec, function () {

			var lResponse = null;

			jws.Tests.getAdminConn().fsStopObserve({
				OnResponse: function( aToken ) {
					lResponse = aToken;
				}
			});

			waitsFor(
				function() {
					return( null != lResponse );
				},
				lSpec,
				3000
				);

			runs( function() {
				expect( lResponse.code ).toEqual( aExpectedCode );
			});

		});
	},
	
	testFileLoadByChunks: function(aFilename, aAlias, aOffset, aLength, aExpectedData) {
		var lSpec = this.NS + ": FileLoadByChunks (admin, " + aFilename + ", " + aAlias + ")";
		var lData = aExpectedData;
		var lFilename = aFilename;
		
		it( lSpec, function () {

			var lResponse = null;

			jws.Tests.getAdminConn().fileLoadByChunks( lFilename, aAlias, aOffset, aLength ,{
				decode: true,
				OnResponse: function( aToken ) {
					lResponse = aToken;
				}
			});

			waitsFor(
				function() {
					return( null != lResponse );
				},
				lSpec,
				3000
				);

			runs( function() {
				expect( lResponse.data ).toEqual( lData );
			});
		});
	},
	
	testFileDelete: function(aFilename, aForce, aExpectedCode) {
		var lSpec = this.NS + ": FileDelete (admin, " + aFilename + ", " + aExpectedCode + ")";
		
		it( lSpec, function () {

			var lResponse = null;

			jws.Tests.getAdminConn().fileDelete( aFilename, aForce, {
				OnResponse: function( aToken ) {
					lResponse = aToken;
				}
			});

			waitsFor(
				function() {
					return( null != lResponse );
				},
				lSpec,
				3000
				);

			runs( function() {
				expect( lResponse.code ).toEqual( aExpectedCode );
			});

		});
	},
	
	testDirectoryDelete: function(aDirectory, aExpectedCode) {
		var lSpec = this.NS + ": DirectoryDelete (admin, " + aDirectory + ", " + aExpectedCode + ")";
		
		it( lSpec, function () {

			var lResponse = null;

			jws.Tests.getAdminConn().directoryDelete( aDirectory, {
				OnResponse: function( aToken ) {
					lResponse = aToken;
				}
			});

			waitsFor(
				function() {
					return( null != lResponse );
				},
				lSpec,
				3000
				);

			runs( function() {
				expect( lResponse.code ).toEqual( aExpectedCode );
			});

		});
	},
	
	testFileExists: function(aAlias, aFilename, aExpectedValue) {
		var lSpec = this.NS + ": FileExists (admin, " + aAlias + ", " + aFilename + ")";
		var lFilename = aFilename;
		var lAlias = aAlias;
		
		it( lSpec, function () {

			var lResponse = null;

			jws.Tests.getAdminConn().fileExists( lFilename, lAlias, {
				OnResponse: function( aToken ) {
					lResponse = aToken;
				}
			});

			waitsFor(
				function() {
					return( null != lResponse );
				},
				lSpec,
				3000
				);

			runs( function() {
				expect( lResponse.code ).toEqual( 0 );
				expect( lResponse.exists ).toEqual( aExpectedValue );
			});

		});
	},

	runSpecs: function() {
		jws.tests.enterprise.FileSystem.testStartObserve(0);
		jws.tests.enterprise.FileSystem.testStartObserve(-1);
		
		jws.tests.enterprise.FileSystem.testFileSaveByChunks(
			this.TEST_FOLDER + "/" + this.TEST_FILE_NAME,
			this.TEST_FILE_DATA,
			false, 
			jws.SCOPE_PRIVATE);

		jws.tests.enterprise.FileSystem.testFileSaveByChunks(
			this.TEST_FOLDER + "/" + this.TEST_FILE_NAME,
			this.TEST_FILE_DATA2,
			false, 
			jws.SCOPE_PRIVATE);
		
		jws.tests.enterprise.FileSystem.testFileSaveByChunks(
			this.TEST_FOLDER + "/" + this.TEST_FILE_NAME,
			this.TEST_FILE_DATA3,
			true, 
			jws.SCOPE_PRIVATE);
			
		jws.tests.enterprise.FileSystem.testFileRename(this.TEST_FOLDER + "/" + this.TEST_FILE_NAME, 
			this.TEST_FOLDER + "/" + this.TEST_FILE_NAME + 5, 
			jws.FileSystemPlugIn.SCOPE_PRIVATE, 
			0);

		jws.tests.enterprise.FileSystem.testFileRename(this.TEST_FOLDER + "/" + this.TEST_FILE_NAME + 5, 
			this.TEST_FOLDER + "/" + this.TEST_FILE_NAME, 
			jws.FileSystemPlugIn.SCOPE_PRIVATE, 
			0);

		jws.tests.FileSystem.testFileLoad(
			this.TEST_FOLDER + "/" + this.TEST_FILE_NAME,
			jws.FileSystemPlugIn.ALIAS_PRIVATE,
			this.TEST_FILE_DATA + this.TEST_FILE_DATA2 + this.TEST_FILE_DATA3);

		jws.tests.enterprise.FileSystem.testDirectoryDelete(this.TEST_FOLDER, 0);	
		jws.tests.enterprise.FileSystem.testDirectoryDelete(this.TEST_FOLDER, -1);	

		jws.tests.FileSystem.testFileSave(
			this.TEST_FILE_NAME,
			this.TEST_FILE_DATA, 
			jws.SCOPE_PUBLIC);
		
		jws.tests.FileSystem.testFileLoad(
			this.TEST_FILE_NAME, 
			jws.FileSystemPlugIn.ALIAS_PUBLIC,
			this.TEST_FILE_DATA);
			
		jws.tests.enterprise.FileSystem.testFileLoadByChunks(
			this.TEST_FILE_NAME, 
			jws.FileSystemPlugIn.ALIAS_PUBLIC,
			-5,
			4,
			"file");
		jws.tests.enterprise.FileSystem.testFileLoadByChunks(
			this.TEST_FILE_NAME, 
			jws.FileSystemPlugIn.ALIAS_PUBLIC,
			0,
			4,
			"This");
			
		jws.tests.enterprise.FileSystem.testFileLoadByChunks(
			this.TEST_FILE_NAME, 
			jws.FileSystemPlugIn.ALIAS_PUBLIC,
			2,
			4,
			"is i");
		
		jws.tests.FileSystem.testFileExists(
			jws.FileSystemPlugIn.ALIAS_PUBLIC, 
			this.TEST_FILE_NAME, 
			true);
		
		jws.tests.FileSystem.testFileExists(
			jws.FileSystemPlugIn.ALIAS_PRIVATE, 
			"unexisting_file.txt", 
			false);
		
		jws.tests.FileSystem.testFileSave(
			this.TEST_FILE_NAME, 
			this.TEST_FILE_DATA, 
			jws.SCOPE_PRIVATE);
			
		jws.tests.FileSystem.testFileExists(
			jws.FileSystemPlugIn.ALIAS_PRIVATE, 
			this.TEST_FILE_NAME, 
			true);
		
		jws.tests.FileSystem.testGetFilelist(
			jws.FileSystemPlugIn.ALIAS_PUBLIC, 
			["*.txt"], 
			true, [this.TEST_FILE_NAME]);
		
		jws.tests.FileSystem.testGetFilelist(
			jws.FileSystemPlugIn.ALIAS_PRIVATE, 
			["*.txt"], 
			true, 
			[this.TEST_FILE_NAME]);
		
		jws.tests.FileSystem.testFileSend(this.TEST_FILE_NAME, this.TEST_FILE_DATA);
		jws.tests.enterprise.FileSystem.testFileSendByChunks(this.TEST_FILE_NAME, 
			[this.TEST_FILE_DATA, 
			this.TEST_FILE_DATA2, 
			this.TEST_FILE_DATA3]);
		jws.tests.FileSystem.testFileSend(this.TEST_FILE_NAME, this.TEST_FILE_DATA);
		jws.tests.FileSystem.testFileDelete(this.TEST_FILE_NAME, true, 0);
		jws.tests.FileSystem.testFileDelete(this.TEST_FILE_NAME, true, -1);
		
		jws.tests.enterprise.FileSystem.testStopObserve(0);
		jws.tests.enterprise.FileSystem.testStopObserve(-1);
	},

	runSuite: function() {
		var lThis = this;
		describe( "Performing test suite: " + this.NS + "...", function () {
			lThis.runSpecs();
		});
	}	

};