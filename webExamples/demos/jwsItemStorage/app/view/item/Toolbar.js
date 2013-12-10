Ext.define('IS.view.item.Toolbar' ,{
	extend: 'Ext.toolbar.Toolbar',
	alias: 'widget.i_toolbar',
	items: [{
		iconCls: 'i_edit',
		tooltip: 'Edit item',
		disabled: true
	},{
		iconCls: 'i_add',
		tooltip: 'Add item'
	}, {
		iconCls: 'i_remove',
		tooltip: 'Remove item',
		disabled: true
	}, {
		iconCls: 'find',
		tooltip: 'Filter'
	},{
		iconCls: 'history',
		tooltip: 'Show history',
		disabled: true
	},{
		iconCls: 'i_details',
		tooltip: 'Show details',
		disabled: true
	}]
});
