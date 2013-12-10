Ext.define('IS.view.definition.List' ,{
	extend: 'Ext.grid.Panel',
	alias: 'widget.d_list',
	id: 'definitionsGrid',
	border: 0,
	store: 'Definitions',
	autoScroll: true,
	enableColumnHide: false,
	minHeight: 475,
	dockedItems: [{
		xtype: 'd_toolbar'
	},{
		xtype: 'pagingtoolbar',
		store: 'Definitions',
		id: 'definitionsPager',
		dock: 'bottom',
		displayInfo: false,
		beforePageText: '',
		afterPageText: ''
	}],
	columns: [{
		header: 'Type',  
		dataIndex: 'type',  
		flex: 1
	}],
	viewConfig: {
		loadMask: false
	}
});
