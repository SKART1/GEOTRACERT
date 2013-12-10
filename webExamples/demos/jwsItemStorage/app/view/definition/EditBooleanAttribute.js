Ext.define('IS.view.definition.EditBooleanAttribute', {
	extend: 'IS.view.definition.EditAttribute',

	initComponent: function() {
		this.items = [{
			xtype: 'form',
			bodyPadding: 10,
			border: 0,
			autoScroll: true,
			items: [{
				xtype: 'checkbox',
				fieldLabel: 'Default',
				name: 'default',
				tooltip: 'Default attribute value.'
			}]
		}];
	
		this.parentMeta = {
			'in': {},
			'not_in': {}
		};
		
		this.parentMeta['in'].emptyText = '[true]';
		this.parentMeta['in'].vtype = 'booleanArray';
		this.parentMeta['not_in'].emptyText = '[]';
		this.parentMeta['not_in'].vtype = 'booleanArray';

		this.callParent(arguments);
	}
});
