

/**
 * Joystick transmitter
 * This program reads the joystick and buttons and
 * sends the values out to the radio. It will select
 * an empty radio channel, which you can transmit
 * to your Cutebot by pressing the A+B buttons.
 */


//joystick.initRadioOnFreeChannel(DigitalPin.P8)

joystick.initRadioOnDefaultChannel(DigitalPin.P8)
serial.writeLine('== Joystick Transmitter ==')
serial.writeLine('Channel ' + radiop.getChannel() + ' group ' + radiop.getGroup());
joystick.blockingRadioTransfer(radiop.DeviceClass.CUTEBOT);


//radiop.initDefaults()
joystick.initJoystick();
joystick.calibrate();

basic.showIcon(IconNames.Heart);

// Install handler for incoming Bot Status (print x,y,buttons) using specialized API
radiop.onReceiveJoystickMessage(function (bs: radiop.JoyPayload) {
    // Decode 25-bit image value back to 5x5 and display
    radiop.intToImage(bs.image).showImage(0);
    bs.playSound();

});
        
basic.forever(function () {
    let jp = joystick.newJoyPayload();

    if (jp.buttonPressed(radiop.JoystickButton.A)) {
        jp.setIcon(IconNames.Heart);
    }   else if (jp.buttonPressed(radiop.JoystickButton.B)) {
        jp.setIcon(IconNames.Sad);
    } else if (jp.buttonPressed(radiop.JoystickButton.C)) {
        jp.setIcon(IconNames.Happy);
    }   else if (jp.buttonPressed(radiop.JoystickButton.D)) {
        jp.setIcon(IconNames.Giraffe);
    }   else if (jp.buttonPressed(radiop.JoystickButton.E)) {
        jp.setIcon(IconNames.Ghost);
    }   else if (jp.buttonPressed(radiop.JoystickButton.F)) {
        jp.setIcon(IconNames.Skull);
    }

    if(radiop.sendIfChanged(jp)){
        basic.pause(100)
    }

})
