var lWSC = new jws.jWebSocketJSONClient();
$(document).ready(function(){
	lWSC.open("ws://localhost:8787/jWebSocket/jWebSocket", {
		OnWelcome: function(){
			lWSC.login('root', 'root');
		},
		OnLogon: function(){
			
			$('#start').click(function(){
				log('Openning client connections...', true);
				
				$('#start').fadeOut(500);
				openConnections(parseInt($('#clients').val()));
			});
		}
	});
});

var lClients = [];
var lActive = 0;
openConnections = function(aClients){
	for (var i = 0; i < aClients; i++){
		var lC =  new jws.jWebSocketJSONClient();
		lC.open("ws://localhost:8787/jWebSocket/jWebSocket", {
			OnWelcome: function(){
				log('Established. Active: ' + (++lActive), true);
				
				if ($('#transport').val() == 'channelBroadcast'){
					lC.channelSubscribe("publicA", "access");
					lC.setChannelCallbacks({
						OnChannelBroadcast: function(aToken){
						}
					});
				}
			},
			OnClose: function(){
				log('Closed. Active: ' + (--lActive), true);
			},
			OnMessage: function(aMessage){
			}
		});
		
		lClients.push(lC);
	}
}