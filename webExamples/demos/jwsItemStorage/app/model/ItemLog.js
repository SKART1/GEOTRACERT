Ext.define('IS.model.ItemLog', {
	extend: 'Ext.data.Model',
	fields: ['id', 'action', 'user', 'time', 'info'],
	idProperty: 'none'
});