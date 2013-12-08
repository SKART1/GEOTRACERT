Ext.define('IS.model.Collection', {
	extend: 'Ext.data.Model',
	fields: [
	'name', 
	'itemType', 
	'secretPassword', 
	'accessPassword',
	'private', 
	'capped', 
	'capacity', 
	'subscribed', 
	'authorized', 
	'size', 
	'owner', 
	'system', 
	'createdAt',
	'subscribers',
	'publishers']
});