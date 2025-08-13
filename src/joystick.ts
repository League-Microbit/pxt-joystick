
//% color="#FF6600" weight=100 icon="\uf11b"
namespace joystick { 

    export let _runJoystick: boolean = true;

    let irtInit: boolean = false; //initRadioTransfer has been called
    let joyBackgroundInit: boolean = false; //initJoyBackground has been called

    let irLedPin: DigitalPin = DigitalPin.P8; // Default IR LED pin



    let joystickInitialize = false;
    let defaultCenter = 512; // Default center value for joystick
    let jsXCenter = 512; // Default center value for joystick X
    let jsXOffset = 0; // Offset for joystick X
    let jsYCenter = 512; // Default center value for joystick Y
    let jsYOffset = 0; // Offset for joystick Y
    let jsDeadzone = 10; // Deadzone for joystick movement

    /**
     * Run the joystick functionality
     */
    //% blockId=joystick_run block="Init joystick channel $channel group $group Led pin $pin"
    //% channel.min=1 channel.max=100 channel.defl=1
    //% group.min=1 group.max=254 group.defl=1
    //% irLedPin.defl=P8
    //% irLedPin.fieldEditor="gridpicker" irLedPin.fieldOptions.columns=
    export function init(channel: number, group: number, pin: DigitalPin = DigitalPin.P8): void {

        radiop.init(radiop.BROADCAST_CHANNEL, radiop.BROADCAST_GROUP, 7)
        
        if (channel === 0 || group === 0) {
            radiop.findFreeChannel();
        }  else {
            radiop.init(channel, group, 7);
        }

        irLedPin = pin;

        radiop.initBeacon("joystick");
        radiop.initJoystick();

        initRadioTransfer(); // Install A+B buttons to run the IR transfer
        initJoyBackground(); // Start the background task to send joystick data

        serial.writeLine(`Joystick running on channel ${radiop.getChannel()}, group ${radiop.getGroup()}, pin ${irLedPin}`);
        basic.showIcon(IconNames.Happy);
        basic.pause(500);
        basic.clearScreen();

    }

    /**
     *  Copy of radiop.initJoystick
     * @returns
     */
    export function initJoystick(): void {
        if (joystickInitialize) return;
        joystickInitialize = true;

        pins.digitalWritePin(DigitalPin.P0, 0)
        pins.setPull(DigitalPin.P12, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P13, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P14, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P15, PinPullMode.PullUp)
        pins.digitalWritePin(DigitalPin.P16, 1)

        // Calibrate joystick center position
        let xSum = 0;
        let ySum = 0;
        let sampleCount = 0;
        let startTime = input.runningTime();
        
        // Collect samples for 1 second
        basic.showIcon(IconNames.Sword);
        while (input.runningTime() - startTime < 1000) {
            xSum += pins.analogReadPin(radiop.JoystickBitPin.X);
            ySum += pins.analogReadPin(radiop.JoystickBitPin.Y);
            sampleCount++;
            basic.pause(10); // Small pause between readings
        }
        
        // Calculate average center positions
        if (sampleCount > 0) {
            jsXCenter = Math.round(xSum / sampleCount);
            jsYCenter = Math.round(ySum / sampleCount);
        }
        
        jsXOffset = jsXCenter - defaultCenter; // Adjust offset based on center
        jsYOffset = jsYCenter - defaultCenter; // Adjust offset based on center

        serial.writeLine("Joystick calibrated - Center X: " + jsXCenter + ", Y: " + jsYCenter);
        basic.showIcon(IconNames.Yes);
        basic.pause(200);
        basic.clearScreen();

    }

    /**
    * Run the joystick functionality on free channel
    */
    //% blockId=joystick_run_defl block="Init joystick on open channel Led pin $pin"

    //% irLedPin.defl=P8
    //% irLedPin.fieldEditor="gridpicker" irLedPin.fieldOptions.columns=
    export function initFreeChannel( pin: DigitalPin = DigitalPin.P8): void {
        init(0,0,pin);
    }




    /**
     * Setup the message handler for sending radio pairing codes.
     */
    function initRadioTransfer() {

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