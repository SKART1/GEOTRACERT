/*
JAXB Annotation:
For object that need to convert to / from XML file, it have to annotate 
with JAXB annotation.
The annotation are pretty self-explanatory, you can refer to this JAXB 
guide for detail explanation. (http://jaxb.java.net/tutorial/)

 */
package com.github.skart123.geotracert.geotracertserver.IpTocoordinates;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

/*
 Вид XML ответа
 <Response>
 <Ip>188.134.42.215</Ip>
 <CountryCode>RU</CountryCode>
 <CountryName>Russian Federation</CountryName>
 <RegionCode>66</RegionCode>
 <RegionName>Saint Petersburg City</RegionName>
 <City>Saint Petersburg</City>
 <ZipCode/>
 <Latitude>59.8944</Latitude>
 <Longitude>30.2642</Longitude>
 <MetroCode/>
 <AreaCode/>
 </Response>

 */
@XmlRootElement(name = "Response")
public class IpGeoBaseLocation {

    @XmlElement
    private String Ip;
    @XmlElement
    private String CountryName;
    @XmlElement
    private String RegionName;
    @XmlElement
    private String City;
    @XmlElement
    private double Latitude;
    @XmlElement
    private double Longitude;

    @XmlElement

    public String getIp() {
        return Ip;
    }

    public void setIp(String Ip) {
        this.Ip = Ip;
    }

    public String getCountryName() {
        return CountryName;
    }

    public void setCountryName(String CountryName) {
        this.CountryName = CountryName;
    }

    public String getRegionName() {
        return RegionName;
    }

    public void setRegionName(String RegionName) {
        this.RegionName = RegionName;
    }

    public String getCity() {
        return City;
    }

    public void setCity(String City) {
        this.City = City;
    }

    public double getLatitude() {
        return Latitude;
    }

    public void setLatitude(double Latitude) {
        this.Latitude = Latitude;
    }

    public double getLongitude() {
        return Longitude;
    }

    public void setLongitude(double Longitude) {
        this.Longitude = Longitude;
    }
}
