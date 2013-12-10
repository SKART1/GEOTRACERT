//	---------------------------------------------------------------------------
//	jWebSocket Management Desk (Community Edition, CE)
//	---------------------------------------------------------------------------
//	Copyright 2010-2013 Innotrade GmbH (jWebSocket.org)
//  Alexander Schulze, Germany (NRW)
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

/**
 * 
 * @author Marcos Antonio González Huerta (markos0886, UCI)
 * @version 1.0
 * 
 */
Ext.BLANK_IMAGE_URL = 'images/s.gif';
Ext.Loader.setConfig({
	enabled: true
});
Ext.Loader.setPath('Ext.ux', '../../lib/ExtJS/ux');
Ext.require(['Ext.data.*', 'Ext.grid.*','Ext.form.*','Ext.tip.*','Ext.util.*','Ext.tip.QuickTipManager','Ext.ux.LiveSearchGridPanel']);
Ext.ns("admin");

var mName = "jWebSocket Management Desk";
var mVersion = mName + " 1.0";
		
function renderResult(val){
	if(val == "Successful" || true == val){
		return '<span style="color:green;">' + val + '</span>';
	} else if(val == "Warning"){
		return '<span style="color:orange;">' + val + '</span>';
	} else {
		return '<span style="color:red;">' + val + '</span>';
	}
	return val;
}

function newGridPanel(Title, Store){
	return new Ext.create('Ext.grid.Panel', {
		id: 'gridMain' + Title,
		title: (Title + 's'),
		xtype:'gridpanel',
		store: Store,
		frame:true,
		border: true,
		columnLines: true,
		resizable : false,
		height:235,
		columns: [
		Ext.create('Ext.grid.RowNumberer'),{
			header:'Id ' + Title,
			dataIndex:'id',
			width:115
		},{
			header:'Name',
			dataIndex:'name',
			width:275
		},{
			header:'Namespace',
			dataIndex:'namespace',
			width:200
		},{
			header:'Library (.jar)',
			dataIndex:'jar',
			width:190
		},{
			header:'Servers',
			dataIndex:'servers',
			align: 'center',
			width:55
		},{
			header:'Enabled',
			dataIndex:'enabled',
			align: 'center',
			renderer: renderResult,
			width:55
		}]
	});
}

