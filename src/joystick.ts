
//% color="#FF6600" weight=100 icon="\uf11b"
namespace joystick { 

    export let _runJoystick: boolean = true;

    let irtInit: boolean = false; //initRadioTransfer has been called
    let joyBackgroundInit: boolean = false; //initJoyBackground has been called

    let irLedPin: DigitalPin = DigitalPin.P8; // Default IR LED pin


    let joystickInitialize = false;

    // Calibration values
    let defaultCenter = 512; // Default center value for joystick
    let jsXCenter = 512; // Default center value for joystick X
    let jsXOffset = 0; // Offset for joystick X
    let jsYCenter = 512; // Default center value for joystick Y
    let jsYOffset = 0; // Offset for joystick Y
    let jsDeadzone = 10; // Deadzone for joystick movement


    // Joystickbit pins for joystick and buttons
    export enum JoystickBitPin {
        C = DigitalPin.P12,
        D = DigitalPin.P13,
        E = DigitalPin.P14,
        F = DigitalPin.P15,
        X = AnalogPin.P1,
        Y = AnalogPin.P2,
    }
    /**
     * Run the joystick functionality
     */
    //% blockId=joystick_run block="Init joystick radio channel $channel group $group Led pin $pin"
    //% channel.min=1 channel.max=100 channel.defl=1
    //% group.min=1 group.max=254 group.defl=1
    //% irLedPin.defl=P8
    //% irLedPin.fieldEditor="gridpicker" irLedPin.fieldOptions.columns=
    export function initRadio(channel: number, group: number, pin: DigitalPin = DigitalPin.P8): void {

        radiop.init(channel, group, 7);

        irLedPin = pin;

        radiop.initBeacon("joystick");

        //initRadioTransfer(); // Install A+B buttons to run the IR transfer

    }

    /**
     * Run the joystick functionality
     */
    //% blockId=joystick_run block="Init joystick radio channel on a free channel pin $pin"
    //% irLedPin.defl=P8
    //% irLedPin.fieldEditor="gridpicker" irLedPin.fieldOptions.columns=
    export function initRadioOnFreeChannel( pin: DigitalPin = DigitalPin.P8): void {

        radiop.init(radiop.BROADCAST_CHANNEL, radiop.BROADCAST_GROUP, 7)
        
        radiop.findFreeChannel();

        irLedPin = pin;

        radiop.initBeacon("joystick");

    }

    /**
     * Initialize on the channle/group chosed from the machine id, 
     * and don't test if it is clear. 
     */
    //% blockId=joystick_run block="Init joystick default radio channel pin $pin"
    //% irLedPin.defl=P8
    //% irLedPin.fieldEditor="gridpicker" irLedPin.fieldOptions.columns=
    export function initRadioOnDefaultChannel(pin: DigitalPin = DigitalPin.P8): void {
        
        let [channel, group] = radiop.getInitialRadioRequest();
       
        radiop.init(channel, group, 7);

        irLedPin = pin;

        radiop.initBeacon("joystick");
    
    }



    /**
     *  Copy of radiop.initJoystick
     * @returns
     */
    //% blockId=joystick_init block="Initialize joystick"
    export function initJoystick(): void {
        if (joystickInitialize) return;
        joystickInitialize = true;

        // Setting .P0 seems to throw off IR timing, prob
        // b/c .P0 is attached to the speaker / audio mixer
        // and writing to it sets up a PWM resource. 
        //pins.digitalWritePin(DigitalPin.P0, 0)  // turn off buzzer
        //pins.digitalWritePin(DigitalPin.P16, 1) // Turn off vibration

        // Configure buttons
        pins.setPull(DigitalPin.P12, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P13, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P14, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P15, PinPullMode.PullUp)
     
    }

    /**
     * Calibrate the joystick to find the value it reads when at rest
     */
    //% blockId=joystick_calibrate block="Calibrate joystick"
    export function calibrate() {
           // Calibrate joystick center position
        let xSum = 0;
        let ySum = 0;
        let sampleCount = 0;
        let startTime = input.runningTime();
        
        // Collect samples for 1 second
        basic.showIcon(IconNames.Sword);
        while (input.runningTime() - startTime < 1000) {
            xSum += pins.analogReadPin(JoystickBitPin.X);
            ySum += pins.analogReadPin(JoystickBitPin.Y);
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

        //serial.writeLine("Joystick calibrated - Center X: " + jsXCenter + ", Y: " + jsYCenter);
        basic.showIcon(IconNames.Yes);
        basic.pause(200);
        basic.clearScreen();

        
    }


    /**
     * Create a JoyPayload from current hardware state
     * @param readAccelerometer Whether to read accelerometer values (default: false)
     * @returns A new JoyPayload instance with current joystick state
     */
    //% blockId=joystick_new_payload block="create joystick payload"
    export function newJoyPayload(readAccelerometer: boolean = false): radiop.JoyPayload {

        // Read joystick X and Y from analog pins
        let rawX = pins.analogReadPin(JoystickBitPin.X);
        let rawY = pins.analogReadPin(JoystickBitPin.Y);
        
        // Apply offsets to center the values
        let x = Math.abs(rawX - jsXOffset);
        let y = Math.abs(rawY - jsYOffset);

        // Check if values are within deadzone and reset to center if so
        if (Math.abs(x - defaultCenter) <= jsDeadzone) {
            x = defaultCenter;
        }
        if (Math.abs(y - defaultCenter) <= jsDeadzone) {
            y = defaultCenter;
        }
        
        // Read buttons (micro:bit built-in + joystick buttons)
        let buttons: number[] = [];
        if (input.buttonIsPressed(Button.A)) buttons.push(0);
        if (input.buttonIsPressed(Button.B)) buttons.push(1);
        if (input.logoIsPressed()) buttons.push(2);
        if (pins.digitalReadPin(JoystickBitPin.C) == 0) buttons.push(3);  // C button (active low)
        if (pins.digitalReadPin(JoystickBitPin.D) == 0) buttons.push(4);  // D button (active low)
        if (pins.digitalReadPin(JoystickBitPin.E) == 0) buttons.push(5);  // E button (active low)
        if (pins.digitalReadPin(JoystickBitPin.F) == 0) buttons.push(6);  // F button (active low)
        
        // Read accelerometer values only if requested
        let accelX = readAccelerometer ? input.acceleration(Dimension.X) : 0;
        let accelY = readAccelerometer ? input.acceleration(Dimension.Y) : 0;
        let accelZ = readAccelerometer ? input.acceleration(Dimension.Z) : 0;
        
        return new radiop.JoyPayload(x, y, buttons, accelX, accelY, accelZ);
    }


    /**
    * Send the radio info over IR until wee get a peer with the given class Id
    */
    //% block="Transfer radio info, blocking"
    export function blockingRadioTransfer(classId: string) {

        let startTime = input.runningTime();
        let channel = radiop.getChannel();
        let group = radiop.getGroup();

    
        while (true) {
            basic.showIcon(IconNames.Target);
            joystick.sendIRRadioMessage(irLedPin, channel, group);
            basic.pause(100);
            basic.clearScreen()
            basic.pause(100);
            
            if(input.buttonIsPressed(Button.AB)){
                basic.clearScreen()
                return
            }

            if(radiop.peerDb.findPeerByClassId(classId)){
                basic.clearScreen()
                return
            }
        }

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