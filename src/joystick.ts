
namespace joystick { 

    export let _runJoystick: boolean = true;

    let irtInit: boolean = false; //initRadioTransfer has been called
    let joyBackgroundInit: boolean = false; //initJoyBackground has been called

    let irLedPin: DigitalPin = DigitalPin.P8; // Default IR LED pin

    /**
     * Run the joystick functionality
     */
    //% blockId=joystick_run block="run joystick functionality"
    //% channel.min=1 channel.max=100 channel.defl=1
    //% group.min=1 group.max=254 group.defl=1
    //% irLedPin.defl=P8
    //% irLedPin.fieldEditor="gridpicker" irLedPin.fieldOptions.columns=
    export function init(channel: number = 0, group: number = 0, irLedPin: DigitalPin = DigitalPin.P8): void {

        radiop.init();
        radiop.initBeacon("joystick");
        
        if (channel === 0 || group === 0) {
            radiop.init();
            radiop.findFreeChannel();
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



    /**
     * Setup the message handler for sending radio pairing codes.
     */
    function initRadioTransfer() {

        if (irtInit) return;
        irtInit = true;

        input.onButtonPressed(Button.AB, function () {
            serial.writeLine("initRadioTransfer: Button A+B pressed, sending radio IR codes");

            radio.off();
            radiop.stopBeacon();
            _runJoystick = false;

            let startTime = input.runningTime();

            let channel = radiop.getChannel();
            let group = radiop.getGroup();
         

            while (input.runningTime() - startTime < 4000) {
                basic.showIcon(IconNames.Target);
                joystick.sendIRRadioMessage(irLedPin, channel, group);
                basic.pause(100);
                basic.clearScreen();
                basic.pause(100);                
               
            }
            
            radio.on();
            radiop.startBeacon();
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
                    if (radiop.sendIfChanged()) {
                        displayLedPosition(); // Update the LED position based on joystick movement
                    }
                    basic.pause(10);
                } else {
                    basic.pause(500);
                }
            }
           
        });
    }

    /** Send a RadioChannel message through the IR transmitter
     * @param pin The pin to use for IR transmission
     * @param channel The radio channel to send
     * @param group The radio group to send
     */
    export function sendIRRadioMessage(pin: DigitalPin, channel: number , group: number): void {
        let command = (channel << 8) | group;
        leagueir.sendIrAddressCommand(pin, leagueir.Address.RadioChannel, command);
    }


    let lastPx: number = 0;
    let lastPy: number = 0;

    function map(input:number, minIn:number, maxIn:number, minOut:number, maxOut:number): number {
        return (input - minIn) * (maxOut - minOut) / (maxIn - minIn) + minOut;
    }




    /** 
     * Display the current position of the joystick on the LED matrix
     * 
     */
    function displayLedPosition(): void {
        /*
        let x = pins.analogReadPin(joystickp.JoystickBitPin.X);
        let y = pins.analogReadPin(joystickp.JoystickBitPin.Y);

        let px = map(x - 100, 1023, 0, -2, 2) + 2
        let py = map(y - 100, 1023, 0, -2, 2) + 2

        led.unplot(lastPx, lastPy); // Clear the last position
        led.plot(px, py)
        lastPx = px;
        lastPy = py;
        */
    }






}