function newWindowAdd(type, storeJar, storeId, store){
	Ext.create('Ext.window.Window',{
		renderTo:Ext.getBody(),
		width: 390,
		height: 229,
		id: 'add' + type,
		title: 'Add '+ type,
		resizable: false,
		closable: true,
		draggable: false,
		plain: true,
		border: true,
		modal: true,
		iconCls:'icon-add',
		items:[{
			xtype:'form',
			jwsSubmit:true,
			id: 'formAdd' + type,
			frame:true,
			border:true,
			height:195,
			width:378,
			layout:'absolute',
			defaultType: 'textfield',
			items:[{
				xtype:'label',
				text:'Library (.jar):',
				x:5,
				y:10
			},{
				id: 'comboJar' + type,
				xtype:'combobox',
				store: storeJar,
				emptyText: 'Select a Library',
				queryMode: 'local',
				triggerAction: 'all',
				displayField: 'jar',
				valueField: 'jar',
				allowBlank: false,
				forceSelection: true,
				editable: false,
				renderTo: Ext.getCmp(this.up),
				width:270,
				x:90,
				y:6
			},{
				xtype:'label',
				text:'Id ' + type + ':',
				x:5,
				y:41
			},{
				id: 'comboId' + type,
				xtype:'combobox',
				store: storeId,
				disabled: true,
				allowBlank: false,
				forceSelection: true,
				editable: false,
				emptyText: 'Select the id of a ' + type,
				triggerAction: 'all',
				queryMode: 'local',
				displayField: 'id' + type,
				valueField: 'id' + type,
				renderTo: Ext.getCmp(this.up),
				width:270,
				x:90,
				y:35
			},{
				xtype:'label',
				text:'Name:',
				x:5,
				y:70
			},{
				id: 'textName' + type,
				width:270,
				disabled: true,
				readOnly: true,
				cls:"disableTextField",
				x:90,
				y:65
			},{
				xtype:'label',
				text:'Namespace:',
				x:5,
				y:100
			},{
				id: 'textNamespace' + type,
				width:270,
				disabled: true,
				readOnly: true,
				cls:"disableTextField",
				x:90,
				y:95	
			},{
				xtype:'label',
				text:'Servers:',
				x:5,
				y:130
			},{
				id: 'textServers' + type,
				width:270,
				disabled: true,
				readOnly: true,
				cls:"disableTextField",
				x:90,
				y:125	
			},{
				xtype:'button',
				text:'Add',
				width:60,
				iconCls:'icon-add',
				x:220,
				y:160,
				handler: function add() {
					var id = Ext.getCmp('comboId' + type).getValue();
					
					if(id != "") {
						newWindowReason(id, "add" + type, store);
					}
					Ext.getCmp('add' + type).close();
				}
			},{
				xtype:'button',
				text:'Cancel',
				width:70,
				iconCls:'icon-cancel',
				x:290,
				y:160,
				handler: function() {
					Ext.getCmp('add' + type).close();
				}
			}]
		}]
	}).show().center();
	
	Ext.getCmp('comboJar' + type).on('select',function(cmb, record, index){
		var comboId = Ext.getCmp('comboId' + type);
		comboId.enable();
		comboId.clearValue();
		Ext.getCmp('textName' + type).setValue("");
		Ext.getCmp('textNamespace' + type).setValue("");
		Ext.getCmp('textServers' + type).setValue("");
		storeId.load({				 
			params:{  
				jar:Ext.getCmp('comboJar' + type).getValue() 
			}  
		});
	});
	
	Ext.getCmp('comboId' + type).on('select',function(cmb, record, index){

		Ext.jws.send("org.jwebsocket.plugins.admin", "get" + type + "ConfigById",{
			id:	this.getValue()
		}, {
			success: function(aToken){
				Ext.getCmp('textName' + type).setValue(aToken.name);
				Ext.getCmp('textNamespace' + type).setValue(aToken.namespace);
				Ext.getCmp('textServers' + type).setValue(aToken.servers);
			},
			failure: function(aToken){
				msg("Error", aToken.msg);
			}
		});
	});
}

function newWindowReason(aId, aFunction, aStore){
	Ext.create('Ext.window.Window',{
		renderTo:Ext.getBody(),
		width: 386,
		height: 199,
		id: 'windowReason',
		title: 'Reason of change.',
		resizable: false,
		closable: true,
		draggable: false,
		plain: true,
		border: true,
		modal: true,
		iconCls:'icon-reload',
		items:[{
			xtype:'form',
			jwsSubmit:true,
			id: 'formReason',
			frame:true,
			border:true,
			height:165,
			width:374,
			layout:'absolute',
			defaultType: 'label',
			items:[{
				text:'Enter the reason of change:',
				x:5,
				y:6
			},{
				id: 'reason',
				xtype:'textareafield',
				allowBlank: false,
				width:355,
				height:95,
				x:5,
				y:21
			},{
				xtype:'button',
				text:'Send',
				width:60,
				iconCls:'icon-add',
				x:220,
				y:130,
				handler: function() {
					var lReason = Ext.getCmp('reason').getValue();
					if("" != lReason) {
						Ext.jws.send("org.jwebsocket.plugins.admin", aFunction,{
							id:	aId,
							reason: lReason
						}, {
							success: function(aToken){
								aStore.load();
								msg("Successful",aToken.msg);
							},
							failure: function(aToken){
								msg("Error",aToken.msg);
							}
						});
						Ext.getCmp('windowReason').close();
					} else {
						msg("Error","The fields are required.");
					}
				}
			},{
				xtype:'button',
				text:'Cancel',
				width:70,
				iconCls:'icon-cancel',
				x:290,
				y:130,
				handler: function() {
					Ext.getCmp('windowReason').close();
				}
			}]
		}]
	}).show().center();
}

