Ext.define('IS.view.collection.History', {
	extend: 'IS.view.base.Window',
	alias: 'widget.c_history',

	title: 'History viewer',
	autoShow: false,
	width: 550,
	height: 400,
	iconCls: 'history',
	modal: false,
	resizable: false,
	
	loadHistory: function( aCollection ){
		this.setTitle( 'History viewer: ' + aCollection );
		this.down('pagingtoolbar').moveFirst();
		this.showAt({
			y: 100
		});
	},
	
	initComponent: function() {
		this.items = [{
			xtype: 'grid',
			autoScroll: true,
			sortableColumns: false,
			border: 0,
			viewConfig: {
				loadMask: false
			},
			store: 'CollectionLogs',
			columns: [{
				header: 'Action',  
				dataIndex: 'action',  
				flex: 1
			},{
				header: 'User',  
				dataIndex: 'user',  
				flex: 1,
				renderer: function( aUser ){
					return (Ext.jws.getConnection().getUsername() == aUser) ? 
					'<b>' + aUser + '</b>' : aUser;
				}
			},{
				header: 'Time',  
				dataIndex: 'time',  
				flex: 1,
				renderer: function ( aTime ){
					return new Date(aTime);
				},
				minWidth: 250
			},{
				header: 'Info',  
				dataIndex: 'info',  
				flex: 1,
				minWidth: 100
			}],
			dockedItems: [{
				xtype: 'pagingtoolbar',
				store: 'CollectionLogs',
				dock: 'bottom'
			}]
		}];
	
		this.callParent(arguments);
		
		this.down('grid').getView().on('render', function(aView) {
			aView.tip = Ext.create('Ext.tip.ToolTip', {
				target: aView.el,
				delegate: aView.itemSelector,
				trackMouse: true,
				renderTo: Ext.getBody(),
				listeners: {
					beforeshow: function updateTipBody(tip) {
						tip.update('<b>Log info</b>: ' + aView.getRecord(tip.triggerElement).get('info'));
					}
				}
			});
		});
	},
	close: function(){
		this.hide();
	}
});