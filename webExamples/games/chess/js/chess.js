//	---------------------------------------------------------------------------
//	jWebSocket Chess Game Demo (Community Edition, CE)
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


var chess  = chess || {};

chess.getImgPath = function() {
	return "img/";  
}

var canvas, context;

var h = 46;
var x = 20;
var y = 50;
var w = 50;

var p;
var pieces = [];

var kimg = new Image();
kimg.src = chess.getImgPath() + "bbk.gif";

var currPiece;
var selectedImage;
 
var loginid = null;

var isConnected = false;
var targetId;

var recvImage = new Image();
var theToken;

var movelist,whitelist,blacklist;
var pieceType;
var firstColumn = 0;
var moves="";
var whiteMoves = [];
var blackMoves = [];
var whiteCounter = 0;
var blackCounter = 0;
var chesspiece;
var yourPiece = true;
var whitePiece,blackPiece;
var moved = true;
var users;
var isInvite = false;
var currToken ;
var firstMove = true;
  
// websocket connection handler
//var lWSC;
 
function piece(xPos, yPos, x, y, img, w, h, colColor, pieceType, moveId, pieceColor) {
	this.xPos = xPos;
	this.yPos = yPos;
	this.x    = x;
	this.y    = y;
	this.Cimg  = img;
	this.w    = w;
	this.h    = h;
	this.colColor = colColor;
	this.pieceType = pieceType;
	this.moveId = moveId;
	this.pieceColor = pieceColor;
	this.firstMove = firstMove;
}

chess.initialize = function(formElements) {

	loginid    = formElements.loginBtn;
	logger     = formElements.log;
	canvas     = formElements.canvas1;
	whitelist  = formElements.whitelist;
	blacklist  = formElements.blacklist;
	lWSC       = formElements.lWSC;
   
	if(canvas){
		context = canvas.getContext("2d");
	}
	else {
		alert("Either Your browser does not support Canvas or you have not initialized canvas element.");
	}
	chessBoard.drawBoard();
};

/*
  This function loads white pieces into an array and returns the same
*/
chess.loadWhitePieces = function() {
	var white = {
		bwr : chess.getImgPath() + "bwr.gif", 
		bwn : chess.getImgPath() + "bwn.gif", 
		bwb : chess.getImgPath() + "bwb.gif", 
		bwq : chess.getImgPath() + "bwq.gif", 
		bwk : chess.getImgPath() + "bwk.gif", 
		bwb1: chess.getImgPath() + "bwb.gif", 
		bwn1: chess.getImgPath() + "bwn.gif", 
		bwr1: chess.getImgPath() + "bwr.gif", 
		bwp : chess.getImgPath() + "bwp.gif"
	};
	var whites = [];
	var i = 0;
	for(key in white) {
		whites[i] = white[key.toString()];
		i = i + 1;
	}
	return whites;
};

/*
  This function loads black pieces into an array and returns the same
*/
chess.loadBlackPieces = function() {
	var black = {
		bbr : chess.getImgPath() + "bbr.gif", 
		bbn : chess.getImgPath() + "bbn.gif", 
		bbb : chess.getImgPath() + "bbb.gif", 
		bbq : chess.getImgPath() + "bbq.gif", 
		bbk : chess.getImgPath() + "bbk.gif", 
		bbb1: chess.getImgPath() + "bbb.gif", 
		bbn1: chess.getImgPath() + "bbn.gif", 
		bbr1: chess.getImgPath() + "bbr.gif", 
		bbp : chess.getImgPath() + "bbp.gif"
	};
	var blacks = [];
	var i=0;
	for(key in black) {
		blacks[i] = black[key.toString()];
		i = i + 1;
	}
	return blacks;
};

// namespace for chess board and its related functions
var chessBoard = {};

