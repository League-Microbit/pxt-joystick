

/**
 * Joystick transmitter
 * This program reads the joystick and buttons and
 * sends the values out to the radio. It will select
 * an empty radio channel, which you can transmit
 * to your Cutebot by pressing the A+B buttons.
 */


joystick.initRadioOnFreeChannel(DigitalPin.P8)
joystick.blockingRadioTransfer("cutebot")
joystick.initJoystick();
joystick.calibrate();

input.onButtonPressed(Button.AB, function() {
    joystick.blockingRadioTransfer("cutebot")
})

basic.forever(function () {
    let payload = joystick.newJoyPayload();
    if(radiop.sendIfChanged(payload)){
        basic.pause(100)
    }

})
