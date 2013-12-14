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
import com.github.skart123.geotracert.geotracertserver.IpTocoordinates.Location;
import java.io.IOException;
import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketError;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;

@WebSocket
public class MyWebSocketHandler {

    @OnWebSocketClose
    public void onClose(int statusCode, String reason) {
        System.out.println("Close: statusCode=" + statusCode + ", reason=" + reason);
    }

    @OnWebSocketError
    public void onError(Throwable t) {
        System.out.println("Error: " + t.getMessage());
    }

    @OnWebSocketConnect
    public void onConnect(Session session) {
        System.out.println("Connect: " + session.getRemoteAddress().getAddress());
        try {
            session.getRemote().sendString("Hello browser, I ServerMessage");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @OnWebSocketMessage
    public void onText(String msg) {
		System.out.println("IP from index.html:");
		System.out.println(msg);
    
                Location locData = new Location();
        if (locData.getIpGeoBaseDataByIp(msg) == 0) {
            locData.getLatitude(); // широта и долгота
            locData.getLongitude();
            System.out.println("City = " + locData.getCityName() + " Country: " + locData.getCountryName());
            System.out.println("Latitude = " + locData.getLatitude() + " Longitude: " + locData.getLongitude());
        } else {
            System.out.println("Произошла ошибка");
        }
        //*************************************************************
    }
}
