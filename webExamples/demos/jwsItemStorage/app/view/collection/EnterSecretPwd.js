Ext.define('IS.view.collection.EnterSecretPwd', {
	extend: 'IS.view.base.Window',
	alias: 'widget.c_confirmpwd',
	iconCls: 'key',
	doAction: function(){},
	text: "",
	textColor: "red",
	
	initComponent: function() {
		this.items = [{
			xtype: 'form',
			bodyPadding: 10,
			border: 0,
			items: [{
				xtype: 'panel',
				border: 0,
				padding: '0 0 20 0',
				html: '<font size=small color=' + this.textColor + '>' + this.text + '</font>',
				maxWidth: 280
			},{
				xtype: 'textfield',
				inputType: 'password',
				name : 'secretPassword',
				fieldLabel: 'Please enter the collection secret password',
				labelWidth: 150,
				minLength: 4,
				listeners:{  
					scope:this,  
					specialkey: function(f,e){  
						if(e.getKey()==e.ENTER){  
							this.doAction();
						}  
					}  
				}  
			}]
		}];

		this.buttons = [{
			text: 'Do Action',
			scope: this,
			tooltip: 'Tries to authorize on the collection by using entered password, executes the requested operation if success.',
			handler: function (){
				this.doAction();
			}
		},{
			text: 'Cancel',
			scope: this,
			handler: this.close,
			tooltip: 'Cancel operation.'
		}];

		this.callParent(arguments);
	}
});
