Ext.define('IS.view.definition.EditStringAttribute', {
	extend: 'IS.view.definition.EditAttribute',

	initComponent: function() {
		this.items = [{
			xtype: 'form',
			bodyPadding: 10,
			border: 0,
			autoScroll: true,
			items: [{
				xtype: 'textfield',
				fieldLabel: 'Default',
				name: 'default',
				tooltip: 'Default attribute value.'
			},{
				xtype: 'numberfield',
				name : 'min_length',
				fieldLabel: 'Min Length',
				minValue: 0,
				allowDecimals: false,
				tooltip: 'Minimum attribute value\'s length restriction.'
			},{
				xtype: 'numberfield',
				name : 'max_length',
				fieldLabel: 'Max Length',
				minValue: 0,
				allowDecimals: false,
				vtype: 'max',
				tooltip: 'Maximum attribute value\'s length restriction.'
			}, {
				xtype: 'checkbox',
				name : 'mail',
				fieldLabel: 'Mail',
				tooltip: 'If TRUE, the attribute value require to be a valid email address. Example: rsantamaria@jwebsocket.org'
			}, {
				xtype: 'textfield',
				name : 'input_type',
				fieldLabel: 'Input Type',
				tooltip: 'The input type for the attribute value. Example: \'password\'.'
			}, {
				xtype: 'textfield',
				name : 'reg_exp',
				fieldLabel: 'Reg Exp',
				tooltip: 'The attribute value require to match the regular expression.'
			}, {
				xtype: 'checkbox',
				name : 'multi_line',
				fieldLabel: 'Multi Line',
				tooltip: 'If TRUE, the user interface will show a multi-line text field to set the attribute value.'
			}]
		}];	
		
		this.parentMeta = {
			'in': {},
			'not_in': {}
		};
		
		this.parentMeta['in'].emptyText = "['Juan', 'Pedro', 'Maria']";
		this.parentMeta['in'].vtype = 'stringArray';
		this.parentMeta['not_in'].emptyText = "['Judas']";
		this.parentMeta['not_in'].vtype = 'stringArray';

		this.callParent(arguments);
	}
});
