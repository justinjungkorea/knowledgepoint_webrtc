document.addEventListener('DOMContentLoaded', function () {
    const inputId = document.getElementById('inputId');
    const inputPw = document.getElementById('inputPw');
    const loginBtn = document.getElementById('loginBtn');
    const joinBtn = document.getElementById('joinBtn');
    const exitBtn = document.getElementById('exitBtn');
    const localVideo = document.getElementById('localVideo');
    const remoteVideo = document.getElementById('remoteVideo');

    let reqNo = 1;
    let peerCon;
    let localStream;

    signalSocketIo.on('ktalk', function (data) {
        console.log('receive', data);

        if (!data.eventOp && !data.signalOp) {
            console.log('error', 'eventOp undefined');
        }

        if (data.eventOp === 'Login') {
            loginBtn.disabled = true;
        }

        if (data.eventOp === 'Invite') {
            roomId = data.roomId;
            joinBtn.className = "btn red";
        }

        if (data.eventOp === 'Join') {
            joinBtn.className = "btn gray";
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: false })
                .then(stream => {
                    localStream = stream;
                    localVideo.srcObject = localStream;

                    roomId = data.roomId;
                    peerCon = new RTCPeerConnection(configuration);

                    peerCon.onicecandidate = onIceCandidateHandler;
                    peerCon.onaddstream = onAddStreamHandler;

                    peerCon.addStream(localStream);
                    peerCon.createOffer().then(sdp => {
                        peerCon.setLocalDescription(new RTCSessionDescription(sdp));

                        let sdpData = {
                            eventOp: 'SDP',
                            sdp,
                            useMediaSvr: 'N',
                            userId: inputId.value,
                            roomId,
                            reqNo: reqNo++,
                            reqDate: nowDate()
                        };

                        try {
                            console.log('send', sdpData);
                            signalSocketIo.emit('knowledgetalk', sdpData);
                        } catch (err) {
                            if (err instanceof SyntaxError) {
                                alert(
                                    ' there was a syntaxError it and try again : ' + err.message
                                );
                            } else {
                                throw err;
                            }
                        }
                    });
                });
        }

        if (data.eventOp === 'SDP') {
            if (data.sdp.type === 'answer') {
                peerCon.setRemoteDescription(new RTCSessionDescription(data.sdp));
            }
        }

        if (data.eventOp === 'Candidate') {
            peerCon.addIceCandidate(new RTCIceCandidate(data.candidate));

            let iceData = {
                eventOp: 'Candidate',
                roomId: data.roomId,
                reqNo: data.reqNo,
                resDate: nowDate(),
                code: '200'
            };

            try {
                console.log('send', iceData);
                signalSocketIo.emit('knowledgetalk', iceData);
            } catch (err) {
                if (err instanceof SyntaxError) {
                    alert(' there was a syntaxError it and try again : ' + err.message);
                } else {
                    throw err;
                }
            }
        }

        if (data.signalOp === 'Presence') {
            if (data.action === 'exit') {
                localVideo.srcObject = null;
                remoteVideo.srcObject = null;
            }
        }
    });

    function onIceCandidateHandler(e) {
        if (!e.candidate) return;

        let iceData = {
            eventOp: 'Candidate',
            candidate: e.candidate,
            useMediaSvr: 'N',
            userId: inputId.value,
            roomId,
            reqNo: reqNo++,
            reqDate: nowDate()
        };

        try {
            console.log('send', iceData);
            signalSocketIo.emit('knowledgetalk', iceData);
        } catch (err) {
            if (err instanceof SyntaxError) {
                alert(' there was a syntaxError it and try again : ' + err.message);
            } else {
                throw err;
            }
        }
    }

    function onAddStreamHandler(e) {
        remoteVideo.srcObject = e.stream;
    }

    loginBtn.addEventListener('click', function (e) {
        let loginData = {
            eventOp: 'Login',
            reqNo: reqNo++,
            userId: inputId.value,
            userPw: inputPw.value,
            reqDate: nowDate(),
            deviceType: 'pc'
        };

        try {
            console.log('send', loginData);
            signalSocketIo.emit('knowledgetalk', loginData);
        } catch (err) {
            if (err instanceof SyntaxError) {
                alert(' there was a syntaxError it and try again : ' + err.message);
            } else {
                throw err;
            }
        }
    });

    joinBtn.addEventListener('click', function (e) {
        let joinData = {
            eventOp: 'Join',
            reqNo: reqNo++,
            reqDate: nowDate(),
            userId: inputId.value,
            roomId,
            status: 'accept'
        };

        try {
            console.log('send', joinData);
            signalSocketIo.emit('knowledgetalk', joinData);
        } catch (err) {
            if (err instanceof SyntaxError) {
                alert(' there was a syntaxError it and try again : ' + err.message);
            } else {
                throw err;
            }
        }
    });

    exitBtn.addEventListener('click', function (e) {
        localVideo.srcObject = null;
        remoteVideo.srcObject = null;
        let callEndData = {
            eventOp: 'ExitRoom',
            reqNo: reqNo,
            userId: inputId.value,
            reqDate: 20171011133100123,
            roomId
        };

        try {
            console.log('send', callEndData);
            signalSocketIo.emit('knowledgetalk', callEndData);
            if (window.roomId) {
                window.roomId = null;
            }

        } catch (err) {
            if (err instanceof SyntaxError) {
                alert('there was a syntaxError it and try again:' + err.message);
            } else {
                throw err;
            }
        }
    });
});