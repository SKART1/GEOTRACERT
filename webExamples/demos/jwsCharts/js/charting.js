Ext.require( [ 'Ext.data.*', 'Ext.chart.*' ] );
Ext.BLANK_IMAGE_URL = 's.gif';

Ext.require( [
	'Ext.form.field.ComboBox',
	'Ext.form.FieldSet',
	'Ext.tip.QuickTipManager',
	'Ext.data.*'
] );
NS_MONITORING = jws.NS_BASE + ".plugins.monitoring";
NS_SYSTEM = jws.NS_BASE + ".plugins.system";

// Token types
TT_COMPUTER_INFO = "computerInfo";
TT_USER_INFO = "userInfo";
TT_SERVER_XCHG_INFO = "serverXchgInfo";
TT_SERVER_XCHG_INFO_X_DAYS = "serverXchgInfoXDays";
TT_SERVER_XCHG_INFO_X_MONTH = "serverXchgInfoXMonth";
TT_PLUGINS_INFO = "pluginsInfo";
TT_WELCOME = "welcome";
TT_REGISTER = "register";
TT_UNREGISTER = "unregister";

/**
 * Registers to the server monitoring plugin by sending the interest and some 
 * aditional data that the user should want to get from the server
 * @param {type} aInterest
 * @param {type} aData
 */
function registerTo( aInterest, aData ) {
	if ( aInterest ) {
		if ( typeof aData == "undefined" ) {
			aData = { }
		}

		aData.interest = aInterest;

		Ext.jws.send( NS_MONITORING, TT_REGISTER, aData );
	}
}

function unregister( ) {
	Ext.jws.send( NS_MONITORING, TT_UNREGISTER );
}

Ext.onReady( function( ) {
	Ext.tip.QuickTipManager.init( );

	/* Defining some month names to be used later */
	Date.prototype.getMonthName = function( aLang, aNumber ) {
		var lLang = aLang && (aLang in Date.locale) ? aLang : 'en';
		var lMonth = (aNumber && aNumber >= 0) ? aNumber : this.getMonth( );
		return Date.locale[ lLang ].month_names[ lMonth ];
	};

	Date.prototype.getMonthNameShort = function( aLang, aNumber ) {
		var lLang = aLang && (aLang in Date.locale) ? aLang : 'en',
				lMonth = (aNumber && aNumber >= 0) ? aNumber : this.getMonth( );
		return Date.locale[ lLang ].month_names_short[ lMonth ];
	};

	Date.prototype.getMonths = function( aLang ) {
		var lLang = aLang && (aLang in Date.locale) ? aLang : 'en';
		return Date.locale[ lLang ].month_names;
	};

	Date.prototype.getShortMonths = function( aLang ) {
		var lLang = aLang && (aLang in Date.locale) ? aLang : 'en';
		return Date.locale[ lLang ].month_names_short;
	};

	Date.locale = {
		en: {
			month_names: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],
			month_names_short: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ]
		}
	};

	// Namespaces
	var
			lClientStatus = Ext.get( "client_status" ),
			lClientId = Ext.get( "client_id" ),
			lWebSocketType = Ext.get( "websocket_type" );

	lWebSocketType.dom.innerHTML = "WebSocket: " +
			(jws.browserSupportsNativeWebSockets ? "(native)" : "(flashbridge)");

	Ext.jws.open( jws.getAutoServerURL() );

	Ext.jws.on( 'open', function( ) {
		registerTo( TT_COMPUTER_INFO );
	} );

	Ext.jws.on( 'close', function( ) {
		lClientId.dom.innerHTML = "Client-ID: - ";
		lClientStatus.dom.innerHTML = "disconnected";
		lClientStatus.dom.className = "offline";
	} );

	initDemo( );

} );

