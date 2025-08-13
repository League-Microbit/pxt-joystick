

    /**
     * Setup the message handler for sending radio pairing codes.
     */
    //% blockId=joystick_init_radio_transfer block="Initialize radio transfer handler"
    export function initRadioTransfer() {

        if (irtInit) return;
        irtInit = true;

        input.onButtonPressed(Button.AB, function () {
            serial.writeLine("initRadioTransfer: Button A+B pressed, sending radio IR codes");

            let startTime = input.runningTime();
            let channel = radiop.getChannel();
            let group = radiop.getGroup();

            basic.showIcon(IconNames.Target);
            basic.pause(250);
            basic.clearScreen();

            radio.off();
            radiop.stopBeacon();
            led.enable(false); // Disable LED matrix to save power during IR transmission
            _runJoystick = false;

            while (input.runningTime() - startTime < 5000) {
                joystick.sendIRRadioMessage(irLedPin, channel, group);
                basic.pause(300);
            }
       
            radio.on();
            radiop.startBeacon();
            led.enable(true); // Re-enable LED matrix
            _runJoystick = true;
            
            serial.writeLine("initRadioTransfer: Radio IR codes sent, radio back on");
        });
        
    }

    function initJoyBackground() {
        if (joyBackgroundInit) return;
        joyBackgroundInit = true;

        control.runInBackground(function () {
            while (true) {
                if (_runJoystick) {
                    if (radiop.sendIfChanged(joystick.newJoyPayload())) {
                        displayLedPosition(); // Update the LED position based on joystick movement
                    }
                    basic.pause(10);
                } else {
                    basic.pause(500);
                }
            }
           
        });
    }
