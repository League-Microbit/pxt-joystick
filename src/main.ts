

/**
 * Joystick transmitter
 * This program reads the joystick and buttons and
 * sends the values out to the radio. It will select
 * an empty radio channel, which you can transmit
 * to your Cutebot by pressing the A+B buttons.
 */


//joystick.initRadioOnFreeChannel(DigitalPin.P8)

//joystick.initRadioOnDefaultChannel(DigitalPin.P8)
//joystick.blockingRadioTransfer(radiop.DeviceClass.CUTEBOT);

// Prepare a list of icons to pick from for transmission
const icons: IconNames[] = [
    IconNames.Heart,
    IconNames.SmallHeart,
    IconNames.Happy,
    IconNames.Sad,
    IconNames.Giraffe,
    IconNames.Ghost,
    IconNames.Skull,
    IconNames.Fabulous,
    IconNames.Duck,
    IconNames.Sword
];


radiop.initDefaults()
joystick.initJoystick();
joystick.calibrate();

// Install handler for incoming Joy payloads (print x,y,buttons) using specialized API
radiop.onReceiveJoystickMessage(function (jp) {
    // Decode 25-bit image value back to 5x5 and display
    radiop.intoToImage(jp.image).showImage(0);
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
