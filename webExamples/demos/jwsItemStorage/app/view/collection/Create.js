Ext.define('IS.view.collection.Create', {
	extend: 'IS.view.base.Window',
	alias: 'widget.c_create',

	title: 'Create collection',
	iconCls: 'c_add',
	resizable: false,
	
	initComponent: function() {
		this.items = [{
			xtype: 'form',
			bodyPadding: 10,
			border: 0,
			items: [{
				xtype: 'textfield',
				name : 'collectionName',
				fieldLabel: 'Name',
				regex: /^[a-zA-Z0-9]+([.]([a-zA-Z])+)*/,
				allowBlank: false,
				tooltip: 'The collection name attribute should be unique and it acts as the collection identifier.'
			}, {
				xtype: 'textfield',
				name : 'itemType',
				fieldLabel: 'Item type',
				maskRe: /^[a-zA-Z0-9]/,
				regex: /^[a-zA-Z]+([a-zA-Z0-9]+)*/,
				allowBlank: false,
				tooltip: 'The item type collection attribute, refers the definition(class) of the items that the collection will hold. Example: contact.'
			}, {
				xtype: 'textfield',
				inputType: 'password',
				name : 'secretPassword',
				fieldLabel: 'Secret Password',
				minLength: 4,
				tooltip: 'The secret password of a collection is used to allow users to "write" data on the collection. The secret password is also requested to the onwer before execute administrative operations(clear, restart, remove, edit) on the collection.'
			}, {
				xtype: 'textfield',
				inputType: 'password',
				name : 'secretPassword2',
				fieldLabel: 'Confirm Secret Password',
				tooltip: 'Confirm secret password value.',
				minLength: 4,
				vtype: 'confirm'
			}, {
				xtype: 'textfield',
				inputType: 'password',
				name : 'accessPassword',
				fieldLabel: 'Access Password',
				minLength: 4,
				tooltip: 'The access password of a collection is used to allow users to "read" data from the collection.'
			}, {
				xtype: 'textfield',
				inputType: 'password',
				name : 'accessPassword2',
				fieldLabel: 'Confirm Access Password',
				tooltip: 'Confirm access password value.',
				minLength: 4,
				vtype: 'confirm'
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
				value: 0,
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
			action: 'create',
			tooltip: 'Create collection using entered form data.'
		},{
			text: 'Cancel',
			scope: this,
			handler: this.close,
			tooltip: 'Cancel operation.'
		}];

		this.callParent(arguments);
	}
});
