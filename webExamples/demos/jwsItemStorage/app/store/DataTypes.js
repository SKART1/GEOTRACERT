Ext.define('IS.store.DataTypes', {
	extend: 'Ext.data.Store',
	fields: ['name'],
	data : [{
		"name":"string"
	},{
		"name":"boolean"
	},{
		"name":"integer"
	},{
		"name":"double"
	},{
		"name":"long"
	}]
});