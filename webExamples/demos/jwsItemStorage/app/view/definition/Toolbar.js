Ext.define('IS.view.definition.Toolbar' ,{
	extend: 'Ext.toolbar.Toolbar',
	alias: 'widget.d_toolbar',
	items: [{
		iconCls: 'd_add',
		tooltip: 'Add definition'
	}, {
		iconCls: 'd_extend',
		tooltip: 'Create from definition prototype...',
		disabled: true
	}, {
		iconCls: 'd_remove',
		tooltip: 'Remove definition',
		disabled: true
	}, {
		iconCls: 'd_details',
		tooltip: 'Show details',
		disabled: true
	}, {
		iconCls: 'd_edit',
		tooltip: 'Edit definition...',
		disabled: true
	}]
});
