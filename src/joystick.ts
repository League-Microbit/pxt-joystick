
namespace joystick { 


    export function sendIRRadioMessage(pin: DigitalPin, channel: number , group: number): void {
        let command = (channel << 8) | group;
        leagueir.sendIrAddressCommand(pin, leagueir.Address.RadioChannel, command);
    }

    export function recieveIrMessages(pin: DigitalPin) {
        leagueir.onIrPacketReceived(pin, function (id: number, status: number, command: number, value: number) {

        });
    }

    export function init(): void {
     
    }

    /**
     * Run the joystick functionality
     */
    //% blockId=joystick_run block="run joystick functionality"
    export function run() {
        radiop.init();
        negotiate.init("joystick");
        negotiate.findFreeChannel();

        basic.forever(function () {
            joystickp.sendIfChanged();
        });

        input.onButtonPressed(Button.AB, function () {
            serial.writeLine("Button A+B pressed, sending radio IR codes");
            negotiate.stopBeacon();
            let startTime = input.runningTime();

            let channel = radiop.getChannel();
            let group = radiop.getGroup();
            let command = (channel << 8) | group;

            while (input.runningTime() - startTime < 4000) {
                basic.showIcon(IconNames.Target);
                joystick.sendIRRadioMessage(DigitalPin.P8, channel, group);
                basic.pause(650);
                basic.clearScreen();
                basic.pause(100);
            }
            negotiate.startBeacon();
            
        });
    }
    


}