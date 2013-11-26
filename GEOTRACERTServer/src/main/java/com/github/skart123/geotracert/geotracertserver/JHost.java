/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package com.github.skart123.geotracert.geotracertserver;

/**
 *
 * @author Ksenya
 */
import org.jwebsocket.api.*;
import org.jwebsocket.config.*;
import org.jwebsocket.kit.*;
import org.jwebsocket.listener.*;
import org.jwebsocket.token.*;
import org.jwebsocket.server.*;
import org.jwebsocket.factory.*;

/*public class JHost implements WebSocketServerTokenListener {
  private TokenServer tokenServer;

  public TokenServer getTokenServer()
  {
    return tokenServer;
  }
  public void init()
  {
      System.out.println("œ–Œ¬≈– ¿ 1");

    
   
          

   //   tokenServer = (TokenServer) JWebSocketFactory.getServer("ts0");
      if (tokenServer != null) {
        System.out.println("Server was found!!! :D");
        tokenServer.addListener(this);
      } else {
        System.out.println("Awww snap. I couldn't find a server.");
      }

      System.out.println("init exception...");
      System.out.println("œ–Œ¬≈– ¿ 3");

    System.out.println("œ–Œ¬≈– ¿ 4");
  }

  @Override
  public void processOpened(WebSocketServerEvent event)
  {
    System.out.println("\n***");
    System.out.println("Open! \n" + event.toString());
    System.out.println("***\n");
  } 
  @Override
  public void processClosed(WebSocketServerEvent event)
  {
    System.out.println("\n***");
    System.out.println("Closed! \n" + event.toString());
    System.out.println("***\n");
  }
  @Override
  public void processToken(WebSocketServerTokenEvent event, Token token)
  {
    System.out.println("\n***");
    System.out.println("Got Token: \n" + token.toString());
    System.out.println("***\n");
        
        // Respond depending on what they sent
        Token response = event.createResponse(token);
        
        String itype = token.getString("itype");
        if (itype != null && itype.equals("sendMove"))
        {
                response.setString("msg", "SendMoveResponse");
                event.sendToken(response);
        }
  }
  public void processPacket(WebSocketServerEvent event, WebSocketPacket packet)
  {
     System.out.println("\n***");
     System.out.println("Got Packet: \n" + packet.toString());
     System.out.println("***\n");
  }
*/
    
    public class JHost implements WebSocketServerTokenListener{  // ›ÚÓ ÌÂ Ó¯Ë·Í‡
    private TokenServer tokenserver;  
    
  
  
    public void init()  
    {  
     
           // String args = new String("ÎÓÎ");
            // the following line must not be removed due to GNU LGPL 3.0 license!  
            
JWebSocketFactory.printCopyrightToConsole();  
// check if home, config or bootstrap path are passed by command line  
JWebSocketConfig.initForConsoleApp(new String[]{});    
// start the jWebSocket Server  
JWebSocketFactory.start();
                         
            tokenserver = JWebSocketFactory.getTokenServer();  
            if(tokenserver!=null)  
            {  
                tokenserver.addListener(this);  
                System.out.println("Setup complete");  
            }  
            else System.out.println("error");  
        }  

  
    @Override  
    public void processToken(WebSocketServerTokenEvent wsste, Token token)  
    {  
        System.out.println("Token.");  
    }  
  
    @Override  
    public void processOpened(WebSocketServerEvent wsse)  
    {  
        System.out.println("Opened.");  
    }  
  
 //   @Override  
    public void processPacket(WebSocketServerEvent wsse, WebSocketPacket wsp)  
    {  
        System.out.println("Packet. " + wsp.getString());  
    }  
  
    @Override  
    public void processClosed(WebSocketServerEvent wsse)  
    {  
        System.out.println("Closed.");  
    }  
      
}  
