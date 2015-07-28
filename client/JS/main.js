document.addEventListener('DOMContentLoaded', function() {
    // PeerJS server location
    var SERVER_IP = '127.0.0.1';
    var SERVER_PORT = 9000;

    // DOM elements manipulated as user interacts with the app
    var messageBox = document.querySelector('#messages');
    var callerIdEntry = document.querySelector('#caller-id');
    var connectBtn = document.querySelector('#connect');
    var recipientIdEntry = document.querySelector('#recipient-id');
    var dialBtn = document.querySelector('#dial');
    var remoteVideo = document.querySelector('#remote-video');
    var localVideo = document.querySelector('#local-video');

    // the ID set for this client
    var callerId = null;

    // PeerJS object, instantiated when this client connects with its
    // caller ID
    var peer = null;

    // the local video stream captured with getUserMedia()
    var localStream = null;

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

    if (navigator.getUserMedia) {
        // Request the camera.
        navigator.getUserMedia(
                // Constraints
                        {
                            video: true
                        },
                // Success Callback
                function(localMediaStream) {
                    localStream = localMediaStream;
                    localVideo.src = window.URL.createObjectURL(localStream);
                },
                        // Error Callback
                                function(err) {
                                    // Log the error to the console.
                                    alert('The following error occurred when trying to use getUserMedia: ' + err);
                                }
                        );

                    } else {
                alert('Sorry, your browser does not support getUserMedia');
            }



            // set the "REMOTE" video element source
            var showRemoteStream = function(stream) {
                remoteVideo.src = window.URL.createObjectURL(stream);
            };

            // set caller ID and connect to the PeerJS server
            var connect = function() {
                callerId = callerIdEntry.value;

                try {
                    // create connection to the ID server
                    peer = new Peer(callerId, {host: SERVER_IP, port: SERVER_PORT});

                    peer.socket._socket.onclose = function() {
                        alert('no connection to server');
                    };
                    peer.socket._socket.onopen = function() {
                        alert('Connected to Server..');
                    };

                    // handle events representing incoming calls
                    peer.on('call', answer);
                }
                catch (e) {
                    peer = null;
                    alert('error while connecting to server');
                }
            };

            // make an outgoing call
            var dial = function() {
                if (!peer) {
                    alert('please connect first');
                    return;
                }

                if (!localStream) {
                    alert('could not start call as there is no local camera');
                    return
                }

                var recipientId = recipientIdEntry.value;
                var call = peer.call(recipientId, localStream);
                call.on('stream', showRemoteStream);
                call.on('error', function(e) {
                    alert('error with call');
                    alert(e.message);
                });

                if (!recipientId) {
                    alert('could not start call as no recipient ID is set');
                    return;
                }
            };

            // answer an incoming call
            var answer = function(call) {
                if (!peer) {
                    alert('cannot answer a call without a connection');
                    return;
                }

                if (!localStream) {
                    alert('could not answer call as there is no localStream ready');
                    return;
                }

                alert('incoming call answered');

                call.on('stream', showRemoteStream);

                call.answer(localStream);
            };

            // wire up button events
            connectBtn.addEventListener('click', connect);
            dialBtn.addEventListener('click', dial);
        });
