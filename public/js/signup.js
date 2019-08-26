document.addEventListener('DOMContentLoaded', function () {
    let inputId = document.getElementById('InputId')
    let inputPw = document.getElementById('InputPw')
    let inputName = document.getElementById('InputName')
    let sigupBtn = document.getElementById('SigupBtn')

    let reqNo = 1

    signalSocketIo.on('gigagenie', function (data) {
        console.log('receive', data);

        if (!data.eventOp && !data.signalOp) {
            console.log('error', 'eventOp undefined');
        }
    });


    sigupBtn.addEventListener('click', function (e) {
        let signupData = {
            eventOp: 'SignUp',
            reqNo: reqNo++,
            reqDate: nowDate(),
            userId: inputId.value,
            userPw: inputPw.value,
            userName: inputName.value,
            deviceType: 'pc'
        }

        try {
            console.log('send', signupData);
            signalSocketIo.emit('gigagenie', signupData);
        } catch (err) {
            if (err instanceof SyntaxError) {
                alert(' there was a syntaxError it and try again : ' + err.message);
            } else {
                throw err;
            }
        }
    });
});