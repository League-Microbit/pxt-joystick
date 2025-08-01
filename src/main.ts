
joystick.run();


while (true) {
    leagueir.sendIrAddressCommand_cpp(DigitalPin.P8, 0xFF00, 0xABCD);
    pause(500);
    leagueir.sendIrAddressCommand_cpp(DigitalPin.P8, 0x00FF, 0xABCD);
    pause(500);
}
