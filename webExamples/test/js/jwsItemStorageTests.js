//	---------------------------------------------------------------------------
//	jWebSocket ItemStorage Plug-in CE test specs (Community Edition, CE)
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

if ( undefined == jws.tests ){
	jws.tests = {};
}
jws.tests.ItemStorage = {

	NS: "jws.tests.itemstorage", 
	
	testCreateCollection: function(aCollectionName, aItemType, aSecretPwd, aAccessPwd, aIsPrivate, aCapacity, aExpectedCode) {
		
		var lSpec = this.NS + ": createItemCollection (admin, " + aCollectionName + ", " + aItemType
		+ ", " + aExpectedCode + ")";
		
		it( lSpec, function () {

			var lResponse = null;
			
			jws.Tests.getAdminConn().setConfiguration(jws.ItemStoragePlugIn.NS, {
				events: {
					itemUpdateOnly: true
				}
			});
			
			jws.Tests.getAdminConn().createCollection( aCollectionName, aItemType, 
				aSecretPwd, aAccessPwd,  aIsPrivate, {
					capacity: aCapacity,
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
	
	testRemoveCollection: function(aCollectionName,aSecretPwd, aExpectedCode) {
		var lSpec = this.NS + ": removeItemCollection (admin, " + aCollectionName + ", " + aSecretPwd
		+ ", " + aExpectedCode + ")";
		
		it( lSpec, function () {

			var lResponse = null;
			jws.Tests.getAdminConn().removeCollection( aCollectionName, aSecretPwd, {
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
	
	testExistsCollection: function(aCollectionName, aExists) {
		var lSpec = this.NS + ": existsCollection (admin, " + aCollectionName
		+ ", " + aExists + ")";
		
		it( lSpec, function () {

			var lResponse = null;
			jws.Tests.getAdminConn().existsCollection( aCollectionName, {
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
				expect( lResponse.exists ).toEqual( aExists );
			});
		});
	},
	
	testSubscribeCollection: function(aCollectionName, aAccessPwd, aExpectedCode) {
		var lSpec = this.NS + ": subscribeCollection (admin, " + aCollectionName + ", " + aAccessPwd
		+ ", " + aExpectedCode + ")";
		
		it( lSpec, function () {

			var lResponse = null;
			var lEvent = null;
			
			jws.Tests.getAdminConn().setItemStorageCallbacks({
				OnCollectionSubscription: function (aToken){
					lEvent = aToken;
				}
			});
			jws.Tests.getAdminConn().subscribeCollection(aCollectionName, aAccessPwd, {
				OnResponse: function( aToken ) {
					if (-1 == aToken.code){
						lEvent = false;
					}
					lResponse = aToken;
				}
			});

			waitsFor(
				function() {
					return( null != lResponse && null != lEvent );
				},
				lSpec,
				3000
				);

			runs( function() {
				expect( lResponse.code ).toEqual( aExpectedCode );
			});
		});
	},
	
	testUnsubscribeCollection: function(aCollectionName, aExpectedCode) {
		var lSpec = this.NS + ": unsubscribeCollection (admin, " + aCollectionName + ", " + aExpectedCode + ")";
		
		it( lSpec, function () {

			var lResponse = null;
			jws.Tests.getAdminConn().unsubscribeCollection(aCollectionName, {
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
	
	testAuthorizeCollection: function(aCollectionName, aSecretPwd, aExpectedCode) {
		var lSpec = this.NS + ": authorizeCollection (admin, " + aCollectionName + ", " + aSecretPwd
		+ ", " + aExpectedCode + ")";
		
		it( lSpec, function () {

			var lResponse = null;
			var lEvent = null;
			
			jws.Tests.getAdminConn().setItemStorageCallbacks({
				OnCollectionAuthorization: function (aToken){
					lEvent = aToken;
				}
			});
			jws.Tests.getAdminConn().authorizeCollection( aCollectionName, aSecretPwd, {
				OnResponse: function( aToken ) {
					if (-1 == aToken.code){
						lEvent = false;
					}
					lResponse = aToken;
				}
			});

			waitsFor(
				function() {
					return( null != lResponse && null != lEvent );
				},
				lSpec,
				3000
				);

			runs( function() {
				expect( lResponse.code ).toEqual( aExpectedCode );
			});
		});
	},
	
	testClearCollection: function(aCollectionName, aSecretPwd, aExpectedCode) {
		var lSpec = this.NS + ": clearCollection (admin, " + aCollectionName + ", " + aSecretPwd
		+ ", " + aExpectedCode + ")";
		
		it( lSpec, function () {

			var lResponse = null;
			var lEvent = null;
			
			jws.Tests.getAdminConn().setItemStorageCallbacks({
				OnCollectionCleaned: function (aToken){
					lEvent = aToken;
				}
			});
			jws.Tests.getAdminConn().clearCollection( aCollectionName, aSecretPwd, {
				OnResponse: function( aToken ) {
					if (-1 == aToken.code){
						lEvent = false;
					}
					lResponse = aToken;
				}
			});

			waitsFor(
				function() {
					return( null != lResponse && null != lEvent );
				},
				lSpec,
				3000
				);

			runs( function() {
				expect( lResponse.code ).toEqual( aExpectedCode );
			});
		});
	},
	
	testEditCollection: function(aCollectionName, aSecretPwd, aNewSecretPwd, 
		aAccessPwd, aIsPrivate, aExpectedCode) {
		var lSpec = this.NS + ": editCollection (admin, " + aCollectionName + ", " 
		+ aSecretPwd + ", " + aExpectedCode + ")";
		
		it( lSpec, function () {

			var lResponse = null;
			
			jws.Tests.getAdminConn().editCollection(aCollectionName, aSecretPwd, {
				newSecretPassword: aNewSecretPwd,
				accessPassword: aAccessPwd,
				isPrivate: aIsPrivate,
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
	
	testRestartCollection: function(aCollectionName, aSecretPwd, aExpectedCode) {
		var lSpec = this.NS + ": restartCollection (admin, " + aCollectionName + ", " 
		+ aSecretPwd + ", " + aExpectedCode + ")";
		
		it( lSpec, function () {

			var lResponse = null;
			var lEvent = null;
			
			jws.Tests.getAdminConn().setItemStorageCallbacks({
				OnCollectionRestarted: function (aToken){
					lEvent = aToken;
				}
			});
			jws.Tests.getAdminConn().restartCollection(aCollectionName, aSecretPwd, {
				OnResponse: function( aToken ) {
					if (-1 == aToken.code){
						lEvent = false;
					}
					lResponse = aToken;
				}
			});

			waitsFor(
				function() {
					return( null != lResponse && null != lEvent );
				},
				lSpec,
				3000
				);

			runs( function() {
				expect( lResponse.code ).toEqual( aExpectedCode );
			});
		});
	},
	
	testGetCollectionNames: function( aUserOnly, aExpectedCode, aExpectedSize) {
		var lSpec = this.NS + ": getCollectionNames (admin, " + aExpectedCode + ", " + aExpectedSize + ")";
		
		it( lSpec, function () {

			var lResponse = null;
			
			jws.Tests.getAdminConn().getCollectionNames( aUserOnly, {
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
				if (0 == lResponse.code){
					expect( aExpectedSize == lResponse.data.length );
				}
			});
		});
	},
	
	testFindCollection: function( aCollectionName, aFound ) {
		var lSpec = this.NS + ": findCollection (admin, " + aCollectionName + ", " + aFound + ")";
		
		it( lSpec, function () {

			var lResponse = null;
			
			jws.Tests.getAdminConn().findCollection( aCollectionName, {
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
				expect( null != lResponse.data ).toEqual( aFound );
			});
		});
	},
	
	testSaveItem: function( aCollectionName, aItem, aExpectedCode ) {
		var lSpec = this.NS + ": saveItem (admin, " + aCollectionName + ", " + aExpectedCode + ")";
		
		it( lSpec, function () {

			var lResponse = null;
			var lEvent = null;
			
			jws.Tests.getAdminConn().setItemStorageCallbacks({
				OnItemSaved: function (aToken){
					lEvent = aToken;
				}
			});
			
			jws.Tests.getAdminConn().saveItem(aCollectionName, aItem, {
				OnResponse: function( aToken ) {
					if (0 != aToken.code){
						lEvent = false;
					}
					lResponse = aToken;
				}
			});

			waitsFor(
				function() {
					return( null != lResponse && null != lEvent );
				},
				lSpec,
				3000
				);

			runs( function() {
				expect( lResponse.code ).toEqual( aExpectedCode );
			});
		});
	},
	
	testRemoveItem: function( aCollectionName, aPK, aExpectedCode ) {
		var lSpec = this.NS + ": removeItem (admin, " + aCollectionName + ", " + aPK + ", " + aExpectedCode + ")";
		
		it( lSpec, function () {

			var lResponse = null;
			var lEvent = null;
			
			jws.Tests.getAdminConn().setItemStorageCallbacks({
				OnItemRemoved: function (aToken){
					lEvent = aToken;
				}
			});
			
			jws.Tests.getAdminConn().removeItem(aCollectionName, aPK, {
				OnResponse: function( aToken ) {
					if (0 != aToken.code){
						lEvent = false;
					}
					lResponse = aToken;
				}
			});

			waitsFor(
				function() {
					return( null != lResponse && null != lEvent );
				},
				lSpec,
				3000
				);

			runs( function() {
				expect( lResponse.code ).toEqual( aExpectedCode );
			});
		});
	},
	
	testFindItemByPK: function( aCollectionName, aPK, aExpectedCode, aExists ) {
		var lSpec = this.NS + ": findItemByPK (admin, " + aCollectionName + ", " + aPK + ", " + aExists + ")";
		
		it( lSpec, function () {

			var lResponse = null;
			jws.Tests.getAdminConn().findItemByPK(aCollectionName, aPK, {
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
				if (0 == lResponse.code && aExists){
					expect( lResponse.data.pk  ).toEqual( aPK );
				}
			});
		});
	},
	
	testExistsItem: function( aCollectionName, aPK, aExists ) {
		var lSpec = this.NS + ": findItemByPK (admin, " + aCollectionName + ", " + aPK + ", " + aExists + ")";
		
		it( lSpec, function () {

			var lResponse = null;
			jws.Tests.getAdminConn().existsItem(aCollectionName, aPK, {
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
				expect( lResponse.exists  ).toEqual( aExists );
			});
		});
	},
	
	testFindItemDef: function( aItemType, aExists ) {
		var lSpec = this.NS + ": findItemDefinition (admin, " + aItemType + ", " 
		+ aExists + ")";
		
		it( lSpec, function () {

			var lResponse = null;
			jws.Tests.getAdminConn().findItemDefinition(aItemType, {
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
				expect( null != lResponse.data["type"] ).toEqual( aExists );
			});
		});
	},
	
	testExistsItemDef: function( aItemType, aExists ) {
		var lSpec = this.NS + ": existsItemDefinition (admin, " + aItemType + ", " 
		+ aExists + ")";
		
		it( lSpec, function () {

			var lResponse = null;
			jws.Tests.getAdminConn().existsItemDefinition(aItemType, {
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
				expect( lResponse.exists ).toEqual( aExists );
			});
		});
	},
	
	testListItemDef: function( aExpectedSize ) {
		var lSpec = this.NS + ": listDefinitions (admin, " + aExpectedSize + ")";
		
		it( lSpec, function () {

			var lResponse = null;
			jws.Tests.getAdminConn().listItemDefinitions({
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
				expect( lResponse.data.length >= aExpectedSize ).toEqual( true );
			});
		});
	},
	
	testListItems: function( aCollectionName, aOffset, aLength, aExpectedCode, aExpectedSize) {
		var lSpec = this.NS + ": listItems (admin, " + aCollectionName + ", " + aOffset 
		+ ", " + aLength + ", " + aExpectedSize + ", " + aExpectedCode + ")";
		
		it( lSpec, function () {

			var lResponse = null;
			jws.Tests.getAdminConn().listItems(aCollectionName, {
				offset: aOffset,
				length: aLength,
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
				if (0 == lResponse.code){
					expect( lResponse.data.length  ).toEqual( aExpectedSize );
				}
			});
		});
	},
	
	runSpecs: function() {
		var lCollectionName = "myContacts";
		var lPwd = "123";
		
		// create
		this.testCreateCollection(lCollectionName, "contact", lPwd, lPwd, false, 10, 0);
		this.testCreateCollection(lCollectionName, "contact", lPwd, lPwd, false, 10, -1);
		// get names
		this.testGetCollectionNames(false, 0, 1);
		this.testGetCollectionNames(true, 0, 1);
		
		// exists collection
		this.testExistsCollection(lCollectionName, true);
		
		// create other
		this.testCreateCollection(lCollectionName + "1", "contact", lPwd, lPwd, false, 10, 0);
		
		// exists collection
		this.testExistsCollection(lCollectionName + "1", true);
		// exists collection
		this.testExistsCollection("wrong collection name", false);
		
		// get names
		this.testGetCollectionNames(false, 0, 2);
		this.testGetCollectionNames(true, 0, 2);
		
		// get collection
		this.testFindCollection(lCollectionName, true);
		this.testFindCollection("wrong collection name", false);

		// subscribe
		this.testSubscribeCollection(lCollectionName, lPwd, 0);
		this.testUnsubscribeCollection(lCollectionName, 0);
		this.testSubscribeCollection(lCollectionName, lPwd, 0);
		this.testSubscribeCollection(lCollectionName, lPwd, -1); // subscribed already
		this.testSubscribeCollection(lCollectionName, "wrong password", -1);

		// restart
		this.testRestartCollection(lCollectionName, lPwd, 0);
		
		// find by PK
		this.testFindItemByPK("wrongCollectionName", "rsantamaria", -1, 
			true); // should fail (collection not exists)
		this.testFindItemByPK(lCollectionName, "rsantamaria", -1, 
			false); // should fail (not subscribed)
			
		// subscribe again
		this.testSubscribeCollection(lCollectionName, lPwd, 0);
		
		// save item
		this.testSaveItem("wrongCollectionName", {
			name: "Rolando SM",
			mailAddress: "rsantamaria@jwebsocket.org",
			siteURL: "http://jwebsocket.org",
			comment: "jWebSocket developer",
			image: "base64 image content",
			username: "rsantamaria",
			sex: true
		}, -1); // should fail (collection not exists)
		
		// save item
		this.testSaveItem(lCollectionName, {
			name: "Rolando SM",
			mailAddress: "rsantamaria@jwebsocket.org",
			siteURL: "http://jwebsocket.org",
			comment: "jWebSocket developer",
			image: "base64 image content",
			username: "rsantamaria",
			sex: true
		}, -1); // should fail (not authorized)
		
		this.testRemoveItem(lCollectionName, "rsantamaria", 
			-1); // should fail (not authorized)
		this.testRemoveItem("wrongCollectionName", "rsantamaria", 
			-1); // should fail (collection not exists)

		// authorize
		this.testAuthorizeCollection(lCollectionName, lPwd, 0);
		
		// save item
		this.testSaveItem(lCollectionName, {
			name: "Rolando SM",
			mailAddress: "rsantamaria@jwebsocket.org",
			siteURL: "http://jwebsocket.org",
			comment: "jWebSocket developer",
			image: "base64 image content",
			username: "rsantamaria",
			sex: true
		}, 0);
		
		// save item (modify)
		this.testSaveItem(lCollectionName, {
			name: "Rolando Santamaria Maso",
			username: "rsantamaria"
		}, 0);
		
		// find by PK
		this.testFindItemByPK(lCollectionName, "rsantamaria", 0, true);
		this.testFindItemByPK(lCollectionName, "wrongPK", 0, false);
		
		// list items
		this.testListItems(lCollectionName, 0, 1, 0, 1);
		this.testListItems(lCollectionName, 5, 1, -1, 
			0); // should fail (index out of bound)
		this.testListItems(lCollectionName, 0, -1, -1, 
			0); // should fail (expected length > 0)
		
		// remove item
		this.testExistsItem(lCollectionName, "rsantamaria", true);
		
		// remove item
		this.testRemoveItem(lCollectionName, "rsantamaria", 0);
		this.testExistsItem(lCollectionName, "rsantamaria", false);
		this.testRemoveItem(lCollectionName, "rsantamaria", 
			-1); // should fail (item not exists)
		
		// save item
		this.testSaveItem(lCollectionName, {
			name: "Rolando SM",
			mailAddress: "rsantamaria@jwebsocket.org",
			siteURL: "http://jwebsocket.org",
			comment: "jWebSocket developer",
			image: "base64 image content",
			sex: true
		}, -1); // should fail (missing PK)
		// 
		// save item
		this.testSaveItem(lCollectionName, {
			name: "Rolando SM",
			mailAddress: "rsantamaria@jwebsocket.org",
			siteURL: "http://jwebsocket.org",
			comment: "jWebSocket developer",
			image: "base64 image content",
			sex: true,
			arbitraryAttr: "bla bla bla"
		}, -1); // should fail (missing attribute definition)
		
		this.testAuthorizeCollection(lCollectionName, lPwd, -1); // authorized already
		this.testAuthorizeCollection(lCollectionName, "wrong password", -1);
		
		// save item
		this.testSaveItem(lCollectionName, {
			name: "Rolando SM",
			mailAddress: "rsantamaria@jwebsocket.org",
			siteURL: "http://jwebsocket.org",
			comment: "jWebSocket developer",
			image: "base64 image content",
			username: "rsantamaria",
			sex: true
		}, 0);
		
		// clear
		this.testClearCollection(lCollectionName, lPwd, 0);
		this.testClearCollection(lCollectionName, "wrong password", -1);
		
		// change config
		this.testEditCollection(lCollectionName, lPwd, "abc", "abc", true, 0);
		this.testEditCollection(lCollectionName, lPwd, "abc", "abc", true, -1);
		this.testEditCollection(lCollectionName, "abc", lPwd, lPwd, false, 0);
		
		this.testRemoveCollection(lCollectionName, "wrong password", -1);
		this.testRemoveCollection(lCollectionName, lPwd, 0);
		this.testRemoveCollection(lCollectionName + "1", lPwd, 0);
		
		// list definitions
		this.testListItemDef(1);
	},

	runSuite: function() {
		var lThis = this;
		describe( "Performing test suite: " + this.NS + "...", function () {
			lThis.runSpecs();
		});
	}	

};