function initToolTip(Title){
	Ext.create('Ext.tip.ToolTip', {
		target: 'gridMain' + Title,
		delegate: Ext.getCmp('gridMain' + Title).getView().itemSelector,
		trackMouse: true,
		bodyCls: 'bodyToolTip',
		renderTo: Ext.getBody(),
		width: 'auto',
		maxWidth: 500,
		listeners: {
			// Change content dynamically depending on which element triggered the show.
			beforeshow: function updateTipBody(tip) {
				view = Ext.getCmp('gridMain' + Title).getView();
				tip.update('id: <span>"' + view.getRecord(tip.triggerElement).get('id') + '"</span><br>' +
					'name: <span>"' + view.getRecord(tip.triggerElement).get('name') + '"</span><br>' +
					'ns: <span>"' + view.getRecord(tip.triggerElement).get('namespace') + '"</span><br>' +
					'jar: <span>"' + view.getRecord(tip.triggerElement).get('jar') + '"</span><br>' +
					'servers: <span>"' + view.getRecord(tip.triggerElement).get('servers') + '"</span><br>' +
					'enabled: <span>' +  renderResult(view.getRecord(tip.triggerElement).get('enabled')) + '</span><br>');
			}
		}
	});
}

function newMessageBox(Id, Title, Text, Function){
	return Ext.create('Ext.window.Window',{
		id:Id,
		renderTo:Ext.getBody(),
		width: 300,
		height: 120,
		layout:'absolute',
		title: Title,//'Removing Plug-In...',
		resizable: false,
		closable: true,
		border: true,
		modal: true,
		items: [{
			xtype: 'image',
			src: 'images/warning.png',
			renderTo: Ext.getBody(),
			padding: '15 0 0 15'
		},{
			xtype:'label',
			text: Text,//'You are sure remove this Plug-In?',
			cls : 'label',
			x:56,
			y:23
		},{
			xtype:'button',
			text:'Accept',
			width:70,
			iconCls:'icon-accept',
			x:130,
			y:55,
			handler: Function
		},{
			xtype:'button',
			text:'Cancel',
			width:70,
			iconCls:'icon-cancel',
			x:205,
			y:55,
			handler: function() {
				Ext.getCmp(Id).close();
			}
		}]
	}).show().center();
}

function msg(type, message, delay, align){
	var msgCt;
	var title;
	function createBox(t, s){
		if (!s) s = "Debe entrar un texto para el mensaje";
		return ['<div class="msg">',
		'<div class="x-box-tl"><div class="x-box-tr" id="a1"><div class="x-box-tc id="Box1"></div></div></div>',
		'<div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc" id="Box">', t, '<ho2 id="tc">', s,'</ho2></div></div></div>',
		'<div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div>',
		'</div>'].join('');
	}
	
	if (!delay) delay = 3;
	if (!align) align = "t";
	if(!msgCt) msgCt = Ext.core.DomHelper.insertBefore(document.body, {
		id:'msg-div'
	}, true);
	
	if(type.toLowerCase() == "error")
		title = '<h3 style="color:red;"><ho1 id="tt">Error</ho1></h3>';
	else if(type.toLowerCase() == "warning")
		title = '<h3 style="color:orange;"><ho1 id="tt">Warning</ho1></h3>';
	else if(type.toLowerCase() == "successful")
		title = '<h3 style="color:green;"><ho1 id="tt">Successful</ho1></h3>';
	else
		title = '<h3><ho1 id="tt">' + type + '</ho1></h3>';
		
	msgCt.alignTo(document, align+'-'+align);
	var m = Ext.core.DomHelper.append(msgCt, {
		html:createBox(title, message)
	}, true);
	m.slideIn(align).pause(delay * 1000).ghost(align, {
		remove:true
	});
}

