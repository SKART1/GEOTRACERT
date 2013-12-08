Ext.define('IS.view.item.Details', {
	extend: 'IS.view.base.Window',
	title: 'Details',
	iconCls: 'i_details',
	autoShow: true,
	modal: false,

	loadData: function ( aItemPK, aData, aTpl ){
		this.setTitle('Details: ' + aItemPK );
		var lPanel = this.down('panel');
		aTpl.overwrite(lPanel.body, aData);
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
			bodyStyle: "padding:8px;font-size:11px;line-height:16px"
		}];

		this.buttons = [{
			text: 'Close',
			scope: this,
			handler: this.close
		}];

		this.callParent(arguments);
	}
});
