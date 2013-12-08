Ext.define('IS.view.collection.List' ,{
	extend: 'Ext.grid.Panel',
	alias: 'widget.c_list',
	border: 0,
	minHeight: 475,
	store: 'CollectionNames',
	autoScroll: true,
	enableColumnHide: false,
	title: 'User',
	id: 'collectionNamesGrid',
	dockedItems: [{
		xtype: 'c_toolbar'
	},{
		xtype: 'pagingtoolbar',
		store: 'CollectionNames',
		id: 'collectionNamesPager',
		dock: 'bottom',
		displayInfo: false,
		beforePageText: '',
		afterPageText: ''
	},{
		xtype: 'toolbar',
		dock: 'bottom',
		items: [{
			xtype: 'checkbox',
			boxLabel: 'User/Public collections',
			height: 22,
			checked: true,
			id: 'showUserOnly',
			tooltip: 'If set, only the user collections are shown, otherwise the public ones.'
		}]
	}],
	columns: [{
		header: 'Name',  
		dataIndex: 'name',  
		flex: 1
	}],
	viewConfig: {
		loadMask: false
	}
});
