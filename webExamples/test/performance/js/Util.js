generateString = function(aLength){
	var lBase = 'jWebSocket';
	var lStr = '';
	while (lStr.length < aLength){
		lStr += lBase;
	}
		
	return lStr;
}

log = function(aMessage, aClear){
	if (aClear){
		$('#log').html('');
	}
	
	$('#log').append('<br> - ' + aMessage);
}