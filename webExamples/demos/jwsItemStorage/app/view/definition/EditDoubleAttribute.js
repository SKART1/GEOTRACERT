Ext.define('IS.view.definition.EditDoubleAttribute', {
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
				tooltip: 'Default attribute value.'
			},{
				xtype: 'numberfield',
				name : 'min_value',
				fieldLabel: 'Min Value',
				tooltip: 'Minimum attribute value restriction.'
			},{
				xtype: 'numberfield',
				name : 'max_value',
				fieldLabel: 'Max Value',
				vtype: 'max',
				tooltip: 'Maximum attribute value restriction.'
			},{
				xtype: 'arrayfield',
				name: 'between',
				fieldLabel: 'Between',
				vtype: 'doubleArray',
				emptyText: '[-5.1,5.1]',
				tooltip: 'Attribute value domain range.'
			}, {
				xtype: 'arrayfield',
				name: 'not_between',
				fieldLabel: 'Not Between',
				vtype: 'doubleArray',
				emptyText: '[-1.1,1.1]',
				tooltip: 'Attribute value domain range exclusion.'
			}]
		}];
		
		this.parentMeta = {
			'in': {},
			'not_in': {}
		};
		
		this.parentMeta['in'].emptyText =  "[1.1, 2.1, 4.1]";
		this.parentMeta['in'].vtype = 'doubleArray';
		this.parentMeta['not_in'].emptyText = "[3.1]";
		this.parentMeta['not_in'].vtype = 'doubleArray';

		this.callParent(arguments);
	}
});
