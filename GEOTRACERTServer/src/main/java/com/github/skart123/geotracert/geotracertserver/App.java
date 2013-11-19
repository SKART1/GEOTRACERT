package com.github.skart123.geotracert.geotracertserver;

/**
 * Hello world!
 *
 */






import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.restlet.Application;
import org.restlet.Component;
import org.restlet.Restlet;
import org.restlet.data.Protocol;
import org.restlet.data.Reference;
import org.restlet.resource.Directory;
import org.restlet.routing.Redirector;
import org.restlet.routing.Router;




public class App extends Application
{    
   static final String pathToIndexBase1 = App.class.getProtectionDomain().getCodeSource().getLocation().getPath();
    static String pathToIndexBaseCorrect1; 
   
   static final File parentDir = new File(new File("").getAbsolutePath());
   static final String pathToIndexBase2=parentDir.getAbsolutePath();
   static String pathToIndexBaseCorrect2;

     /**
     * Creates a root Restlet that will receive all incoming calls.
     */
     public static void main(String[] args) throws Exception {

            
        pathToIndexBaseCorrect1="file:////"+pathToIndexBase1.substring(0, pathToIndexBase1.indexOf("target")+6)+"/clientFolder";
       // "file:///"  /*File.separator+ File.separator*/+ROOT_URI4+"/clientFolder"
        pathToIndexBaseCorrect2="file:\\\\"+pathToIndexBase2.replaceAll("/", File.separator)+"\\target\\clientFolder";
          // Create a new Component.     
        Component component = new Component();
       
       
        
        System.out.println("App.class.getProtectionDomain().getCodeSource().getLocation().getPath()"); 
        System.out.println(pathToIndexBaseCorrect1);
        System.out.println("File"+File.pathSeparator+File.pathSeparator);
        System.out.println(pathToIndexBaseCorrect2);       
     
        
        
        
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
        
        component.getDefaultHost().attach("/hello",new App());
        
         component.getDefaultHost().attach("/",
                                      new Redirector(component.getContext().createChildContext(),
                                                     "/index.html",
                                                     Redirector.MODE_CLIENT_SEE_OTHER));
        
        // Start the component.
        component.start();
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

