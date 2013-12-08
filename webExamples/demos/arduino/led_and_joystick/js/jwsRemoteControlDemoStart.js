//	---------------------------------------------------------------------------
//	jWebSocket Remote Control Demo (Community Edition, CE)
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

function init(){	

    if(jws.browserSupportsWebSockets()){
        
        jws.myConn = new jws.jWebSocketJSONClient();
        jws.myConn.open(jws.JWS_SERVER_URL, {
            OnOpen: function (){ 
                console.log('connected successful');                              
                securityFilter = new jws.SecurityFilter();
                securityFilter.OnNotAuthorized = function(aEvent){
                    console.log("Failure: NOT AUTHORIZED to notify an event with id '" + aEvent.type + "'. Logon first!");
                }

                cacheFilter = new jws.CacheFilter();
                cacheFilter.cache = new Cache();
                validatorFiler = new jws.ValidatorFilter();

                //Creating a event notifier
                notifier = new jws.EventsNotifier();
                notifier.ID = "notifier0";
                notifier.NS = "rc";
                notifier.jwsClient = jws.myConn;
                jws.user = new jws.AppUser();
                notifier.filterChain = [securityFilter, cacheFilter, validatorFiler];
                notifier.initialize();
                //Creating a plugin generator
                generator = new jws.EventsPlugInGenerator();
     
                gRcPlugin = generator.generate("rc", notifier, function(){                   
					
                    
                     startArduinoRemoteControl();
                    gRcPlugin.ledState = function(aEvent){  
                        changeledsStatus(aEvent.blue, aEvent.red, aEvent.green, aEvent.yellow);  
						
                    } 
                    
                    gRcPlugin.joystickPosition = function(aEvent){	
                       changePosition(aEvent.x, aEvent.y);                       
                      
                    }
                    
                    gRcPlugin.message = function(aEvent){						
                        alert(aEvent.content)
                    }             
                   
                });
               
            },
            OnClose:function(aEvent){
                console.log('Connection loss')
            },
            OnMessage:  function(aMessage)
            {
                
            }
        });
    } else {
        var lMsg = jws.MSG_WS_NOT_SUPPORTED;
        alert( lMsg );
        log( lMsg );
    }
}

function sendCommand(aCmd){	
    gRcPlugin.command({
        args: {            
            cmd: parseInt(aCmd)
        },        
        OnSuccess: function(aResponse){
            if(aResponse.message != null)
                alert(aResponse.message);
        }
    });
}

function startArduinoRemoteControl(){
    gRcPlugin.startrc({       
              OnSuccess: function(aResponse){
          if(aResponse.message != null)
              alert(aResponse.message);
        }					
    });    
}