//Login Panel
admin.loginPanel = {
	init: function(){		
		Ext.create('Ext.window.Window',{
			renderTo:Ext.getBody(),
			id: "winLoginPanel",
			x:(screen.width/2 - 145),
			y:180,
			layout:'absolute',
			width: 297,
			height: 140,
			title: 'Login Panel',
			resizable: false,
			closable: false,
			draggable: false,
			plain: true,
			border: true,
			iconCls:'icon-lock',
			defaultType: 'textfield',
			items:[{
				xtype:'label',
				text:'Username:',
				x:10,
				y:15
			},{
				id: 'textUser',
				emptyText: 'Enter the User',
				vtype:"alphanum",
				allowBlank: false,
				width:200,
				x:75,
				y:11
			},{
				xtype:'label',
				text:'Password:',
				x:10,
				y:45
			},{
				id: 'textPass',
				emptyText: 'Enter the password',
				allowBlank: false,
				inputType: 'password',
				width:200,
				listeners: {
					specialkey: function(field, e){
						if (e.getKey() == e.ENTER) {
							Ext.getCmp('buttonLogon').handler();
						}
					}
				},
				x:75,
				y:40
			},{
				xtype:'button',
				text:'Clear',
				width:60,
				iconCls:'icon-clear',
				x:150,
				y:75,
				handler: function clear() {
					Ext.getCmp('textUser').reset();
					Ext.getCmp('textPass').reset();
				}
			},{
				id:"buttonLogon",
				xtype:'button',
				text:'Login',
				width:60,
				iconCls:'icon-unlock',
				x:215,
				y:75,
				handler: function logon() {
					if(("" != Ext.getCmp('textUser').getValue()) && ("" != Ext.getCmp('textPass').getValue())) {	
						Ext.jws.send("org.jwebsocket.plugins.system", "logon",{
							username:	Ext.getCmp('textUser').getValue(),
							password: Ext.getCmp('textPass').getValue()}, {
								success: function(aToken){
									if(0 == aToken.authorities.indexOf("ROLE_ADMIN_MAINTENANCE")) {
										admin.mainPanel.init();
										admin.logsPanel.init();
										admin.loginPanel.close();
									} else {
										msg("Error","You don't have the credentials for access.");
									}
								},
								failure: function(aToken){
									msg("Error",aToken.msg);
								}
						});
					} else {
						msg("Error","The fields are required.");
					}
				}
			}]
		}).show();
		
		Ext.getCmp('textUser').focus();
	},
	close: function(){
		if(Ext.getCmp("winLoginPanel"))
			Ext.getCmp("winLoginPanel").close();
	}
}

