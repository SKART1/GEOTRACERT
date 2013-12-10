//  ---------------------------------------------------------------------------
//  jWebSocket - Events Plug-in  (Community Edition, CE)
//	---------------------------------------------------------------------------
//	Copyright 2010-2013 Innotrade GmbH (jWebSocket.org)
//	Alexander Schulze, Germany (NRW)
//  Author: Rolando Santamaria Maso
//
//	Licensed under the Apache License, Version 2.0 (the 'License');
//	you may not use this file except in compliance with the License.
//	You may obtain a copy of the License at
//
//	http://www.apache.org/licenses/LICENSE-2.0
//
//	Unless required by applicable law or agreed to in writing, software
//	distributed under the License is distributed on an 'AS IS' BASIS,
//	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//	See the License for the specific language governing permissions and
//	limitations under the License.
//	---------------------------------------------------------------------------

//:package:*:jws
//:class:*:jws.EventsCallbacksHandler
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.EventsCallbacksHandler[/tt] class. _
//:d:en:This class handle request callbacks on the events plug-in
jws.oop.declareClass( 'jws', 'EventsCallbacksHandler', null, {
	OnTimeout: function(aRawRequest, aArgs){
		if (undefined != aArgs.meta['OnTimeout'] && 'function' == typeof(aArgs.meta['OnTimeout'])){
			aArgs.meta.OnTimeout(aRawRequest);
		}
	}
	,
	OnResponse: function(aResponseEvent, aArgs){
		aResponseEvent.elapsedTime = (new Date().getTime()) - aArgs.sentTime;
		aResponseEvent.processingTime = aResponseEvent._pt;
		delete(aResponseEvent._pt);

		if (undefined != aArgs.meta.eventDefinition){
			var lIndex = aArgs.filterChain.length - 1;
			while (lIndex > -1){
				try
				{
					aArgs.filterChain[lIndex].afterCall(aArgs.meta, aResponseEvent);
				}
				catch(err)
				{
					switch (err)
					{
						case 'stop_filter_chain':
							return;
							break;
						default:
							throw err;
							break;
					}
				}
				lIndex--;
			}
		}
		
		if (undefined != aArgs.meta.OnResponse){
			aArgs.meta.OnResponse(aResponseEvent);
		}
		
		if (aResponseEvent.code === 0){
			if (undefined != aArgs.meta.OnSuccess)
				aArgs.meta.OnSuccess(aResponseEvent);
		}
		else {
			if (undefined != aArgs.meta.OnFailure)
				aArgs.meta.OnFailure(aResponseEvent);
		}
	}
});

//:file:*:jwsEventsPlugIn.js
//:d:en:Implements the EventsPlugIn in the client side

