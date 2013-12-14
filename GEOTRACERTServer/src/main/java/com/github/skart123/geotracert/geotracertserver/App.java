package com.github.skart123.geotracert.geotracertserver;

/**
 * Hello world!
 *
 */
import com.github.skart123.geotracert.geotracertserver.IpTocoordinates.Location;
import java.io.File;
<<<<<<< HEAD
import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.server.handler.DefaultHandler;
import org.eclipse.jetty.server.handler.HandlerCollection;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;
import org.eclipse.jetty.websocket.server.WebSocketHandler;
import org.eclipse.jetty.websocket.servlet.WebSocketServlet;
import org.eclipse.jetty.websocket.servlet.WebSocketServletFactory;
=======
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import org.jwebsocket.config.JWebSocketConfig;
import org.jwebsocket.config.JWebSocketServerConstants;
import org.jwebsocket.factory.JWebSocketFactory;
import org.jwebsocket.server.TokenServer;
>>>>>>> origin/workBranch
import org.restlet.Application;
import org.restlet.Component;
import org.restlet.Restlet;
import org.restlet.data.CharacterSet;
import org.restlet.data.Protocol;
import org.restlet.resource.Directory;
import org.restlet.routing.Redirector;
import org.restlet.routing.Router;

public class App extends Application {

    //Solution 1 for relative paths
    static final String pathToIndexBase1 = App.class.getProtectionDomain().getCodeSource().getLocation().getPath();
    static String pathToIndexBaseCorrect1;

    //Solution 2 for relative paths
    static final File parentDir = new File(new File("").getAbsolutePath());
    static final String pathToIndexBase2 = parentDir.getAbsolutePath();
    static String pathToIndexBaseCorrect2;

    
       /**
     * Creates a root Restlet that will receive all incoming calls.
     */
    public static void main(String[] args) throws Exception {

        //Solution 1    
        pathToIndexBaseCorrect1 = "file:////" + pathToIndexBase1.substring(0, pathToIndexBase1.indexOf("target") + 6) + "/clientFolder";

        //Solution 2
<<<<<<< HEAD
        pathToIndexBaseCorrect2 = "file:" + File.separator + File.separator + File.separator + File.separator + pathToIndexBase2.replaceAll("/", File.separator) + File.separator + File.separator + "target" + File.separator + File.separator + "clientFolder";

=======
        pathToIndexBaseCorrect2="file:"+File.separator+File.separator+File.separator+File.separator+pathToIndexBase2.replaceAll("/", File.separator)+File.separator+File.separator+"target"+File.separator+File.separator+"clientFolder";
       
        //*************************************************************
        //RESTLET
>>>>>>> origin/workBranch
        Component component = new Component();

        /*System.out.println("App.class.getProtectionDomain().getCodeSource().getLocation().getPath()"); 
         System.out.println(pathToIndexBaseCorrect1);
         System.out.println("File"+File.pathSeparator+File.pathSeparator);
         System.out.println(pathToIndexBaseCorrect2);     */
        component.getServers().add(Protocol.HTTP, 8182);
        component.getClients().add(Protocol.FILE);

        // Create an application         
        Application application = new Application() {
            @Override
            public Restlet createInboundRoot() {
                //Конструктор ресурса                 
                Directory temp = new Directory(getContext(), pathToIndexBaseCorrect1);

                return temp;
            }
        };
        //application
        //For correct rusian letters representation
        application.getMetadataService().setDefaultCharacterSet(CharacterSet.UTF_8);

        // Attach the application to the component 
        //main page: index.html
        component.getDefaultHost().attach("/index.html", application);

        //just for fun page /hello/hello
        component.getDefaultHost().attach("/hello", new App());

        //redirector from / to /index.html
        component.getDefaultHost().attach("/",
                new Redirector(component.getContext().createChildContext(),
                        "/index.html",
                        Redirector.MODE_CLIENT_SEE_OTHER));

        // Start the component.
        component.start();
<<<<<<< HEAD

        /* 
         //SOCKETS!!!!       
         try {
         String temp=pathToIndexBase2+File.separator+File.separator+"socketConfig"+File.separator+File.separator+"jWebSocket.xml";
         System.out.println("MyDebug");
         System.out.println(temp);
         JWebSocketFactory.start(temp);           
=======
        
        //*************************************************************
        //SOCKETS START!!!!       
        try {
            String temp=pathToIndexBase2+File.separator+File.separator+"socketConfig"+File.separator+File.separator+"jWebSocket.xml";
            System.out.println("MyDebug");
            System.out.println(temp);
            JWebSocketFactory.start(temp);           
>>>>>>> origin/workBranch
            
         
         TokenServer lServer = (TokenServer)JWebSocketFactory.getServer("ts0");
            
         if( lServer != null ) {
         // and add the sample listener to the server's listener chain
         lServer.addListener(new JWebSocketTokenListenerSample());
         } 
           
         } 
         catch (Exception lEx) {
         System.out.println(
         lEx.getClass().getSimpleName()
         + " on starting jWebSocket server: "
         + lEx.getMessage());
         } 
         finally {
         // JWebSocketFactory.stop();
         } 
         */
        
        
        //**************** JETTY SERVER *********************************************
        Server server = new Server(8182);

        ServerConnector connector = new ServerConnector(server);
        connector.setPort(8183);
        server.setConnectors(new Connector[]{connector});

       // ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
        //context.addServlet(HelloServlet.class, "/");
       
         WebSocketHandler wsHandler = new WebSocketHandler() {
            @Override
            public void configure(WebSocketServletFactory factory) {
                factory.register(MyWebSocketHandler.class);
            }
        };
        server.setHandler(wsHandler);
        server.start();
        server.join();

/************* END JETTY SERVER **************************************/
 
        
        
        
        
        //*************************************************************
        // Пример работы: Получения координат по IP
        Location locData = new Location();
        if (locData.getIpGeoBaseDataByIp("213.180.193.1") == 0) {
            locData.getLatitude(); // широта и долгота
            locData.getLongitude();
            System.out.println("City = " + locData.getCityName() + " Country: " + locData.getCountryName());
            System.out.println("Latitude = " + locData.getLatitude() + " Longitude: " + locData.getLongitude());
        } else {
            System.out.println("Произошла ошибка");
        }
<<<<<<< HEAD
        //*************************************************************
=======
         //*************************************************************
        
        //*************************************************************
        // Пример работы: Получения координат по IP
        String ip="91.192.189.223";
        Traceroute TracerouteMy=new Traceroute();
        ArrayList<TracerouteItem> resultMy =TracerouteMy.traceroute(ip);
        for (int i=0; i< resultMy.size(); i++)
        {
            System.out.println(resultMy.get(i).toString());
        }
        
>>>>>>> origin/workBranch
    }

    @Override
    public synchronized Restlet createInboundRoot() {
        // Create a router Restlet that routes each call to a new instance of HelloWorldResource.
        Router router = new Router(getContext());

        // Defines only one route
        router.attach("/hello", HelloWorldResource.class);
        return router;
    }

}
