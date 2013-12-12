/*
 *Класс Location, в поля которого будут записаны полученные данные
    Метод getIpGeoBaseDataByIp() для получения объекта типа Location
    Метод makeGetRequest() для выполнения Get запроса
    Класс IpGeoBaseLocation, в объект этого типа будет проходить демаршалинг данных полученных с ipgeobase.ru

    Формат использования: 
        Location locData = new Location(); 
        locData.getIpGeoBaseDataByIp("213.180.193.1"); // 
        locData.getLatitude(); // возвращается широта 
        locData.getLongitude(); // возвращается долгота
 */
package com.github.skart123.geotracert.geotracertserver.IpTocoordinates;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.Unmarshaller;

/**
 * Отвечает за преобразование IP адреса в координаты. Реализован через c
 * использованием API freegeoip.net. Запрос осуществляет метод
 * getIpGeoBaseDataByIp. Ответ получает в формате xml и разбирает его с помощью
 * класса IpGeoBaseLocation, который предсталяет собой JAXB аннотацию для
 * разборки xml.
 *
 * @author AndrewMendrew
 */
public class Location {

    String ip;
    private String countryName = "";
    private String cityName = "";
    private double latitude; // широта
    private double longitude; // долгота

    public Location() {
        this.latitude = 0;
        this.longitude = 0;
    }

    public String getIp() {
        return ip;
    }

    public void setIp(String ip) {
        this.ip = ip;
    }

    public String getCountryName() {
        return countryName;
    }

    public void setCountryName(String countryName) {
        this.countryName = countryName;
    }

    public String getCityName() {
        return cityName;
    }

    public void setCityName(String cityName) {
        this.cityName = cityName;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    /**
     * Основной метод, выполняющий посылку запроса к freegeoip.net и сохраняющий
     * ответ.
     *
     * @author AndrewMendrew
     * @param ip Ip-адрес
     * @return тип Location. Результаты можно получить через get* и set*
     */
    public int getIpGeoBaseDataByIp(String ip) {
        try {
            /*
             * Получаем экземпляр объекта типа JAXBContext с помощью вызова
             * статического метода newInstance() в него мы должны передать класс с
             * которым будет происходить "связывание" XML ответа,
             */

            JAXBContext jaxbContext = JAXBContext //JAXB для работы с xml
                    .newInstance(IpGeoBaseLocation.class);

            /*
             создаем демаршалер и 
             * вызываем его метод unmarshal() в который мы передаем поток байтов на 
             * полученный XML документ - в результате после приведения типа к 
             * IpGeoBaseLocation используем его экземпляр ipGeoBaseLocation для 
             * заполнения нашего локейшена и возвращаем его.
             */
            Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();

            IpGeoBaseLocation ipGeoBaseLocation;
            //Посылка запроса и парсинг ответа.
            ipGeoBaseLocation = (IpGeoBaseLocation) jaxbUnmarshaller
                    .unmarshal(new ByteArrayInputStream(makeGetRequest(
                                            "http://freegeoip.net/xml/" + ip).getBytes())
                    );
            // Сохранение полученных данных в переменных класса Locate
            if (ipGeoBaseLocation.getCountryName() != null) {
                this.setCountryName(ipGeoBaseLocation.getCountryName());
            }
            if (ipGeoBaseLocation.getIp() != null) {
                this.setIp(ipGeoBaseLocation.getIp());
            }

            if (ipGeoBaseLocation.getCity() != null) {
                this.setCityName(ipGeoBaseLocation.getCity());
            }

            //Было замечено, что при IP, не найденном в базе возвращается 
            //нулевые координаты
          
                this.setLatitude(ipGeoBaseLocation.getLatitude());
                this.setLongitude(ipGeoBaseLocation.getLongitude());
           
            return 0;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return -1;
    }

    /**
     * Метод с помощью которого выполняется Get запрос
     *
     * @author AndrewMendrew
     */
    private static String makeGetRequest(String myURL) throws IOException {
        URL url = new URL(myURL);
        URLConnection connection = url.openConnection();
        connection.setDoOutput(true);

        StringBuffer response = new StringBuffer();
        BufferedReader reader = new BufferedReader(new InputStreamReader(
                connection.getInputStream(), "windows-1251"));
        String line;
        while ((line = reader.readLine()) != null) {
            response.append(line);
        }
        reader.close();

        return response.toString();
    }

}
