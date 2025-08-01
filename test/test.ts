
    
joystick.run();

while (true) {
    basic.showIcon(IconNames.Confused);
    let [address, command] = leagueir.readNecAddressCommand(DigitalPin.P16, 2000);
    if (address != 0) {
        basic.showIcon(IconNames.Happy);
    } else {
        basic.showIcon(IconNames.Sad);
    }
    
    serial.writeLine("Address: " + address + ", Command: " + command);
    pause(100);
}


//joytest.testIPReceive();
//joytest.testIPSend();

//joytest.testRadioChannelIrSend();

//joystick.run();
//joystick._runJoystick = false;

//joytest.testListenForFriends();

//joytest.testNextNecCode();
