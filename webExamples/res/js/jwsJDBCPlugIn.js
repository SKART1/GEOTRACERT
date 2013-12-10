//	---------------------------------------------------------------------------
//	jWebSocket JDBC Plug-in (Community Edition, CE)
//	---------------------------------------------------------------------------
//	Copyright 2010-2013 Innotrade GmbH (jWebSocket.org)
//	Alexander Schulze, Germany (NRW)
//
//	Licensed under the Apache License, Version 2.0 (the "License");
//	you may not use this file except in compliance with the License.
//	You may obtain a copy of the License at
//
//	http://www.apache.org/licenses/LICENSE-2.0
//
//	Unless required by applicable law or agreed to in writing, software
//	distributed under the License is distributed on an "AS IS" BASIS,
//	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//	See the License for the specific language governing permissions and
//	limitations under the License.
//	---------------------------------------------------------------------------

//:package:*:jws
//:class:*:jws.JDBCPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.JDBCPlugIn[/tt] class.
//:d:en:This client-side plug-in provides the API to access the features of the _
//:d:en:JDBC plug-in on the jWebSocket server.
jws.JDBCPlugIn = {

	//:const:*:NS:String:org.jwebsocket.plugins.jdbc (jws.NS_BASE + ".plugins.jdbc")
	//:d:en:Namespace for the [tt]JDBCPlugIn[/tt] class.
	// if namespace is changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.jdbc",
	
	//:m:*:processToken
	//:d:en:Processes an incoming token from the server side JDBC plug-in and _
	//:d:en:checks if certains events have to be fired. _
	//:d:en:If e.g. the request type was [tt]selectSQL[/tt] and data is _
	//:d:en:returned the [tt]OnJDBCRowSet[/tt] event is fired. Normally this _
	//:d:en:method is not called by the application directly.
	//:a:en::aToken:Object:Token to be processed by the plug-in in the plug-in chain.
	//:r:*:::void:none
	processToken: function( aToken ) {
		// check if namespace matches
		if( aToken.ns == jws.JDBCPlugIn.NS ) {
			// here you can handle incomimng tokens from the server
			// directy in the plug-in if desired.
			if( "selectSQL" == aToken.reqType ) {
				if( this.OnJDBCRowSet ) {
					this.OnJDBCRowSet( aToken );
				}
			}
		}
	},

	//:m:*:jdbcQuerySQL
	//:d:en:Runs a single native SQL query on the server utilizing the JDBC plug-in. 
	//:d:en:For security reasons it is recommended to use the abstract SQL commands.
	//:a:en::aQuery:String:Single SQL query string to be executed by the server side JDBC plug-in.
	//:a:en::aOptions:Object:Optional arguments, please refer to the [tt]sendToken[/tt] method of the [tt]jWebSocketTokenClient[/tt] class for details.
	//:r:*:::void:none
	jdbcQuerySQL: function( aQuery, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.JDBCPlugIn.NS,
				type: "querySQL",
				sql: aQuery
			};
			this.sendToken( lToken, aOptions );
		}
		return lRes;
	},

	//:m:*:jdbcQueryScript
	//:d:en:Runs a native SQL query script on the server utilizing the JDBC plug-in. 
	//:d:en:Attention! You may not mix query and update commands in a script!
	//:d:en:For security reasons it is recommended to use the abstract SQL commands.
	//:a:en::aScript:Array:Array of SQL query strings to be executed by the server side JDBC plug-in.
	//:a:en::aOptions:Object:Optional arguments, please refer to the [tt]sendToken[/tt] method of the [tt]jWebSocketTokenClient[/tt] class for details.
	//:r:*:::void:none
	jdbcQueryScript: function( aScript, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.JDBCPlugIn.NS,
				type: "querySQL",
				script: aScript
			};
			this.sendToken( lToken, aOptions );
		}
		return lRes;
	},

	//:m:*:jdbcUpdateSQL
	//:d:en:Runs a single native SQL update command on the server utilizing the JDBC plug-in. 
	//:d:en:This method returns an array of numbers how many rows have _
	//:d:en:been updated. No SQL result data is returned.
	//:d:en:For security reasons it is recommended to use the abstract SQL commands.
	//:a:en::aQuery:String:Single SQL update command string to be executed by the server side JDBC plug-in.
	//:a:en::aOptions:Object:Optional arguments, please refer to the [tt]sendToken[/tt] method of the [tt]jWebSocketTokenClient[/tt] class for details.
	//:r:*:::void:none
	jdbcUpdateSQL: function( aQuery, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.JDBCPlugIn.NS,
				type: "updateSQL",
				sql: aQuery
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	//:m:*:jdbcUpdateScript
	//:d:en:Runs a native SQL update script on the server utilizing the JDBC plug-in. _
	//:d:en:This method returns an array of numbers how many rows have _
	//:d:en:been updated. No SQL result data is returned.
	//:d:en:Attention! You may not mix query and update commands in a script!
	//:d:en:For security reasons it is recommended to use the abstract SQL commands.
	//:a:en::aScript:Array:Array of SQL update strings to be executed by the server side JDBC plug-in.
	//:a:en::aOptions:Object:Optional arguments, please refer to the [tt]sendToken[/tt] method of the [tt]jWebSocketTokenClient[/tt] class for details.
	//:r:*:::void:none
	jdbcUpdateScript: function( aScript, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.JDBCPlugIn.NS,
				type: "updateSQL",
				script: aScript
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	//:m:*:jdbcExecSQL
	//:d:en:Runs a single native SQL DDL command on the server utilizing the _
	//:d:en:JDBC plug-in. This method should be used to run DDL commands only, _
	//:d:en:e.g. to create or drop tables or stored procedures.
	//:a:en::aQuery:String:Single SQL DDL string to be executed by the server side JDBC plug-in.
	//:a:en::aOptions:Object:Optional arguments, please refer to the [tt]sendToken[/tt] method of the [tt]jWebSocketTokenClient[/tt] class for details.
	//:r:*:::void:none
	jdbcExecSQL: function( aQuery, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.JDBCPlugIn.NS,
				type: "execSQL",
				sql: aQuery
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	//:m:*:jdbcSelect
	//:d:en:Runs a single abstract SQL query on the server utilizing the JDBC plug-in. 
	//:a:en::aQuery:String:Single SQL query object to be executed by the server side JDBC plug-in.
	//:a:en:aQuery:tables:Array:Array of Strings with the names of the tables to generate the SQL command.
	//:a:en::aOptions:Object:Optional arguments, please refer to the [tt]sendToken[/tt] method of the [tt]jWebSocketTokenClient[/tt] class for details.
	//:r:*:::void:none
	jdbcSelect: function( aQuery, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lTables = aQuery.tables;
			if( lTables && !lTables.length ) {
				lTables = [ lTables ];
			}
			var lFields = aQuery.fields;
			if( lFields && !lFields.length ) {
				lFields = [ lFields ];
			}
			var lJoins = aQuery.joins;
			if( lJoins && !lJoins.length ) {
				lJoins = [ lJoins ];
			}
			var lOrders = aQuery.orders;
			if( lOrders && !lOrders.length ) {
				lOrders = [ lOrders ];
			}
			var lToken = {
				ns: jws.JDBCPlugIn.NS,
				type: "select",
				tables: lTables,
				joins: lJoins,
				fields: lFields,
				orders: lOrders,
				where: aQuery.where,
				group: aQuery.group,
				having: aQuery.having
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	jdbcUpdate: function( aQuery, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.JDBCPlugIn.NS,
				type: "update",
				table: aQuery.table,
				fields: aQuery.fields,
				values: aQuery.values,
				where: aQuery.where
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	jdbcInsert: function( aQuery, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.JDBCPlugIn.NS,
				type: "insert",
				table: aQuery.table,
				fields: aQuery.fields,
				values: aQuery.values
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	jdbcDelete: function( aQuery, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.JDBCPlugIn.NS,
				type: "delete",
				table: aQuery.table,
				where: aQuery.where
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},
	
	jdbcGetPrimaryKeys: function( aSequence, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lCount = 1;
			if( aOptions ) {
				if( aOptions.count != undefined ) {
					lCount = aOptions.count;
				}
			}
			var lToken = {
				ns: jws.JDBCPlugIn.NS,
				type: "getNextSeqVal",
				sequence: aSequence,
				count: lCount
			};
			this.sendToken( lToken,	aOptions );
		}
		return lRes;
	},

	setJDBCCallbacks: function( aListeners ) {
		if( !aListeners ) {
			aListeners = {};
		}
		if( aListeners.OnJDBCRowSet !== undefined ) {
			this.OnJDBCRowSet = aListeners.OnJDBCRowSet;
		}
		if( aListeners.OnJDBCResult !== undefined ) {
			this.OnJDBCResult = aListeners.OnJDBCResult;
		}
	}

}

// add the JWebSocket JDBC PlugIn into the TokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.JDBCPlugIn );