//:package:*:jws
//:class:*:jws.EventsNotifier
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.EventsNotifier[/tt] class. _
//:d:en:This class handle raw events notifications to/from the server side.
jws.oop.declareClass( 'jws', 'EventsNotifier', null, {
	ID: ''
	,
	jwsClient: {}
	,
	NS: ''
	,
	filterChain: []
	,
	plugIns: []
	,
	//:m:*:initialize
	//:d:en:Initialize this component. 
	//:a:en::::none
	//:r:*:::void:none
	initialize : function(){
		//Registering the notifier as plug-in of the used connection
		this.jwsClient.addPlugIn(this);
		
		//Initializing each filters
		for (var lIndex = 0, lEnd = this.filterChain.length; lIndex < lEnd; lIndex++){
			if (this.filterChain[lIndex]['initialize']){
				this.filterChain[lIndex].initialize(this);
			}
		}
	}
	,
	//:m:*:notify
	//:d:en:Notify an event in the server side
	//:a:en::aEventName:String:The event name.
	//:a:en::aOptions:Object:Contains the event arguments and the OnResponse, OnSuccess and OnFailure callbacks.
	//:r:*:::void:none
	notify: function(aEventName, aOptions){
		if (this.jwsClient.isConnected()){
			var lToken = {};
			if (aOptions.args){
				lToken = aOptions.args;
				delete (aOptions.args);
			}
			lToken.ns   = this.NS;
			lToken.type = aEventName;
			
			aOptions.UTID = jws.tools.generateSharedUTID(lToken);
			
			var lRequest;
			if (!aOptions['OnResponse'] && !aOptions['OnSuccess'] && !aOptions['OnFailure'] && !aOptions['OnTimeout']){
				lRequest = {};
			}
			else{
				lRequest = new jws.EventsCallbacksHandler();	
			}
			
			lRequest.args = {
				meta: aOptions,
				filterChain: this.filterChain,
				sentTime: new Date().getTime()
			};
			
			
			if (undefined != aOptions.eventDefinition){
				for (var i = 0; i < this.filterChain.length; i++){
					try {
						this.filterChain[i].beforeCall(lToken, lRequest);
					}
					catch(err) {
						switch (err) {
							case 'stop_filter_chain':
								return;
								break;
							default:
								throw err;
								break;
						}
					}
				}
			}
			
			this.jwsClient.sendToken(lToken, lRequest);
		}
		else
			jws.console.error( 'client:not_connected' );
	}
	,
	//:m:*:processToken
	//:d:en:Processes an incoming token. Used to support S2C events notifications. _
	//:d:en:Use the 'event_name' and 'plugin_id' information to execute _
	//:d:en:a targered method in a plug-in.
	//:a:en::aToken:Object:Token to be processed
	//:r:*:::void:none
	processToken: function (aToken) {
		if ((this.NS == aToken.ns && 'auth.logon' == aToken.reqType && 0 == aToken.code)){
			this.user.principal = aToken.username;
			this.user.uuid = aToken.uuid;
			this.user.roles = aToken.roles;
		}
		else if ((this.NS == aToken.ns && 'auth.logoff' == aToken.reqType && 0 == aToken.code)){
			this.user.clear();
		} 
		else if (this.NS == aToken.ns && 's2c.en' == aToken.type){
			var lMethod = aToken._e;
			var lPlugIn = aToken._p;

			if (undefined != this.plugIns[lPlugIn] && undefined != this.plugIns[lPlugIn][lMethod]){
				var lStartTime = new Date().getTime();
				var lRes = this.plugIns[lPlugIn][lMethod](aToken);
				var lProcessingTime = (new Date().getTime()) - lStartTime;

				//Sending response back to the server if the event notification
				//has a callback
				if (aToken.hc){
					this.notify('s2c.r', {
						args: {
							_rid: aToken.uid,
							_r: lRes,
							_pt: lProcessingTime
						}
					});
				}
			}
			else {
				//Sending the 'not supported' event notification
				this.notify('s2c.ens', {
					args: {
						_rid: aToken.uid
					}
				});
				jws.console.error( 's2c_event_support_not_found for: ' + lMethod );
			}
		}
	}
});

//:package:*:jws
//:class:*:jws.EventsPlugInGenerator
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.EventsPlugInGenerator[/tt] class. _
//:d:en:This class handle the generation of server plug-ins as _
//:d:en:Javascript objects.
jws.oop.declareClass( 'jws', 'EventsPlugInGenerator', null, {

	//:m:*:generate
	//:d:en:Processes an incoming token. Used to support S2C events notifications. _
	//:a:en::aPlugInId:String:Remote plug-in 'id' to generate in the client.
	//:a:en::aNotifier:jws.EventsNotifier:The event notifier used to connect with the server.
	//:a:en::aCallbacks:Function:This callback is called when the plug-in has been generated successfully.
	//:a:en::aCallbacks:Object:Contains the OnSuccess and OnFailure callbacks
	//:r:*:::void:none
	generate: function(aPlugInId, aNotifier, aCallbacks){
		var lPlugIn = new jws.EventsPlugIn();
		lPlugIn.notifier = aNotifier;

		aNotifier.notify('plugin.getapi', {
			args: {
				plugin_id: aPlugInId
			}
			,
			plugIn: lPlugIn
			,
			callbacks: aCallbacks
			,
			OnSuccess: function(aResponseEvent){
				this.plugIn.id = aResponseEvent.id;
				this.plugIn.plugInAPI = aResponseEvent.api;

				//Generating the plugin methods
				for (method in aResponseEvent.api){
					eval('this.plugIn.' + method + '=function(aOptions){if (undefined == aOptions){aOptions = {};};var eventName=this.plugInAPI.'+method+'.type; aOptions.eventDefinition=this.plugInAPI.'+ method + '; aOptions.timeout = this.plugInAPI.'+method+'.timeout; this.notifier.notify(eventName, aOptions);}')
				}

				//Registering the plugin in the notifier
				this.plugIn.notifier.plugIns[this.plugIn.id] = this.plugIn;

				//Plugin is generated successfully
				if ('function' == typeof(this.callbacks)){
					this.callbacks(this.plugIn);
				} else if ('function' == typeof( this.callbacks['OnSuccess'] )){
					this.callbacks.OnSuccess(this.plugIn);
				}
			}
			,
			OnFailure: function(aResponseEvent){
				if ('function' == typeof( this.callbacks['OnFailure'] )){
					this.callbacks.OnFailure(this.plugIn);
				} else {
					jws.console.error('Failure generating plug-in: ' + aResponseEvent.msg );
				}
			}	
		});

		return lPlugIn;
	}
});

