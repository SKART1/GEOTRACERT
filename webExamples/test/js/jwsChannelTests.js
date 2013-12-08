//	---------------------------------------------------------------------------
//	jWebSocket Channel test specs (Community Edition, CE)
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

jws.tests.Channels = {
	NS: "jws.tests.channels",
	TEST_MESSAGE: "this is a test message",
	// this spec tests the subscribe method of the Channels plug-in
	testSubscribe: function(aChannelName, aAccessKey) {
		var lSpec = this.NS + ": subscribe (" + aChannelName + ")";

		it(lSpec, function() {
			var lResponse = {};
			jws.Tests.getAdminConn().channelSubscribe(
					aChannelName,
					aAccessKey,
					{
						OnResponse: function(aToken) {
							lResponse = aToken;
						}
					}
			);

			waitsFor(
					function() {
						return(lResponse.code == 0);
					},
					lSpec,
					1000
					);

			runs(function() {
				expect(lResponse.code).toEqual(0);
			});
		});
	},
	// this spec tests the unsubscribe method of the Channels plug-in
	testUnsubscribe: function(aChannelName) {
		var lSpec = this.NS + ": unsubscribe (" + aChannelName + ")";

		it(lSpec, function() {
			var lResponse = {};
			jws.Tests.getAdminConn().channelUnsubscribe(
					aChannelName,
					{
						OnResponse: function(aToken) {
							lResponse = aToken;
						}
					}
			);

			waitsFor(
					function() {
						return(lResponse.code == 0);
					},
					lSpec,
					1000
					);

			runs(function() {
				expect(lResponse.code).toEqual(0);
			});

		});
	},
	// this spec tests the create method for a new channel
	testChannelCreate: function(aChannelId, aChannelName, aAccessKey, aSecretKey,
			aIsPrivate, aIsSystem, aComment, aExpectedReturnCode) {
		var lSpec = this.NS + ": channelCreate (id: " + aChannelId + ", name: " + aChannelName + ", " + aComment + ")";

		it(lSpec, function() {

			var lResponse = {};
			jws.Tests.getAdminConn().channelCreate(
					aChannelId,
					aChannelName,
					{
						isPrivate: aIsPrivate,
						isSystem: aIsSystem,
						accessKey: aAccessKey,
						secretKey: aSecretKey,
						OnResponse: function(aToken) {
							lResponse = aToken;
						}
					}
			);

			waitsFor(
					function() {
						return(lResponse.code !== undefined);
					},
					lSpec,
					1000
					);

			runs(function() {
				expect(lResponse.code).toEqual(aExpectedReturnCode);
			});

		});
	},
	// this spec tests the modify method for an existing channel
	testChannelModify: function(aChannelId, aSecretKey,
			aOptions, aComment, aExpectedReturnCode) {
		var lSpec = this.NS + ": channelModify (id: " + aChannelId + ", name: " + aChannelId + ", " + aComment + ")";

		it(lSpec, function() {

			var lResponse = {};
			aOptions.OnResponse = function(aToken) {
				lResponse = aToken;
			};
			jws.Tests.getAdminConn().channelModify(
					aChannelId,
					aSecretKey,
					aOptions
					);

			waitsFor(
					function() {
						return(lResponse.code !== undefined);
					},
					lSpec,
					2000
					);

			runs(function() {
				expect(lResponse.code).toEqual(aExpectedReturnCode);
			});

		});
	},
	// this spec tests the create method for a new channel
	testChannelAuth: function(aChannelId, aAccessKey, aSecretKey,
			aComment, aExpectedReturnCode) {
		var lSpec = this.NS + ": channelAuth (id: " + aChannelId + ", " + aComment + ")";

		it(lSpec, function() {

			var lResponse = {};
			jws.Tests.getAdminConn().channelAuth(
					aChannelId,
					aAccessKey,
					aSecretKey,
					{
						OnResponse: function(aToken) {
							lResponse = aToken;
						}
					}
			);

			waitsFor(
					function() {
						return(lResponse.code !== undefined);
					},
					lSpec,
					1000
					);

			runs(function() {
				expect(lResponse.code).toEqual(aExpectedReturnCode);
			});

		});
	},
	// this spec tests the create method for a new channel
	testChannelPublish: function(aChannelId, aData,
			aComment, aExpectedReturnCode) {
		var lSpec = this.NS + ": channelPublish (id: " + aChannelId + ", data: " + aData + ", " + aComment + ")";

		it(lSpec, function() {

			var lResponse = null;
			var lEvent = null;

			if (0 == aExpectedReturnCode) {
				jws.Tests.getAdminConn().setChannelCallbacks({
					OnChannelBroadcast: function(aEvent) {
						lEvent = aEvent;
					}
				});
			} else {
				lEvent = true;
			}
			jws.Tests.getAdminConn().channelPublish(
					aChannelId,
					aData,
					null,
					{
						OnResponse: function(aToken) {
							lResponse = aToken;
						}
					}
			);

			waitsFor(
					function() {
						return(lResponse != null && lEvent != null);
					},
					lSpec,
					3000
					);

			runs(function() {
				expect(lResponse.code).toEqual(aExpectedReturnCode);
				if (0 == aExpectedReturnCode) {
					expect(lEvent.data).toEqual(aData);
				}
			});

		});
	},
	// this spec tests the create method for a new channel
	testChannelSubscriptions: function(aComment, aExpectedIDs, aExpectedCount) {
		var lSpec = this.NS + ": channelSubscriptions (" + aComment + ")";

		it(lSpec, function() {

			var lResponse = {};
			jws.Tests.getAdminConn().channelGetSubscriptions(
					{
						OnResponse: function(aToken) {
							lResponse = aToken;
						}
					}
			);

			waitsFor(
					function() {
						return(lResponse.code !== undefined);
					},
					lSpec,
					1000
					);

			runs(function() {
				var lChannels = lResponse.channels;
				var lToBeFound = aExpectedCount;
				if (lChannels) {
					for (var lIdx = 0, lCnt = lChannels.length; lIdx < lCnt; lIdx++) {
						var lChannel = lChannels[ lIdx ];
						var lFound = aExpectedIDs[ lChannel.id ];
						if (lFound
								&& lFound.isPrivate === lChannel.isPrivate
								&& lFound.isSystem === lChannel.isSystem
								) {
							lToBeFound--;
						}
					}
				} else {
					lChannels = [];
				}
				expect(lResponse.code).toEqual(0);
				expect(lToBeFound).toEqual(0);
				expect(lChannels.length).toEqual(aExpectedCount);
			});

		});
	},
	// this spec tests to obtain the ids of the 
	testChannelGetIds: function(aComment, aExpectedIDs, aExpectedCount) {
		var lSpec = this.NS + ": channelGetIds (" + aComment + ")";

		it(lSpec, function() {

			var lResponse = {};
			jws.Tests.getAdminConn().channelGetIds(
					{
						OnResponse: function(aToken) {
							lResponse = aToken;
						}
					}
			);

			waitsFor(
					function() {
						return(lResponse.code !== undefined);
					},
					lSpec,
					1000
					);

			runs(function() {
				var lChannels = lResponse.channels;
				var lToBeFound = aExpectedCount;
				if (lChannels) {
					for (var lIdx = 0, lCnt = lChannels.length; lIdx < lCnt; lIdx++) {
						var lChannel = lChannels[ lIdx ];
						var lFound = aExpectedIDs[ lChannel.id ];
						if (lFound
								&& lFound.isPrivate === lChannel.isPrivate
								&& lFound.isSystem === lChannel.isSystem
								) {
							lToBeFound--;
						}
					}
				} else {
					lChannels = [];
				}
				expect(lResponse.code).toEqual(0);
				expect(lToBeFound).toEqual(0);
				expect(0).toEqual(lToBeFound);
			});

		});
	},
	// this spec tests the create method for a new channel
	testChannelComplexTest: function(aComment) {
		var lSpec = this.NS + ": complex test (" + aComment + ")";

		it(lSpec, function() {

			var lPubCnt = 3, lPubIdx;
			var lSubCnt = 9, lSubIdx;
			var lPubsCreated = 0, lSubsCreated = 0;

			var lPubs = [];
			var lSubs = [];
			var lPub, lSub;

			var lChannelId = 0;
			var lChId;
			var lPacketsReceived = 0;

			var lCreateSubs = function() {
				// now create the given number of subscribers
				for (lSubIdx = 0; lSubIdx < lSubCnt; lSubIdx++) {
					lSub = new jws.jWebSocketJSONClient();
					// use parameter to easily access channel id in listener
					lSub.setParamNS(jws.tests.Channels.NS, "listenOn", "ch_" + ((lSubIdx % lPubCnt) + 1));
					lSubs[ lSubIdx ] = {
						client: lSub,
						status: jws.tests.Channels.INIT
					};
					lSub.logon(jws.getDefaultServerURL(), jws.Tests.ADMIN_USER, jws.Tests.ADMIN_PWD, {
						OnToken: function(aToken) {
							// jws.console.log( "Subscriber Token: " + JSON.stringify( aToken ) );
							// once logged in subscribe each client to a certain publisher
							if ("org.jwebsocket.plugins.system" == aToken.ns
									&& "login" == aToken.reqType) {
								// use parameter to access channel id to subscribe to
								lChId = this.getParamNS(jws.tests.Channels.NS, "listenOn");
								jws.console.log("Subscribing at channel " + lChId + "...");
								this.channelSubscribe(
										lChId,
										"testAccessKey"
										);
								// once all subscribers are allocated the publishers can fire		
							} else if (jws.ChannelPlugIn.NS == aToken.ns
									&& "subscribe" == aToken.reqType
									// && 0 == aToken.code
									) {
								lSubsCreated++;

								jws.console.log("Subscription at channel " + aToken.channelId + ": " + aToken.code + " " + aToken.msg);

								if (lSubsCreated == lSubCnt) {
									// now we can start the publish and receive test
									for (lPubIdx = 0; lPubIdx < lPubCnt; lPubIdx++) {
										lPub = lPubs[ lPubIdx ].client;
										lChId = "ch_" + (lPubIdx + 1);
										jws.console.log("Publishing at channel " + lChId + "...");
										lPub.channelPublish(lChId, "Test", null, {
											OnResponse: function(aToken) {
												jws.console.log("Publish Response: " + JSON.stringify(aToken));
											}
										});
									}
								}
							} else if (jws.ChannelPlugIn.NS == aToken.ns
									&& "data" == aToken.type) {
								jws.console.log("Received data from"
										+ " channel " + aToken.channelId
										+ ", publisher: " + aToken.publisher
										+ ": '" + aToken.data + "'.");
								lPacketsReceived++;
							}

						}
					});
				}
			}

			var lCreatePubs = function() {
				// first create the given number of publishers
				for (lPubIdx = 0; lPubIdx < lPubCnt; lPubIdx++) {
					lPub = new jws.jWebSocketJSONClient();
					lPubs[ lPubIdx ] = {
						client: lPub,
						status: jws.tests.Channels.INIT
					};

					lPub.logon(jws.getDefaultServerURL(), jws.Tests.ADMIN_USER, jws.Tests.ADMIN_PWD, {
						OnToken: function(aToken) {
							// once logged in the channel can be created
							if ("org.jwebsocket.plugins.system" == aToken.ns
									&& "login" == aToken.reqType) {
								lChannelId++;
								var lChId = "ch_" + lChannelId;
								jws.console.log("Creating channel " + lChId + "...");
								this.channelCreate(
										"ch_" + lChannelId,
										"channel_" + lChannelId,
										{
											isPrivate: false,
											isSystem: false,
											accessKey: "testAccessKey",
											secretKey: "testSecretKey"
										}
								);
								// once channel is created authenticate for publishing
							} else if (jws.ChannelPlugIn.NS == aToken.ns
									&& "createChannel" == aToken.reqType) {
								lPubsCreated++;
								jws.console.log("Channel " + aToken.channelId + " created.");
								this.channelAuth(
										aToken.channelId,
										"testAccessKey",
										"testSecretKey",
										{
											OnResponse: function(aToken) {
												jws.console.log("Channel " + aToken.channelId + " authenticated.");
												if (lPubsCreated == lPubCnt) {
													// lCreateSubs();
												}
											}
										}
								);
								// once channel is removed close connection
							} else if (jws.ChannelPlugIn.NS == aToken.ns
									&& "removeChannel" == aToken.reqType) {
								// once channel is removed the connection can be closed
								jws.console.log("Channel " + aToken.channelId + " removed.");
								if (aToken.channelId.substr(0, 3) == "ch_") {
									this.close({
										timeout: 1000
									});
								}
							}
						}
					});
				}
			}

			// create all publishers
			lCreatePubs();
			// give server a bit to start all channels
			// TODO: improve! this should be done by events! not by hardcoded timeout!
			setTimeout(lCreateSubs, 500);

			waitsFor(
					function() {
						return(
								lPubsCreated == lPubCnt
								&& lPacketsReceived == lSubCnt
								);
					},
					lSpec,
					3000
					);

			runs(function() {
				var lClient;
				// remove created channels and close opened connections
				for (var lPubIdx = 0; lPubIdx < lPubCnt; lPubIdx++) {
					lClient = lPubs[ lPubIdx ].client;
					lChId = "ch_" + (lPubIdx + 1);
					jws.console.log("Removing channel " + lChId + "...");
					lClient.channelRemove(
							lChId,
							{
								accessKey: "testAccessKey",
								secretKey: "testSecretKey",
								OnResponse: function(aToken) {
									// lResponse = aToken;
								}
							}
					);
				}

				for (var lSubIdx = 0; lSubIdx < lSubCnt; lSubIdx++) {
					var lChId = "ch_" + (lSubIdx + 1);
					jws.console.log("Closing subscriber ch_" + lChId + "...");
					lSubs[ lSubIdx ].client.close({
						timeout: 1000
					});
				}

				expect(lPubsCreated).toEqual(lPubCnt);
			});

		});
	},
	// this spec tests the create method for a new channel
	testChannelRemove: function(aChannelId, aAccessKey, aSecretKey,
			aComment, aExpectedReturnCode) {
		var lSpec = this.NS + ": channelRemove (id: " + aChannelId + ", " + aComment + ")";

		it(lSpec, function() {

			var lResponse = {};
			jws.Tests.getAdminConn().channelRemove(
					aChannelId,
					{
						accessKey: aAccessKey,
						secretKey: aSecretKey,
						OnResponse: function(aToken) {
							lResponse = aToken;
						}
					}
			);

			waitsFor(
					function() {
						return(lResponse.code !== undefined);
					},
					lSpec,
					1000
					);

			runs(function() {
				expect(lResponse.code).toEqual(aExpectedReturnCode);
				if (lResponse.code !== undefined
						&& lResponse.code != aExpectedReturnCode) {
					jasmine.log("Error: " + lResponse.msg);
				}
			});

		});
	},
	runSpecs: function() {

		// testing subscribing to existing, pre-defined channels
		jws.tests.Channels.testSubscribe("systemA", "access");
		// Retreiving subscriptions of current client
		jws.tests.Channels.testChannelSubscriptions(
				"Retreiving subscriptions of current client (should return 1).",
				{
					"systemA": {
						isPrivate: false,
						isSystem: true
					}
				},
		1
				);

		// testing unsubscribing from existing, pre-defined channels
		jws.tests.Channels.testUnsubscribe("systemA", "access");
		// Retreiving subscriptions of current client
		jws.tests.Channels.testChannelSubscriptions("Retreiving subscriptions of current client (should return 0).",
				{}, 0);
		// creating new public channels
		jws.tests.Channels.testChannelCreate("myPubSec", "123", "123", "123", false, false,
				"Creating public channel with correct credentials (allowed)", 0);
		jws.tests.Channels.testChannelModify("myPubSec", "123", {
			name: "myPublicSecure",
			newSecretKey: "myPublicSecret",
			accessKey: "myPublicAccess",
			isPrivate: false,
			isSystem: false
		}, "Modifying public channel(allowed)", 0);
		jws.tests.Channels.testChannelCreate("myPubSec", "myPublicSecure", "myPublicAccess", "myPublicSecret", false, false,
				"Creating public channel that already exists (invalid)", -1);
		jws.tests.Channels.testChannelCreate("myPubUnsec", "myPublicUnsecure", "", "", false, false,
				"Creating public channel w/o access key and secret key (allowed)", 0);

		// creating new private channels
		jws.tests.Channels.testChannelCreate("myPrivSec", "myPrivateSecure", "myPrivateAccess", "myPrivateSecret", true, false,
				"Creating private channel with access key and secret key (allowed)", 0);
		jws.tests.Channels.testChannelCreate("myPrivUnsec", "myUnsecurePrivateChannel", "", "", true, false,
				"Creating private channel w/o access key and secret key (not allowed)", -1);

		// channel authentication prior to publishing
		jws.tests.Channels.testChannelAuth("myInvalid", "myPublicAccess", "myPublicSecret",
				"Authenticating against invalid channel with access key and secret key (not allowed)", -1);
		jws.tests.Channels.testChannelAuth("myPubSec", "", "",
				"Authenticating against public channel w/o access key and secret key (not allowed)", -1);
		jws.tests.Channels.testChannelPublish("myPubSec", jws.tests.Channels.TEST_MESSAGE,
				"Publishing test message on a non-authenticated channel (not allowed)", -1);
		jws.tests.Channels.testChannelAuth("myPubSec", "myPublicAccess", "myPublicSecret",
				"Authenticating against public channel access key and secret key (allowed)", 0);
		jws.tests.Channels.testSubscribe("myPubSec", "myPublicAccess");
		jws.tests.Channels.testChannelPublish("myPubSec", jws.tests.Channels.TEST_MESSAGE,
				"Publishing test message on authenticated channel (allowed)", 0);


		// obtaining public channels
		jws.tests.Channels.testChannelGetIds(
				"Retreiving IDs of available public channels",
				{
					"myPubSec": {
						isPrivate: false,
						isSystem: false
					},
					"myPubUnsec": {
						isPrivate: false,
						isSystem: false
					},
					"systemA": {
						isPrivate: false,
						isSystem: true
					},
					"systemB": {
						isPrivate: false,
						isSystem: true
					},
					"publicA": {
						isPrivate: false,
						isSystem: false
					},
					"publicB": {
						isPrivate: false,
						isSystem: false
					}
				}, 6
				);

		// run complex publish and subscribe test
		//jws.tests.Channels.testChannelComplexTest(
		//	"Multiple publishers distributing messages to multiple subscribers.", 0 );

		// removing public channels
		jws.tests.Channels.testChannelRemove("myPubSec", "myInvalidAccess", "myInvalidSecret",
				"Removing secure public channel with incorrect credentials (not allowed)", -1);
		jws.tests.Channels.testChannelRemove("myPubSec", "myPublicAccess", "myPublicSecret",
				"Removing secure public channel with correct credentials (allowed)", 0);
		jws.tests.Channels.testChannelRemove("myPubUnsec", "", "",
				"Removing unsecure public channel w/o credentials (allowed)", 0);

		// removing private channels
		jws.tests.Channels.testChannelRemove("myPrivSec", "myInvalidAccess", "myInvalidSecret",
				"Removing private channel with invalid credentials (invalid)", -1);
		jws.tests.Channels.testChannelRemove("myPrivSec", "myPrivateAccess", "myPrivateSecret",
				"Removing private channel with correct credentials (allowed)", 0);
		jws.tests.Channels.testChannelRemove("myPrivSec", "myPrivateAccess", "myPrivateSecret",
				"Removing private channel that should alredy have been removed (invalid)", -1);
		jws.tests.Channels.testChannelRemove("myPrivUnsec", "", "",
				"Removing channel that should never have existed (invalid)", -1);

	},
	runSuite: function() {
		var lThis = this;
		describe("Performing test suite: " + this.NS + "...", function() {
			lThis.runSpecs();
		});
	}

}
