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

    //Поле отвечает за хранение текущей сессии
    private Session connection;
    
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
        connection = session;
        System.out.println("Connect: " + session.getRemoteAddress().getAddress());
        try {
            session.getRemote().sendString("Hello browser, I ServerMessage");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    
    private String msgToJSON(String[] unit)
    {
        if(unit.length == 3)
        {
            return "[{\"country\":\"" + unit[0] + "\",\"coordinates\":[" + unit[1] + "," + unit[2] + "]}]";
        }
        else
        {
            return "";
        }
    }
    
    private void sendMessage(Session session, String msg)
    {
        
        try {
            session.getRemote().sendString(msg);            
        }
        catch (IOException e) {
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
            String unit[] = new String[3];
            unit[0] = "City = " + locData.getCityName() + " Country: " + locData.getCountryName();
            unit[1] = String.valueOf(locData.getLatitude());
            unit[2] = String.valueOf(locData.getLongitude());
            // Где-то здесь будет метод парсинга и т.д., так что итогом будет String[] или вообще новая структура JSON
            // Так что в будущем здесь будет цикл, который переводит цепочку данных по каждому IP в JSON
            //sendMessage(connection, "[{\"country\":\"" + unit[0] + "\",\"coordinates\":{\"Latitude\":" + unit[1] + ",\"Longitude\":" + unit[3] + "}}]");            //"(\"IPs\":" + msgToJSON(unit) + ")"
            //sendMessage(connection, "[{\"country\":\"" + unit[0] + "\", \"coordinates\":{\"Latitude\":" + unit[1] + ",\"Longitude\":" + unit[2] + "}}]");
            sendMessage(connection, "{\"IPs\":" + msgToJSON(unit) + "}");
        } else {
            System.out.println("Произошла ошибка");
        }
        //*************************************************************
    }
}

