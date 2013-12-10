Ext.define('IS.view.definition.Create', {
	extend: 'IS.view.base.Window',
	alias: 'widget.d_create',

	title: 'Create item definition',
	mode: 'create',
	iconCls: 'd_add',
	minHeight: 260,
	minWidth: 330,
	maxWidth: 330,
	
	loadForEdit: function ( aFieldValues ){
		this.setTitle('Edit definition');
		this.mode = 'edit';
		
		var lForm = this.down('form');
		lForm.down('textfield[name=itemType]').setValue(aFieldValues['type']);
		lForm.down('textfield[name=itemType]').disable();
		lForm.down('textfield[name=itemPK]').setValue(aFieldValues['pk_attr']);
		lForm.up('window').down('button[action=create]').setText('Save');
		lForm.remove(this.down('d_attribute'));
				
		Ext.each(aFieldValues.attrs, function (aAttr){
			if (aAttr.name != aFieldValues.pk_attr){ // skip primary key attr
				var lAttrView = Ext.create('IS.view.definition.Attribute');
				lAttrView.down('textfield').setValue(aAttr.name);
				lAttrView.down('combobox').setValue(aAttr.type);
				lForm.add(lAttrView);
			}
		});
		
		this.showAt({
			y: 100
		});
	},
	
	loadForPrototype: function ( aFieldValues ){
		var lForm = this.down('form');
		lForm.down('textfield[name=itemPK]').setValue(aFieldValues['pk_attr']);
		lForm.up('window').down('button[action=create]').setText('Save');
		lForm.remove(lForm.down('d_attribute'));
				
		Ext.each(aFieldValues.attrs, function (aAttr){
			if (aAttr.name != aFieldValues.pk_attr){ // skip primary key attr
				var lAttrView = Ext.create('IS.view.definition.Attribute');
				lAttrView.down('textfield').setValue(aAttr.name);
				lAttrView.down('combobox').setValue(aAttr.type);
				lForm.add(lAttrView);
			}
		});
		
		this.showAt({
			y: 100
		});
	},
			
	initComponent: function() {
		this.items = [{
			xtype: 'form',
			bodyPadding: 10,
			border: 0,
			autoScroll: true,
			width: 320,
			items: [{
				xtype: 'textfield',
				name : 'itemType',
				fieldLabel: 'Type name',
				regex: /^[a-zA-Z0-9]+([.]([a-zA-Z])+)*/,
				allowBlank: false,
				tooltip: 'The type name attribute should be unique and it acts as the definition identifier. It is like a database entity name.'
			}, {
				xtype: 'textfield',
				name : 'itemPK',
				fieldLabel: 'Primary key',
				value: 'id',
				maskRe: /^[a-zA-Z0-9]/,
				regex: /^[a-zA-Z]+([a-zA-Z0-9]+)*/,
				allowBlank: false,
				tooltip: 'The definition primary key attribute acts as a database entity primary key. The system internally generates a unique string value for "id" attribute, we suggest to use this attribute if possible for primary key as a good practice.'
			}, {
				xtype: 'd_attribute'
			}] 
		}];

		this.buttons = [{
			text: 'Add attribute',
			tooltip: 'Adds a new "Attribute" box that allows you to add a new attribute in the item definition.',
			action: 'addAttr',
			margin: '0 60 0 0',
			iconCls: 'attr_add',
			scope: this,
			handler: function(){
				var lForm = this.down('form');
				lForm.add({
					xtype: 'd_attribute'
				});
				lForm.scrollBy({
					y: 10000000
				});
			}
		},{
			text: 'Create',
			action: 'create',
			tooltip: 'Creates item definition by using entered form data.'
		},{
			text: 'Cancel',
			scope: this,
			handler: this.close,
			tooltip: 'Cancel operation.'
		}];

		this.callParent(arguments);
	}
});
