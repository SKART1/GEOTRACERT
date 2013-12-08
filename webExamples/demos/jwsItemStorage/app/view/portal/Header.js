Ext.define('IS.view.portal.Header' ,{
	extend: 'Ext.panel.Panel',
	alias: 'widget.p_header',
	layout: 'column',
	region: 'north',
	maxWidth: 750,
	border: 0,
	padding: 5,
	items: [{
		xtype: 'panel',
		border:0,
		minWidth: 150,
		html: '<img src="resources/images/jwebsocket_logo.png"/> '
	},{
		xtype: 'panel',
		border: 0,
		html: '<h1>ItemStoragePlugIn administration tool</h1> <div class="header_text">Synchronizing cross-platform application data in real-time.</div>',
		padding: '10 10 0 0'
	},{
		xtype: 'button',
		id: 'logoff_button',
		text: 'Logoff',
		handler: function() {
			Ext.jws.getConnection().logout();
		}
	},{
		xtype: 'button',
		id: 'help_button',
		href: 'http://jwebsocket.org/plugins/itemstorage',
		text: 'Help',
		target: '_blank'
	},{
		xtype: 'button',
		id: 'about_button',
		text: 'About',
		handler: function() {
			Ext.Msg.show({
				msg: '<center>jWebSocket ItemStorage Web Admin v1.0 <br> Copyright (c) 2013 Innotrade GmbH <p>&nbsp<p><a href="http://jwebsocket.org">http://jwebsocket.org</a></center>', 
				buttons: Ext.Msg.OK, 
				icon: Ext.Msg.INFO
			});
		}
	}]
});
