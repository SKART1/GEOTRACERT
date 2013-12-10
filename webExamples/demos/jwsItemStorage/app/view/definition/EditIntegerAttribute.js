Ext.define('IS.view.definition.EditIntegerAttribute', {
	extend: 'IS.view.definition.EditAttribute',

	initComponent: function() {
		this.items = [{
			xtype: 'form',
			bodyPadding: 10,
			border: 0,
			autoScroll: true,
			items: [{
				xtype: 'numberfield',
				fieldLabel: 'Default',
				name: 'default',
				allowDecimals: false,
				tooltip: 'Default attribute value.'
			},{
				xtype: 'numberfield',
				name : 'min_value',
				fieldLabel: 'Min Value',
				allowDecimals: false,
				tooltip: 'Minimum attribute value restriction.'
			},{
				xtype: 'numberfield',
				name : 'max_value',
				fieldLabel: 'Max Value',
				allowDecimals: false,
				vtype: 'max',
				tooltip: 'Maximum attribute value restriction.'
			},{
				xtype: 'arrayfield',
				name: 'between',
				fieldLabel: 'Between',
				vtype: 'integerArray',
				emptyText: '[0,10]',
				tooltip: 'Attribute value domain range.'
			}, {
				xtype: 'arrayfield',
				name: 'not_between',
				fieldLabel: 'Not Between',
				vtype: 'integerArray',
				emptyText: '[5,6]',
				tooltip: 'Attribute value domain range exclusion.'
			}]
		}];
	
		this.parentMeta = {
			'in': {},
			'not_in': {}
		};
		
		this.parentMeta['in'].emptyText =  "[1, 2, 4]";
		this.parentMeta['in'].vtype = 'integerArray';
		this.parentMeta['not_in'].emptyText = "[3]";
		this.parentMeta['not_in'].vtype = 'integerArray';

		this.callParent(arguments);
	}
});