//Plugins and Filters Panel
admin.mainPanel = {
	init: function(){
		Ext.define('Comp', {
			extend: 'Ext.data.Model',
			fields: ['id','name','namespace','jar','servers','enabled']
		});
		
		var proxyPlugIn = new Ext.jws.data.proxy({
			ns:'org.jwebsocket.plugins.admin',
			api:{
				read   : 'getPlugInsConfig'
			},
			reader: {
				root: 'plugins',
				totalProperty: 'totalCount'
			}
		});
		
		var proxyFilter = new Ext.jws.data.proxy({
			ns:'org.jwebsocket.plugins.admin',
			api:{
				read: 'getFiltersConfig'
			},
			reader: {
				root: 'filters',
				totalProperty: 'totalCount'
			}
		});
		
		var proxyJars = new Ext.jws.data.proxy({
			ns:'org.jwebsocket.plugins.admin',
			api:{
				read: 'getJars'
			},
			reader: {
				root: 'jars',
				totalProperty: 'totalCount'
			}
		});
		
		var proxyIdPlugIn = new Ext.jws.data.proxy({
			ns:'org.jwebsocket.plugins.admin',
			api:{
				read: 'getPlugInsByJar'
			},
			reader: {
				root: 'plugInsByJar',
				totalProperty: 'totalCount'
			}
		});
		
		var proxyIdFilter = new Ext.jws.data.proxy({
			ns:'org.jwebsocket.plugins.admin',
			api:{
				read: 'getFilterByJar'
			},
			reader: {
				root: 'filtersByJar',
				totalProperty: 'totalCount'
			}
		});
		
		var storePlugins = new Ext.data.Store({
			autoSync: true,
			autoLoad:true,
			model: 'Comp',
			proxy: proxyPlugIn
		});
		
		var storeFilters = new Ext.data.Store({
			autoSync: true,
			autoLoad:true,
			model: 'Comp',
			proxy: proxyFilter
		});
		
		var storeJars = new Ext.data.Store({
			autoSync: true,
			autoLoad:false,
			fields: ['jar'],
			proxy: proxyJars
		});
		
		var storeIdPlugIn = new Ext.data.Store({
			autoSync: true,
			autoLoad:false,
			fields: ['idPlugIn'],
			proxy: proxyIdPlugIn
		});
		
		var storeIdFilter = new Ext.data.Store({
			autoSync: true,
			autoLoad:false,
			fields: ['idFilter'],
			proxy: proxyIdFilter
		});
		
		Ext.create('Ext.window.Window',{
			renderTo:Ext.getBody(),
			id: "winMainPanel",
			x:(screen.width/2 - 480),
			y:5,
			layout:'absolute',
			width: 960,
			height: 329,
			title: mVersion,
			resizable: false,
			closable: false,
			draggable: false,
			plain: true,
			border: true,
			iconCls:'icon-conf',
			tools:[{
				type: 'help',
				handler: function(){
				// do help
				}
			}, {
				type: 'about',
				handler: function(){
					admin.aboutPanel.init();
				}
			}],
			bbar:{
				items:['-',{
					text:'Add',
					width:50,
					tooltip:'Add',
					iconCls: 'icon-add',
					handler: function add() {
						('gridMainFilter' != Ext.getCmp('tabpanel').getActiveTab().getId())
						?newWindowAdd("PlugIn",storeJars, storeIdPlugIn, storePlugins)
						:newWindowAdd("Filter",storeJars, storeIdFilter, storeFilters);
						
						storeJars.load();
					}					
				},'-',{
					text:'Remove',
					id: 'btnRemove',
					width:73,
					tooltip:'Remove',
					iconCls: 'icon-remove',
					handler: function remove() {
						var type = "PlugIn";
						if ('gridMainFilter' == Ext.getCmp('tabpanel').getActiveTab().getId()) {
							type = "Filter";
						}
						newMessageBox('msgRemove', 'Removing ' + type + '...', 'You are sure remove this ' + type + '?', function() {
							var view = Ext.getCmp('gridMainPlug-In').getView();
							var fn = "removePlugIn";
							var store = storePlugins;
						
							if ('gridMainFilter' == Ext.getCmp('tabpanel').getActiveTab().getId()) {
								view = Ext.getCmp('gridMainFilter').getView();
								fn = "removeFilter";
								store = storeFilters;
							}
							if(view.getSelectionModel().hasSelection()) {
								newWindowReason(view.getSelectionModel().getSelection()[0].get("id"), fn, store);
							}
							Ext.getCmp('msgRemove').close();
						});
					}
				},'-',{
					text:'Reload',
					width:70,
					tooltip:'Reload',
					iconCls: 'icon-reload',
					handler: function reload() {
						var view = Ext.getCmp('gridMainPlug-In').getView();
						var fn = "reloadPlugIn";
						var store = storePlugins;
						
						if ('gridMainFilter' == Ext.getCmp('tabpanel').getActiveTab().getId()) {
							view = Ext.getCmp('gridMainFilter').getView();
							fn = "reloadFilter";
							store = storeFilters;
						}
						
						if(view.getSelectionModel().hasSelection()) {
							newWindowReason(view.getSelectionModel().getSelection()[0].get("id"), fn, store);
						}
					}
				},'-',{
					text:'Enable',
					width:70,
					tooltip:'Enable',
					iconCls: 'icon-enable',
					handler: function enable() {
						var view = Ext.getCmp('gridMainPlug-In').getView();
						var fn = "enablePlugIn";
						var store = storePlugins;
						
						if ('gridMainFilter' == Ext.getCmp('tabpanel').getActiveTab().getId()) {
							view = Ext.getCmp('gridMainFilter').getView();
							fn = "enableFilter";
							store = storeFilters;
						}
						if(view.getSelectionModel().hasSelection()) {
							newWindowReason(view.getSelectionModel().getSelection()[0].get("id"), fn, store);
						}
					}
				},'-',{
					text:'Disable',
					width:70,
					tooltip:'Disable',
					iconCls: 'icon-disable',
					handler: function disable() {
						var type = "PlugIn";
						if ('gridMainFilter' == Ext.getCmp('tabpanel').getActiveTab().getId()) {
							type = "Filter";
						}
						newMessageBox('msgDisable', 'Disabling '+ type + '...', 'You are sure to disable this ' + type + '?', function() {
							var view = Ext.getCmp('gridMainPlug-In').getView();
							var fn = "disablePlugIn";
							var store = storePlugins;
						
							if ('gridMainFilter' == Ext.getCmp('tabpanel').getActiveTab().getId()) {
								view = Ext.getCmp('gridMainFilter').getView();
								fn = "disableFilter";
								store = storeFilters;
							}
							if(view.getSelectionModel().hasSelection()) {
								newWindowReason(view.getSelectionModel().getSelection()[0].get("id"), fn, store);
							}
							Ext.getCmp('msgDisable').close();
						});
					}
				},'-',{
					text:'Up',
					width:45,
					tooltip:'Up',
					iconCls: 'icon-up',
					handler: function changeOrder() {
						var view = Ext.getCmp('gridMainPlug-In').getView();
						var fn = "changeOrderOfPlugInChain";
						var store = storePlugins;
						
						if ('gridMainFilter' == Ext.getCmp('tabpanel').getActiveTab().getId()) {
							view = Ext.getCmp('gridMainFilter').getView();
							fn = "changeOrderOfFilterChain";
							store = storeFilters;
						}
						if(view.getSelectionModel().hasSelection()) {
							Ext.jws.send("org.jwebsocket.plugins.admin", fn,{
								id:	view.getSelectionModel().getSelection()[0].get("id"),
								steps: -1
							}, {
								success: function(aToken){
									store.load();
									msg("Successful",aToken.msg);
								},
								failure: function(aToken){
									msg("Error",aToken.msg);
								}
							} );
						}
					}
				},'-',{
					text:'Down',
					width:60,
					tooltip:'Down',
					iconCls: 'icon-down',
					handler: function changeOrder() {
						var view = Ext.getCmp('gridMainPlug-In').getView();
						var fn = "changeOrderOfPlugInChain";
						var store = storePlugins;
						
						if ('gridMainFilter' == Ext.getCmp('tabpanel').getActiveTab().getId()) {
							view = Ext.getCmp('gridMainFilter').getView();
							fn = "changeOrderOfFilterChain";
							store = storeFilters;
						}
						if(view.getSelectionModel().hasSelection()) {
							Ext.jws.send("org.jwebsocket.plugins.admin", fn,{
								id:	view.getSelectionModel().getSelection()[0].get("id"),
								steps: 1
							}, {
								success: function(aToken){
									store.load();
									msg("successful",aToken.msg);
								},
								failure: function(aToken){
									msg("Error",aToken.msg);
								}
							} );
						}
					}
				},'-',{
					xtype:"tbtext",
					overflowText:'Adminsss',
					margin:"0 0 0 181"
				},'-',{
					id:"buttonLogout",
					text:'Logout',
					width:65,
					tooltip:'Logout',
					iconCls: 'icon-remove',
					handler: function logout() {
						Ext.jws.send("org.jwebsocket.plugins.system", "logoff",{}, {
							success: function(aToken){
								admin.mainPanel.close();
								admin.logsPanel.close();
								admin.loginPanel.init();
								msg("Successful", "The session was successfully closed.");
							},
							failure: function(aToken){
								msg("Error", aToken.msg);
							}
						});
					}
				}]
			},
			items:[{
				xtype: 'tabpanel',
				id:'tabpanel',
				activeTab:0,
				enableTabScroll:true,
				border:false,
				frame:true,
				items:[newGridPanel('Plug-In',storePlugins),newGridPanel('Filter',storeFilters)]
			}]
		}).show();
		
		initToolTip("Plug-In");
		initToolTip("Filter");
		
		var plugin = {}
		plugin.processToken = function(aToken){
			if (aToken.ns == 'org.jwebsocket.plugins.admin' && (aToken.type == 'processChangeOfPlugIn'|| aToken.type == 'processChangeOfFilter')){
				var text = aToken.reason + "\n Version " + aToken.version + " supported the change.";
				if(aToken.changeType != "UPDATE")
					Ext.getCmp('buttonLogout').handler();
				msg("Warning", text, 15);
			}
		}
	
		Ext.jws.addPlugIn(plugin);
	},
	close: function(){
		if(Ext.getCmp("winMainPanel"))
			Ext.getCmp("winMainPanel").close();
	}
}

