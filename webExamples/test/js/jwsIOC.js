//	---------------------------------------------------------------------------
//	jWebSocket JavaScript IOC container test specs (Community Edition, CE)
//	---------------------------------------------------------------------------
//	Copyright 2010-2013 Innotrade GmbH (jWebSocket.org)
//  Alexander Schulze, Germany (NRW)
//
//	Licensed under the Apache License, Version 2.0 (the "License");
//	you may not use this file except in compliance with the License.
//	You may obtain a copy of the License at
//
//	http://www.apache.org/licenses/LICENSE-2.0
//
//	Unless required by applicable law or agreed to in writing, software
//	distributed under the License is distributed on an "AS IS" BASIS,
//	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//	See the License for the specific language governing permissions and
//	limitations under the License.
//	---------------------------------------------------------------------------

/**
 * Author: Rolando Santamaria Maso <kyberneees@gmail.com>
 */
var classes = {};
jws.tests.ioc = {

	NS: "jws.tests.ioc", 

	testSetAndGetParameter: function() {	
		var lKey = "name";
		
		it("SetAndGetParameter(1)", function() {
			var lValue = "Rolando S M";
			jws.sc.setParameter(lKey, lValue);
			
			var lReturnValue = jws.sc.getParameter(lKey);
			
			expect(lValue).toEqual(lReturnValue);
		});
			
		it("SetAndGetParameter(2)", function() {
			var lValue1 = "Rolando Santamaria Maso";
			jws.sc.setParameter(lKey, lValue1);
			
			var lReturnValue = jws.sc.getParameter(lKey);
			expect(lValue1).toEqual(lReturnValue);
		});
	},
	
	testSetAndGetService: function() {	
		var lKey = "serv1";
		
		it("SetAndGetService: Without to use the ServiceDefinition class", function() {
			var lValue = {
				plus: function(x, y){
					return x + y;
				}
			};
			jws.sc.setService(lKey, lValue);
			
			var lReturnValue = jws.sc.getService(lKey);
			
			expect(lValue).toEqual(lReturnValue);
		});
	},
	
	testHasAndRemoveParameter: function() {	
		var lKey = "version";
		var lValue = 1.0;
		
		it("HasParameter", function() {
			expect(jws.sc.hasParameter(lKey)).toEqual(false);
			
			jws.sc.setParameter(lKey, lValue);
			
			expect(jws.sc.hasParameter(lKey)).toEqual(true);
		});
		
		it("RemoveParameter", function() {
			expect(jws.sc.removeParameter(lKey)).toEqual(lValue);
			expect(jws.sc.hasParameter(lKey)).toEqual(false);
		});
	},
	
	testHasAndRemoveService: function() {	
		var lKey = "serv2";
		var lValue = {
			mult: function(x, y){
				return x * y;
			}
		};
		
		it("HasService: Without to use the ServiceDefinition class", function() {
			expect(jws.sc.hasService(lKey)).toEqual(false);
			
			jws.sc.setService(lKey, lValue);
			
			expect(jws.sc.hasService(lKey)).toEqual(true);
		});
		
		it("RemoveService: Without to use the ServiceDefinition class", function() {
			expect(jws.sc.removeService(lKey)).toEqual(lValue);
			expect(jws.sc.hasService(lKey)).toEqual(false);
		});
	},
	
	testRegisterAndGetServiceDefinition: function(){
		jws.tests.ioc.MyClass = function MyClass(){
			this._name = null;
			this._service = null;
			this._pi = null;
			
			//Use init-method instead of the constructor
			this.init = function(aArgs){
				this._name = aArgs.name;
				this._service = aArgs.service;
				this._pi = aArgs.pi;
				this._service2 = aArgs.service2;
			}
			
			this.getService2 = function(){
				return this._service2;
			}
			
			//This method needs to be called before the service construction
			this.methodToBeCalled = function(){
				//Facade using the referenced service
				this.plus = function(x, y){
					return this._service.plus(x, y);
				}
			}
			
			this.sayHello = function(){
				return "Hello, " + this._name; 
			}
			
			this.getPi = function(){
				return this._pi;
			}
		}
		
		it("RegisterAndGetServiceDefinition", function() {
			var lServiceName = "myclass";
			var lClassName = "jws.tests.ioc.MyClass";
			
			var lDef = jws.sc.register(lServiceName, lClassName);
			expect(lDef).toEqual(jws.sc.getServiceDefinition(lServiceName));
		});
	},
	
	testCreateGetAndRemoveService: function(){
		var lServiceName = "myclass";
		var lCreated = false;
		var lRemoved = false;
		var lDef = null;
		
		var lPiSource = {
			getPi: function(){
				return 3.141652
			}
		};
		
		jws.tests.ioc.MyClass2 = function MyClass2(){
		}
		
		var lInitialized = false;
		it("CreateService: Using the service definition class", function() {
			var lInitMethod = "init";
			lDef = new jws.ioc.ServiceDefinition({
				className: "jws.tests.ioc.MyClass",
				name: lServiceName,
				aspects: [{
					pointcut: lInitMethod,
					advices: {
						after: function(){
							lInitialized = true;
						}
					}
				}]
			});
			
			lDef.setInitMethod(lInitMethod)
			.setShared(true)
			.setInitArguments({
				name: new jws.ioc.ParameterReference("name"),
				service: new jws.ioc.ServiceReference("serv1"),
				pi: new jws.ioc.MethodExecutionReference(lPiSource,	"getPi"),
				//Testing inner services
				service2: new jws.ioc.ServiceDefinition({
					className: "jws.tests.ioc.MyClass2"
				})
			})
			.setOnCreate(function(aService){
				lCreated = true;
			})
			.setOnRemove(function(aService){
				lRemoved = true;
			})
			.addMethodCall("methodToBeCalled");
			
			jws.sc.addServiceDefinition(lDef);
		});
		
		it("GetService: Using the service definition class", function() {
			var lService = jws.sc.getService(lServiceName);
			
			expect(lService.sayHello()).toEqual("Hello, " + jws.sc.getParameter("name"));
			expect(lService.plus(5, 5)).toEqual(10);
			expect(lService.getPi()).toEqual(lPiSource.getPi());
			expect(lService.getService2()).toEqual(jws.sc.getService("jws.tests.ioc.myclass2"));
			expect(lCreated).toEqual(true);
			expect(lInitialized).toEqual(true);
		});
		
		it("RemoveService: Using the service definition class", function() {
			expect(jws.sc.getService(lServiceName)).toEqual(jws.sc.removeService(lServiceName));
			expect(jws.sc.hasService(lServiceName)).toEqual(false);
			expect(jws.sc.hasServiceDefinition(lServiceName)).toEqual(false);
			expect(lRemoved).toEqual(true);
		});
	},
	
	testFactoryMethod: function(){
		jws.tests.ioc.MyStaticClass = {
			getInstance: function(){
				return {
					method1: function(){
						return "method1";
					}
				}
			}
		};
		
		it("FactoryMethod(1)", function() {
			var lKey = "mystaticclass";
			
			jws.sc.addServiceDefinition(new jws.ioc.ServiceDefinition({
				name: lKey, 
				className: "jws.tests.ioc.MyStaticClass",
				factoryMethod: "getInstance"
			}));
			
			expect(jws.sc.getService(lKey).method1()).toEqual("method1");
		});
		
		jws.tests.ioc.Circle = function Circle(){
			this._radio = 0;
		}
		jws.tests.ioc.Circle.prototype.getRadio = function(){
			return this._radio;
		}
		jws.tests.ioc.Circle.prototype.init = function(aArguments){
			this._radio = aArguments.radio;
		}
		
		jws.tests.ioc.CircleFactory = {
			getInstance: function (aArguments){
				var lCircle = new jws.tests.ioc.Circle();
				lCircle.init(aArguments);
				
				return lCircle;
			}
		}
	
		it("FactoryMethod(2)", function() {
			jws.sc.addServiceDefinition(new jws.ioc.ServiceDefinition({
				className: "jws.tests.ioc.CircleFactory",
				name: "circle",
				factoryMethod: {
					method: "getInstance", 
					arguments: {
						radio: 5
					}
				}
			}));
			
			expect(jws.sc.getService("circle").getRadio()).toEqual(5);
		});
	},
	
	testAnonymousServices: function(){
		it("AnonymousServices: Creating services without names", function() {
			jws.sc.addServiceDefinition(new jws.ioc.ServiceDefinition({
				className: "jws.tests.ioc.MyStaticClass",
				factoryMethod: "getInstance"
			}));
			jws.sc.addServiceDefinition(new jws.ioc.ServiceDefinition({
				className: "jws.tests.ioc.MyStaticClass",
				factoryMethod: "getInstance"
			}));
		});
		
		jws.sc.addServiceDefinition(new jws.ioc.ServiceDefinition({
			className: "jws.tests.ioc.MyStaticClass",
			factoryMethod: "getInstance"
		}));
	},
	
	runSpecs: function() {
		this.testSetAndGetParameter();
		this.testHasAndRemoveParameter();
		this.testSetAndGetService();
		this.testHasAndRemoveService();
		this.testRegisterAndGetServiceDefinition();
		this.testCreateGetAndRemoveService();
		this.testFactoryMethod();
		this.testAnonymousServices();
	},

	runSuite: function() {
		
		// run alls tests as a separate test suite
		var lThis = this;
		
		describe( "Performing test suite: " + this.NS + "...", function () {
			lThis.runSpecs();
		});
	}
};