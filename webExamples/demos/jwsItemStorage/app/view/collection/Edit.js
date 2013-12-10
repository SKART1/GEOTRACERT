Ext.define('IS.view.collection.Edit', {
	extend: 'IS.view.base.Window',
	title: 'Edit collection',
	alias: 'widget.c_edit',
	iconCls: 'c_edit',
	resizable: false,
	
	loadData: function( aData ){
		this.showAt({
			y: 100
		});
		var lForm = this.down('form');
		lForm.down('textfield[name=collectionName]').setValue(aData.name);
		lForm.down('textfield[name=type]').setValue(aData.type);
		lForm.down('textfield[name=capacity]').setValue(aData.capacity);
		lForm.down('checkbox[name=private]').setValue(aData['private']);
		lForm.down('checkbox[name=capped]').setValue(aData.capped);
	},

	initComponent: function() {
		this.items = [{
			xtype: 'form',
			bodyPadding: 10,
			border: 0,
			items: [{
				xtype: 'textfield',
				name : 'collectionName',
				fieldLabel: 'Name',
				allowBlank: false,
				disabled: true,
				tooltip: 'The collection name attribute should be unique and it acts as the collection identifier.'
			}, {
				xtype: 'textfield',
				name : 'type',
				fieldLabel: 'Item type',
				allowBlank: false,
				disabled: true,
				tooltip: 'The item type collection attribute, refers the definition(class) of the items that the collection will hold. Example: contact.'
			}, {
				xtype: 'textfield',
				inputType: 'password',
				name : 'secretPassword',
				fieldLabel: 'Secret Password',
				minLength: 4,
				allowBlank: false,
				tooltip: 'The secret password of a collection is used to allow users to "write" data on the collection. The secret password is also requested to the onwer before execute administrative operations(clear, restart, remove, edit) on the collection.'
			}, {
				xtype: 'textfield',
				inputType: 'password',
				name : 'newSecretPassword',
				fieldLabel: 'New Secret Password',
				minLength: 4,
				tooltip: 'Enter new secret password value.',
				linkType: 'pwd' 
			}, {
				xtype: 'textfield',
				inputType: 'password',
				name : 'newSecretPassword2',
				fieldLabel: 'Confirm New Secret Password',
				minLength: 4,
				vtype: 'confirm',
				tooltip: 'Confirm new secret password value.'
			}, {
				xtype: 'textfield',
				inputType: 'password',
				name : 'accessPassword',
				fieldLabel: 'Access Password',
				minLength: 4,
				linkType: 'pwd' ,
				tooltip: 'The access password of a collection is used to allow users to "read" data from the collection.'
			}, {
				xtype: 'textfield',
				inputType: 'password',
				name : 'accessPassword2',
				fieldLabel: 'Confirm Access Password',
				minLength: 4,
				vtype: 'confirm',
				tooltip: 'Confirm access password value.'
			}, {
				xtype: 'checkbox',
				name : 'private',
				fieldLabel: 'Private',
				checked: true,
				tooltip: 'Private collections becomes hidden expect for the owner. The name of a private collection is never revealed to the users.'
			}, {
				xtype: 'numberfield',
				name : 'capacity',
				fieldLabel: 'Capacity',
				minValue: 0,
				maxValue: 2147483647,
				allowDecimals: false,
				tooltip: 'The capacity attribute of a collection defines the maximum number of items that the collection will hold. Default value: "0"(unlimited)'
			}, {
				xtype: 'checkbox',
				name : 'capped',
				fieldLabel: 'Capped',
				disabled: true,
				tooltip: 'A capped collection removes the oldest item on insertion when the capacity is full. Capped collections will always accept new items.'
			}]
		}];

		this.buttons = [{
			text: 'Save',
			action: 'edit',
			tooltip: 'Edit collection using entered form data.'
		},{
			text: 'Cancel',
			scope: this,
			handler: this.close,
			tooltip: 'Cancel operation.'
		}];

		this.callParent(arguments);
	}
});
