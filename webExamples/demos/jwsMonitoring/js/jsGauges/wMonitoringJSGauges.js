//	---------------------------------------------------------------------------
//	jWebSocket Monitoring Demo (Community Edition, CE)
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
 * @author Orlando Miranda Gómez, vbarzana
 */
$.widget("jws.monitoring", {
	_init: function( ) {
		this.NS = jws.NS_BASE + ".plugins.monitoring";
		this.TT_REGISTER = "register";
		this.TT_INFO = "computerInfo";
		this.eCpuGauge = $("#cpuDiv");
		this.eMemGauge = $("#memDiv");
		this.eHddGauge = $("#hddDiv");
		this.mTotalHddSpace = 0;
		w.monitoring = this;
		w.monitoring.doWebSocketConnection( );
		// Tricking the gauges to be shown in IE7
		if (typeof window.onload != 'function') {
			window.onload = w.monitoring.initGauges;
		} else {
			w.monitoring.initGauges();
		}
	},
	doWebSocketConnection: function( ) {
		// Each widget uses the same authentication mechanism, please refer
		// to the public widget ../../res/js/widgets/wAuth.js
		var lCallbacks = {
			OnOpen: function() {
				// Registering to the monitoring stream
				var lRegisterToken = {
					ns: w.monitoring.NS,
					type: w.monitoring.TT_REGISTER,
					interest: w.monitoring.TT_INFO
				};
				// Sending the register token
				mWSC.sendToken(lRegisterToken);
			},
			OnClose: function() {
				w.monitoring.resetGauges();
			},
			OnMessage: function(aEvent, aToken) {
				if (w.monitoring.NS === aToken.ns && 
					w.monitoring.TT_INFO === aToken.type) {
					w.monitoring.updateGauge(aToken);
				}
				var lDate = "";
				if (aToken.date_val) {
					lDate = jws.tools.ISO2Date(aToken.date_val);
				}
				log("<font style='color:#888'>jWebSocket '" + aToken.type +
					"' token received, full message: '" + aEvent.data + "' " +
					lDate + "</font>");
			}
		};
		// this widget will be accessible from the global variable w.auth
		$("#demo_box").auth(lCallbacks);
	},
	initGauges: function() {
		w.monitoring.eCpuGauge.gauge({
			majorTickLabel: true,
			min: 0,
			max: 100,
			label: 'CPU',
			unitsLabel: '%',
			greenFrom: 60,
			greenTo: 70,
			yellowFrom: 70,
			yellowTo: 85,
			redFrom: 85,
			redTo: 100,
			colorOfPointerStroke: 'rgba(0, 0, 0, 0)',
			colorOfPointerFill: 'rgba(0, 0, 0, 0.7)',
			colorOfCenterCircleFill: 'rgba(125, 160, 125, 1)',
			colorOfCenterCircleStroke: 'rgba(0, 0, 0, 0)',
			colorOfFill: [ '#111', '#ccc', '#ddd', '#fcfcfc' ]
		});
		
		w.monitoring.eMemGauge.gauge({
			majorTickLabel: true,
			min: 0,
			max: 100,
			label: 'RAM',
			unitsLabel: '%',
			greenFrom: 60,
			greenTo: 70,
			yellowFrom: 70,
			yellowTo: 85,
			redFrom: 85,
			redTo: 100,
			colorOfPointerStroke: 'rgba(0, 0, 0, 0)',
			colorOfPointerFill: 'rgba(0, 0, 0, 0.7)',
			colorOfCenterCircleFill: 'rgba(125, 160, 125, 1)',
			colorOfCenterCircleStroke: 'rgba(0, 0, 0, 0)',
			colorOfFill: [ '#111', '#ccc', '#ddd', '#fcfcfc' ]
		});
		
		w.monitoring.eHddGauge.gauge({
			majorTickLabel: true,
			min: 0,
			max: 100,
			label: 'HDD',
			unitsLabel: 'GB',
			greenFrom: 60,
			greenTo: 70,
			yellowFrom: 70,
			yellowTo: 85,
			redFrom: 85,
			redTo: 100,
			colorOfPointerStroke: 'rgba(0, 0, 0, 0)',
			colorOfPointerFill: 'rgba(0, 0, 0, 0.7)',
			colorOfCenterCircleFill: 'rgba(125, 160, 125, 1)',
			colorOfCenterCircleStroke: 'rgba(0, 0, 0, 0)',
			colorOfFill: [ '#111', '#ccc', '#ddd', '#fcfcfc' ]
		})
	},
	// Dynamically update the gauge at runtime
	updateGauge: function(aToken) {
		//cpu
		var lCPU = parseInt(aToken.consumeCPU),
		lMemory = parseInt(aToken.usedMemPercent);
		
		w.monitoring.eCpuGauge.gauge('setValue', lCPU);
		w.monitoring.eMemGauge.gauge('setValue', lMemory );
		
		//hdd 
		var IUsed = parseInt(aToken.usedHddSpace), lTotal = parseInt( aToken.totalHddSpace );
		
		if( lTotal != w.monitoring.mTotalHddSpace ) {
			w.monitoring.mTotalHddSpace = lTotal;
			w.monitoring.eHddGauge.gauge({
				majorTickLabel: true,
				min: 0,
				max: lTotal,
				label: 'HDD',
				unitsLabel: 'GB',
				greenFrom: parseInt( lTotal - lTotal * 0.6),
				greenTo: parseInt(lTotal - lTotal * 0.3),
				yellowFrom:parseInt(lTotal - lTotal * 0.3),
				yellowTo: parseInt(lTotal - lTotal * 0.2),
				redFrom: parseInt(lTotal - lTotal * 0.2),
				redTo: parseInt(lTotal - lTotal * 0.1),
				colorOfPointerStroke: 'rgba(0, 0, 0, 0)',
				colorOfPointerFill: 'rgba(0, 0, 0, 0.7)',
				colorOfCenterCircleFill: 'rgba(125, 160, 125, 1)',
				colorOfCenterCircleStroke: 'rgba(0, 0, 0, 0)',
				colorOfFill: [ '#111', '#ccc', '#ddd', '#fcfcfc' ]
			});
		}
		w.monitoring.eHddGauge.gauge('setValue', IUsed );
	},
	//Reset gauges when the server is disconnect
	resetGauges: function() {
		w.monitoring.eHddGauge.gauge('setValue', 0);
		w.monitoring.eCpuGauge.gauge('setValue', 0);
		w.monitoring.eMemGauge.gauge('setValue', 0);
	}
});