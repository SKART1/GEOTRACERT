//	---------------------------------------------------------------------------
//	jWebSocket Channel Plug-in (Community Edition, CE)
//	---------------------------------------------------------------------------
//	Copyright 2010-2013 Innotrade GmbH (jWebSocket.org)
//	Alexander Schulze, Germany (NRW)
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

//:package:*:jws
//:class:*:jws.ChannelPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.ChannelPlugIn[/tt] class. This _
//:d:en:plug-in provides the methods to subscribe and unsubscribe at certain _
//:d:en:channel sn the server.
jws.ChannelPlugIn = {
	//:const:*:NS:String:org.jwebsocket.plugins.channels (jws.NS_BASE + ".plugins.channels")
	//:d:en:Namespace for the [tt]ChannelPlugIn[/tt] class.
	// if namespace changes update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.channels",
	SUBSCRIBE: "subscribe",
	UNSUBSCRIBE: "unsubscribe",
	GET_CHANNELS: "getChannels",
	CREATE_CHANNEL: "createChannel",
	MODIFY_CHANNEL: "modifyChannel",
	REMOVE_CHANNEL: "removeChannel",
	GET_SUBSCRIBERS: "getSubscribers",
	GET_PUBLISHERS: "getPublishers",
	GET_SUBSCRIPTIONS: "getSubscriptions",
	AUTHORIZE: "authorize",
	PUBLISH: "publish",
	STOP: "stopChannel",
	START: "startChannel",
	processToken: function(aToken) {
		// check if namespace matches
		if (aToken.ns == jws.ChannelPlugIn.NS) {
			// here you can handle incoming tokens from the server
			// directy in the plug-in if desired.
			if ("event" == aToken.type) {
				if ("channelCreated" == aToken.name) {
					if (this.fOnChannelCreated) {
						this.fOnChannelCreated(aToken);
					}
				} else if ("channelRemoved" == aToken.name) {
					if (this.fOnChannelRemoved) {
						this.fOnChannelRemoved(aToken);
					}
				} else if ("channelStarted" == aToken.name) {
					if (this.fOnChannelStarted) {
						this.fOnChannelStarted(aToken);
					}
				} else if ("channelStopped" == aToken.name) {
					if (this.fOnChannelStopped) {
						this.fOnChannelStopped(aToken);
					}
				} else if ("subscription" == aToken.name) {
					if (this.fOnChannelSubscription) {
						this.fOnChannelSubscription(aToken);
					}
				} else if ("unsubscription" == aToken.name) {
					if (this.fOnChannelUnsubscription) {
						this.fOnChannelUnsubscription(aToken);
					}
				}
			} else if ("getChannels" == aToken.reqType) {
				if (this.fOnChannelsReceived) {
					this.fOnChannelsReceived(aToken);
				}
			} else if ("data" == aToken.type) {
				if (this.fOnChannelBroadcast) {
					this.fOnChannelBroadcast(aToken);
				}
			} else if (aToken.type == "response" &&
					this.CREATE_CHANNEL == aToken.reqType && aToken.isPrivate) {
				// When a private channel is created the callback 
				// OnChannelCreated is fired to the user
				if (this.fOnChannelCreated) {
					this.fOnChannelCreated(aToken);
				}
			}
		}
	},
	//:m:*:channelSubscribe
	//:d:en:Registers the client at the given channel on the server. _
	//:d:en:After this operation the client obtains all messages on this _
	//:d:en:channel. Basically, a client can subscribe at multiple channels.
	//:d:en:If no channel with the given ID exists on the server an error token _
	//:d:en:is returned. Depending on the type of the channel it may take more _
	//:d:en:or less time until you get the first token from the channel.
	//:a:en::aChannel:String:The id of the server side data channel.
	//:r:*:::void:none
	channelSubscribe: function(aChannel, aAccessKey, aOptions) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			this.sendToken({
				ns: jws.ChannelPlugIn.NS,
				type: jws.ChannelPlugIn.SUBSCRIBE,
				channel: aChannel,
				accessKey: aAccessKey
			}, aOptions);
		}
		return lRes;
	},
	//:m:*:channelUnsubscribe
	//:d:en:Unsubscribes the client from the given channel on the server.
	//:d:en:From this point in time the client does not receive any messages _
	//:d:en:on this channel anymore.
	//:a:en::aChannel:String:The id of the server side data channel.
	//:r:*:::void:none
	channelUnsubscribe: function(aChannel, aOptions) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			this.sendToken({
				ns: jws.ChannelPlugIn.NS,
				type: jws.ChannelPlugIn.UNSUBSCRIBE,
				channel: aChannel
			}, aOptions);
		}
		return lRes;
	},
	//:m:*:channelAuth
	//:d:en:Authenticates the client at a certain channel to publish messages.
	//:a:en::aChannel:String:The id of the server side data channel.
	//:a:en::aAccessKey:String:Access key configured for the channel.
	//:a:en::aSecretKey:String:Secret key configured for the channel.
	//:r:*:::void:none
	channelAuth: function(aChannel, aAccessKey, aSecretKey, aOptions) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			this.sendToken({
				ns: jws.ChannelPlugIn.NS,
				type: jws.ChannelPlugIn.AUTHORIZE,
				channel: aChannel,
				accessKey: aAccessKey,
				secretKey: aSecretKey
			}, aOptions);
		}
		return lRes;
	},
	//:m:*:channelPublish
	//:d:en:Sends a string message to the given channel on the server.
	//:d:en:The client needs to be authenticated against the server and the
	//:d:en:channel to publish data. All clients that subscribed to the channel
	//:d:en:will receive the message.
	//:a:en::aChannel:String:The id of the server side data channel.
	//:a:en::aData:String:String (text) to be sent to the server side data channel.
	//:r:*:::void:none
	channelPublishString: function(aChannel, aString, aOptions) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			this.sendToken({
				ns: jws.ChannelPlugIn.NS,
				type: jws.ChannelPlugIn.PUBLISH,
				channel: aChannel,
				data: aString
			}, aOptions);
		}
		return lRes;
	},
	//:m:*:channelPublish
	//:d:en:Sends a combined string (id) and map message to the given channel _
	//:d:en:on the server. The id can be used to identify the map type/content.
	//:d:en:The client needs to be authenticated against the server and the
	//:d:en:channel to publish data. All clients that subscribed to the channel
	//:d:en:will receive the message.
	//:a:en::aChannel:String:The id of the server side data channel.
	//:a:en::aData:String:String (text) to be sent to the server side data channel.
	//:r:*:::void:none
	channelPublish: function(aChannel, aData, aMap, aOptions) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			this.sendToken({
				ns: jws.ChannelPlugIn.NS,
				type: jws.ChannelPlugIn.PUBLISH,
				channel: aChannel,
				data: aData,
				map: aMap
			}, aOptions);
		}
		return lRes;
	},
	//:m:*:channelPublishMap
	//:d:en:Sends a map message to the given channel on the server.
	//:d:en:The client needs to be authenticated against the server and the
	//:d:en:channel to publish data. All clients that subscribed to the channel
	//:d:en:will receive the message.
	//:a:en::aChannel:String:The id of the server side data channel.
	//:a:en::aMap:Map:Data object to be sent to the server side data channel.
	//:r:*:::void:none
	channelPublishMap: function(aChannel, aMap, aOptions) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			this.sendToken({
				ns: jws.ChannelPlugIn.NS,
				type: jws.ChannelPlugIn.PUBLISH,
				channel: aChannel,
				map: aMap
			}, aOptions);
		}
		return lRes;
	},
	//:m:*:channelModify
	//:d:en:Modify an existing channel properties.
	//:d:en:The client needs to be authenticated against the server.
	//:a:en::aId:String:The channel identifier.
	//:a:en::aSecretKey:String:The channel secret key.
	//:a:en::aOptions.name:String:The new channel name property value.
	//:a:en::aOptions.newSecretKey:String:The new channel secretKey property value.
	//:a:en::aOptions.accessKey:String:The new channel accessKey property value.
	//:a:en::aOptions.owner:String:The new channel owner property value.
	//:a:en::aOptions.isPrivate:Boolean:The new channel isPrivate property value.
	//:a:en::aOptions.isSystem:Boolean:The new channel isSystem property value.
	channelModify: function(aId, aSecretKey, aOptions) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			var lToken = {
				ns: jws.ChannelPlugIn.NS,
				type: jws.ChannelPlugIn.MODIFY_CHANNEL,
				channel: aId,
				secretKey: aSecretKey
			};

			if (aOptions["name"]) {
				lToken.name = aOptions.name;
			}
			if (aOptions["newSecretKey"]) {
				lToken.newSecretKey = aOptions.newSecretKey;
			}
			if (aOptions["accessKey"]) {
				lToken.accessKey = aOptions.accessKey;
			}
			if (aOptions["owner"]) {
				lToken.owner = aOptions.owner;
			}
			if (undefined != aOptions["isPrivate"]) {
				lToken.isPrivate = aOptions.isPrivate;
			}
			if (undefined != aOptions["isSystem"]) {
				lToken.isSystem = aOptions.isSystem;
			}

			this.sendToken(lToken, aOptions);
		}
		return lRes;
	},
	//:m:*:channelCreate
	//:d:en:Creates a new channel on the server. If a channel with the given _
	//:d:en:channel-id already exists the create channel request is rejected. _
	//:d:en:A private channel requires an access key, if this is not provided _
	//:d:en:for a private channel the request is rejected. For public channel _
	//:d:en:the access key is optional.
	//:a:en::aChannel:String:The id of the server side data channel.
	//:a:en::aName:String:The name (human readably) of the channel.
	//:r:*:::void:none
	channelCreate: function(aId, aName, aOptions) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			var lIsPrivate = false;
			var lIsSystem = false;
			var lAccessKey = null;
			var lSecretKey = null;
			var lOwner = null;
			var lPassword = null;
			if (aOptions) {
				if (aOptions.isPrivate != undefined) {
					lIsPrivate = aOptions.isPrivate;
				}
				if (aOptions.isSystem != undefined) {
					lIsSystem = aOptions.isSystem;
				}
				if (aOptions.accessKey != undefined) {
					lAccessKey = aOptions.accessKey;
				}
				if (aOptions.secretKey != undefined) {
					lSecretKey = aOptions.secretKey;
				}
				if (aOptions.owner != undefined) {
					lOwner = aOptions.owner;
				}
				if (aOptions.password != undefined) {
					lPassword = aOptions.password;
				}
			}
			this.sendToken({
				ns: jws.ChannelPlugIn.NS,
				type: jws.ChannelPlugIn.CREATE_CHANNEL,
				channel: aId,
				name: aName,
				isPrivate: lIsPrivate,
				isSystem: lIsSystem,
				accessKey: lAccessKey,
				secretKey: lSecretKey,
				owner: lOwner,
				password: lPassword
			}, aOptions);
		}
		return lRes;
	},
	//:m:*:channelRemove
	//:d:en:Removes a (non-system) channel on the server. Only the owner of _
	//:d:en:channel can remove a channel. If a accessKey/secretKey pair is _
	//:d:en:defined for a channel this needs to be passed as well, otherwise _
	//:d:en:the remove request is rejected.
	//:a:en::aChannel:String:The id of the server side data channel.
	//:r:*:::void:none
	channelRemove: function(aId, aOptions) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			var lAccessKey = null;
			var lSecretKey = null;
			var lOwner = null;
			var lPassword = null;
			if (aOptions) {
				if (aOptions.accessKey != undefined) {
					lAccessKey = aOptions.accessKey;
				}
				if (aOptions.secretKey != undefined) {
					lSecretKey = aOptions.secretKey;
				}
				if (aOptions.owner != undefined) {
					lOwner = aOptions.owner;
				}
				if (aOptions.password != undefined) {
					lPassword = aOptions.password;
				}
			}
			this.sendToken({
				ns: jws.ChannelPlugIn.NS,
				type: jws.ChannelPlugIn.REMOVE_CHANNEL,
				channel: aId,
				accessKey: lAccessKey,
				secretKey: lSecretKey,
				owner: lOwner,
				password: lPassword
			}, aOptions);
		}
		return lRes;
	},
	//:m:*:channelGetSubscribers
	//:d:en:Returns all channels to which the current client currently has
	//:d:en:subscribed to. This also includes private channels. The owners of
	//:d:en:the channels are not returned due to security reasons.
	//:a:en::aChannel:String:The id of the server side data channel.
	//:a:en::aAccessKey:String:Access Key for the channel (required for private channels, optional for public channels).
	//:r:*:::void:none
	channelGetSubscribers: function(aChannel, aAccessKey, aOptions) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			this.sendToken({
				ns: jws.ChannelPlugIn.NS,
				type: jws.ChannelPlugIn.GET_SUBSCRIBERS,
				channel: aChannel,
				accessKey: aAccessKey
			}, aOptions);
		}
		return lRes;
	},
	//:m:*:channelGetPublishers
	//:d:en:Returns all the publishers authenticated in a certain channel
	//:a:en::aChannel:String:The id of the server side data channel.
	//:a:en::aAccessKey:String:Access Key for the channel (required for private channels, optional for public channels).
	//:r:*:::void:none
	channelGetPublishers: function(aChannel, aAccessKey, aOptions) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			this.sendToken({
				ns: jws.ChannelPlugIn.NS,
				type: jws.ChannelPlugIn.GET_PUBLISHERS,
				channel: aChannel,
				accessKey: aAccessKey
			}, aOptions);
		}
		return lRes;
	},
	//:m:*:channelGetSubscriptions
	//:d:en:Returns all channels to which the current client currently has
	//:d:en:subscribed to. This also includes private channels. The owners of
	//:d:en:the channels are not returned due to security reasons.
	//:a:en:::none
	//:r:*:::void:none
	channelGetSubscriptions: function(aOptions) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			this.sendToken({
				ns: jws.ChannelPlugIn.NS,
				type: jws.ChannelPlugIn.GET_SUBSCRIPTIONS
			}, aOptions);
		}
		return lRes;
	},
	//:m:*:channelGetIds
	//:d:en:Tries to obtain all ids of the public channels
	//:a:en:::none
	//:r:*:::void:none
	channelGetIds: function(aOptions) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			this.sendToken({
				ns: jws.ChannelPlugIn.NS,
				type: jws.ChannelPlugIn.GET_CHANNELS
			}, aOptions);
		}
		return lRes;
	},
	//:m:*:channelStop
	//:d:en:Stop a channel given the channel identifier
	//:a:en::aChannel:String:The id of the server side data channel.
	//:r:*:::void:none
	channelStop: function(aChannel, aOptions) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			this.sendToken({
				ns: jws.ChannelPlugIn.NS,
				channel: aChannel,
				type: jws.ChannelPlugIn.STOP
			}, aOptions);
		}
		return lRes;
	},
	//:m:*:channelStart
	//:d:en:Start a channel given the channel identifier
	//:a:en::aChannel:String:The id of the server side data channel.
	//:r:*:::void:none
	channelStart: function(aChannel, aOptions) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			this.sendToken({
				ns: jws.ChannelPlugIn.NS,
				channel: aChannel,
				type: jws.ChannelPlugIn.START
			}, aOptions);
		}
		return lRes;
	},
	//:m:*:setChannelCallbacks
	//:d:en:Set the channels lifecycle callbacks
	//:a:en::aListeners:Object:JSONObject containing the channels lifecycle callbacks
	//:a:en::aListeners.OnChannelCreated:Function:Called when a new channel has been created
	//:a:en::aListeners.OnChannelsReceived:Function:Called when the list of available channels is received
	//:a:en::aListeners.OnChannelRemoved:Function:Called when a channel has been removed
	//:a:en::aListeners.OnChannelStarted:Function:Called when a channel has been started
	//:a:en::aListeners.OnChannelStopped:Function:Called when a channel has been stopped
	//:a:en::aListeners.OnChannelSubscription:Function:Called when a channel receives a new subscription
	//:a:en::aListeners.OnChannelUnsubscription:Function:Called when a channel receives an unsubscription
	//:a:en::aListeners.OnChannelBroadcast:Function:Called when a channel broadcast data because of a publication
	//:r:*:::void:none
	setChannelCallbacks: function(aListeners) {
		if (!aListeners) {
			aListeners = {};
		}
		if (aListeners.OnChannelCreated !== undefined) {
			this.fOnChannelCreated = aListeners.OnChannelCreated;
		}
		if (aListeners.OnChannelsReceived !== undefined) {
			this.fOnChannelsReceived = aListeners.OnChannelsReceived;
		}
		if (aListeners.OnChannelRemoved !== undefined) {
			this.fOnChannelRemoved = aListeners.OnChannelRemoved;
		}
		if (aListeners.OnChannelStarted !== undefined) {
			this.fOnChannelStarted = aListeners.OnChannelStarted;
		}
		if (aListeners.OnChannelStopped !== undefined) {
			this.fOnChannelStopped = aListeners.OnChannelStopped;
		}
		if (aListeners.OnChannelSubscription !== undefined) {
			this.fOnChannelSubscription = aListeners.OnChannelSubscription;
		}
		if (aListeners.OnChannelUnsubscription !== undefined) {
			this.fOnChannelUnsubscription = aListeners.OnChannelUnsubscription;
		}
		if (aListeners.OnChannelBroadcast !== undefined) {
			this.fOnChannelBroadcast = aListeners.OnChannelBroadcast;
		}
	}

};

// add the ChannelPlugIn into the jWebSocketTokenClient class
jws.oop.addPlugIn(jws.jWebSocketTokenClient, jws.ChannelPlugIn);
