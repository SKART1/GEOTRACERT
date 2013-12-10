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

gElements = {
	eLedBlue    : null,
	eLedRed     : null,
	eLedGreen   : null,
	eLedYellow  : null,
	ePosition   : null,
	init        :function(){
		this.eLedBlue   = $("#ledblue");
		this.eLedRed    = $("#ledred");
		this.eLedGreen  = $("#ledgreen");
		this.eLedYellow = $("#ledyellow");
		this.ePosition = $("#point");     	 
	}
}




