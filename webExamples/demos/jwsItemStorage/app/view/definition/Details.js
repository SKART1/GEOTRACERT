Ext.define('IS.view.definition.Details', {
	extend: 'IS.view.base.Window',
	title: 'Details',
	autoShow: true,
	iconCls: 'd_details',
	modal: false,

	loadData: function( aData ){
		this.setTitle('Details: ' + aData.type);
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
			height: 250,
			width: 350,
			bodyStyle: "padding:8px;font-size:11px;line-height:16px",
			tpl: Ext.create('Ext.XTemplate', 
				'<p>Item type: <b>{type}</b></p>',
				'<p>Primary key: <b>{pk_attr}</b></p>',
				'<p>Attributes: </p>',
				'<hr>',
				'<tpl for="attrs">',
				'<p>{#}. {name}: <b>{type}</b></p>',
				'</tpl></p>'
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
