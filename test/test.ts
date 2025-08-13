
//joytest.testIPReceive();
//joytest.testIPSend();

//joytest.testRadioChannelIrSend();

//joystick.run();
//joystick._runJoystick = false;

//joytest.testListenForFriends();

//joytest.testNextNecCode();

joystick.initJoystick();
joystick.calibrate();

joytest.testSendNecCode();

while (true) {
    radiop.sendIfChanged_(joystick.newJoyPayload());
    basic.pause(100);
}