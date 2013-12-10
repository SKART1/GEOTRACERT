Ext.define('IS.view.collection.EnterAccessPwd', {
	extend: 'IS.view.base.Window',
	iconCls: 'key',
	doAction: function(){},
	text: "",
	textColor: "green",
	
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
				name : 'accessPassword',
				fieldLabel: 'Please enter the collection access password',
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
			tooltip: 'Tries to subscribe on the collection by using entered password, executes the requested operation if success.',
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
