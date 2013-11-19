/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.github.skart123.geotracert.geotracertserver;

/**
 *
 * @author Goko
 */
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;

/**
 * Класс который отвечает за команду traceroute
 */
public class Traceroute {

    /*
     * runtime.
     */
    private Runtime run;

    /**
     * Иницилизация runtime для того команды работали
     */
    public Traceroute() {
        run = Runtime.getRuntime();
    }

    /**
     * Вызов команду traceroute, и возврашает хопы в виде list->
     * TracerouteItems.
     *
     * @param destination пункт назначения hostname или IP
     * @return list of TracerouteItems
     */
    public ArrayList<TracerouteItem> traceroute(String destination) {
        /*
         * Это будет наш результат.
         */
        ArrayList<TracerouteItem> result = new ArrayList<TracerouteItem>();

        /*
         * Процесс для вызов команды.
         */
        Process pr = null;

        /*
         * Выбор команды для конкрктной ОС. 
         */
        String cmd = getTracerouteCommand(destination);

        try {
            pr = run.exec(cmd);
        } catch (IOException e) {
            /*
             * Если что-то не так пойдет...
             */
            e.printStackTrace();
        }

        /*
         * Заготовка BufferedReader для четения вывод из traceroute.
         */
        BufferedReader buf = new BufferedReader(new InputStreamReader(
                pr.getInputStream()));

        /*
         * Попытка разобрать каждую строку и создать соответствующий TracerouteItem
         */
        String line = "";
        try {
            while ((line = buf.readLine()) != null) {
                if (line.length() > 10) {
                    if ("Tra".equals(line.substring(0, 3)) || "ove".equals(line.substring(0, 3)) || "Reque".equals(line.substring(32, 37))) {
                    } else {
                        TracerouteItem item = parse(line);
                        result.add(item);
                    }
                }
            }
        } catch (IOException e) {
            /*
             * А вдруг тут что-то не так :)
             */
            return null;
        }

        /*
         * Конец метода.
         */
        return result;
    }

    /**
     * Извлекает необходимую информацию из строки вывода (один хоп) из
     *          * Traceroute и делает TracerouteItem от него.
     *
     * @param line один хоп из traceroute
     * @return the правильное TracerouteItem
     */
    public TracerouteItem parse(String line) {
        String hostname = null;
        String IP = null;

        int lenght = line.length();
        int indexOf = line.indexOf("[");

        if (line.indexOf("[") == -1) {
            IP = line.substring(32, lenght);
        } else {
            hostname = line.substring(32, indexOf - 1);
            IP = line.substring(indexOf + 1, lenght - 2);
        }
        TracerouteItem tItem = new TracerouteItem(hostname, IP);
        return tItem;
    }

    /**
     * Получает надлежащую команду запустить трассировку для этой операционной
     * системы.
     *
     * @param destination пункт назначения hostname или IP
     * @return правильная traceroute команда
     */
    public String getTracerouteCommand(String destination) {
        //для linux
        String cmd = ("traceroute " + destination);
        //для windows была бы tracert
        return cmd;
    }
}