//Logs Panel
admin.logsPanel = {
	init: function(){		
		Ext.define('Log', {
			extend: 'Ext.data.Model',
			fields: ['date','time','action','result','desc']
		});

		var proxyLogs  = new Ext.jws.data.proxy({
			ns:'org.jwebsocket.plugins.admin',
			api:{
				read   : 'getAdminLogs',
				create : 'notExist'
			},
			reader: {
				root: 'logs',
				totalProperty: 'totalCount'
			}
		});

		var storeLogs = new Ext.data.Store({
			autoSync: true,
			autoLoad:true,
			model: 'Log',
			proxy: proxyLogs,
			sorters:[{
				property : 'date',
				direction: 'DESC'
			},{
				property : 'time',
				direction: 'DESC'
			}]
		});
		
		storeLogs.sort();
		
		Ext.create('Ext.window.Window',{
			renderTo:Ext.getBody(),
			id: "logsPanel",
			x:(screen.width/2 - 480),
			y:340,
			layout:'absolute',
			width: 960,
			height: 204,
			title: 'Logs panel',
			resizable: false,
			closable: false,
			draggable: false,
			collapsible:true,
			iconCls:'icon-log',
			plain: true,
			border: true,
			stripeRows: true,
			items:[Ext.create('Ext.ux.LiveSearchGridPanel',{	
				store: storeLogs,
				viewConfig: {
					loadMask: false
				},
				frame:true,
				height:170,
				columnLines: true,
				width:948,
				columns: [{
					header:'Date',
					dataIndex:'date',
					align: 'center',
					sortable:true,
					width:80
				},{
					header:'Time',
					align: 'center',
					dataIndex:'time',
					sortable:true,
					width:80
				},{
					header:'Action',
					dataIndex:'action',
					width:100
				},{
					header:'Result',
					dataIndex:'result',
					renderer: renderResult,
					width:100
				},{
					header:'Description',
					dataIndex:'desc',
					width:563
				}]
			})]
		}).show();
		
		var plugin = {}
		plugin.processToken = function(aToken){
			if (aToken.ns == 'org.jwebsocket.plugins.admin' && aToken.type == 'traceLog'){
				var lLog = new Log({
					date: aToken.log.date,
					time: aToken.log.time,
					action: aToken.log.action,
					result: aToken.log.result,
					desc: aToken.log.desc
				});
				
				storeLogs.add(lLog);
				storeLogs.sort();
			}
		}
	
		Ext.jws.addPlugIn(plugin);
	},
	close: function(){
		if(Ext.getCmp("logsPanel"))
			Ext.getCmp("logsPanel").close();
	}
}

