Ext.define('IS.view.portal.Logon', {
	extend: 'IS.view.base.Window',
	iconCls: 'key',
	title: 'jWebSocket ItemStorage plug-in',
	closable: false,
	
	doAction: function(){
		var lForm = this.down('form');
		if (lForm.getForm().isValid()){
			Ext.jws.getConnection().login(lForm.down('textfield[name=username]').getValue(), 
				lForm.down('textfield[name=password]').getValue());
		}
	},
	
	initComponent: function() {
		this.items = [{
			xtype: 'form',
			bodyPadding: 10,
			border: 0,
			items: [{
				xtype: 'textfield',
				name : 'username',
				fieldLabel: 'Username',
				value: 'demo',
				allowBlank: false
			},{
				xtype: 'textfield',
				inputType: 'password',
				name : 'password',
				fieldLabel: 'Password',
				value: 'demo',
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
			text: 'Logon',
			scope: this,
			handler: function (){
				this.doAction();
			}
		}];

		this.callParent(arguments);
	}
});
