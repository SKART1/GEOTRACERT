
//	---------------------------------------------------------------------------
//	jWebSocket Enterprise Mail Client Plug-In
//	(C) Copyright 2012-2013 Innotrade GmbH, Herzogenrath Germany
//	Author: Rolando Santamaria Maso
//	---------------------------------------------------------------------------
jws.MailPlugIn={NS:jws.NS_BASE+".plugins.mail",saveEmailAccount:function(bg,J){var C=this.checkConnected();if(0==C.code){var G={ns:jws.MailPlugIn.NS,type:"saveAccount"};this.sendToken(G,J);}return C;}};jws.oop.addPlugIn(jws.jWebSocketTokenClient,jws.MailPlugIn); 