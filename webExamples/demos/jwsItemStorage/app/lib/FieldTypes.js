Ext.define('Ext.form.ArrayField', {
	extend: 'Ext.form.field.Text',
	alias: 'widget.arrayfield',

	getValue: function(){
		try {
			return Ext.decode(this.getRawValue());
		} catch (lEx){
			return [];
		}
	},
	
	setValue: function(aArrayVal){
		if (undefined != aArrayVal){
			this.callParent([Ext.encode(aArrayVal)]);
		}
	}
});
