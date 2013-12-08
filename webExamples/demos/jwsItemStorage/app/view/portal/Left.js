Ext.define('IS.view.portal.Left' ,{
	extend: 'Ext.panel.Panel',
	alias: 'widget.p_left',
	width: 210,
	border: 0,
	padding: 5,
	items: [{
		xtype: 'tabpanel',
		height: 500,
		activeTab: 0,
		items: [{
			title: 'Collections',
			id: 'collectionstab',
			items: [{
				xtype: 'c_list'
			}]
		},{
			title: 'Definitions',
			id: 'definitionstab',
			items: [{
				xtype: 'd_list'
			}]
		}]
	}]
});
