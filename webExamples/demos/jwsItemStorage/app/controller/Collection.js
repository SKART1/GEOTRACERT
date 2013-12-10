Ext.define('IS.controller.Collection', {
	extend: 'Ext.app.Controller',
	views: ['collection.Toolbar', 'collection.List', 'collection.Create', 
	'collection.Edit', 'collection.EnterSecretPwd'],
	stores: ['CollectionNames', 'CollectionLogs'],
	refs: [{
		ref: 'workspace',
		selector: '#workspace'
	},{
		ref: 'list',
		selector: '#collectionNamesGrid'
	},{
		ref: 'openBtn',
		selector: 'c_toolbar > button[iconCls=c_open]'
	},{
		ref: 'detailsBtn',
		selector: 'c_toolbar > button[iconCls=c_details]'
	},{
		ref: 'HistoryBtn',
		selector: 'c_toolbar > button[iconCls=history]'
	},{
		ref: 'showUserOnly',
		selector: '#showUserOnly'
	}],

	__showCollectionTab: function( aCollectionName, aItemDefinition ){
		var self = this;
		
		var lColumns = [];
		
		for (var lAttrName in aItemDefinition.attr_types){
			lColumns.push({
				header:		lAttrName.substr(0,1).toUpperCase() + lAttrName.substr(1),
				dataIndex: lAttrName,
				flex: 1,
				minWidth: 100
			});
		}
		if ('id' != aItemDefinition.pk_attr){
			lColumns.push({
				header:		'Id',
				dataIndex: 'id',
				flex: 1,
				minWidth: 100
			});
		}
						
		var lStore = IS.lib.Util.createDynamicStore(aCollectionName, self.application);
						
		self.getWorkspace().add({
			title: aCollectionName,
			id: aCollectionName,
			closable: true, 
			dockedItems: [{
				xtype: 'i_toolbar'
			}, {
				xtype: 'pagingtoolbar',
				store: lStore,
				dock: 'bottom',
				displayInfo: true
			}],
			items: [{
				xtype: 'i_list',
				columns: lColumns,
				store: lStore
			}]
		});
						
		var lTab = self.getWorkspace().setActiveTab(aCollectionName);
		var lExcluded = ['i_add', 'find'];
						
		lTab.down('grid').on('selectionchange', function( aModel, aGrid) {
			var lButtons;
			if ( aModel.getCount() < 1){
				lButtons = lTab.down('toolbar').query('button');
				Ext.each(lButtons, function ( aButton ){
					if ( !Ext.Array.contains(lExcluded, aButton.iconCls) )
						aButton.disable();
				});
			} else {
				lButtons = lTab.down('toolbar').query('button');
				Ext.each(lButtons, function ( aButton ){
					if ( !Ext.Array.contains(lExcluded, aButton.iconCls))
						aButton.enable();
				});
			}
		});
	},
	
	__callSubscription: function( aCollectionName, aItemDefinition ){
		var self = this;
		
		var lView = Ext.create('IS.view.collection.EnterAccessPwd', {
			title : 'Subscription required',
			text: 'To read the collection content is required that you subscribe first.',
			doAction : function (){
				var lForm = this.down('form');
				if (!lForm.getForm().isValid()){
					return;
				}
						
				var lArguments = lForm.getValues();
				lArguments.collectionName = aCollectionName;
					
				Ext.jws.send(jws.ItemStoragePlugIn.NS, 'subscribe', lArguments, {
					success: function() {
						self.__showCollectionTab(aCollectionName, aItemDefinition);
						lView.close();
					}
				})
			}
		});
		lView.showAt({
			y: 100
		});
	},
	
	open: function( aCollectionName){
		var self = this;
		
		if (!this.getWorkspace().setActiveTab(aCollectionName)){
			Ext.jws.send(jws.ItemStoragePlugIn.NS, 'findCollection', {
				collectionName: aCollectionName
			}, {
				success: function( aResponse ) {
					var lSubscribed = aResponse.data.subscribed;
					Ext.jws.send(jws.ItemStoragePlugIn.NS, 'findDefinition', {
						itemType: aResponse.data.type
					}, {
						success: function( aResponse ) {
							// caching the collection definition
							self.application.collection2def[aCollectionName] = aResponse.data;
							// defineCollectionModel at this point
							IS.lib.Util.defineModel(aCollectionName, aResponse.data);
							
							if (!lSubscribed){
								self.__callSubscription(aCollectionName, aResponse.data);
							} else {
								self.__showCollectionTab(aCollectionName, aResponse.data);
							}
						}
					});
				}
			});
		}
	},
	
	showDetails: function( aData ){
		if (!this.detailsView){
			this.detailsView = Ext.create('IS.view.collection.Details');
		}
		this.detailsView.loadData( aData.data );
	},
	
	edit: function( aData ){
		var lData = aData.data;
		var lView = Ext.create('IS.view.collection.Edit');
		lView.loadData(lData);
	},
	
	getActiveCollectionName: function( aGrid ){
		return aGrid.
		getSelectionModel().
		getSelection()[0].
		get('name');
	},
	
	closeCollectionTab: function(aEvent){
		var lCollectionTab = this.getWorkspace().queryById(aEvent.collectionName);
			
		// close collection tab if exists
		if (lCollectionTab){
			lCollectionTab.close();
		}
	},
	
	reloadCollectionTab: function(aEvent){
		var lCollectionTab = this.getWorkspace().queryById(aEvent.collectionName);
		lCollectionTab.down('grid').getStore().reload();
	},
	
	init: function() {
		var self = this;
		
		this.application.on('collectionRestarted', this.closeCollectionTab, this);
		this.application.on('collectionRemoved', this.closeCollectionTab, this);
		this.application.on('collectionCleaned', this.reloadCollectionTab, this);
		
		Ext.jws.on('beforesend', function ( aToken ) {
			if ( aToken.type == 'getCollectionNames' ){
				aToken.userOnly = true;
				var lCheckbox = self.getShowUserOnly();
				if ( lCheckbox ){
					aToken.userOnly = lCheckbox.checked;
				}
			}
		});
		
		this.control({
			'c_edit textfield[linkType=pwd]': {
				change: function( aField, aNewValue ){
					if ( '' != aNewValue ){
						aField.nextNode().allowBlank = false;
					} else {
						aField.nextNode().allowBlank = true;
						aField.validate();
					}
				}
			},
			'#collectionstab': {
				activate: function(){
					self.getCollectionNamesStore().load();
				}
			},
			'#showUserOnly': {
				change: function( aField, aNewValue ) {
					self.getCollectionNamesStore().load();
					
					var lGridTitle = 'User';
					if ( !aNewValue ){
						lGridTitle = 'All (public only)';
					}
					
					this.getList().setTitle(lGridTitle);
				}
			}, 
			'c_toolbar > button[iconCls=c_add]': {
				click: function(){
					var lView = Ext.create('IS.view.collection.Create');
					lView.showAt({
						y: 100
					});
					
				}
			},
			'c_toolbar > button[iconCls=c_open]': {
				click: function( aButton ){
					self.open(self.getActiveCollectionName(aButton.findParentByType('grid')));
				}
			},
			'c_toolbar > button[iconCls=history]': {
				click: function( aButton ){
					if (!IS.lib.Util.isEE()){
						return;
					}
					
					if (!self.historyView){
						self.historyView = Ext.create('IS.view.collection.History');
					}
					self.historyView.loadHistory(self.getActiveCollectionName(aButton.findParentByType('grid')));
				}
			},
			'c_toolbar > button[iconCls=c_edit]': {
				click: function( aButton ){
					Ext.jws.send(jws.ItemStoragePlugIn.NS, 'findCollection', {
						collectionName: self.getActiveCollectionName(aButton.findParentByType('grid'))
					}, {
						success: function( aResponse ) {
							self.edit(aResponse);
						}
					});
				}
			},
			'c_toolbar > button[iconCls=c_details]': {
				click: function(aButton){
					Ext.jws.send(jws.ItemStoragePlugIn.NS, 'findCollection', {
						collectionName: self.getActiveCollectionName(aButton.findParentByType('grid'))
					}, {
						success: function( aResponse ) {
							self.showDetails(aResponse);
						}
					});
				}
			},
			'c_toolbar > button[iconCls=c_remove]': {
				click: function(aButton){
					var lView =  Ext.create('IS.view.collection.EnterSecretPwd', {
						title: 'Remove collection?',
						text: 'Removing a collection will destroy the collection content forever. <br>Subscribers are notified.',
						doAction: function (){
							var lForm = this.down('form');
							if (!lForm.getForm().isValid()){
								return;
							}
						
							var lArguments = lForm.getValues();
							lArguments.collectionName = self.getActiveCollectionName(aButton.findParentByType('grid'));
					
							Ext.jws.send(jws.ItemStoragePlugIn.NS, 'removeCollection', lArguments, {
								success: function() {
									self.getCollectionNamesStore().reload();
									lView.close();
								}
							});
						}
					});
					lView.showAt({
						y: 100
					})
				}
			},
			'c_toolbar > button[iconCls=c_restart]': {
				click: function(aButton){
					var lView =  Ext.create('IS.view.collection.EnterSecretPwd', {
						title: 'Restart collection?',
						text: 'Restarting a collection will expire the current collection autorizations and subscriptions. Restart a collection is recommended if you changed the collection secret or access password.<br>Subscribers and publishers are notified.',
						doAction: function (){
							var lForm = this.down('form');
							if (!lForm.getForm().isValid()){
								return;
							}
						
							var lArguments = lForm.getValues();
							lArguments.collectionName = self.getActiveCollectionName(aButton.findParentByType('grid'));
					
							Ext.jws.send(jws.ItemStoragePlugIn.NS, 'restartCollection', lArguments, {
								success: function() {
									lView.close();
								}
							});
						}
					});
					lView.showAt({
						y: 100
					})
				}
			},
			'c_toolbar > button[iconCls=c_clear]': {
				click: function(aButton){
					var lView =  Ext.create('IS.view.collection.EnterSecretPwd', {
						title: 'Clear collection?',
						text: 'Clearing a collection will remove all collection items. <br>Subscribers are notified',
						doAction: function (){
							var lForm = this.down('form');
							if (!lForm.getForm().isValid()){
								return;
							}
						
							var lArguments = lForm.getValues();
							lArguments.collectionName = self.getActiveCollectionName(aButton.findParentByType('grid'));
					
							Ext.jws.send(jws.ItemStoragePlugIn.NS, 'clearCollection', lArguments, {
								success: function() {
									lView.close();
								}
							});
						}
					});
					lView.showAt({
						y: 100
					})
				}
			},
			'c_create button[action=create]': {
				click: function( aButton ){
					var lWindow    = aButton.up('window'),
					lForm   = lWindow.down('form'),
					lArguments = lForm.getForm().getFieldValues();
					
					if (lForm.getForm().isValid()){
						// deleting extra fields
						delete lArguments.accessPassword2;
						delete lArguments.secretPassword2;
						
						Ext.jws.send(jws.ItemStoragePlugIn.NS, 'createCollection', lArguments, {
							success: function (){
								self.getCollectionNamesStore().reload();
								lWindow.close();
							}
						});
					} 
				}
			},
			'c_edit button[action=edit]': {
				click: function( aButton ){
					var lWindow    = aButton.up('window'),
					lForm   = lWindow.down('form'),
					lArguments = lForm.getForm().getFieldValues();
					lArguments.collectionName = lForm.down('textfield[name=collectionName]').getValue();
					
					if (lForm.getForm().isValid()){
						// deleting extra fields
						delete lArguments.accessPassword2;
						delete lArguments.newSecretPassword2;
						if ('' == lArguments.newSecretPassword){
							delete lArguments.newSecretPassword;
						}
						if ('' == lArguments.accessPassword){
							delete lArguments.accessPassword;
						}
						
						Ext.jws.send(jws.ItemStoragePlugIn.NS, 'editCollection', lArguments, {
							success: function (){
								lWindow.close();
							}
						});
					} 
				}
			},
			'numberfield[name=capacity]': {
				change: function( aField, aNewValue ){
					if ( aNewValue > 0 ){
						aField.nextNode().enable();
					} else {
						aField.nextNode().setValue(false);
						aField.nextNode().disable();
					}
				}
			},
			'c_list ': {
				itemdblclick: function(){
					self.getOpenBtn().fireEvent('click', self.getOpenBtn());
				},
				
				selectionchange: function( aModel ){
					var lButtons;
					if ( aModel.getCount() < 1){
						lButtons = Ext.ComponentQuery.query('c_toolbar button');
						Ext.each(lButtons, function ( aButton ){
							if ( aButton.iconCls != 'c_add' )
								aButton.disable();
						});
						if (self.historyView && !self.historyView.isHidden()){
							self.historyView.down('pagingtoolbar').disable();
						} 
					} else {
						lButtons = Ext.ComponentQuery.query('c_toolbar button');
						Ext.each(lButtons, function ( aButton ){
							if ( aButton.iconCls != 'c_add')
								aButton.enable();
						});
						if (self.historyView && !self.historyView.isHidden()){
							self.historyView.down('pagingtoolbar').enable();
							self.getHistoryBtn().fireEvent('click', self.getHistoryBtn());
						} 
						if (self.detailsView && !self.detailsView.isHidden()){
							self.getDetailsBtn().fireEvent('click', self.getDetailsBtn());
						}
					}
				}
			}
		})
	}
});
