package com.github.skart123.geotracert.geotracertserver;

/**
 * Hello world!
 *
 */






import org.restlet.Application;
import org.restlet.Component;
import org.restlet.Restlet;
import org.restlet.data.Protocol;
import org.restlet.data.Reference;
import org.restlet.resource.Directory;
import org.restlet.routing.Router;



public class App extends Application{
     public static final String ROOT_URI = "file:///C:/Users/art/Documents/GitHub/temp8/GEOTRACERT/GEOTRACERTServer/target/clientFolder/"; 
     public static final String ROOT_URI2 = "file:///C:/Users/art/Documents/GitHub/temp8/GEOTRACERT/GEOTRACERTServer/target/clientFolder/"; 
      /**
     * Creates a root Restlet that will receive all incoming calls.
     */
     public static void main(String[] args) throws Exception {
        // Create a new Component.
        Component component = new Component();

        // Add a new HTTP server listening on port 8182.
       /* component.getServers().add(Protocol.HTTP, 8182);

        // Attach the sample application.
        component.getDefaultHost().attach("/firstSteps", new App());*/
        
        
        
        component.getServers().add(Protocol.HTTP, 8182);  
        component.getClients().add(Protocol.FILE );  
        // Create an application 
        
        Application application = new Application() {  
            @Override  
            public Restlet createInboundRoot() {  
                //Конструктор ресурса
                     Directory temp= new Directory(getContext(), ROOT_URI); 
                    // Reference temp2=temp.getRootRef();
                     //temp.s
                    // temp2.setBaseRef(ROOT_URI2);
                    // temp.setRootRef(temp2);
                   //  temp2=temp.getRootRef();
                     return temp;
                
            }  
        }; 
        
        
        
        // Attach the application to the component and 
       // component.getDefaultHost().attach("/trace2",new App());  
        
        component.getDefaultHost().attach("",application);  
        
        component.getDefaultHost().attach("/hello",new App());
        
     //    component.getDefaultHost().attach("/",
    //                                  new Redirector(component.getContext().createChildContext(),
      //                                               " {rh}/C:/Users/art/Documents/GitHub/temp8/GEOTRACERT/GEOTRACERTServer/target/clientFolder/index.html",
      //                                               Redirector.MODE_CLIENT_SEE_OTHER));
        
        // Start the component.
        component.start();
    }
    
    @Override
    public synchronized Restlet createInboundRoot() {
        // Create a router Restlet that routes each call to a new instance of HelloWorldResource.
        Router router = new Router(getContext());

        // Defines only one route
        router.attach("/hello",HelloWorldResource.class);
 
    // Print the requested URI path  
        
  
     
        return router;
    }

    
}