//:package:*:jws
//:class:*:jws.EventsPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.EventsPlugIn[/tt] class. _
//:d:en:This class represents an abstract client plug-in. The methods are _
//:d:en:generated in runtime.
jws.oop.declareClass( 'jws', 'EventsPlugIn', null, {
	id: ''
	,
	notifier: {}
	,
	plugInAPI: {}
	
//Methods are generated in runtime!
//Custom methods can be added using the OnReady callback
});

//:package:*:jws
//:class:*:jws.AppUser
//:ancestor:*:-
//:d:en:Application user instance.
jws.oop.declareClass( 'jws', 'AppUser', null, {
	principal: ''
	,
	uuid: ''
	,
	roles: []
	,
	//:m:*:clear
	//:d:en:Clear the user instance
	//:r:*:::void:none
	clear: function (){
		this.principal = '';
		this.roles = [];
		this.uuid = '';
	}
	,
	//:m:*:isAuthenticated
	//:d:en:Returns TRUE if the user is authenticated, FALSE otherwise
	//:r:*:::boolean:none
	isAuthenticated: function(){
		return (this.principal)? true : false
	}
	,
	//:m:*:hasRole
	//:d:en:TRUE if the user have the given role, FALSE otherwise
	//:a:en::r:String:A role
	//:r:*:::boolean:none
	hasRole: function(aRole){
		var lEnd = this.roles.length;
		
		for (var lIndex = 0; lIndex < lEnd; lIndex++){
			if (aRole == this.roles[lIndex])
				return true
		}
	
		return false;
	}
});


//:package:*:jws
//:class:*:jws.EventsBaseFilter
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.EventsBaseFilter[/tt] class. _
//:d:en:This class represents an abstract client filter.
jws.oop.declareClass( 'jws', 'EventsBaseFilter', null, {
	id: ''
	,
	
	//:m:*:initialize
	//:d:en:Initialize the filter instance
	//:a:en::aNotifier:jws.EventsNotifier:The filter notifier
	//:r:*:::void:none
	initialize: function(aNotifier){}
	,

	//:m:*:beforeCall
	//:d:en:This method is called before every C2S event notification.
	//:a:en::aToken:Object:The token to be filtered.
	//:a:en::aRequest:Object:The OnResponse callback to be called.
	//:r:*:::void:none
	beforeCall: function(aToken, aRequest){}
	,
	//:m:*:afterCall
	//:d:en:This method is called after every C2S event notification.
	//:a:en::aRequest:Object:The request to be filtered.
	//:a:en::aResponseEvent:Object:The response token from the server.
	//:r:*:::void:none
	afterCall: function(aRequest, aResponseEvent){}
});