function initDemo( ) {
	var myStore = Ext.create( 'Ext.data.JsonStore', {
		fields: [ 'name', 'Memory', 'Cpu', 'Swap' ]
	} );

	var myStorePie = Ext.create( 'Ext.data.JsonStore', {
		fields: [ 'name', 'Total Hdd Space', 'Free', 'Used' ]
	} );

	var lHours = [ 'name' ];
	for ( var lHour = 1; lHour <= 24; lHour++ ) {
		lHours.push( lHour );
	}
	var myStoreExchange = Ext.create( 'Ext.data.JsonStore', {
		fields: lHours
	} );

	var lDays = [ 'name' ];
	for ( var lDay = 1; lDay <= 31; lDay++ ) {
		lDays.push( lDay );
	}
	var lStorePacketsXDay = Ext.create( 'Ext.data.JsonStore', {
		fields: lDays
	} );

	var lDate = new Date();
	var lStorePacketsXMonth = Ext.create( 'Ext.data.JsonStore', {
		fields: [ 'name', lDate.getFullYear() - 1, lDate.getFullYear(), lDate.getFullYear() + 1 ]
	} );

	var myStoreUsersOnline = Ext.create( 'Ext.data.JsonStore', {
		fields: [ 'name', { name: 'data', type: 'Integer' } ]
	} );

	var lStoreUseOfPlugIns = Ext.create( 'Ext.data.JsonStore', {
		fields: [ 'name', 'plugins' ]
	} );

	var lPlugin = { };

	lPlugin.processToken = function( aToken ) {
		if ( aToken.ns === NS_MONITORING ) {
			if ( aToken.type === TT_COMPUTER_INFO ) {
				var memory = parseInt( aToken.usedMemPercent );
				var totalConsumeCPU = parseFloat( aToken.consumeTotal );
				var cpu = aToken.consumeCPUCharts;
				var dataToShow = new Array( );
				for ( var i = 0; i < cpu.length; i++ ) {
					dataToShow.push( {
						name: 'CPU ' + (i + 1),
						data: parseFloat( cpu[i] )
					} );
				}

				var swap = parseInt( aToken.swapPercent );

				dataToShow.push(
						{
							name: 'Total CPU',
							data: totalConsumeCPU
						} );
				dataToShow.push( {
					name: 'Memory',
					data: memory
				} );
				dataToShow.push( {
					name: 'Swap',
					data: swap
				} );
				myStore.loadData( dataToShow );


				var freehd = parseInt( aToken.freeHddSpace );
				var usedhd = parseInt( aToken.usedHddSpace );

				var show = [
					{
						name: 'Free Hdd Space',
						data: freehd
					}, {
						name: 'Used Hdd Space',
						data: usedhd
					} ];
				myStorePie.loadData( show );

			} else if ( aToken.type === TT_USER_INFO ) {
				var lConnUsers = aToken.connectedUsers,
						lOnlineUsers = [ ]; 				// Rendering 60 seconds of connected users in the graph
				for ( var lKey = 59; lKey >= 0; lKey-- ) {
					lOnlineUsers.push( {
						name: 59 - lKey,
						data: lConnUsers[ lKey ]
					} );
				}
				myStoreUsersOnline.loadData( lOnlineUsers );
			}
			else if ( aToken.type === TT_SERVER_XCHG_INFO ) {
				if ( aToken.exchanges == null ) {
					lCbChooseDate.markInvalid( "There are no transactions " +
							"during the selected day in the server, please " +
							"select other day" );
				} else {
					var lExchangeInfo = [ ], lCounter = 0;
					for ( var lKey in aToken.exchanges ) {
						if ( lKey.toString()[0] === 'h' ) {
							lExchangeInfo.push( {
								name: lKey.substr( 1, lKey.length ), data: parseInt( aToken.exchanges[ lKey ] ) || 0
							} );
						}
					}
					myStoreExchange.loadData( lExchangeInfo );
				}
			}
			else if ( aToken.type === TT_SERVER_XCHG_INFO_X_DAYS ) {
				if ( aToken.code === -1 ) {
					lCBChooseMonth.markInvalid( "There are no transactions " +
							"for the selected month in the server, please " +
							"select other month" );
				} else {
					var lPacketsXDay = [ ];
					for ( var lDay = 1; lDay <= 31; lDay++ ) {
						lPacketsXDay.push( {
							name: lDay,
							data: aToken[(lDay < 10) ? '0' + lDay : lDay] || 0
						} );
					}
					lStorePacketsXDay.loadData( lPacketsXDay );
				}
			}

			else if ( aToken.type === TT_SERVER_XCHG_INFO_X_MONTH ) {
				if ( aToken.code == -1 ) {
					lCBChooseYear.markInvalid( "There are no transactions " +
							"for the selected year in the server, please " +
							"select other year" );
				}
				else {
					var lDate = new Date(),
							lMonths = lDate.getShortMonths( );

					var lPacketsXMonth = [ ];
					for ( var lIdx in lMonths ) {
						var lMonthNr = lIdx;
						if ( lMonthNr > 0 ) {
							lMonthNr = lMonthNr < 10 ? "0" + lMonthNr : lMonthNr;
						}
						lPacketsXMonth.push( {
							name: lMonths[ lIdx ],
							data: aToken[lMonthNr] || 0
						} );
					}
					lStorePacketsXMonth.loadData( lPacketsXMonth );
				}
			}

			else if ( aToken.type === TT_PLUGINS_INFO ) {
				var lUsePlugins = new Array( );
				var lPluginsInUse = aToken.usePlugins;
				if ( lPluginsInUse.length === 0 ) {
					lCbDataToSelect.markInvalid( 'No information for this item',
							'Sorry, the information for the Plug-ins is not ' +
							'available at this moment please, try later' );
				} else {
					for ( var j = 0; j < lPluginsInUse.length; j++ ) {
						lUsePlugins.push( {
							name: aToken.usePlugins[j].id,
							data: aToken.usePlugins[j].requests || 0
						} );
					}

					lStoreUseOfPlugIns.loadData( lUsePlugins );
				}
			}
		}

		else if ( aToken.ns === NS_SYSTEM ) {
			if ( aToken.type === TT_WELCOME ) {
				Ext.get( "client_id" ).dom.innerHTML = "Client-ID: " + aToken.sourceId;
				Ext.get( "client_status" ).dom.innerHTML = "online";
				Ext.get( "client_status" ).dom.className = "authenticated";
			}
		}
	}
	Ext.jws.addPlugIn( lPlugin );

	//**************** graphical representations*****************

	// Graphic representation of the resources of the machine
	var lTabPanelMachineResources = new Ext.TabPanel( {
		renderTo: Ext.getBody( ),
		id: 'main-tabs',
		height: 380,
		width: 400,
		activeTab: 0, border: false,
		margin: 0, defaults: {
			padding: 10 },
		//hideTabStripItem:true,
		bodyStyle: 'background:#e4e4e4;',
		items: [
			{
				title: 'Machine resources',
				id: 'tab1',
				layout: 'fit',
				border: false,
				items: {
					xtype: 'chart',
					border: false,
					style: 'background:#e4e4e4',
					animate: false,
					shadow: false,
					store: myStore,
					axes: [ {
							type: 'Numeric',
							position: 'left',
							fields: [ 'data' ], label: {
								renderer: Ext.util.Format.numberRenderer( '0,0' )
							},
							//title: 'Number of Hits',
							grid: true,
							minimum: 0, maximum: 100
						}, {
							type: 'Category',
							position: 'bottom',
							fields: [ 'name' ], title: 'Machine resources'
						} ], series: [ {
							type: 'column',
							axis: 'left',
							//gutter: 150,
							highlight: false,
							tips: {
								trackMouse: true,
								width: 100,
								height: 28,
								renderer: function( storeItem, item ) {
									this.setTitle( storeItem.get( 'name' ) + ': '
											+ storeItem.get( 'data' ) + ' %' );
								}
							},
							label: {
								display: 'outside',
								'text-anchor': 'middle',
								field: 'data',
								renderer: Ext.util.Format.numberRenderer( '0.0' ), orientation: 'horizontal',
								color: '#333'
							},
							xField: 'name',
							yField: 'data'
						} ]
				}
			},
			{
				title: 'Hard Disk Data',
				id: 'tab2',
				border: false,
				layout: 'fit',
				items: {
					xtype: 'chart',
					id: 'chartCmp',
					animate: true,
					border: false,
					store: myStorePie,
					background: {
						fill: '#e4e4e4'
					},
					shadow: true,
					legend: {
						position: 'right'
					},
					//insetPadding: 60,
					theme: 'Base:gradients',
					series: [ {
							type: 'pie',
							field: 'data',
							showInLegend: true,
							//  donut: donut,
							tips: {
								trackMouse: true,
								width: 90,
								height: 35,
								renderer: function( storeItem, item ) {
									//calculate percentage.
									var total = 0;
									myStorePie.each( function( rec ) {
										total += rec.get( 'data' );
									} );
									this.setTitle( storeItem.get( 'name' ) + ': '
											+ Math.round( storeItem.get( 'data' )
											/ total * 100) + '%');
								}
							},
							/* highlight: {
							 segment: {
							 margin: 20
							 }
							 },*/
							label: {
								field: 'name',
								display: 'rotate',
								contrast: true,
								font: '10px Arial'
							}
						} ]
				}

			}

		]

	} );
	Ext.define( 'State', {
		extend: 'Ext.data.Model',
		fields: [ 'name' ]
	} );
	// The data for all states
	var lDataToSelect = [ {
			"name": "Machine resources"
		}, {
			"name": "Server requests"
		}, {
			"name": "Online users"
		}, {
			"name": "Use of plug-ins"
		} ];
	var lDate = new Date(),
			lMonth_array = lDate.getMonths(),
			lMonths = [ ];
	for ( var lDay in lMonth_array ) {
		lMonths.push( {
			"name": lMonth_array[lDay]
		} );
	}

	var lYears = [ {
			"name": lDate.getFullYear() - 1
		}, {
			"name": lDate.getFullYear()
		}, {
			"name": lDate.getFullYear() + 1
		} ];
	// The data store holding the states; shared by each of the ComboBox 
	var lDataToSelectStore = Ext.create( 'Ext.data.Store', {
		model: 'State',
		data: lDataToSelect
	} );
	var storeMonth = Ext.create( 'Ext.data.Store', {
		model: 'State',
		data: lMonths
	} );
	var storeYear = Ext.create( 'Ext.data.Store', {
		model: 'State',
		data: lYears
	} ); 	//Creating the combobox in the main ExchangesXDays
	var lCBChooseMonth = Ext.create( 'Ext.form.field.ComboBox', {
		fieldLabel: 'Month',
		displayField: 'name',
		labelAlign: 'right',
		fieldStyle: "padding-left: 6px;",
		labelWidth: 80,
		width: 260,
		value: new Date().getMonthName(),
		emptyText: 'Select...',
		store: storeMonth,
		queryMode: 'local',
		typeAhead: true,
		listeners: {
			change: function( aField, aRecord, aIndex ) {
				var lValue = aField.getValue( );

				var lDate = new Date(),
						lMonthNr = Ext.Array.indexOf( lDate.getMonths( ), lValue ) + 1;
				registerTo( TT_SERVER_XCHG_INFO_X_DAYS, {
					month: lMonthNr < 10 ? "0" + lMonthNr : lMonthNr
				} )
			}
		}
	} );
	lCBChooseMonth.hide( );

	//Creating the combobox in the main ExchangesXMonth
	var lCBChooseYear = Ext.create( 'Ext.form.field.ComboBox', {
		fieldLabel: 'Year',
		displayField: 'name',
		labelAlign: 'right',
		labelWidth: 80,
		width: 260,
		emptyText: 'Select...',
		value: new Date().getFullYear(),
		fieldStyle: "padding-left: 6px;",
		store: storeYear,
		queryMode: 'local',
		typeAhead: true,
		listeners: {
			select: function( aField, aRecord, aIndex ) {
				var lValue = aField.getValue( );
				registerTo( TT_SERVER_XCHG_INFO_X_MONTH, {
					year: lValue.toString()
				} );
			}
		}
	} );
	lCBChooseYear.hide( );

	//Creating the calendar
	var lCbChooseDate = new Ext.form.DateField( {
		fieldLabel: 'Date',
		emptyText: 'Select a date...',
		format: 'M/d/y',
		labelAlign: 'right',
		fieldStyle: "padding-left: 6px;",
		labelWidth: 80,
		width: 260,
		value: new Date(),
		minValue: '01/01/2013',
		listeners: {
			select: function( aField, aDate ) {
				var lSelectedDate = aField.rawValue,
						lDateArray = lSelectedDate.split( '/', 3 ), lSelMonth = lDateArray[0],
						lDay = lDateArray[1],
						lYear = lDateArray[2],
						lDate = new Date(),
						lMonthNr = Ext.Array.indexOf( lDate.getShortMonths( ), lSelMonth ) + 1;
				if ( lMonthNr > 0 ) {
					lMonthNr = lMonthNr < 10 ? "0" + lMonthNr : lMonthNr;
				}

				registerTo( TT_SERVER_XCHG_INFO, {
					month: lMonthNr,
					day: lDay,
					year: lYear
				} );
			}
		}

	} );
	// Adding the calendar to a panel
	var lPanelChooseDate = new Ext.Panel( {
		frame: false,
		border: false,
		width: 270,
		height: 46,
		x: 0, y: 0, layout: 'absolute',
		bodyStyle: 'background:#e4e4e4',
		items: [ lCbChooseDate ]
	} );
	lPanelChooseDate.hide( );

	//Creating the combobox in the main view
	var lCbDataToSelect = Ext.create( 'Ext.form.field.ComboBox', {
		fieldLabel: 'Data Source',
		labelAlign: 'right',
		labelWidth: 80,
		displayField: 'name',
		value: lDataToSelect[0].name,
		width: 260,
		fieldStyle: "padding-left: 6px;",
		emptyText: 'Select...',
		store: lDataToSelectStore,
		queryMode: 'local',
		typeAhead: false,
		editable: false,
		listeners: {
			change: function( aField, aValue ) {
				var lIdx = -1, lMainCmp = Ext.getCmp( 'main_panel' ), lItem;
				for ( lItem in lDataToSelect ) {
					if ( lDataToSelect[ lItem ].name === aValue ) {
						lIdx = lItem;
						break;
					}
				}

				if ( lIdx == 0 ) {
					//send token register with your interest
					registerTo( TT_COMPUTER_INFO );
					lPanelChooseDate.hide( );
					lCBChooseMonth.hide( );
					lCBChooseYear.hide( );
				}
				else if ( lIdx == 1 ) {
					registerTo( TT_SERVER_XCHG_INFO );
					lPanelChooseDate.show();
				}
				else if ( lIdx == 2 ) {
					registerTo( TT_USER_INFO );
					lPanelChooseDate.hide( );
					lCBChooseMonth.hide( );
					lCBChooseYear.hide( );
				}
				if ( lIdx == 3 ) {
					registerTo( TT_PLUGINS_INFO );
					lPanelChooseDate.hide( );
					lCBChooseMonth.hide( );
					lCBChooseYear.hide( );
				}
				lMainCmp.layout.setActiveItem( parseInt( lIdx ) );
			}
		}
	} ); 	// Creating panel containing the combobox and calendar        
	var lOptionsPanel = new Ext.Panel( {
		border: true,
		frame: false,
		x: 400,
		y: -470,
		width: 290,
		bodyStyle: 'background:#e4e4e4;padding-top: 7px;',
		height: 75,
		items: [ lCbDataToSelect, lCBChooseMonth, lCBChooseYear,
			lPanelChooseDate ]
	} );
	// Graphic representation of the server requests
	var lTabPanelServerPackets = new Ext.TabPanel( {
		renderTo: Ext.getBody( ),
		id: 'exchanges-main-tabs',
		height: 380,
		width: 400,
		activeTab: 0, border: false,
		margin: 0, defaults: {
			padding: 10 },
		hideTabStripItem: true,
		bodyStyle: 'background:#e4e4e4;',
		items: [ {
				title: 'Packets/Hour',
				id: 'tab_pkt_x_h',
				layout: 'fit',
				border: false,
				items: {
					xtype: 'chart',
					style: 'background:#e4e4e4',
					animate: false,
					border: false,
					shadow: false,
					store: myStoreExchange,
					axes: [ {
							type: 'Numeric',
							position: 'left',
							fields: [ 'data' ], label: {
								renderer: Ext.util.Format.numberRenderer( '0,0' )
							},
							title: 'Packets',
							grid: true,
							minimum: 0
						}, {
							type: 'Category',
							position: 'bottom',
							fields: [ 'name' ], title: 'Hour'
						} ], series: [ {
							type: 'column',
							axis: 'left',
							highlight: false,
							tips: {
								trackMouse: true,
								width: 140,
								height: 28,
								renderer: function( storeItem, item ) {
									this.setTitle( storeItem.get( 'name' ) + ': '
											+ storeItem.get( 'data' ) + ' requests' );
								}
							},
							label: {
								display: 'outside',
								'text-anchor': 'middle',
								field: 'data',
								renderer: Ext.util.Format.numberRenderer( '0' ), orientation: 'horizontal',
								color: '#333'
							},
							xField: 'name',
							yField: 'data'
						} ]
				}

			},
			{
				title: 'Packets/Day',
				id: 'tab_pkt_x_d',
				layout: 'fit',
				border: false,
				items: {
					xtype: 'chart',
					style: 'background:#e4e4e4',
					animate: false,
					border: false,
					shadow: false,
					store: lStorePacketsXDay,
					axes: [ {
							type: 'Numeric',
							position: 'left',
							fields: [ 'data' ], label: {
								renderer: Ext.util.Format.numberRenderer( '0,0' )
							},
							title: 'Packets',
							grid: true,
							minimum: 0
						}, {
							type: 'Category',
							position: 'bottom',
							fields: [ 'name' ], title: 'Day'
						} ], series: [ {
							type: 'column',
							axis: 'left',
							highlight: false,
							tips: {
								trackMouse: true,
								width: 140,
								height: 28,
								renderer: function( storeItem, item ) {
									this.setTitle( storeItem.get( 'name' ) + ': '
											+ storeItem.get( 'data' ) + ' requests' );
								}
							},
							label: {
								display: 'outside',
								'text-anchor': 'middle',
								field: 'data',
								renderer: Ext.util.Format.numberRenderer( '0' ), orientation: 'horizontal',
								color: '#333'
							},
							xField: 'name',
							yField: 'data'
						} ]
				}
			},
			{
				title: 'Packets/Month',
				id: 'tab_pkt_x_m',
				layout: 'fit',
				border: false,
				items: {
					xtype: 'chart',
					style: 'background:#e4e4e4',
					animate: false,
					border: false,
					shadow: false,
					store: lStorePacketsXMonth,
					axes: [ {
							type: 'Numeric',
							position: 'left',
							fields: [ 'data' ], label: {
								renderer: Ext.util.Format.numberRenderer( '0,0' )
							},
							title: 'Packets',
							grid: true,
							minimum: 0
						}, {
							type: 'Category',
							position: 'bottom',
							fields: [ 'name' ], title: 'Month'
						} ], series: [ {
							type: 'column',
							axis: 'left',
							highlight: false,
							tips: {
								trackMouse: true,
								width: 140,
								height: 28,
								renderer: function( storeItem, item ) {
									this.setTitle( storeItem.get( 'name' ) + ': '
											+ storeItem.get( 'data' ) + ' requests' );
								}
							},
							label: {
								display: 'outside',
								'text-anchor': 'middle',
								field: 'data',
								renderer: Ext.util.Format.numberRenderer( '0' ), orientation: 'horizontal',
								color: '#333'
							},
							xField: 'name',
							yField: 'data'
						} ]
				}
			} ], listeners: {
			tabchange: function( aTabPanel, aNewCard, aOldCard ) {
				switch ( aNewCard.id ) {
					case 'tab_pkt_x_h':
						registerTo( TT_SERVER_XCHG_INFO );
						lPanelChooseDate.show( );
						lCBChooseMonth.hide( );
						lCBChooseYear.hide( );

						break;
					case 'tab_pkt_x_d':
						var lMonthNr = new Date().getMonth() + 1;
						registerTo( TT_SERVER_XCHG_INFO_X_DAYS, {
							month: lMonthNr < 10 ? "0" + lMonthNr : lMonthNr
						} );
						lCBChooseMonth.show( );
						lPanelChooseDate.hide( );
						lCBChooseYear.hide( );
						break;
					case 'tab_pkt_x_m':
						registerTo( TT_SERVER_XCHG_INFO_X_MONTH, {
							year: new Date().getFullYear().toString()
						} );
						lCBChooseYear.show( );
						lPanelChooseDate.hide( );
						lCBChooseMonth.hide( );
						break;
				}
			}
		}
	} );
	// Graphic representation of Users Online
	var lTabPanelUsersOnline = new Ext.TabPanel( {
		renderTo: Ext.getBody( ),
		id: 'tab_panel_users_online',
		layout: 'fit',
		height: 380,
		width: 400,
		border: false,
		activeTab: 0, margin: 0, defaults: {
			padding: 5
		},
		hideTabStripItem: true,
		bodyStyle: 'background:#e4e4e4;',
		items: [
			{
				bodyStyle: 'background:#e4e4e4;',
				title: 'Online Users',
				id: 'tab_users_online',
				layout: 'fit',
				border: false,
				items: {
					xtype: 'chart',
					animate: true,
					store: myStoreUsersOnline,
					shadow: true,
					axes: [ {
							type: 'Numeric',
							minimum: 0, position: 'left',
							fields: 'data',
							title: "Online Users",
							grid: false,
							label: {
								renderer: Ext.util.Format.numberRenderer( '0,0' ), font: '7pt Verdana'
							}
						}, {
							type: 'Category',
							position: 'bottom',
							fields: 'name',
							title: "Seconds ago",
							label: {
								font: '7pt Verdana'
							}
						} ], series: [ {
							type: 'line',
							axis: 'left',
							xField: 'name',
							yField: 'data',
							tips: {
								trackMouse: true,
								width: 120,
								height: 40,
								renderer: function( storeItem, item ) {
									this.setTitle( storeItem.get( 'name' ) + " Seconds ago"
											+ '<br />' + storeItem.get( 'data' )
											+ " users online" );
								}
							},
							style: {
								fill: '#38B8BF',
								stroke: '#38B8BF',
								'stroke-width': 1
							},
							markerConfig: {
								type: 'circle',
								size: 3, radius: 3, 'stroke-width': 0, fill: '#38B8BF',
								stroke: '#38B8BF'
							}
						} ]
				}
			} ]
	} );
	// Graphic representation of use of plugins
	var lTabPanelUseOfPlugIns = new Ext.TabPanel( {
		renderTo: Ext.getBody( ),
		id: 'tab_panel_use_of_plug_ins',
		height: 380,
		width: 400,
		activeTab: 0, border: false,
		margin: 0, defaults: {
			padding: 10 },
		//hideTabStripItem:true,
		bodyStyle: 'background:#e4e4e4;',
		items: [
			{
				bodyStyle: 'background:#e4e4e4;',
				title: 'Use of plug-ins',
				id: 'tab7',
				layout: 'fit',
				border: false,
				items: {
					xtype: 'chart',
					animate: false,
					shadow: false,
					store: lStoreUseOfPlugIns,
					axes: [ {
							type: 'Numeric',
							position: 'bottom',
							fields: [ 'data' ], label: {
								renderer: Ext.util.Format.numberRenderer( '0,0' )
							},
							title: 'Number of Requests',
							grid: true,
							minimum: 0
									//maximum:100
						}, {
							type: 'Category',
							position: 'left',
							fields: [ 'name' ], title: 'Plug-ins'
						} ], series: [ {
							type: 'bar',
							axis: 'bottom',
							highlight: false,
							tips: {
								trackMouse: true,
								width: 180,
								height: 28,
								renderer: function( storeItem, item ) {
									this.setTitle( storeItem.get( 'name' ) + ': '
											+ storeItem.get( 'data' ) + " packets" );
								}
							},
							label: {
								display: 'insideEnd',
								field: 'data',
								renderer: Ext.util.Format.numberRenderer( '0' ), orientation: 'horizontal',
								color: '#333',
								'text-anchor': 'middle'
							},
							xField: 'name',
							yField: [ 'data' ]
						} ]
				}
			}
		]
	} );
	// Panel that contains the graphics
	var lMainPanel = new Ext.Panel( {
		id: 'main_panel',
		border: false,
		frame: false,
		width: 700,
		x: 0, y: 0, activeItem: 0, layout: 'card',
		//collapsible:false,
		items: [ lTabPanelMachineResources, lTabPanelServerPackets, lTabPanelUsersOnline, lTabPanelUseOfPlugIns ]
	} );
	// Panel that contains the text of the main view
	var lDescription = new Ext.Panel( {
		frame: false,
		border: false,
		width: 350,
		height: 100,
		html: "The Charting Demo displays server statistics graphically in " +
				"real-time. Please select one of the data sources provided " +
				"by server to see the various possibilities of real-time " +
				"server monitoring with jWebSocket.",
		x: 20,
		y: 10,
		//  layout:'absolute',
		bodyStyle: 'background:#eaf4dc;'
	} );

	var lGraphicPanel = new Ext.Panel( {
		frame: false,
		border: false,
		x: 10,
		y: 10,
		width: 700,
		height: 380,
		items: [ lMainPanel ]
	} );

	var lChartingDemo = new Ext.Window( {
		renderTo: 'content',
		x: 0, y: 85,
		width: 710,
		height: 490,
		border: false,
		frame: true,
		resizable: false,
		closable: false,
		draggable: false,
		maximizable: false,
		cls: "border",
		minimizable: false,
		bodyStyle: 'background:#eaf4dc;',
		items: [ lDescription, lGraphicPanel, lOptionsPanel ]
	} );
	lChartingDemo.show( );
}
