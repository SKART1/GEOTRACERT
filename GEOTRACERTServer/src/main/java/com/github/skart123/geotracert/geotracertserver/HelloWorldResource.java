/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.github.skart123.geotracert.geotracertserver;



import org.restlet.resource.Get;
import org.restlet.resource.ServerResource;

/**
 * Resource which has only one representation.
 * 
 */
public class HelloWorldResource extends ServerResource {

    @Get
    public String represent() {
        return "hello, everybody!";
    }

}
   