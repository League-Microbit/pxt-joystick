

namespace joytest {

    export function testSendNecCode() {
        
        //leagueir.calibrate_cpp(DigitalPin.P0);

        while (true) {
            leagueir.sendIrAddressCommand(DigitalPin.P8, 0xD00D, 0xABCD);
            pause(500);
            //leagueir.sendIrAddressCommand(DigitalPin.P8, 0xFFFF, 0x1234);
            //pause(500);
        }

    }

    export function testNextNecCode() {
            
     
        while (true) {
            basic.showIcon(IconNames.Confused);
            let [address, command] = leagueir.readNecAddressCommand(DigitalPin.P16, 2000);
            if (address != 0) {
                basic.showIcon(IconNames.Happy);
            } else {
                basic.showIcon(IconNames.Sad);
            }
            
            serial.writeLine("Address: " + address + ", Command: " + command);
            pause(100);
        }

    }

    export function testRadioChannelReceive() {
        leagueir.onNecReceived(DigitalPin.P16, function (address: number, command: number) {
            if (address == leagueir.Address.RadioChannel) {
                let channel = (command >> 8) & 0xFF;
                let group = command & 0xFF;
        
                serial.writeLine("Radio Channel: " + channel + ", Group: " + group);
                basic.showIcon(IconNames.Happy);
            } else {
                serial.writeLine("Unknown address: " + address);
                basic.showIcon(IconNames.Sad);
            }
            basic.pause(100);
            basic.clearScreen();
        });
    }

    export function testRadioChannelIrSend() {

        // This makes the IR system, if it uses PWM, have timing problems, due
        // to reading the analog pins for calibration.
        
        let i = 0;


        radio.off();
        radiop.stopBeacon();

        basic.forever(function () {
            let channel = i;
            let group = Math.floor(i / 2);
            i++;
            basic.showIcon(IconNames.Target);

            joystick.sendIRRadioMessage(DigitalPin.P8, channel, group);
            
            basic.clearScreen();
            basic.pause(1000);
        });
    }
    
    


}