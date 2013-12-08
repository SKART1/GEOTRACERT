Ext.define('IS.model.CollectionLog', {
	extend: 'Ext.data.Model',
	fields: ['id', 'action', 'user', 'time', 'info'],
	idProperty: 'none'
});