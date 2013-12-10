Ext.define('IS.store.Definitions', {
	extend: 'Ext.data.Store',
	model: 'IS.model.Definition',
	autoLoad: false,
    
	proxy: {
		transform: function ( aRequest ){
			if ( 'listDefinitions' == aRequest.type ){
				aRequest.data.offset = aRequest.data.start;
				aRequest.data.length = aRequest.data.limit;
				
				delete aRequest.data.start;
				delete aRequest.data.limit;
				delete aRequest.data.page;
			}
		},
		type: 'jws',
		ns: jws.ItemStoragePlugIn.NS,
		api: {
			read: 'listDefinitions'
		},
		reader: {
			type: 'jws'
		}
	}
});