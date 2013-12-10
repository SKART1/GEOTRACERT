Ext.define('IS.lib.Util', {
	singleton: true,
	def2tpl: {},
	
	isEE: function (aShowMessage){
		var lShow = (undefined == aShowMessage) ? true : aShowMessage ;
		if ( 'undefined' == typeof jws.ItemStoragePlugIn.registerItemDefinition ){
			if (lShow){
				Ext.Msg.show({
					msg: 'Feature available only for enterprise clients! <br>See http://jwebsocket.org for details.',
					buttons: Ext.Msg.OK, 
					icon: Ext.Msg.ERROR
				});
			}
			
			return false;
		}
		
		return true;
	},
	
	registerTooltip: function(aItemsId) {
		Ext.each(aItemsId, function(aId){
			var lField = Ext.getCmp(aId);
			Ext.tip.QuickTipManager.register({
				target: lField.getId(),
				text: lField.tooltip,
				title: 'Description:',
				mouseOffset: [10,0]
			});
		});
	},
	
	createDetailsTpl: function (aItemDefinition){
		if (!this.def2tpl[aItemDefinition.type]){
			var lTpl = "";
			
			for (var lAttr in aItemDefinition.attr_types){
				lTpl += '<p><b>' + lAttr.substr(0,1).toUpperCase() + lAttr.substr(1)
				+ '</b>: {'+ lAttr + '}</p>';
			}
			if ('id' != aItemDefinition.pk_attr){
				lTpl += '<p><b>Id</b>: {id}</p>';
			}
			
			this.def2tpl[aItemDefinition.type] = Ext.create('Ext.XTemplate', lTpl);
		}
		
		return this.def2tpl[aItemDefinition.type];
	}, 
	
	createFormField: function ( aName, aTypeDefiniton ){
		var lPos = aTypeDefiniton.indexOf('{');
		
		var lType = (lPos > 0) ? aTypeDefiniton.substr(0, lPos): aTypeDefiniton;
		var lDefinition;
		
		try {
			lDefinition = Ext.decode(aTypeDefiniton.substr(lPos));
		} catch (lEx){
			lDefinition = {};
		}
		var lField = {
			name: aName,
			allowBlank: !lDefinition.required,
			fieldLabel: aName
		};
		
		if ('string' == lType){
			this.createStringField(lField, lDefinition);
		} else if ('boolean' == lType){
			this.createBooleanField(lField, lDefinition);
		} else {
			this.createNumberField(lField, lType, lDefinition);
		}
		
		return lField;
	},
	
	createStringField: function ( aField, aDefinition ){
		aField.xtype = 'textfield';
		if (aDefinition['multi_line']){
			aField.xtype = 'textarea';
		}
		
		if (undefined != aDefinition['max_length']){
			aField.maxLength = aDefinition['max_length'];
		}
		if (undefined != aDefinition['min_length']){
			aField.minLength = aDefinition['min_length'];
		}
		if (undefined != aDefinition['input_type']){
			aField.inputType = aDefinition['input_type'];
		}
		if (undefined != aDefinition['reg_exp']){
			aField.regex = aDefinition['reg_exp'];
		}
		if (aDefinition['mail']){
			aField.regex = this.mailRegex;
		}
		aField.value = aDefinition['default'];
	},
	mailRegex: /^([\w]+)(.[\w]+)*@([\w-]+\.){1,5}([A-Za-z]){2,4}$/,
	 
	createNumberField: function ( aField, aType, aDefinition ){
		aField.xtype = 'numberfield';
		
		if (undefined != aDefinition['max_value']){
			aField.maxValue = aDefinition['max_value'];
		}
		if (undefined != aDefinition['min_value']){
			aField.minValue = aDefinition['min_value'];
		}
		if ('double' != aType){
			aField.allowDecimals = false;
		}
	},
	
	createBooleanField: function ( aField, aDefinition ){
		aField.xtype = 'checkbox';
		aField.value = false;
	},
	
	defineModel: function ( aCollectionName, aItemDefinition ){
		var lFiels = [];
		for (var lAttrName in aItemDefinition.attr_types){
			lFiels.push(lAttrName);
		}
		if (lFiels.lastIndexOf("id") < 0){
			lFiels.push("id");
		}
		
		Ext.define(aCollectionName + 'Model', {
			extend: 'Ext.data.Model',
			fields: lFiels,
			idProperty: aItemDefinition.id
		});
	},
	
	createDynamicStore: function(aCollectionName, aApp){
		var lStore = Ext.create('Ext.data.Store', {
			model: aCollectionName + 'Model',
			autoLoad: true,
			pageSize: 18,
			proxy: Ext.create('Ext.jws.data.Proxy', {
				type: 'jws',
				ns: jws.ItemStoragePlugIn.NS,
				api: {
					read: 'listItems',
					update: 'saveItem'
				},
				reader: {
					type: 'jws',
					transform: function( aResponse ){
						if ('findItemByPK' == aResponse.reqType){
							if (aResponse.data){
								aResponse.data = [aResponse.data.attrs];
							}else {
								aResponse.data = [];
							}
							
							aResponse.total = aResponse.data.length;
						} else {
							for (var lIndex = 0; lIndex < aResponse.data.length; lIndex++){
								aResponse.data[lIndex] = aResponse.data[lIndex].attrs;
							}
						}
					}
				},
				transform: function ( aRequest ){
					if ( 'listItems' == aRequest.type){
						if (aApp.itemSearchs[aCollectionName]){
							if (IS.lib.Util.isEE(false)){
								aRequest.type = 'findItems';
								aRequest.data.attrName = aApp.itemSearchs[aCollectionName].attr;
								aRequest.data.attrValue = aApp.itemSearchs[aCollectionName].value;
							} else {
								aRequest.type = 'findItemByPK';
								aRequest.data.itemPK = aApp.itemSearchs[aCollectionName].value;
							}
						}
						
						aRequest.data.offset = aRequest.data.start;
						aRequest.data.length = aRequest.data.limit;
				
						// setting the target collection name
						aRequest.data.collectionName = aCollectionName;
						
						delete aRequest.data.start;
						delete aRequest.data.limit;
						delete aRequest.data.page;
					} 
				//					else if ('saveItem' == aRequest.type){
				//						var lDef =aApp.collection2def[aCollectionName];
				//						if ('id' != lDef.pk_attr){
				//							delete aRequest.data['id'];
				//						}
				//						aRequest.data = {
				//							item: aRequest.data,
				//							collectionName: aCollectionName
				//						}
				//					}
				}
			})
		});
		
		return lStore;
	}
});

