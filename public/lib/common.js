onst signalServerMultiConnectURL = 'https://knowledgetalk.co.kr:7511/SignalServer';

const K_STUN = { urls: 'stun:106.240.247.44:46000' };
const K_TURN = {
    urls: 'turn:106.240.247.44:46000',
    credential: 'kpoint01',
    username: 'kpoint'
};
const configuration = {
    iceServers: [K_TURN]
};

let signalSocketIo = null;
let signalServerMultiUrl = signalServerMultiConnectURL;

(function init() {
    if (signalServerMultiUrl) {
        try {
            signalSocketIo = io.connect(signalServerMultiUrl,
                { reconnect: true, 'transports': ['websocket'] });
        } catch (err) {
            console.warn('signaling server connect error.');
        }
    }
})();

function nowDate() {
    var today = new Date();
    var yyyy = today.getFullYear();
    var mm = today.getMonth() + 1;
    var dd = today.getDate();

    if (mm < 10) {
        mm = '0' + mm;
    }
    if (dd < 10) {
        dd = '0' + dd;
    }

    return '' + yyyy + mm + dd;
}

