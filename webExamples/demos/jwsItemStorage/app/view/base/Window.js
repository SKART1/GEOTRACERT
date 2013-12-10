Ext.define('IS.view.base.Window', {
	extend: 'Ext.window.Window',
	layout: 'fit',
	autoShow: false,
	modal: true,
	
	initComponent: function() {
		this.on('afterrender', function(self) {
			var lForm = self.down('form');
			if (null != lForm){
				var lFields = lForm.queryBy(function(aField){
					if (undefined != aField.tooltip){
						return true;
					}
				
					return false
				});
			
				Ext.Array.each(lFields, function(lField) {
					Ext.tip.QuickTipManager.register({
						target: lField.getId(),
						text: lField.tooltip,
						title: 'Description:',
						mouseOffset: [10,0]
					});
				});
			}
		});
		
		this.callParent(arguments);
	}
});