chessBoard.drawBoard = function(selectedPiece) {
  
	context.strokeRect(15,y-3,408,375);
	context.fillStyle = "white";
	context.strokeRect(18,y,405,372);
   
	var color;
	var counter = 0;
	var moveid = "";
  
	var blacks =  chess.loadBlackPieces();
	var whites =  chess.loadWhitePieces();
    
	if( selectedPiece == "B") {
      
        
		for(var i = 0; i < 8; i++) {
       
			color = util.isEven(i) ? "B": "W";     
			var offset = 0;
			var blackOffset = 0;

			for(var j = 0; j < 8; j++) {

				var x0 = x + 10;
				var y0 = y + h - 45;

				if(j == 0) {  
					moveid = "a" + (8 - i);
				}  
				else if(j == 1) {
					moveid = "b" + (8 - i);
				}  
				else if(j == 2) {
					moveid = "c" + (8 - i);
				}
				else if(j == 3) {  
					moveid = "d" + (8 - i);
				}
				else if(j == 4) {
					moveid = "e" + (8 - i);
				}
				else if(j == 5) {
					moveid = "f" + (8 - i);
				}
				else if(j == 6) {
					moveid = "g" + (8 - i);
				} 
				else if(j == 7) {
					moveid = "h" + (8 - i);
				}
				if(color == "W") {
					color = "B";
					context.fillStyle = "black";
					context.fillRect(x, y, w, h);
					p = new piece(x0, y0, x, y, null, w, h, color, null, moveid, null,null); 
				}
				else {
					color = "W";
					context.fillStyle = "white";
					context.fillRect(x, y, w, h);
					p = new piece(x0, y0, x, y, null, w, h, color, null, moveid, null,null);
				}
				if(i == 0){
					if(offset <= 7){
						chessimg = new Image();
						chessimg.src = whites[offset];
						context.drawImage(chessimg, x0, y0, 30, 36);   
                    
						if(offset == 0) pieceType = "R";
						else if(offset == 1) pieceType = "N";
						else if(offset == 2) pieceType = "B";
						else if(offset == 3) pieceType = "Q";
						else if(offset == 4) pieceType = "K";
						else if(offset == 5) pieceType = "B";
						else if(offset == 6) pieceType = "N";
						else if(offset == 7) pieceType = "R";	

						p = new piece(x0, y0, x, y, chessimg, w, h, color, pieceType, moveid,"W",null);
					}
				}
				else if(i == 1) {
					chessimg = new Image();
					chessimg.src = whites[whites.length - 1];
					context.drawImage(chessimg, x0, y0, 30, 36);   
					p = new piece(x0, y0, x, y, chessimg, w, h, color, "P", moveid, "W", true);
				} else if(i == 6) {
					chessimg = new Image();
					chessimg.src = blacks[blacks.length - 1];
					context.drawImage(chessimg, x0, y0, 30, 36);   
					p = new piece(x0, y0, x, y, chessimg, w, h, color, "P", moveid,"B", true);
				} else if(i == 7) {
					if(blackOffset <= 7){
						chessimg = new Image();
						chessimg.src = blacks[blackOffset];
						context.drawImage(chessimg, x0, y0, 30, 36);  

						if(blackOffset == 0) pieceType = "R";
						else if(blackOffset == 1) pieceType = "N";
						else if(blackOffset == 2) pieceType = "B";
						else if(blackOffset == 3) pieceType = "Q";
						else if(blackOffset == 4) pieceType = "K";
						else if(blackOffset == 5) pieceType = "B";
						else if(blackOffset == 6) pieceType = "N";
						else if(blackOffset == 7) pieceType = "R";	
			 
						p = new piece(x0, y0, x, y, chessimg, w, h, color, pieceType, moveid,"B",null);
					}
				}
				if(i >=2 && i<=5) {
					p = new piece(x0, y0, x, y, null, w, h, color, null, moveid,null,null);
				}
				pieces[counter++] = p;
				x += w;
				offset += 1;
				blackOffset += 1;
          
			} //end of for
			x = 20;
			y = y + h;
		} //end for
	}  //end if
	else {
		for(var i = 0; i < 8; i++) {
       
			color = util.isEven(i) ? "B": "W";     
			var offset = 0;
			var blackOffset = 0;

			for(var j = 0; j < 8; j++) {

				var x0 = x + 10;
				var y0 = y + h - 45;

				if(j == 0) {  
					moveid = "a" + (8 - i);
				}  
				else if(j == 1) {
					moveid = "b" + (8 - i);
				}  
				else if(j == 2) {
					moveid = "c" + (8 - i);
				}
				else if(j == 3) {  
					moveid = "d" + (8 - i);
				}
				else if(j == 4) {
					moveid = "e" + (8 - i);
				}
				else if(j == 5) {
					moveid = "f" + (8 - i);
				}
				else if(j == 6) {
					moveid = "g" + (8 - i);
				} 
				else if(j == 7) {
					moveid = "h" + (8 - i);
				}
				if(color == "W") {
					color = "B";
					context.fillStyle = "black";
					context.fillRect(x, y, w, h);
					p = new piece(x0, y0, x, y, null, w, h, color, null, moveid, null); 
				}
				else {
					color = "W";
					context.fillStyle = "white";
					context.fillRect(x, y, w, h);
					p = new piece(x0, y0, x, y, null, w, h, color, null, moveid, null);
				}
				if(i == 0){
					if(blackOffset <= 7){
						chessimg = new Image();
						chessimg.src = blacks[offset];
						context.drawImage(chessimg, x0, y0, 30, 36);   
                    
						if(offset == 0) pieceType = "R";
						else if(offset == 1) pieceType = "N";
						else if(offset == 2) pieceType = "B";
						else if(offset == 3) pieceType = "Q";
						else if(offset == 4) pieceType = "K";
						else if(offset == 5) pieceType = "B";
						else if(offset == 6) pieceType = "N";
						else if(offset == 7) pieceType = "R";	

						p = new piece(x0, y0, x, y, chessimg, w, h, color, pieceType, moveid,"B",null);
					}
				}
				else if(i == 1) {
					chessimg = new Image();
					chessimg.src = blacks[blacks.length - 1];
					context.drawImage(chessimg, x0, y0, 30, 36);   
					p = new piece(x0, y0, x, y, chessimg, w, h, color, "P", moveid, "B",true);
				} else if(i == 6) {
					chessimg = new Image();
					chessimg.src = whites[blacks.length - 1];
					context.drawImage(chessimg, x0, y0, 30, 36);   
					p = new piece(x0, y0, x, y, chessimg, w, h, color, "P", moveid,"W",true);
				} else if(i == 7) {
					if(offset <= 7){
						chessimg = new Image();
						chessimg.src = whites[offset];
						context.drawImage(chessimg, x0, y0, 30, 36);  

						if(offset == 0) pieceType = "R";
						else if(offset == 1) pieceType = "N";
						else if(offset == 2) pieceType = "B";
						else if(offset == 3) pieceType = "Q";
						else if(offset == 4) pieceType = "K";
						else if(offset == 5) pieceType = "B";
						else if(offset == 6) pieceType = "N";
						else if(offset == 7) pieceType = "R";	
			 
						p = new piece(x0, y0, x, y, chessimg, w, h, color, pieceType, moveid,"W", null);
					}
				}
				if(i >=2 && i<=5) {
					p = new piece(x0, y0, x, y, null, w, h, color, null, moveid, null, null);
				}
				pieces[counter++] = p;
				x += w;
				offset += 1;
				blackOffset += 1;
          
			} //end of for
			x = 20;
			y = y + h;
		} //end for
	}
};

