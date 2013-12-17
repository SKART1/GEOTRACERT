/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.github.skart123.geotracert.geotracertserver;

/**
 *
 * @authors Goko dm-kiselev
 */
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.UnknownHostException;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.apache.commons.lang.SystemUtils;

/**
 * Класс который отвечает за команду traceroute
 */
public class Traceroute {

    /*
     * runtime.
     */
    private Runtime run;
    private int OSType;
    Process pr; 
    BufferedReader buf;
    /**
     * Иницилизация runtime для того команды работали
     */
    public Traceroute() throws Exception {
        if (SystemUtils.IS_OS_WINDOWS == true)////для Windows tracert
        {
            OSType = 0;
        } else if (SystemUtils.IS_OS_UNIX == true)//для linux
        {
            OSType = 1;
        } else {
            OSType = 3;
            throw new Exception("Unknown operating system");
        }
        run = Runtime.getRuntime();
    }

    /**
     * Вызов команду traceroute, и возврашает хопы в виде list->
     * TracerouteItems.
     *
     * @param destination пункт назначения hostname или IP
     * @return list of TracerouteItems
     * 
     */
    
      public void tracerouteDestination(String destination) throws IOException
      {     
           /* Выбор команды для конкрктной ОС.*/
            String cmd = getTracerouteCommand(destination);
           /*Процесс для вызов команды.*/
            pr = run.exec(cmd);       
            buf = new BufferedReader(new InputStreamReader(pr.getInputStream()));
        }
    
    public TracerouteItem getTracerouteAnswerString() throws IOException {
        /*
         * Это будет наш результат.
         */
      //  ArrayList<TracerouteItem> result = new ArrayList<>();
      //  boolean firstLineFlag = true;
        
    


       

        /*
         * Попытка разобрать каждую строку и создать соответствующий TracerouteItem
         */
        String line= buf.readLine();
        if (line == null) 
        { 
            return null;           
        } 
        else 
        {
            line = new String(line.getBytes(), Charset.forName("CP866"));
            TracerouteItem item = parse(line);
            return item;
        }       
    }

    /**
     * Извлекает необходимую информацию из строки вывода (один хоп) из
     *          * Traceroute и делает TracerouteItem от него.
     *
     * @param line один хоп из traceroute
     * @return the правильное TracerouteItem
     */
    public TracerouteItem parse(String line) throws UnknownHostException {
//		System.out.println("line = " + line);
        String hostname = null, IP = null;
        Pattern hopPattern = Pattern.compile("^[ \t]*[0-9]+");
        Matcher matcher = hopPattern.matcher(line);
        if (matcher.find()) {
            Pattern hostnamePattern = Pattern.compile("[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,6}"),
                    IPPattern = Pattern.compile("\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b");
            matcher = hostnamePattern.matcher(line);
            if (matcher.find()) {
                hostname = matcher.group();
            }
            matcher = IPPattern.matcher(line);
            if (matcher.find()) {
                IP = matcher.group();
            }
        }
//		System.out.println("hostname = " + hostname + "; IP = " + IP);
        return new TracerouteItem(hostname, IP);
    }

    /**
     * Получает надлежащую команду запустить трассировку для этой операционной
     * системы.
     *
     * @param destination пункт назначения hostname или IP
     * @return правильная traceroute команда
     */
    public String getTracerouteCommand(String destination) {
        String cmd = "";
        if (OSType == 0)////для Windows tracert
        {
            cmd = ("tracert " + destination);
        } else if (OSType == 1)//для linux
        {
            cmd = ("traceroute " + destination);
        }
        return cmd;
    }
}
