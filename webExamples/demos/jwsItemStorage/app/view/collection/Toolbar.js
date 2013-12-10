Ext.define('IS.view.collection.Toolbar' ,{
	extend: 'Ext.toolbar.Toolbar',
	alias: 'widget.c_toolbar',
	items: [{
		iconCls: 'c_open',
		tooltip: 'Open collection',
		disabled: true
	},{
		iconCls: 'c_add',
		tooltip: 'Add collection'
	},{
		iconCls: 'c_remove',
		tooltip: 'Remove collection',
		disabled: true
	}, {
		iconCls: 'c_restart',
		tooltip: 'Restart collection',
		disabled: true
	}, {
		iconCls: 'c_clear',
		tooltip: 'Clear collection',
		disabled: true
	},{
		iconCls: 'c_details',
		tooltip: 'Show details',
		disabled: true
	},{
		iconCls: 'history',
		tooltip: 'Show history',
		disabled: true
	}, {
		iconCls: 'c_edit',
		tooltip: 'Edit collection',
		disabled: true
	}]
});
