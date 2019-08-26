document.addEventListener('DOMContentLoaded', function () {
    const inputId = document.getElementById('inputid');
    const inputPw = document.getElementById('inputpw');
    const inputTarget = document.getElementById('inputTarget');
    const loginBtn = document.getElementById('loginBtn');
    const callBtn = document.getElementById('callBtn');
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
            callBtn.disabled = false;
        }

        if (data.eventOp === 'Call') {
            if (data.message !== 'OK') {
                tLogBox('error', 'Call failed');
                return;
            }
            callBtn.disabled = true;
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: false })
                .then(stream => {
                    localStream = stream;
                    localVideo.srcObject = stream;
                });
        }

        if (data.eventOp === 'SDP') {
            if (data.sdp.type === 'offer') {
                roomId = data.roomId;
                peerCon = new RTCPeerConnection(configuration);

                peerCon.onicecandidate = onIceCandidateHandler;
                peerCon.onaddstream = onAddStreamHandler;

                peerCon.addStream(localStream);

                peerCon.setRemoteDescription(new RTCSessionDescription(data.sdp));
                peerCon.createAnswer().then(sdp => {
                    peerCon.setLocalDescription(new RTCSessionDescription(sdp));

                    let ansData = {
                        eventOp: 'SDP',
                        sdp,
                        useMediaSvr: 'N',
                        userId: inputId.value,
                        roomId,
                        reqNo: reqNo++,
                        reqDate: nowDate()
                    };

                    try {
                        console.log('send', ansData);
                        signalSocketIo.emit('knowledgetalk', ansData);
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

    callBtn.addEventListener('click', function (e) {
        let callData = {
            eventOp: 'Call',
            reqNo: reqNo++,
            reqDate: nowDate(),
            userId: inputId.value,
            targetId: inputTarget.value,
            serviceType: 'call',
            reqDeviceType: 'pc'
        };

        try {
            console.log('send', callData);
            signalSocketIo.emit('knowledgetalk', callData);
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
        } catch (err) {
            if (err instanceof SyntaxError) {
                alert('there was a syntaxError it and try again:' + err.message);
            } else {
                throw err;
            }
        }
    });
});