//About Panel
admin.aboutPanel = {
	init: function(){		
		Ext.create('Ext.window.Window',{
			renderTo:Ext.getBody(),
			id: "winAbout",
			x:(screen.width/2 - 185),
			y:100,
			layout:'absolute',
			width: 368,
			height: 320,
			title: 'About',
			resizable: false,
			plain: true,
			border: true,
			iconCls:'icon-info',
			items:[{
				xtype: "image",
				src: 'images/jws.png',
				width: 360,
				height: 155,
				x:0,
				y:0,
				renderTo: Ext.getCmp("winAbout")
			},{
				xtype:'label',
				//text:'Username:',
				html: "<b>" + mName + '</b> is the administrator toolbox of jWebSocket, licensed under the GNU Lesser General Public License. For more information, please visit <a href="http://www.jwebsocket.org" target="_blank">www.jwebsocket.org</a>.',
				width: 340,
				cls:"textAbout",
				x:10,
				y:170
			},{
				xtype:'label',
				html: "<b>Version: </b>" + mVersion,
				cls:"textAbout",
				x:10,
				y:240
			},{
				xtype:'label',
				html: "<b>Developed by: </b> Marcos A. González Huerta (UCI, Cuba)",
				cls:"textAbout",
				x:10,
				y:255
			}]
		}).show();
	}
}

Ext.onReady(function(){

	Ext.jws.open();

	Ext.jws.on('open',function(){
		Ext.QuickTips.init();
		Ext.jws.send("org.jwebsocket.plugins.system", "getAuthorities",{}, {
			success: function(aToken){
				if(0 == aToken.authorities.indexOf("ROLE_ADMIN_MAINTENANCE")) {
					admin.mainPanel.init();
					admin.logsPanel.init();
					admin.loginPanel.close();
				} else {
					admin.loginPanel.init();
					msg("Error","You don't have the credentials for access.");
				}
			},
			failure: function(aToken){
				admin.loginPanel.init();
//				msg("Error",aToken.msg);
			}
		});
	});

	Ext.jws.on('close',function(){
		admin.mainPanel.close();
		admin.logsPanel.close();
		admin.loginPanel.close();
		Ext.create('Ext.Img', {
			src: 'images/serverOff.png',
			cls: "centerMessage",
			renderTo: Ext.getBody()
		});
	});
});