//:package:*:jws
//:class:*:jws.SecurityFilter
//:ancestor:*:jws.EventsBaseFilter
//:d:en:Implementation of the [tt]jws.SecurityFilter[/tt] class. _
//:d:en:This class handle the security for every C2S event notification _
//:d:en:in the client, using the server side security configuration.
jws.oop.declareClass( 'jws', 'SecurityFilter', jws.EventsBaseFilter, {
	id: 'security'
	,
	user: null
	,
	initialize: function(aNotifier){
		aNotifier.user = new jws.AppUser();
		this.user = aNotifier.user;
	},
	
	//:m:*:beforeCall
	//:d:en:This method is called before every C2S event notification. _
	//:d:en:Checks that the logged in user has the correct roles to notify _
	//:d:en:a custom event in the server.
	//:a:en::aToken:Object:The token to be filtered.
	//:a:en::aRequest:Object:The OnResponse callback to be called.
	//:r:*:::void:none
	beforeCall: function(aToken, aRequest){
		if (aRequest.args.meta.eventDefinition.isSecurityEnabled){
			var lR, lU;
			var lRoles, lUsers = null;
			var lExclusion = false;
			var lRoleAuthorized = false;
			var lUserAuthorized = false;
			var lStop = false;
			
			//@TODO: Support IP addresses restrictions checks on the JS client

			//Getting users restrictions
			lUsers = aRequest.args.meta.eventDefinition.users;

			//Getting roles restrictions
			lRoles = aRequest.args.meta.eventDefinition.roles;
			
			//Avoid unnecessary checks if the user is not authenticated
			if (lUsers && lRoles && !this.user.isAuthenticated()){
				if (aRequest.OnResponse){
					aRequest.OnResponse({
						code: -2,
						msg: 'User is not authenticated yet. Login first!'
					}, aRequest.args);
				}
				this.OnNotAuthorized(aToken);
				throw 'stop_filter_chain';
			}

			//Checking if the user have the allowed roles
			if (lUsers.length > 0){
				var lUserMatch = false;
				for (var k = 0; k < lUsers.length; k++){
					lU = lUsers[k];
					
					if ('all' != lU){
						lExclusion = (lU.substring(0,1) == '!') ? true : false;
						lU = (lExclusion) ? lU.substring(1) : lU;

						if (lU == this.user.principal){
							lUserMatch = true;
							if (!lExclusion){
								lUserAuthorized = true;
							}
							break;
						}
					} else {
						lUserMatch = true;
						lUserAuthorized = true;
						break;
					}
				}

				//Not Authorized USER
				if (!lUserAuthorized && lUserMatch || 0 == lRoles.length){
					aRequest.OnResponse({
						code: -2,
						msg: 'Not autorized to notify this event. USER restrictions: ' + lUsers.toString()
					}, aRequest.args);
					
					this.OnNotAuthorized(aToken);
					throw 'stop_filter_chain';
				}
			}

			//Checking if the user have the allowed roles
			if (lRoles.length > 0){
				for (var i = 0; i < lRoles.length; i++){
					for (var j = 0; j < this.user.roles.length; j++){
						lR = lRoles[i];
					
						if ('all' != lR){
							lExclusion = (lR.substring(0,1) == '!') ? true : false;
							lR = (lExclusion) ? lR.substring(1) : lR;

							if (lR == this.user.roles[j]){
								if (!lExclusion){
									lRoleAuthorized = true;
								}
								lStop = true;
								break;
							}
						} else {
							lRoleAuthorized = true;
							lStop = true;
							break;
						}	
					}
					if (lStop){
						break;
					}
				}

				//Not Authorized ROLE
				if (!lRoleAuthorized){
					if (aRequest.OnResponse){
						aRequest.OnResponse({
							code: -2,
							msg: 'Not autorized to notify this event. ROLE restrictions: ' + lRoles.toString()
						}, aRequest.args);
					}
					this.OnNotAuthorized(aToken);
					throw 'stop_filter_chain';
				}
			}
		}
	}
	,
	//:m:*:OnNotAuthorized
	//:d:en:This method is called when a 'not authorized' event notification _
	//:d:en:is detected. Allows to define a global behiavor for this kind _
	//:d:en:of exception.
	//:a:en::aToken:Object:The 'not authorized' token to be processed.
	//:r:*:::void:none
	OnNotAuthorized: function(aToken){
		jws.console.error( 'not_authorized' );
	}
});