chessBoard.updateMove = function(theData) {
	var tokens = theData.split("#",theData.length);
	recvImage = new Image();
	recvImage.src = tokens[2];
	context.drawImage(recvImage, tokens[0], tokens[1], 30, 36);
	context.fillStyle=(tokens[7]=="W") ? "white" :"black";
	context.fillRect(tokens[3], tokens[4], tokens[5], tokens[6]);
}

var mouse = {};

mouse.handleMouseDown = function(event) {
	if(isConnected)
		mouse.handleCollision(event);
}

mouse.handleMouseup   = function(event)  {
	if(mouse.handleCollisionAgain(event) && isConnected && yourPiece && moved) {
		log("---it is matched again----");
		context.drawImage(selectedImage.Cimg, p.xPos, p.yPos, 30, 36);
		p.Cimg = selectedImage.Cimg;
		context.fillStyle=(selectedImage.colColor=="W") ? "white" : "black";
		context.fillRect(selectedImage.x, selectedImage.y, selectedImage.w, selectedImage.h);
		if(chesspiece == "W") {
			whiteMoves[whiteCounter] = selectedImage.moveId + "-" +p.moveId;
			whiteCounter = whiteCounter + 1;
			chessrules.makeMoves( chesspiece);
		}
		else  {
			blackMoves[blackCounter] = selectedImage.moveId + "-" +p.moveId;
			blackCounter = blackCounter + 1;
			chessrules.makeMoves( chesspiece );
		}
		var lRes = lWSC.broadcastText("",p.xPos+"#"+p.yPos+"#" + selectedImage.Cimg.src+"#"+selectedImage.x+"#"+selectedImage.y+"#"+selectedImage.w+"#"+selectedImage.h+"#"+selectedImage.colColor+"#"+selectedImage.moveId + "-" + p.moveId + "#" + chesspiece + "#" + selectedImage.pieceType);
	//    var lRes = lWSC.sendText("",p.xPos+"#"+p.yPos+"#" + selectedImage.Cimg.src+"#"+selectedImage.x+"#"+selectedImage.y+"#"+selectedImage.w+"#"+selectedImage.h+"#"+selectedImage.colColor+"#"+selectedImage.moveId + "-" + p.moveId + "#" + chesspiece + "#" + selectedImage.pieceType);
	}
	yourPiece = true;
}

