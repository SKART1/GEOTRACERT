//	---------------------------------------------------------------------------
//	jWebSocket Ping Pong Demo (ranking) (Community Edition, CE)
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
$.widget( "jws.ranking", {
        
    _init:function(  ) {
        w.Ranking				= this;
		
        w.Ranking.eRankingDiv	= w.Ranking.element.find( '#ranking div.ranking' ); 
		
        w.Ranking.onMessage(  );         
    },
    onMessage: function(  ) {        
        $.jws.bind( NS + ':ranking', function( aEvt, aToken ) {
            
            w.Ranking.eRankingDiv.html( "" );
            for ( var i = 0; i < aToken.username.length; i++ ) {
                w.Ranking.initRanking( aToken.username[i], aToken.wins[i], aToken.lost[i] );
            }                       
        } );    
        $.jws.bind( NS + ':deleteranking', function( aEvt, aToken ) {
            w.Ranking.eRankingDiv.html( "" );                                
        } );     
    },
    initRanking:function( aUsername, aWins, aLosts ) {
        var $O_p   =$( '<div class="name">' ).text( aUsername ).append( '</div>' );
        var $O_pp   =$( '<div class="points">' ).text( aWins+" - "+aLosts ).append( '</div>' );
        w.Ranking.eRankingDiv.append( $O_p );
        w.Ranking.eRankingDiv.append( $O_pp );       
    }
} );
