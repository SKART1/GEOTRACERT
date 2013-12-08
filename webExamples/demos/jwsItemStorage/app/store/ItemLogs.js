Ext.define('IS.store.ItemLogs', {
	extend: 'Ext.data.Store',
	model: 'IS.model.ItemLog',
	autoLoad: false,
	pageSize: 15,
	
	proxy: {
		type: 'jws',
		ns: jws.ItemStoragePlugIn.NS,
		api: {
			read: 'getLogs'
		},
		transform: function ( aRequest ){
			if ( 'getLogs' == aRequest.type ){
				aRequest.data.offset = aRequest.data.start;
				aRequest.data.length = aRequest.data.limit;
				aRequest.data.eType = 'collection';
				
				// setting the collection name
				aRequest.data.collectionName = Ext.ComponentManager.get('collectionNamesGrid').
				getSelectionModel().
				getSelection()[0].
				get('name');

				delete aRequest.data.start;
				delete aRequest.data.limit;
				delete aRequest.data.page;
			}
		},
		reader: {
			type: 'jws'
		}
	}
});