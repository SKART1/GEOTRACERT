
$.widget("jws.sessionManagement", {
	_init: function( ) {
		// ------------- DOM ELEMENTS --------------------------
		this.ePutKey = this.element.find("#put_key");
		this.ePutValue = this.element.find("#put_value");
		this.ePutPublic = this.element.find("#put_public");
		this.eGetClient = this.element.find("#get_client");
		this.eGetKey = this.element.find("#get_key");
		this.eGetPublic = this.element.find("#get_public");
		this.eHasClient = this.element.find("#has_client");
		this.eHasKey = this.element.find("#has_key");
		this.eHasPublic = this.element.find("#has_public");
		this.eKeysClient = this.element.find("#keys_client");
		this.eKeysPublic = this.element.find("#keys_public");
		this.eRemoveKey = this.element.find("#remove_key");
		this.eRemovePublic = this.element.find("#remove_public");
		this.eGetAllClient = this.element.find("#getall_client");
		this.eGetAllPublic = this.element.find("#getall_public");
		this.eGetManyClient = this.element.find("#getmany_client");
		this.eGetManyKey = this.element.find("#getmany_key");
		this.ePublicList = this.element.find(".keys_list ul.public");
		this.ePrivateList = this.element.find(".keys_list ul.private");
		this.eClientId = this.element.find(".client_name .id");
		this.eDemoBox = $("#demo_box");

		//--------------- BUTTONS --------------------------------
		this.eBtnPut = this.element.find("#put_btn");
		this.eBtnGet = this.element.find("#get_btn");
		this.eBtnHas = this.element.find("#has_btn");
		this.eBtnKeys = this.element.find("#keys_btn");
		this.eBtnRemove = this.element.find("#remove_btn");
		this.eBtnGetAll = this.element.find("#getall_btn");
		this.eBtnGetMany = this.element.find("#getmany_btn");
		this.mAuthUser = "";

		w.SM = this;
		w.SM.registerEvents( );
	},
	registerEvents: function( ) {
		var lCallbacks = {
			OnOpen: function(aEvent) {
			},
			OnClose: function(aEvent) {
				w.SM.eClientId.text("-");
				w.SM.clearList(w.SM.ePublicList, true);
				w.SM.clearList(w.SM.ePrivateList, false);
			},
			OnMessage: function(aEvent, aToken) {
				log("<font style='color:#888'>" + JSON.stringify(aToken) + "</font>");
			},
			OnWelcome: function(aEvent) {
				w.SM.mAuthUser = aEvent.sourceId;
				w.SM.eClientId.text(aEvent.sourceId || "-");

				mWSC.sessionKeys(aEvent.sourceId, false, {
					OnSuccess: function(aToken) {
						w.SM.updateLists(aToken);
					}
				});
			},
			OnGoodBye: function(aEvent) {
			}
		};

		w.SM.eDemoBox.auth(lCallbacks);

		//registering events
		w.SM.eBtnPut.click(w.SM.put);
		w.SM.eBtnGet.click(w.SM.get);
		w.SM.eBtnHas.click(w.SM.has);
		w.SM.eBtnKeys.click(w.SM.keys);
		w.SM.eBtnRemove.click(w.SM.remove);
		w.SM.eBtnGetAll.click(w.SM.getAll);
		w.SM.eBtnGetMany.click(w.SM.getMany);
	},
	put: function( ) {
		var lKey = w.SM.ePutKey.val( ),
				lValue = w.SM.ePutValue.val( ),
				lPublic = (w.SM.ePutPublic.attr("checked")) ? true : false;
		var lCallbacks = {
			OnSuccess: function(aToken) {
				w.SM.eClientId.text( w.SM.mAuthUser );
				// Once the client saves the key ask again for the list
				w.SM.getKeys(w.SM.eClientId.text( ));
			}
		}
		mWSC.sessionPut(lKey, lValue, lPublic, lCallbacks);
	},
	get: function( ) {
		var lClientId = w.SM.eGetClient.val( ),
				lKey = w.SM.eGetKey.val( ),
				lPublic = (w.SM.eGetPublic.attr("checked")) ? true : false;

		mWSC.sessionGet(lClientId, lKey, lPublic);
	},
	has: function( ) {
		var lClientId = w.SM.eHasClient.val( );
		var lKey = w.SM.eHasKey.val( );
		var lPublic = (w.SM.eHasPublic.attr("checked")) ? true : false;

		mWSC.sessionHas(lClientId, lKey, lPublic);
	},
	keys: function( ) {
		var lClientId = w.SM.eKeysClient.val( );
		var lIsPublic = (w.SM.eKeysPublic.attr("checked")) ? true : false;
		var lCallbacks = {
			OnSuccess: function(aToken) {
				w.SM.eClientId.text(lClientId);
				// Once the client saves the key ask again for the list
				w.SM.updateLists(aToken);
			}
		}
		mWSC.sessionKeys(lClientId, lIsPublic, lCallbacks);
	},
	remove: function( ) {
		var lKey = w.SM.eRemoveKey.val( );
		var lPublic = (w.SM.eRemovePublic.attr("checked")) ? true : false;
		var lCallbacks = {
			OnSuccess: function(aToken) {
				w.SM.eClientId.text( w.SM.mAuthUser );
				// Once the client saves the key ask again for the list
				w.SM.getKeys(w.SM.eClientId.text( ));
			}
		}
		mWSC.sessionRemove(lKey, lPublic, lCallbacks);
	},
	getAll: function( ) {
		var lClientId = w.SM.eGetAllClient.val( );
		var lPublic = (w.SM.eGetAllPublic.attr("checked")) ? true : false;
		var lCallbacks = {
			OnSuccess: function(aToken) {
				w.SM.eClientId.text(lClientId);
				// Once the client saves the key ask again for the list
				w.SM.updateListsAll(aToken);
			}
		}
		mWSC.sessionGetAll(lClientId, lPublic, lCallbacks);
	},
	getMany: function( ) {
		var lClients = w.SM.eGetManyClient.val( ).replace(" ", "").split(",");
		var lKeys = w.SM.eGetManyKey.val( ).replace(" ", "").split(",");

		mWSC.sessionGetMany(lClients, lKeys);
	},
	addKeyToList: function(aKey, aList) {
		if (aList && aKey) {
			var lNoKeys = aList.find(".no_keys");
			lNoKeys && lNoKeys.remove( );
			aList.append($("<li>" + aKey + "</li>"));
		}
	},
	clearList: function(aList, aIsPublic) {
		aList.html("");
		var aMsg = aIsPublic ? "There are no public keys" : "There are no keys for this client";
		aList.html("<li class='no_keys'>" + aMsg + "</li>");
	},
	updateLists: function(aToken) {
		w.SM.clearList(w.SM.ePublicList, true);
		w.SM.clearList(w.SM.ePrivateList, false);
		var lData = "", lPublicKey = "";
		for (var lIdx in aToken.data) {
			lData = aToken.data[ lIdx ];
			if (lData !== "$created_at") {
				lPublicKey = lData.trim( ).split("::");
				if (lPublicKey.length > 1) {
					w.SM.addKeyToList(lPublicKey[ 1 ], w.SM.ePublicList);
				} else {
					w.SM.addKeyToList(lData, w.SM.ePrivateList);
				}
			}
		}
	},
	updateListsAll: function(aToken) {
		w.SM.clearList(w.SM.ePublicList, true);
		w.SM.clearList(w.SM.ePrivateList, false);
		var lData = "", lPublicKey = "";
		for (var lIdx in aToken.data) {
			if (lIdx !== "$created_at") {
				lPublicKey = lIdx.trim( ).split("::");
				if (lPublicKey.length > 1) {
					w.SM.addKeyToList(lPublicKey[1] + ": " + aToken.data[ lIdx ], w.SM.ePublicList);
				} else {
					w.SM.addKeyToList(lIdx + ": " + aToken.data[ lIdx ], w.SM.ePrivateList);
				}
			}
		}
	},
	getKeys: function(aSourceId) {
		aSourceId && mWSC.sessionKeys(aSourceId, false, {
			OnSuccess: function(aToken) {
				w.SM.updateLists(aToken);
			}
		});
	}
});
