import * as bleno from "bleno";
import {PrimaryService} from "bleno";
import {RoalCharacteristic} from "../../src";
import * as service from "./service";

console.log('bleno - echo');

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('echo', ['ec00']);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    bleno.setServices([
      new PrimaryService({
        uuid: 'ec00',
        characteristics: [
          new RoalCharacteristic('ec0e', service)
        ]
      })
    ]);
  }
});
