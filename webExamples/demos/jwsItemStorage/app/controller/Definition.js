Ext.define('IS.controller.Definition', {
	extend: 'Ext.app.Controller',
	views: ['definition.Toolbar', 'definition.List', 'definition.Create', 'definition.Attribute',
	'definition.EditStringAttribute', 'definition.EditAttribute'],
	stores: ['Definitions', 'DataTypes'],
	refs: [{
		ref: 'list',
		selector: '#definitionsGrid'
	}],

	getSelectedRecord: function(){
		return this.getList().getSelectionModel().getSelection()[0];
	},

	showDetails: function( aRecord ){
		if (!this.detailsView){
			this.detailsView = Ext.create('IS.view.definition.Details');
		}
		var lData = Ext.clone(aRecord.data);
		lData.attrs = [];
		for (var lAttr in lData.attr_types){
			lData.attrs.push({
				name: lAttr, 
				type: lData.attr_types[lAttr]
			});
		}
		delete lData.attr_types;
		
		this.detailsView.loadData(lData);
	},
	
	edit: function( aRecord ){
		var lView = Ext.create('IS.view.definition.Create');
		lView.iconCls = 'd_edit';
		var lData = Ext.clone(aRecord.data);
					
		lData.attrs = [];
		for (var lAttr in lData.attr_types){
			lData.attrs.push({
				name: lAttr, 
				type: lData.attr_types[lAttr]
			});
		}
		delete lData.attr_types;
		
		lView.loadForEdit(lData);
	},
	
	createFromPrototype: function( aRecord ){
		var lView = Ext.create('IS.view.definition.Create');
		var lData = Ext.clone(aRecord.data);
					
		lData.attrs = [];
		for (var lAttr in lData.attr_types){
			lData.attrs.push({
				name: lAttr, 
				type: lData.attr_types[lAttr]
			});
		}
		delete lData.attr_types;
		
		lView.loadForPrototype(lData);
	},

	init: function() {
		var self = this;
		
		this.control({
			'#definitionsGrid': {
				itemdblclick: function(aGrid, aRecord) {
					Ext.ComponentQuery.query('d_toolbar button[iconCls=d_edit]')[0].fireEvent('click');
				}
			},
			
			'd_toolbar > button[iconCls=d_details]': {
				click: function (){
					var lRecord = self.getSelectedRecord();
					self.showDetails(lRecord);
				}
			},
			
			'd_toolbar > button[iconCls=d_extend]': {
				click: function (){
					if (!IS.lib.Util.isEE()){
						return;
					}
					
					var lRecord = self.getSelectedRecord();
					self.createFromPrototype(lRecord);
				}
			},
			
			'd_toolbar > button[iconCls=d_edit]': {
				click: function (){
					if (!IS.lib.Util.isEE()){
						return;
					}
					
					var lRecord = self.getSelectedRecord();
					self.edit(lRecord);
				}
			},
			
			'd_create button[action=create]': {
				click: function( aButton ) {
					var lView = aButton.up('window');
					var lForm = lView.down('form').getForm();
					
					if (!lForm.isValid()){
						return;
					}
					
					// cleaning the values
					var lValues = lForm.getFieldValues();
					for (var lKey in lValues){
						if (undefined == lValues[lKey]){
							delete lValues[lKey];
						}
					}
					
					lValues.attributes = {};
					if (Ext.isArray(lValues['attr'])){
						Ext.each(lValues['attr'], function( aAttr, aIndex ){
							lValues.attributes[aAttr] = lValues.type[aIndex];
						});
					} else {
						lValues.attributes[lValues.attr] = lValues.type;
					}
					
					// cleaning 
					delete lValues.attr;
					delete lValues.type;
					
					var lRegisterDefFn = function (){
						Ext.jws.send(jws.ItemStoragePlugIn.NS, 'registerDefinition', lValues, {
							success: function (){
								self.getDefinitionsStore().reload();
								lView.close();
							}
						});
					}
					
					if ('create' == lView.mode){
						lRegisterDefFn();
					} else if ('edit' == lView.mode){
						lValues.itemType = lView.down('form').down('textfield[name=itemType]').getValue();
						Ext.jws.send(jws.ItemStoragePlugIn.NS, 'removeDefinition', {
							itemType: lValues.itemType
						}, {
							success: function() {
								lRegisterDefFn();
							}
						});
					}
				}
			},
			'd_editattr button[action=save]': {
				click: function( aButton ) {
					var lView = aButton.up('window');
					var lForm = lView.down('form').getForm();
					
					if (!lForm.isValid()){
						return;
					}
					
					// cleaning the values
					var lValues = lForm.getFieldValues(true);
					for (var lKey in lValues){
						if (undefined == lValues[lKey]){
							delete lValues[lKey];
						}
					}
					
					// setting field values if present
					var lPrefix = lView.combobox.value;
					if (lPrefix.indexOf('{') > 0){
						lPrefix = lPrefix.substring(0, lPrefix.indexOf('{'));
					}
					lView.combobox.setValue(lPrefix + Ext.encode(lValues));
					
					lView.close();
				}
			},
			'd_attribute button[iconCls=attr_edit]': {
				click: function( aButton ) {
					var lCombo = aButton.up('fieldcontainer').previousNode();
					if ( lCombo && lCombo.isValid()){
						var lView = null;
						if (0 == lCombo.value.indexOf("string")){
							lView = Ext.create('IS.view.definition.EditStringAttribute');
						} else if (0 == lCombo.value.indexOf("integer")){
							lView = Ext.create('IS.view.definition.EditIntegerAttribute');
						} else if (0 == lCombo.value.indexOf("boolean")){
							lView = Ext.create('IS.view.definition.EditBooleanAttribute');
						} else if (0 == lCombo.value.indexOf("long")){
							lView = Ext.create('IS.view.definition.EditLongAttribute');
						} else if (0 == lCombo.value.indexOf("double")){
							lView = Ext.create('IS.view.definition.EditDoubleAttribute');
						}
						
						lView.combobox = lCombo;
						lView.loadDefinition();
					}
				}
			},
			'd_toolbar > button[iconCls=d_add]': {
				click: function(){
					if (!IS.lib.Util.isEE()){
						return;
					}
					
					var lView = Ext.widget('d_create');
					lView.showAt({
						y: 100
					});
				}
			},
			'#definitionstab': {
				activate: function(){
					self.getDefinitionsStore().load();
				}
			},
			'd_list ': {
				selectionchange: function( aModel ){
					var lButtons;
					if ( aModel.getCount() < 1){
						lButtons = Ext.ComponentQuery.query('d_toolbar button');
						Ext.each(lButtons, function ( aButton ){
							if ( aButton.iconCls != 'd_add' )
								aButton.disable();
						});
					} else {
						lButtons = Ext.ComponentQuery.query('d_toolbar button');
						Ext.each(lButtons, function ( aButton ){
							if ( aButton.iconCls != 'd_add' )
								aButton.enable();
						});
					
						if (self.detailsView && !self.detailsView.isHidden()){
							Ext.ComponentQuery.query('d_toolbar button[iconCls=d_details]')[0].fireEvent('click');
						}
					}
				}				
			} ,
			'd_toolbar > button[iconCls=d_remove]': {
				click: function(){
					if (!IS.lib.Util.isEE()){
						return;
					}
					
					Ext.Msg.show({
						title:'Confirm?',
						msg: 'Are you sure to remove the selected item definition?',
						buttons: Ext.Msg.YESNO,
						icon: Ext.Msg.QUESTION,
						fn: function ( aButton ){
							if ('yes' != aButton)
								return;
							
							var lArguments = {
								itemType: self.getList().
								getSelectionModel().
								getSelection()[0].
								get('type')
							}
					
							Ext.jws.send(jws.ItemStoragePlugIn.NS, 'removeDefinition', lArguments, {
								success: function() {
									self.getDefinitionsStore().reload();
								}
							});
						} 
					});
				}
			}
		});
	}
});