mouse.handleCollision = function(event) {
    
	var size   = pieces.length;
	var mousex = event.layerX;
	var mousey = event.layerY - h;
   
	for(var i = 0; i < size; i++) {
		p = pieces[i];
		if(mousex >= p.x && mousex <=(p.x + p.w)) {
			if(mousey >= p.y && mousey <=(p.y + p.h)) {
				log("---it is matched ----");
				log( "piece color: " + p.pieceColor);
				log( "chesspiece: " + chesspiece);
				if( p.pieceColor == chesspiece )
				{
					log( "AAAAA: ");
					p.pieceColor = chesspiece;
					pieces[i] = p;
				}
				else {
					log( "BBBBB: ");
					yourPiece = false;
					return false;
				}
				log( "CCCC: ");
				selectedImage = p;
				log( "selectedImage color: " + selectedImage.pieceColor);
				return true;
			}
		}
	}
}

mouse.handleCollisionAgain = function(event) {
	var size = pieces.length;
	var mousex = event.layerX;
	var mousey = event.layerY - h;
	for(var i = 0; i < size; i++) {
		p = pieces[i];

		//	 if(!chessrules.MovePiece(chesspiece, p.y, mousey)) return false;

		if(mousex >= selectedImage.x && mousex <=(selectedImage.x + selectedImage.w)) {
			if(mousey >= selectedImage.y && mousey <=(selectedImage.y + selectedImage.h)) {
				log("A here what is the selected piece color..." + selectedImage.pieceColor);

				if(!chessrules.MovePiece(selectedImage.pieceType, selectedImage.y, mousey, i,selectedImage.firstMove, selectedImage.x, mousex)) return false;

				context.drawImage(selectedImage, p.xPos, p.yPos, 30, 36);
				return false;
			}
		} 
		if(mousex >= p.x && mousex <=(p.x + p.w)) {
			if(mousey >= p.y && mousey <=(p.y + p.h)) {
				log("B. here what is the selected piece color..." + selectedImage.pieceColor);
				p.pieceColor = selectedImage.pieceColor;
				p.pieceType = selectedImage.pieceType;
				pieces[i] = p ;
              
				if(!chessrules.MovePiece(selectedImage.pieceType, selectedImage.y, mousey, i, selectedImage.firstMove, selectedImage.x, mousex)) {
					return false;
				}  

				return true;
			}
		}
	} 
}

var util = {};

util.isEven = function (value) {
	if(value % 2 == 0) return true;
	else return false; 
}
 
var chessrules = {};
 
