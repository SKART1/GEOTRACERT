package com.github.skart123.geotracert.geotracertserver;

/**
 * Hello world!
 *
 */
import java.io.File;
import org.jwebsocket.config.JWebSocketCommonConstants;
import org.jwebsocket.config.JWebSocketConfig;
import org.jwebsocket.config.JWebSocketServerConstants;
import org.jwebsocket.console.JWebSocketCustomListenerSample;
import org.jwebsocket.console.JWebSocketTokenListenerSample;
import org.jwebsocket.factory.JWebSocketFactory;
import org.jwebsocket.instance.JWebSocketInstance;
import org.jwebsocket.server.CustomServer;
import org.jwebsocket.server.TokenServer;
import org.restlet.Application;
import org.restlet.Component;
import org.restlet.Restlet;
import org.restlet.Server;
import org.restlet.data.Protocol;
import org.restlet.resource.Directory;
import org.restlet.routing.Redirector;

public class App extends Application {

    //Solution 1 for relative paths
    static final String pathToIndexBase1 = App.class.getProtectionDomain().getCodeSource().getLocation().getPath();
    static String pathToIndexBaseCorrect1;

    //Solution 2 for relative paths
    static final File parentDir = new File(new File("").getAbsolutePath());
    static final String pathToIndexBase2 = parentDir.getAbsolutePath();
    static String pathToIndexBaseCorrect2;
    private static Server arr;


    /**
     * Creates a root Restlet that will receive all incoming calls.
     */
    public static void main(String[] args) throws Exception {

        //Solution 1    
        pathToIndexBaseCorrect1 = "file:////" + pathToIndexBase1.substring(0, pathToIndexBase1.indexOf("target") + 6) + "/clientFolder";

        //Solution 2
        pathToIndexBaseCorrect2 = "file:" + File.separator + File.separator + File.separator + File.separator + pathToIndexBase2.replaceAll("/", File.separator) + File.separator + File.separator + "target" + File.separator + File.separator + "clientFolder";

        Component component = new Component();

        /*System.out.println("App.class.getProtectionDomain().getCodeSource().getLocation().getPath()"); 
         System.out.println(pathToIndexBaseCorrect1);
         System.out.println("File"+File.pathSeparator+File.pathSeparator);
         System.out.println(pathToIndexBaseCorrect2);     */
        arr = component.getServers().add(Protocol.HTTP, 8787); //jWebSocket требует обращаться именно к 8787 порту
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

        // Attach the application to the component 
        //main page: index.html
        component.getDefaultHost().attach("/index.html", application);

        //just for fun page /hello/hello
        //  component.getDefaultHost().attach("/hello", new App());
        
        //redirector from / to /index.html
        component.getDefaultHost().attach("/",
                new Redirector(component.getContext().createChildContext(), "/index.html", Redirector.MODE_CLIENT_SEE_OTHER));

        // Start the component.
        component.start();

        
        ////////////////////////////////////////////////////////////////////////////////
        
        /*    JHost host = new JHost();
         host.init();
         System.out.println("ПРОВЕРКА host.init");*/
        System.out.println("jWebSocket Ver. " + JWebSocketServerConstants.VERSION_STR + " (" + System.getProperty("sun.arch.data.model") + "bit)");
        System.out.println(JWebSocketCommonConstants.COPYRIGHT_EE);
        System.out.println(JWebSocketCommonConstants.LICENSE_EE);
       // System.out.println(JWebSocketCommonConstants.DEFAULT_PORT);
       // System.out.println("Log files per default in jWebSocket.log if not overwritten in jWebSocket.xml.\n\n");

        
        JWebSocketFactory.run();
        // the following line must not be removed due to GNU LGPL 3.0 license!  
        JWebSocketFactory.printCopyrightToConsole();
        // check if home, config or bootstrap path are passed by command line  
        JWebSocketConfig.initForConsoleApp(args);
        JWebSocketFactory.start();

        // get the token server
        TokenServer lTS0 = (TokenServer) JWebSocketFactory.getServer("ts0");
        if (lTS0 != null) {
            System.out.println("Server was found!");
            // and add the sample listener to the server's listener chain
            lTS0.addListener(new JWebSocketTokenListenerSample());
        }
        else {
            System.out.println("Server was NOT found!");
        }

        // get the custom server
        CustomServer lCS0 = (CustomServer) JWebSocketFactory.getServer("cs0");
        if (lCS0 != null) {
            // and add the sample listener to the server's listener chain
            lCS0.addListener(new JWebSocketCustomListenerSample());
        }

        // remain here until shut down request
        while (JWebSocketInstance.getStatus() != JWebSocketInstance.SHUTTING_DOWN) {
            try {
                Thread.sleep(250);
            } catch (InterruptedException ex) {
                // no handling required here
            }
        }

        JWebSocketFactory.stop();
    }


    /* @Override
     public synchronized Restlet createInboundRoot() {
     // Create a router Restlet that routes each call to a new instance of HelloWorldResource.
     Router router = new Router(getContext());
     // Defines only one route
     router.attach("/hello", HelloWorldResource.class);
     return router;
     }*/
}
