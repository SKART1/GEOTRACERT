//	---------------------------------------------------------------------------
//	jWebSocket Ping Pong Demo (init) (Community Edition, CE)
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

/* 
 * @author armando
 */

function init(  ) {
	w = {};
	mLog = {};
	mLog.isDebugEnabled = true;

	// Setting the styles to the buttons, avoiding to fill the HTML code 
	// with unnecessary data
	$('.button').each(function( ) {
		var lBtn = $(this);
		var lRightClass = lBtn.hasClass('download') ? 'r_download' : 'btn_right';
		lBtn.attr("class", "button onmouseup")
				.attr("onmouseover", "this.className='button onmouseover'")
				.attr("onmousedown", "this.className='button onmousedown'")
				.attr("onmouseup", "this.className='button onmouseup'")
				.attr("onmouseout", "this.className='button onmouseout'")
				.attr("onclick", "this.className='button onmouseover'");
		lBtn.html('<div class="btn_left"/>' + '<div class="btn_center">' +
				lBtn.html( ) + '</div>' + '<div class="' + lRightClass + '"></div>');
	});

	$("#demo_box").authentication( );

	$.jws.bind('open', function(aEvt, aToken) {
		$('#board').ball(  );
		$('#scenario_body').stage(  );
		$('#board').player(  );
		$('#online').connected(  );
		$('#main_content').menu(  );
		$('#main_content').chat(  );
		$('#scenario_body').ranking(  );
	});

	$.jws.bind("org.jwebsocket.plugins.system:welcome", function(aEvt, aToken) {
		//Change status offline by online
		$("#client_status").hide(  ).attr("class", "").addClass("online").text("online").show(  );
		$("#client_id").text("Client-ID: " + aToken.sourceId);
	});

	$.jws.bind('close', function(aEvt, aToken) {
		//Change the status online by offline
		$("#client_status").hide(  ).attr("class", "").addClass("offline").text("disconnected").show(  );
		$("#client_id").text("Client-ID: - ");

		dialog('Ping Pong Game', 'There is no connection with the server', true);

		//modifying the dialog style
		$(".ui-widget-overlay").css({
			'background': '#eeeeee !important',
			'opacity': '.80',
			'filter': 'Alpha( Opacity=80 )'
		});
	});

	$.jws.bind(NS + ':databaseError', function(aEvt, aToken) {
		dialog('Ping Pong Game', "<div style='color:red;'>" + aToken.msg + "</div>", true);
		//modifying the dialog style
		$(".ui-widget-overlay").css({
			'background': '#eeeeee !important',
			'opacity': '.80',
			'filter': 'Alpha( Opacity=80 )'
		});
	});

	//Set WebSocket type
	$('#websocket_type').text("WebSocket: " + (jws.browserSupportsNativeWebSockets ? "(native)" : "(flashbridge)"));
	$('#scenario_menu').hide(  );
	$('#obj_area').hide(  );
	$('#scenario_chat').hide(  );
}


$(document).ready(function(  ) {
	init(  );
});