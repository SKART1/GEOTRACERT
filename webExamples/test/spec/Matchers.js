

beforeEach( function() {

	this.addMatchers({
		toBeTypeOf: function( aType ) {
			return aType == jws.tools.getType( this.actual );
		}
	});

});
