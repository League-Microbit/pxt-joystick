
namespace joystick { 

    let _runJoystick: boolean = true;

    export function sendIRRadioMessage(pin: DigitalPin, channel: number , group: number): void {
        let command = (channel << 8) | group;
        leagueir.sendIrAddressCommand(pin, leagueir.Address.RadioChannel, command);
    }

    export function init(): void {
        joystickp.init()
    }

    /**
     * Setup the message handler for sending radio pairing codes.
     */
    function initRadioTransfer() {
        input.onButtonPressed(Button.AB, function () {
            serial.writeLine("initRadioTransfer: Button A+B pressed, sending radio IR codes");

            radio.off();
            negotiate.stopBeacon();
            _runJoystick = false;

            let startTime = input.runningTime();

            let channel = radiop.getChannel();
            let group = radiop.getGroup();
         

            while (input.runningTime() - startTime < 10000) {
                basic.showIcon(IconNames.Target);
                joystick.sendIRRadioMessage(DigitalPin.P8, channel, group);
                basic.pause(100);
                basic.clearScreen();
                basic.pause(100);                
               
            }
            
            radio.on();
            negotiate.startBeacon();
            _runJoystick = true;
            
            serial.writeLine("initRadioTransfer: Radio IR codes sent, radio back on");
        });
        
    }

    /**
     * Run the joystick functionality
     */
    //% blockId=joystick_run block="run joystick functionality"
    export function run(channel: number = 0, group: number = 0): void {

        joystick.init();
        radiop.init();
        negotiate.init("joystick");

        if (channel === 0 || group === 0) {
            negotiate.findFreeChannel();
        }  else {
            radiop.setChannel(channel);
            radiop.setGroup(group);
        }

        serial.writeLine(`Joystick running on channel ${radiop.getChannel()}, group ${radiop.getGroup()}`);

        initRadioTransfer(); // Install A+B buttons to run the IR transfer

        basic.forever(function () {
            if (_runJoystick) {
                joystickp.sendIfChanged();
            } else {
                basic.pause(100);
            }
           
        });


    }
    


}