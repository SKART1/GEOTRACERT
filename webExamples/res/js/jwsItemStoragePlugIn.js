//	---------------------------------------------------------------------------
//	jWebSocket ItemStorage Client Plug-In (Community Edition, CE)
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

jws.ItemStoragePlugIn = {

	// namespace for item storage plugin
	// if namespace is changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.itemstorage",
	
	processToken: function( aToken ) {
		// check if namespace matches
		if( aToken.ns == jws.ItemStoragePlugIn.NS ) {
			if ( "event" == aToken.type ){
				if ( "itemSaved" == aToken.name ){
					if ( this.OnItemSaved ){
						this.OnItemSaved(aToken);
					} 
				} else if ( "itemRemoved" == aToken.name ){
					if ( this.OnItemRemoved ){
						this.OnItemRemoved(aToken);
					} 
				} else if ( "collectionCleaned" == aToken.name ){
					if ( this.OnCollectionCleaned ){
						this.OnCollectionCleaned(aToken);
					} 
				} else if ( "collectionRestarted" == aToken.name ){
					if ( this.OnCollectionRestarted ){
						this.OnCollectionRestarted(aToken);
					} 
				} else if ( "collectionRemoved" == aToken.name ){
					if ( this.OnCollectionRemoved ){
						this.OnCollectionRemoved(aToken);
					} 
				} else if ( "collectionSaved" == aToken.name ){
					if ( this.OnCollectionSaved ){
						this.OnCollectionSaved(aToken);
					} 
				} else if ( "authorization" == aToken.name ){
					if ( this.OnCollectionAuthorization ){
						this.OnCollectionAuthorization(aToken);
					} 
				} else if ( "subscription" == aToken.name ){
					if ( this.OnCollectionSubscription ){
						this.OnCollectionSubscription(aToken);
					} 
				} else if ( "unsubscription" == aToken.name ){
					if ( this.OnCollectionUnsubscription ){
						this.OnCollectionUnsubscription(aToken);
					} 
				} 
			}
		}
	},
	
	//:m:*:createCollection
	//:d:en:Creates an item collection
	//:a:en::aCollectionName:String:The item collection name
	//:a:en::aItemType:String:The collection item type
	//:a:en::aSecretPwd:String:The collection secret password
	//:a:en::aAccessPwd:String:The collection access password
	//:a:en::aIsPrivate:Boolean:Indicates if the collection will be privated or public
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:a:en::aOptions.capacity:Integer:The collection capacity. A collection by default has unlimited capacity.
	//:a:en::aOptions.capped:Boolean:Indicates if the collection is capped. 
	//:r:*:::void:none
	createCollection: function(aCollectionName, aItemType, aSecretPwd, aAccessPwd, aIsPrivate, aOptions){
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.ItemStoragePlugIn.NS,
				type: "createCollection",
				collectionName: aCollectionName,
				itemType: aItemType,
				secretPassword: aSecretPwd,
				accessPassword: aAccessPwd,
				"private": aIsPrivate
			};
			if (aOptions.capacity){
				lToken.capacity = aOptions.capacity;
			}
			if (aOptions.capped){
				lToken.capped = aOptions.capped;
			}
			this.sendToken( lToken,	aOptions );
		}	
		return lRes;
	},
	
	//:m:*:removeCollection
	//:d:en:Removes an item collection
	//:a:en::aCollectionName:String:The item collection name
	//:a:en::aSecretPwd:String:The collection secret password
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:r:*:::void:none
	removeCollection: function(aCollectionName, aSecretPwd, aOptions){
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.ItemStoragePlugIn.NS,
				type: "removeCollection",
				collectionName: aCollectionName,
				secretPassword: aSecretPwd
			};
			this.sendToken( lToken,	aOptions );
		}	
		return lRes;
	},
	
	//:m:*:existsCollection
	//:d:en:Indicates if an item collection exists
	//:a:en::aCollectionName:String:The item collection name
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:r:*:::void:none
	existsCollection: function(aCollectionName, aOptions){
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.ItemStoragePlugIn.NS,
				type: "existsCollection",
				collectionName: aCollectionName
			};
			this.sendToken( lToken,	aOptions );
		}	
		return lRes;
	},

	//:m:*:subscribeCollection
	//:d:en:Subscribe to an item collection
	//:a:en::aCollectionName:String:The item collection name
	//:a:en::aAccessPwd:String:The collection access password
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:r:*:::void:none
	subscribeCollection: function(aCollectionName, aAccessPwd, aOptions){
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.ItemStoragePlugIn.NS,
				type: "subscribe",
				collectionName: aCollectionName,
				accessPassword: aAccessPwd
			};
			this.sendToken( lToken,	aOptions );
		}	
		return lRes;
	},
	
	//:m:*:unsubscribeCollection
	//:d:en:Unsubscribe from an item collection
	//:a:en::aCollectionName:String:The item collection name
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:r:*:::void:none
	unsubscribeCollection: function(aCollectionName, aOptions){
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.ItemStoragePlugIn.NS,
				type: "unsubscribe",
				collectionName: aCollectionName
			};
			this.sendToken( lToken,	aOptions );
		}	
		return lRes;
	},
	
	//:m:*:authorizeCollection
	//:d:en:Authorize to an item collection
	//:a:en::aCollectionName:String:The item collection name
	//:a:en::aSecretPwd:String:The collection secret password
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:r:*:::void:none
	authorizeCollection: function(aCollectionName, aSecretPwd, aOptions){
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.ItemStoragePlugIn.NS,
				type: "authorize",
				collectionName: aCollectionName,
				secretPassword: aSecretPwd
			};
			this.sendToken( lToken,	aOptions );
		}	
		return lRes;
	},
	
	//:m:*:clearCollection
	//:d:en:Clear an item collection
	//:a:en::aCollectionName:String:The item collection name
	//:a:en::aSecretPwd:String:The collection secret password
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:r:*:::void:none
	clearCollection: function(aCollectionName, aSecretPwd, aOptions){
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.ItemStoragePlugIn.NS,
				type: "clearCollection",
				collectionName: aCollectionName,
				secretPassword: aSecretPwd
			};
			this.sendToken( lToken,	aOptions );
		}	
		return lRes;
	},
	
	//:m:*:editCollection
	//:d:en:Edit an item collection
	//:a:en::aCollectionName:String:The item collection name
	//:a:en::aSecretPwd:String:The collection secret password
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:a:en::aOptions.newSecretPassword:String:Optional argument that override the collection 'secretPassword' attribute value.
	//:a:en::aOptions.accessPassword:String:Optional argument that override the collection 'accessPassword' attribute value.
	//:a:en::aOptions.private:String:Optional argument that override the collection 'private' attribute value.
	//:a:en::aOptions.capped:Boolean:Optional argument that override the collection 'capped' attribute value.
	//:r:*:::void:none	
	editCollection: function(aCollectionName, aSecretPwd, aOptions){
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.ItemStoragePlugIn.NS,
				type: "editCollection",
				collectionName: aCollectionName,
				secretPassword: aSecretPwd
			};
			if (aOptions.newSecretPassword){
				lToken.newSecretPassword = aOptions.newSecretPassword;
			}
			if (aOptions.accessPassword){
				lToken.accessPassword = aOptions.accessPassword;
			}
			if (aOptions["private"]){
				lToken["private"] = aOptions["private"];
			}
			if (aOptions.capped){
				lToken.capped = aOptions.capped;
			}
			if (aOptions.capacity){
				lToken.capacity = aOptions.capacity;
			}
			this.sendToken( lToken,	aOptions );
		}	
		return lRes;
	},
	
	//:m:*:restartCollection
	//:d:en:Restart an item collection
	//:a:en::aCollectionName:String:The item collection name
	//:a:en::aSecretPwd:String:The collection secret password
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:r:*:::void:none
	restartCollection: function(aCollectionName, aSecretPwd, aOptions){
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.ItemStoragePlugIn.NS,
				type: "restartCollection",
				collectionName: aCollectionName,
				secretPassword: aSecretPwd
			};
			this.sendToken( lToken,	aOptions );
		}	
		return lRes;
	},
	
	//:m:*:getCollectionNames
	//:d:en:Get the name of existing collections
	//:a:en::aUserOnly:Boolean:If TRUE, only the user collections name are returned. 
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:a:en::aOptions.offset:Integer:The number of collection names to be discarded on the result. Default value is 0
	//:a:en::aOptions.length:Integer:The maximum number of collection names to be returned. Default value is 10 
	//:r:*:::void:none
	getCollectionNames: function(aUserOnly, aOptions){
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.ItemStoragePlugIn.NS,
				type: "getCollectionNames",
				userOnly: aUserOnly || false
			};
			if (!aOptions){
				aOptions = {};
			}
			if (aOptions.offset){
				lToken.offset = aOptions.offset;
			}
			if (aOptions.length){
				lToken.length = aOptions.length;
			}
			
			this.sendToken( lToken,	aOptions );
		}	
		return lRes;
	},
	
	//:m:*:findCollection
	//:d:en:Find an item collection
	//:a:en::aCollectionName:String:The item collection name
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:r:*:::void:none
	findCollection: function(aCollectionName, aOptions){
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.ItemStoragePlugIn.NS,
				type: "findCollection",
				collectionName: aCollectionName
			};
			this.sendToken( lToken,	aOptions );
		}	
		return lRes;
	},

	//:m:*:saveItem
	//:d:en:Saves an item on a target collection
	//:a:en::aCollectionName:String:The item collection name
	//:a:en::aItem:Object:The item to be saved
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:r:*:::void:none
	saveItem: function(aCollectionName, aItem, aOptions){
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.ItemStoragePlugIn.NS,
				type: "saveItem",
				collectionName: aCollectionName,
				item: aItem
			};
			this.sendToken( lToken,	aOptions );
		}	
		return lRes;
	},
	
	//:m:*:removeCollection
	//:d:en:Removes an item on a target collection
	//:a:en::aCollectionName:String:The item collection name
	//:a:en::aPK:String:The primary key of the item to be removed
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:r:*:::void:none
	removeItem: function(aCollectionName, aPK, aOptions){
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.ItemStoragePlugIn.NS,
				type: "removeItem",
				collectionName: aCollectionName,
				itemPK: aPK
			};
			this.sendToken( lToken,	aOptions );
		}	
		return lRes;
	},
	
	//:m:*:findItemByPK
	//:d:en:Find an item by primary key
	//:a:en::aCollectionName:String:The item collection name
	//:a:en::aPK:String:The item primary key
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:r:*:::void:none
	findItemByPK: function(aCollectionName, aPK, aOptions){
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.ItemStoragePlugIn.NS,
				type: "findItemByPK",
				collectionName: aCollectionName,
				itemPK: aPK
			};
			this.sendToken( lToken,	aOptions );
		}	
		return lRes;
	},
	
	//:m:*:existsItem
	//:d:en:Indicates if an item exists on a target collection
	//:a:en::aCollectionName:String:The item collection name
	//:a:en::aPK:String:The item primary key
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:r:*:::void:none
	existsItem: function(aCollectionName, aPK, aOptions){
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.ItemStoragePlugIn.NS,
				type: "existsItem",
				collectionName: aCollectionName,
				itemPK: aPK
			};
			this.sendToken( lToken,	aOptions );
		}	
		return lRes;
	},
	
	//:m:*:listItems
	//:d:en:List items from a collection
	//:a:en::aCollectionName:String:The item collection name
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:a:en::aOptions.offset:Integer:The listing start position
	//:a:en::aOptions.length:Integer:The maximum number of items to be listed 
	//:r:*:::void:none
	listItems: function(aCollectionName, aOptions){
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.ItemStoragePlugIn.NS,
				type: "listItems",
				collectionName: aCollectionName,
				offset: aOptions["offset"] || 0,
				length: aOptions["length"] || 10
			};
			this.sendToken( lToken,	aOptions );
		}	
		return lRes;
	},
	
	//:m:*:findItemDefinition
	//:d:en:Finds an item definition. 
	//:a:en::aItemType: The item type value
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:r:*:::void:none
	findItemDefinition: function (aItemType, aOptions){
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.ItemStoragePlugIn.NS,
				type: "findDefinition",
				itemType: aItemType
			};
			this.sendToken( lToken,	aOptions );
		}	
		return lRes;
	},
	
	//:m:*:existsItemDefinition
	//:d:en:Indicates if an item definition exists
	//:a:en::aItemType: The item type value
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:r:*:::void:none
	existsItemDefinition: function (aItemType, aOptions){
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.ItemStoragePlugIn.NS,
				type: "existsDefinition",
				itemType: aItemType
			};
			this.sendToken( lToken,	aOptions );
		}	
		return lRes;
	},
	
	//:m:*:listItemDefinitions
	//:d:en:List item definitions
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:a:en::aOptions.offset:Integer:The listing start position
	//:a:en::aOptions.length:Integer:The maximum number of item definitions to be listed 
	//:r:*:::void:none
	listItemDefinitions: function (aOptions){
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.ItemStoragePlugIn.NS,
				type: "listDefinitions",
				offset: aOptions["offset"] || 0,
				length: aOptions["length"] || 10
			};
			this.sendToken( lToken,	aOptions );
		}	
		return lRes;
	},
	

	//:m:*:setItemStorageCallbacks
	//:d:en:Sets the item storage plug-in lifecycle callbacks
	//:a:en::aListeners:Object:JSONObject containing the item storage plug-in lifecycle callbacks
	//:a:en::aListeners.OnItemSaved:Function:Called when an item has been saved on a subscribed collection
	//:a:en::aListeners.OnItemRemoved:Function:Called when an item has been removed on a subscribed collection
	//:a:en::aListeners.OnCollectionCleaned:Function:Called when a subscribed collection has been cleaned
	//:a:en::aListeners.OnCollectionRemoved:Function:Called when a subscribed collection has been removed
	//:a:en::aListeners.OnCollectionRestarted:Function:Called when a subscribed collection has been restarted
	//:a:en::aListeners.OnCollectionSaved:Function:Called when a subscribed collection has been saved (edited)
	//:a:en::aListeners.OnCollectionSubscription:Function:Called when a new client gets subscribed to a subscribed collection
	//:a:en::aListeners.OnCollectionUnsubscription:Function:Called when a client gets unsubscribed from a subscribed collection
	//:a:en::aListeners.OnCollectionAuthorization:Function:Called when a client gets authorized to a subscribed collection
	//:r:*:::void:none
	setItemStorageCallbacks: function( aListeners ) {
		if( !aListeners ) {
			aListeners = {};
		}
		if( aListeners.OnItemSaved !== undefined ) {
			this.OnItemSaved = aListeners.OnItemSaved;
		}
		if( aListeners.OnItemRemoved !== undefined ) {
			this.OnItemRemoved = aListeners.OnItemRemoved;
		}
		if( aListeners.OnCollectionCleaned !== undefined ) {
			this.OnCollectionCleaned = aListeners.OnCollectionCleaned;
		}
		if( aListeners.OnCollectionRestarted !== undefined ) {
			this.OnCollectionRestarted = aListeners.OnCollectionRestarted;
		}
		if( aListeners.OnCollectionRemoved !== undefined ) {
			this.OnCollectionRemoved = aListeners.OnCollectionRemoved;
		}
		if( aListeners.OnCollectionSaved !== undefined ) {
			this.OnCollectionSaved = aListeners.OnCollectionSaved;
		}
		if( aListeners.OnCollectionSubscription !== undefined ) {
			this.OnCollectionSubscription = aListeners.OnCollectionSubscription;
		}
		if( aListeners.OnCollectionAuthorization !== undefined ) {
			this.OnCollectionAuthorization = aListeners.OnCollectionAuthorization;
		}
		if( aListeners.OnCollectionUnsubscription !== undefined ) {
			this.OnCollectionUnsubscription = aListeners.OnCollectionUnsubscription;
		}
	}
}

// add the jWebSocket ItemStoragePlugIn into the TokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.ItemStoragePlugIn );
