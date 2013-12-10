Ext.onReady(function(){  
    Ext.jws.open();
    
    Ext.jws.on('open',function(){
        init();
    });
    Ext.jws.on('close',function(){
        alert("you are disconnected");
    });
});

function init(){
    var winlogin = getWinLog();
    winlogin.show();
}
