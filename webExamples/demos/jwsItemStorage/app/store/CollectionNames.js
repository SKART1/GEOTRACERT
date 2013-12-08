Ext.define('IS.store.CollectionNames', {
	extend: 'Ext.data.Store',
	model: 'IS.model.CollectionName',
	autoLoad: false,
	pageSize: 20,
	proxy: {
		type: 'jws',
		ns: jws.ItemStoragePlugIn.NS,
		api: {
			read: 'getCollectionNames'
		},
		transform: function ( aRequest ){
			if ( 'getCollectionNames' == aRequest.type ){
				aRequest.data.offset = aRequest.data.start;
				aRequest.data.length = aRequest.data.limit;

				delete aRequest.data.start;
				delete aRequest.data.limit;
				delete aRequest.data.page;
			}
		},
		reader: {
			type: 'jws',
			transform: function( aData ){
				for (var lIndex = 0; lIndex < aData.data.length; lIndex++){
					aData.data[lIndex] = {
						name: aData.data[lIndex]
					};
				}
			}
		}
	}
});