//:package:*:jws
//:class:*:jws.CacheFilter
//:ancestor:*:jws.EventsBaseFilter
//:d:en:Implementation of the [tt]jws.CacheFilter[/tt] class. _
//:d:en:This class handle the cache for every C2S event notification _
//:d:en:in the client, using the server side cache configuration.
jws.oop.declareClass( 'jws', 'CacheFilter', jws.EventsBaseFilter, {
	id: 'cache'
	,
	cache:{}
	,
	user: null
	,
	initialize: function(aNotifier){
		// setting the user instance reference
		this.user = aNotifier.user;
		
		// notifying to the server that cache is enabled in the client
		aNotifier.notify('clientcacheaspect.setstatus', {
			args: {
				enabled: true
			}
		});
		
		// supporting clean cache entries event from the server
		var lFilter = this;
		aNotifier.plugIns['__cache__'] = {
			cleanEntries: function(event){
				for (var i = 0, end = event.entries.length; i < end; i++){
					lFilter.cache.removeItem_(lFilter.user.principal.toString() + event.suffix + event.entries[i]);
				}
			}
		}
	}
	,
	//:m:*:beforeCall
	//:d:en:This method is called before every C2S event notification. _
	//:d:en:Checks if exist a non-expired cached response for the outgoing event. _
	//:d:en:If TRUE, the cached response is used and the server is not notified.
	//:a:en::aToken:Object:The token to be filtered.
	//:a:en::aRequest:jws.OnResponseObject:The OnResponse callback to be called.
	//:r:*:::void:none
	beforeCall: function(aToken, aRequest){
		if (aRequest.args.meta.eventDefinition.isCacheEnabled){
			var lKey = aRequest.args.meta.eventDefinition.type + aRequest.args.meta.UTID;
			
			//Storing in the user private cache storage if required
			if (aRequest.args.meta.eventDefinition.isCachePrivate && this.user.isAuthenticated()){
				lKey = this.user.uuid + lKey;
			}
			
			var lCachedResponseEvent = this.cache.getItem(lKey);

			if (null != lCachedResponseEvent){
				//Setting the processing time of the cached response to 0
				lCachedResponseEvent.processingTime = 0;
				
				//Updating the elapsed time
				aRequest.args.meta.elapsedTime = (new Date().getTime()) - aRequest.sentTime;
				
				//Calling the OnResponse callback
				if (aRequest.OnResponse){
					aRequest.OnResponse(lCachedResponseEvent, aRequest.args);
				}
				
				throw 'stop_filter_chain';
			}
		}
	}
	,
	//:m:*:afterCall
	//:d:en:This method is called after every C2S event notification. _
	//:d:en:Checks if a response needs to be cached. The server configuration _
	//:d:en:for cache used.
	//:a:en::aRequest:Object:The request to be filtered.
	//:a:en::aResponseEvent:Object:The response token from the server.
	//:r:*:::void:none
	afterCall: function(aRequest, aResponseEvent){
		if (aRequest.eventDefinition.isCacheEnabled){
			var lKey = aRequest.eventDefinition.type 
			+ aRequest.UTID;

			//Storing in the user private cache storage if required
			if (aRequest.eventDefinition.isCachePrivate){
				lKey = this.user.uuid + lKey;
			}
			
			this.cache.setItem(lKey, aResponseEvent, {
				expirationAbsolute: null,
				expirationSliding: aRequest.eventDefinition.cacheTime,
				priority: CachePriority.High
			});
		}
	}
});

//:package:*:jws
//:class:*:jws.ValidatorFilter
//:ancestor:*:jws.EventsBaseFilter
//:d:en:Implementation of the [tt]jws.ValidatorFilter[/tt] class. _
//:d:en:This class handle the validation for every argument in the request.
jws.oop.declareClass( 'jws', 'ValidatorFilter', jws.EventsBaseFilter, {
	id: 'validator'
	,
	
	//:m:*:beforeCall
	//:d:en:This method is called before every C2S event notification. _
	//:d:en:Checks if the request arguments match with the validation server rules.
	//:a:en::aToken:Object:The token to be filtered.
	//:a:en::aRequest:jws.OnResponseObject:The OnResponse callback to be called.
	//:r:*:::void:none
	beforeCall: function(aToken, aRequest){
		var lArguments = aRequest.args.meta.eventDefinition.incomingArgsValidation;
		
		for (var i = 0; i < lArguments.length; i++){
			if (undefined === aToken[lArguments[i].name] && !lArguments[i].optional){
				if (aRequest.OnResponse){
					aRequest.OnResponse({
						code: -4,
						msg: 'Argument \''+lArguments[i].name+'\' is required!'
					}, aRequest.args);
				}
				throw 'stop_filter_chain';
			}else if (aToken.hasOwnProperty(lArguments[i].name)){
				var lRequiredType = lArguments[i].type;
				var lArgumentType = jws.tools.getType(aToken[lArguments[i].name]);
				
				//Supporting the numberic types domain
				if ('number' == lRequiredType && ('integer' == lArgumentType || 'double' == lArgumentType)){
					return;
				}
				if ('double' == lRequiredType && ('integer' == lArgumentType)){
					return;
				}
				if (lRequiredType != lArgumentType){
					if (aRequest.OnResponse){
						aRequest.OnResponse({
							code: -4,
							msg: 'Argument \''+lArguments[i].name+'\' has invalid type. Required type is: \''+lRequiredType+'\'!'
						}, aRequest.args);
					}
					throw 'stop_filter_chain';
				}
			}
		}
	}
});
