

/**
 * Joystick transmitter
 * This program reads the joystick and buttons and
 * sends the values out to the radio. It will select
 * an empty radio channel, which you can transmit
 * to your Cutebot by pressing the A+B buttons.
 */

joystick.initRadioOnFreeChannel(DigitalPin.P8)
joystick.initRadioTransfer();
joystick.initJoystick();
joystick.calibrate();

let t = input.runningTime()

basic.forever(function () {
    let payload = joystick.newJoyPayload();
    if (radiop.sendIfChanged(payload)) {
        serial.writeLine("Joy Payload: " + payload.hash + " " + payload.str);
    }

})
