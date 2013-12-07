package com.github.skart123.geotracert.geotracertserver;

/**
 * Hello world!
 *
 */






import java.io.File;
import org.jwebsocket.config.JWebSocketConfig;
import org.jwebsocket.config.JWebSocketServerConstants;
import org.jwebsocket.factory.JWebSocketFactory;
import org.jwebsocket.server.TokenServer;
import org.restlet.Application;
import org.restlet.Component;
import org.restlet.Restlet;
import org.restlet.data.Protocol;
import org.restlet.resource.Directory;
import org.restlet.routing.Redirector;
import org.restlet.routing.Router;




public class App extends Application
{    
   //Solution 1 for relative paths
   static final String pathToIndexBase1 = App.class.getProtectionDomain().getCodeSource().getLocation().getPath();
   static String pathToIndexBaseCorrect1; 
   
   //Solution 2 for relative paths
   static final File parentDir = new File(new File("").getAbsolutePath());
   static final String pathToIndexBase2=parentDir.getAbsolutePath();
   static String pathToIndexBaseCorrect2;

     /**
     * Creates a root Restlet that will receive all incoming calls.
     */
     public static void main(String[] args) throws Exception {

        //Solution 1    
        pathToIndexBaseCorrect1="file:////"+pathToIndexBase1.substring(0, pathToIndexBase1.indexOf("target")+6)+"/clientFolder";
       
        //Solution 2
        pathToIndexBaseCorrect2="file:"+File.separator+File.separator+File.separator+File.separator+pathToIndexBase2.replaceAll("/", File.separator)+File.separator+File.separator+"target"+File.separator+File.separator+"clientFolder";
       
        Component component = new Component();
       
       
        
        /*System.out.println("App.class.getProtectionDomain().getCodeSource().getLocation().getPath()"); 
        System.out.println(pathToIndexBaseCorrect1);
        System.out.println("File"+File.pathSeparator+File.pathSeparator);
        System.out.println(pathToIndexBaseCorrect2);     */  
        
        
        component.getServers().add(Protocol.HTTP, 8182);  
        component.getClients().add(Protocol.FILE );  
        
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
        component.getDefaultHost().attach("/index.html",application); 
        
         //just for fun page /hello/hello
        component.getDefaultHost().attach("/hello",new App());
        
         //redirector from / to /index.html
         component.getDefaultHost().attach("/",
                                      new Redirector(component.getContext().createChildContext(),
                                                     "/index.html",
                                                     Redirector.MODE_CLIENT_SEE_OTHER));
        
        // Start the component.
        component.start();
        
        
        //SOCKETS!!!!
        // We MUST show this to Licence Agreement
        System.setProperty(JWebSocketServerConstants.JWEBSOCKET_HOME, pathToIndexBase2);
        System.out.println(System.getProperty(JWebSocketServerConstants.JWEBSOCKET_HOME));
                
        JWebSocketFactory.printCopyrightToConsole();
                
        // check if home, config or bootstrap path are passed by command line
        JWebSocketConfig.initForConsoleApp(args);

        try {
            // start the jWebSocket Server
            JWebSocketFactory.start();

            TokenServer lServer = (TokenServer)JWebSocketFactory.getServer("ts0");
            //TokenServer lServer = JWebSocketFactory.getTokenServer();
            if( lServer != null ) {
              // and add the sample listener to the server's listener chain
              lServer.addListener(new JWebSocketTokenListenerSample());
            }


            // run server until shut down request
            JWebSocketFactory.run();          
       } 
        catch (Exception lEx) {
                System.out.println(
                                lEx.getClass().getSimpleName()
                                + " on starting jWebSocket server: "
                                + lEx.getMessage());
        } 
        finally {
                JWebSocketFactory.stop();
        }       
    }
    
    @Override
    public synchronized Restlet createInboundRoot() {
        // Create a router Restlet that routes each call to a new instance of HelloWorldResource.
        Router router = new Router(getContext());

        // Defines only one route
        router.attach("/hello",HelloWorldResource.class);    
        return router;
    }   
}

