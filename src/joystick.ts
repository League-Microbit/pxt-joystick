
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
     * Run the joystick functionality
     */
    //% blockId=joystick_run block="run joystick functionality"
    export function run() {
        joystick.init();
        radiop.init();
        negotiate.init("joystick");
        negotiate.findFreeChannel();

        basic.forever(function () {
            if (_runJoystick) {
                joystickp.sendIfChanged();
            } else {
                basic.pause(100);
            }
           
        });

        input.onButtonPressed(Button.AB, function () {
            serial.writeLine("Button A+B pressed, sending radio IR codes");
            negotiate.stopBeacon();
            _runJoystick = false;
            let startTime = input.runningTime();

            let channel = radiop.getChannel();
            let group = radiop.getGroup();
         
            while (input.runningTime() - startTime < 4000) {
                basic.showIcon(IconNames.Target);
                basic.clearScreen();
                joystick.sendIRRadioMessage(DigitalPin.P8, channel, group);
                basic.pause(750);
                basic.clearScreen();
               
            }
            negotiate.startBeacon();
            _runJoystick = true;
            
        });
    }
    


}