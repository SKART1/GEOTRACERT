Ext.define('IS.view.definition.EditAttribute', {
	extend: 'IS.view.base.Window',
	title: 'Edit type: ',
	alias: 'widget.d_editattr',
	iconCls: 'attr_edit',
	
	loadDefinition: function(){
		this.showAt({
			y: 100
		});
		
		var lDef = this.combobox.value;
		var lPos = lDef.indexOf('{');
		var lType = this.combobox.value;
		if (lPos > 0){
			lType = this.combobox.value.substr(0, lPos);
		}
		this.setTitle('Edit type: ' + lType);
		
		try {
			var lRecord  = Ext.decode(lDef.substring(lPos));
			var lForm = this.down('form').getForm();
			
			// setting the form fields value using a simple object as data source
			lForm.getFields().each(function(aField){
				aField.setValue(lRecord[aField.name]);
			});
		} catch (lEx){
		}
	},

	initComponent: function() {
		var self = this;
		
		this.on('beforerender', function() {
			var lForm = self.down('form');
			lForm.add([{
				xtype: 'checkbox',
				name: 'required',
				tooltip: 'If TRUE, the attribute value is required.',
				fieldLabel: 'Required'
			}, {
				xtype: 'checkbox',
				name: 'unique',
				tooltip: 'If TRUE, the attribute value require to be unique in the collection.',
				fieldLabel: 'Unique'
			}, {
				xtype: 'arrayfield',
				name: 'in',
				tooltip: 'Attribute value domain values.',
				fieldLabel: 'In',
				emptyText: self.parentMeta['in'].emptyText,
				vtype: self.parentMeta['in'].vtype
			}, {
				xtype: 'arrayfield',
				name: 'not_in',
				tooltip: 'Attribute value domain exclusion values.',
				fieldLabel: 'Not In',
				emptyText: self.parentMeta['not_in'].emptyText,
				vtype: self.parentMeta['not_in'].vtype
			}]);
		});
		
		this.buttons = [{
			xtype: 'button',
			text: 'Save',
			action: 'save',
			tooltip: 'Saves attribute definition by using entered form data.'
		},{
			xtype: 'button',
			text: 'Cancel',
			scope: self,
			handler: self.close,
			tooltip: 'Cancel operation.'
		}];

		this.callParent(arguments);
	}
});