chessrules.revertSelection = function(mousex, mousey) {
	var status = true;
	if(mousex >= selectedImage.x && mousex <=(selectedImage.x + selectedImage.w)) {
		if(mousey >= selectedImage.y && mousey <=(selectedImage.y + selectedImage.h)) {
			context.drawImage(selectedImage, p.xPos, p.yPos, 30, 36);
			status = false;
			return status;
		}
	}
}
  
chessrules.updateMoves = function(value, pieceColor, pieceType) {
	if(pieceColor == "W") {
		whitelist.innerHTML = "";
		whitelist.innerHTML+="<tr><td>White:</td></tr>";
		whiteMoves[whiteCounter++] = value;
		for(var i = 0; i < whiteMoves.length; i++) {
			whitelist.innerHTML+="<tr><td>" + whiteMoves[i] + "</td></tr>";
		}
	}
          
	if(pieceColor == "B") {
		blacklist.innerHTML = "";
		blacklist.innerHTML+="<tr><td>Black:</td></tr>";
		blackMoves[blackCounter++] = value;
		for(var i = 0; i < blackMoves.length; i++) {
			blacklist.innerHTML+="<tr><td>"+blackMoves[i]+"</td></tr>";
		}
	}
}
  
chessrules.makeMoves = function (pieceColor) {
	/*whitelist.innerHTML = "";
	blacklist.innerHTML = "";
	  whitelist.innerHTML+="<tr><td>White:</td></tr>";    
 	 for(var i = 0; i < whiteMoves.length; i++)
            whitelist.innerHTML+="<tr><td>"+whiteMoves[i]+"</td></tr>";

	blacklist.innerHTML+="<tr><td>Black:</td></tr>";
	 for(var i = 0; i < blackMoves.length; i++)
         blacklist.innerHTML+="<tr><td>"+blackMoves[i]+"</td></tr>";
		 */
	}

chessrules.check = function() {
      
	}

chessrules.MovePiece = function(pieceType, startPosition, endPosition, index, fm, x, mousex) {
	log("insideMovePiece "  + startPosition + "-" + endPosition);
	var deltaPosition;
	//	  alert(pieceType);
	//	  alert(fm+"- "+index);
	if(pieceType == "P") { // piece type is pawn
		if(fm) {

			if(startPosition > endPosition) {
				deltaPosition = startPosition - 2 * h;
				if( endPosition > deltaPosition && endPosition <= startPosition ) {
					selectedImage.firstMove = false;
					p.firstMove =  selectedImage.firstMove;
					pieces[index] = p ;
					return true;
				} else {
					return false;
				}
			}
			else { 
				deltaPosition = startPosition + 2 * h;
				if(endPosition > ( startPosition + (3 * h ))) {
					//  alert("44444");
					return false;
				}else {
					//  alert("44444B")
					selectedImage.firstMove = false;
					p.firstMove =  selectedImage.firstMove;
					pieces[index] = p ;
					return true;
				}
				log("deltaPosition.. " + deltaPosition);
			} // end of 


		} //end if fm
		else {

			if(startPosition > endPosition) {
				deltaPosition = startPosition - 1 * h;
				if( endPosition > deltaPosition && endPosition <= startPosition ) {
					selectedImage.firstMove = false;
					p.firstMove =  selectedImage.firstMove;
					pieces[index] = p ;
					return true;
				} else {
					return false;
				}
			}
			else { 
				deltaPosition = startPosition + 1 * h;
				if(endPosition > ( startPosition + (2 * h ))) {
					// alert("5555");
					return false;
				}else {
					// alert("5555B");
					selectedImage.firstMove = false;
					p.firstMove =  selectedImage.firstMove;
					pieces[index] = p ;
					return true;
				}
				log("deltaPosition.. " + deltaPosition);
			} // end of
             
        

		}

	}  // end if(pieceType == "P") 
	else {
		return true;
	}

}

/*
      This method cheks whether the image at a particular index is empty or not.
	  If empty, allows to make a move. This is very generic rule and applies to all
	  types of pieces movements.
   */
chessrules.emptyColumn = function(index) {
	if(p[index].Cimg.src == null || p[index].Cimg.src == 'undefined') {
		return true;
	} else {
		return false;
	}
}

chessrules.moveDiagonal = function(x, mousex, index) {
	}
