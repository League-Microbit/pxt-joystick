
namespace joystick { 

    export let _runJoystick: boolean = true;

    let irtInit: boolean = false;
    let joyBackgroundInit: boolean = false;

    export function sendIRRadioMessage(pin: DigitalPin, channel: number , group: number): void {
        let command = (channel << 8) | group;
        leagueir.sendIrAddressCommand(pin, leagueir.Address.RadioChannel, command);
    }

    export function init(): void {
        joystickp.init()
    }


    function map(input:number, minIn:number, maxIn:number, minOut:number, maxOut:number): number {
        return (input - minIn) * (maxOut - minOut) / (maxIn - minIn) + minOut;
    }



    let lastPx: number = 0;
    let lastPy: number = 0;

    function displayLedPosition(): void {
        let x = pins.analogReadPin(joystickp.JoystickBitPin.X);
        let y = pins.analogReadPin(joystickp.JoystickBitPin.Y);

        let px = map(x - 100, 1023, 0, -2, 2) + 2
        let py = map(y - 100, 1023, 0, -2, 2) + 2

        led.unplot(lastPx, lastPy); // Clear the last position
        led.plot(px, py)
        lastPx = px;
        lastPy = py;
    }


    /**
     * Setup the message handler for sending radio pairing codes.
     */
    function initRadioTransfer() {

        if (irtInit) return;
        irtInit = true;

        input.onButtonPressed(Button.AB, function () {
            serial.writeLine("initRadioTransfer: Button A+B pressed, sending radio IR codes");

            radio.off();
            negotiate.stopBeacon();
            _runJoystick = false;

            let startTime = input.runningTime();

            let channel = radiop.getChannel();
            let group = radiop.getGroup();
         

            while (input.runningTime() - startTime < 4000) {
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
    function initJoyBackground() {
        if (joyBackgroundInit) return;
        joyBackgroundInit = true;

        control.runInBackground(function () {
            while (true) {
                if (_runJoystick) {
                    if (joystickp.sendIfChanged()) {
                        displayLedPosition(); // Update the LED position based on joystick movement
                    }
                    basic.pause(10);
                } else {
                    basic.pause(1000);
                }
            }
           
        });
    }

    /**
     * Run the joystick functionality
     */
    //% blockId=joystick_run block="run joystick functionality"
    export function run(channel: number = 0, group: number = 0): void {

        joystick.init();
        negotiate.init("joystick");
        
        if (channel === 0 || group === 0) {
            radiop.init();
            negotiate.findFreeChannel();
        }  else {
            radiop.init(channel, group);
        }

        initRadioTransfer(); // Install A+B buttons to run the IR transfer
        initJoyBackground(); // Start the background task to send joystick data

        serial.writeLine(`Joystick running on channel ${radiop.getChannel()}, group ${radiop.getGroup()}`);
        basic.showIcon(IconNames.Happy);
        basic.pause(500);
        basic.clearScreen();

    }


}