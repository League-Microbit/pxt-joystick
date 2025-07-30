


namespace joytest {

    export function testListenForFriends() {
        
        radiop.init();
        basic.showIcon(IconNames.Happy);

        negotiate.onReceive((payload) => {
            serial.writeLine("TL Received: " + payload.str + " on channel " + radiop.getChannel() + ", group " + radiop.getGroup());
        });

    }

}