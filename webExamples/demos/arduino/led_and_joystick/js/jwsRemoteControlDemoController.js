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

$(document).ready(function() { 
    init(); 
 
    gElements.init()
    gElements.eLedBlue.click( function(){       		
        sendCommand(49);                  
    });  
   
    gElements.eLedRed.click( function(){
        sendCommand(50);
    });       
    gElements.eLedGreen.click( function(){
        sendCommand(51);
    });       
    gElements.eLedYellow.click( function(){
        sendCommand(52);
    }); 
	
});


function changeledsStatus(aBlue, aRed, aGreen, aYellow){
    if(aBlue){
        gElements.eLedBlue.removeClass("off").addClass("on");
    }
    else{
        gElements.eLedBlue.removeClass("on").addClass("off");
    }
    if(aRed){
        gElements.eLedRed.removeClass("off").addClass("on");
    }
    else{
        gElements.eLedRed.removeClass("on").addClass("off");
    }
    if(aGreen){
        gElements.eLedGreen.removeClass("off").addClass("on");
    }
    else{
        gElements.eLedGreen.removeClass("on").addClass("off");
    }
    if(aYellow){
        gElements.eLedYellow.removeClass("off").addClass("on");
    }
    else{
        gElements.eLedYellow.removeClass("on").addClass("off");
    }
}

function changePosition(aX , aY){
    //positioning value of x and y value in the center    
    var lX = 135 - (aX ) * 23;
    var lY = 135 + (aY) * 23;
    var lDistance = Math.sqrt(Math.pow(135 - lX, 2) + Math.pow(135 - lY, 2)   );
   
    if(lDistance <= 200){
        gElements.ePosition.css({
            "left": lX,
            "top" : lY
        });
   
    }    
}


        

	

