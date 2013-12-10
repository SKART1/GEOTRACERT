Ext.define('IS.view.collection.Details', {
	extend: 'IS.view.base.Window',
	title: 'Details',
	iconCls: 'c_details',
	autoShow: true,
	modal: false,

	loadData: function ( aData ){
		this.setTitle('Details: ' + aData.name );
		var lPanel = this.down('panel');
		lPanel.tpl.overwrite(lPanel.body, aData);
		this.showAt({
			y: 100
		});
	},
	close: function(){
		this.hide();
	},
	initComponent: function() {
		this.items = [{
			xtype: 'panel',
			border: 0,
			autoScroll: true,
			height: 230,
			width: 270,
			bodyStyle: "padding:8px;font-size:11px;line-height:16px",
			tpl: Ext.create('Ext.XTemplate', 
				'<p>Name: <b>{name}</b></p>',
				'<p>Item type: <b>{type}</b></p>',
				'<p>Private: <b>{private}</b></p>',
				'<p>System: <b>{system}</b></p>',
				'<p>Created at: <b>{createdAt}</b></p>',
				'<p>Owner: <b>{owner}</b></p>',
				'<p>Size: <b>{size}</b></p>',
				'<p>Subscribers: <b>{subscribers}</b></p>',
				'<p>Publishers: <b>{publishers}</b></p>',
				'<p>Capacity: <b>{capacity}</b></p>',
				'<p>Capped: <b>{capped}</b></p>',
				'<p>Authorized: <b>{authorized}</b></p>',
				'<p>Subscribed: <b>{subscribed}</b></p>'
				)
		}];

		this.buttons = [{
			text: 'Close',
			scope: this,
			handler: this.hide
		}];

		this.callParent(arguments);
	}
});
