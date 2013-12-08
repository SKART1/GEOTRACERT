Ext.define('IS.view.item.Find', {
	extend: 'IS.view.base.Window',
	title: 'Filter items',
	iconCls: 'find',
	alias: 'widget.i_find',
	resizable: false,
	
	loadData: function(aItemDefinition, aPreviousCriteria){
		this.itemDefinition = aItemDefinition;
		
		var lStoreData = [];
		if (IS.lib.Util.isEE(false)){
			for (var lAttrName in aItemDefinition.attr_types){
				lStoreData.push({
					'attr': lAttrName
				});
			}
		} else {
			lStoreData.push({
				'attr': aItemDefinition.pk_attr
			});
		}
		
		var lForm = this.down('form');
		lForm.add({
			xtype: 'combo',
			name : 'attr',
			queryMode: 'local',
			displayField: 'attr',
			fieldLabel: 'Attribute',
			store: {
				autoLoad: true,
				model: 'AttributeName',
				fields: ['attr'],
				data : {
					data: lStoreData
				},
				proxy: {
					type: 'memory',
					reader: {
						type: 'jws'
					}
				}
			},
			allowBlank: false,
			editable: false,
			tooltip: 'The attribute name to filter for.',
			listeners: {
				change: {
					fn: function(aField, aNewValue){
						var lExisting = lForm.down('[name=value]');
						if (lExisting){
							lForm.remove(lExisting);
						}
						
						var lField = IS.lib.Util.createFormField('value', aItemDefinition.attr_types[aNewValue]);
						lField.fieldLabel = 'Value';
						
						// fixing if string for search with Regular Expressions
						delete lField.regex;
						delete lField.minLength;
						delete lField.maxLength;
						
						lField.tooltip = aItemDefinition.attr_types[aNewValue];
						lForm.add(lField);
						
						var lFields = lForm.queryBy(function(aField){
							if ('value' == aField.name){
								return true;
							}
				
							return false
						});
			
						Ext.Array.each(lFields, function(lField) {
							Ext.tip.QuickTipManager.register({
								target: lField.getId(),
								text: lField.tooltip,
								title: 'Description:'
							});
						});
					}
				}
			}
		});
		
		if (aPreviousCriteria){
			lForm.down('combo').setValue(aPreviousCriteria.attr);
			lForm.down('[name=value]').setValue(aPreviousCriteria.value);
			
			this.down('button[action=clear]').show();
		}
		
		this.showAt({
			y: 100
		})
	},

	initComponent: function() {
		this.items = [{
			xtype: 'form',
			bodyPadding: 10,
			border: 0,
			autoScroll: true,
			maxHeight: 300,
			width: 305,
			items: [] 
		}];

		this.buttons = [{
			text: 'Clear',
			action: 'clear',
			margin: '0 75 0 0',
			hidden: true,
			tooltip: 'Clear criteria. List all the records.'
		},{
			text: 'Filter',
			action: 'find',
			tooltip: 'Filter by criteria.'
		},{
			text: 'Cancel',
			scope: this,
			handler: this.close,
			tooltip: 'Cancel operation.'
		}];

		this.callParent(arguments);
	}
});