var lWSC = new jws.jWebSocketJSONClient();
$(document).ready(function(){
	lWSC.open("ws://localhost:8787/jWebSocket/jWebSocket", {
		OnWelcome: function(){
			lWSC.login('root', 'root');
		},
		OnLogon: function(){
			lWSC.channelSubscribe("publicA", "access");
			lWSC.channelAuth("publicA", "access", "secret", {
				OnSuccess: function(){
					lWSC.channelStart('publicA');
				}
			});
			
			$('#start').click(function(){
				log('Starting test suite for "' + $('#transport').val() + '" transport...', true);
				
				$('#start').fadeOut(500);
				startTest(
					$('#transport').val(), 
					generateString(parseInt($('#length').val())), 
					parseInt($('#loops').val()), 
					parseInt($('#repeats').val())
					);
			});
		}
	});
});

execBroadcast = function (aData, aLoops, aListener){
	if ($('#loops').val() == aLoops){
		aListener.OnStart();
	}
	
	aListener.OnSampleStart();
	
	lWSC.broadcastText("data", aData, {
		OnFailure: function(aToken){
			log('ERROR: ' + aToken.msg);
		},
		OnResponse: function(){
			aListener.OnSampleComplete();
			
			if (aLoops > 0){
				execBroadcast(aData, aLoops - 1, aListener);
			} else {
				aListener.OnComplete();
			}
		}
	});

};

execChannelBroadcast = function (aData, aLoops, aListener){
	if ($('#loops').val() == aLoops){
		aListener.OnStart();
	}
	
	aListener.OnSampleStart();
	
	lWSC.channelPublishString("publicA", aData, {
		OnFailure: function(aToken){
			log('ERROR: ' + aToken.msg);
		},
		OnResponse: function(){
			aListener.OnSampleComplete();
			
			if (aLoops > 0){
				execChannelBroadcast(aData, aLoops - 1, aListener);
			} else {
				aListener.OnComplete();
			}
		}
	});

};

execJmsBroadcast = function (aData, aLoops, aListener){
	aListener.OnStart();

};


var tests = {
	broadcast: execBroadcast,
	channelBroadcast: execChannelBroadcast,
	jmsBroadcast: execJmsBroadcast
};

var results = {};

startTest = function(aTransport, aData, aLoops, aRepeats){
	
	if (!tests[aTransport]){
		alert('Unsupported test transport: ' + aTransport + '!');
	} else {
		tests[aTransport](aData, aLoops, {
			OnSampleStart: function(){
				results[aTransport].sampleStartTime = new Date().getTime();
			},
			OnSampleComplete: function(){
				// calculating sample elapsed time
				var lSampleElapsedTime = new Date().getTime() - results[aTransport].sampleStartTime;
				
				// updating total samples elapsed time
				results[aTransport].elapsedTime += lSampleElapsedTime;
				
				// updating max elapsed time value
				if (lSampleElapsedTime > results[aTransport].maxSampleTime){
					results[aTransport].maxSampleTime = lSampleElapsedTime;
				}
				
				// updating min elapsed time value
				if (lSampleElapsedTime < results[aTransport].minSampleTime){
					results[aTransport].minSampleTime = lSampleElapsedTime;
				}
			},
			OnStart: function(){
				// initializing test numbers
				results[aTransport] = {
					startTime: new Date().getTime(),
					elapsedTime: 0,
					maxSampleTime: 0,
					minSampleTime: 1000 * 60 * 60 * 1 
				};
			},
			OnComplete: function(){
				log('- AVG response time: ' + results[aTransport].elapsedTime / $('#loops').val());
				log('- MIN response time: ' + results[aTransport].minSampleTime);
				log('- MAX response time: ' + results[aTransport].maxSampleTime);
				log('- TOTAL test time: ' + results[aTransport].elapsedTime);
				
				if (aRepeats > 1){
					log('REPEATING...' );
					startTest(aTransport, aData, aLoops, aRepeats - 1)
				} else {
					log('Test completed!');
					$('#start').fadeIn(500);
				}
			}
		});
	}
}
