package com.github.skart123.geotracert.geotracertserver;

/**
 *
 * @author Goko
 */
import java.net.InetAddress;
import java.net.UnknownHostException;

/**
 * Класс, который представляет одну строку (то есть, по одному хопу) от бега
 * Traceroute.
 */
public class TracerouteItem {

    /*
     * The IP address для этого хопа.
     */
    private InetAddress address;

    /*
     * Нostname, если дан
     */
    private String hostname;

    public TracerouteItem(String hostname, String address) throws UnknownHostException {
        this.hostname = hostname;       
        this.address = InetAddress.getByName(address);       
    }

    public String toStringIPHost() {
        return hostname + ", " + address.getHostAddress();
    }

    public String toStringIP() {
        return address.getHostAddress();
    }

    public String toStringHostName() {
        return hostname;
    }
    
     public boolean isLocal() {
        return address.isAnyLocalAddress();
    }
     
     public boolean haveAnyIP(){
         if ((address.getHostAddress() == null) || (address.getHostAddress().contentEquals("127.0.0.1")))
         {
             return false;
         }
         else
         {
            return true;
         }
     }
}