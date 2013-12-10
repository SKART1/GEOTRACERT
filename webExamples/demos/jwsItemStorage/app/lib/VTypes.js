Ext.apply(Ext.form.field.VTypes, {
	confirm: function( aVal, aField ) {
		return aVal == aField.previousNode().getValue();
	},
	confirmText: 'Value should be equal to previous field value!'
});

Ext.apply(Ext.form.field.VTypes, {
	stringArray: function( aVal, aField ) {
		try {
			var lArray = Ext.decode(aVal);
			return jws.tools.isArrayOf(lArray, 'string');
		}catch (lEx){
			return false;
		}
	},
	stringArrayText: 'Please enter a JSON valid string array!'
});

Ext.apply(Ext.form.field.VTypes, {
	integerArray: function( aVal, aField ) {
		try {
			var lArray = Ext.decode(aVal);
			return jws.tools.isArrayOf(lArray, 'integer');
		}catch (lEx){
			return false;
		}
	},
	integerArrayText: 'Please enter a JSON valid integer array!'
});

Ext.apply(Ext.form.field.VTypes, {
	booleanArray: function( aVal, aField ) {
		try {
			var lArray = Ext.decode(aVal);
			return jws.tools.isArrayOf(lArray, 'boolean');
		}catch (lEx){
			return false;
		}
	},
	booleanArrayText: 'Please enter a JSON valid boolean array!'
});

Ext.apply(Ext.form.field.VTypes, {
	longArray: function( aVal, aField ) {
		try {
			var lArray = Ext.decode(aVal);
			// TODO: Find a solution to this type
			return jws.tools.isArrayOf(lArray, 'integer');
		}catch (lEx){
			return false;
		}
	},
	longArrayText: 'Please enter a JSON valid long array!'
});

Ext.apply(Ext.form.field.VTypes, {
	doubleArray: function( aVal, aField ) {
		try {
			var lArray = Ext.decode(aVal);
			return jws.tools.isArrayOf(lArray, 'double');
		}catch (lEx){
			return false;
		}
	},
	doubleArrayText: 'Please enter a JSON valid double array!'
});

Ext.apply(Ext.form.field.VTypes, {
	max: function( aVal, aField ) {
		return aField.getValue() >= aField.previousNode().getValue();
	},
	maxText: 'Invalid value!'
});
