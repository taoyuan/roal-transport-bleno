import {Characteristic} from "bleno";
import {Message, RPC, Transport, TransportContext} from "roal";

export const STATUS_SUCCESS = Characteristic.RESULT_SUCCESS;
export const STATUS_INVALID_OFFSET = Characteristic.RESULT_INVALID_OFFSET;
export const STATUS_UNEXPECTED_ERROR = Characteristic.RESULT_UNLIKELY_ERROR;

export interface Notify {
  (data: Buffer);
}

export interface RoalCharacteristicOptions {
  [name: string]: any;
}

export class RoalCharacteristic extends Characteristic {
  protected _transport: BlenoTransport;
  protected _rpc : RPC;
  protected _notify?: Notify;

  constructor(uuid: string, methods: {[name: string]: Function}, options?: RoalCharacteristicOptions) {
    super(Object.assign({
      uuid,
      properties: ['write', 'notify'],
      value: null
    }, options));

    this._transport = new BlenoTransport(this);
    this._rpc = RPC.create(this._transport);
    this._rpc.methods(methods);
  }

  notify(data: Buffer) {
    if (this._notify) {
      this._notify(data);
    }
  }

  onReadRequest(offset: number, cb: (code: number, data: Buffer) => void) {
    console.log('READ request');
    cb(STATUS_SUCCESS, Buffer.allocUnsafe(0));
  }

  onWriteRequest(data: Buffer, offset: number, withoutResponse: boolean, cb: (code: number) => void) {
    try {
      this._transport.read(data);
      cb(STATUS_SUCCESS);
    } catch (e) {
      this.notify(Buffer.from(e.message));
      cb(STATUS_UNEXPECTED_ERROR)
    }
  }

  onSubscribe(maxValueSize: number, updateValueCallback: Notify) {
    this._notify = updateValueCallback;
  }

  onUnsubscribe() {
    this._notify = undefined;
  }

}

export class BlenoTransport extends Transport {
  constructor(public characteristic: RoalCharacteristic) {
    super();
  }

  read(data: Buffer) {
    this.recv(JSON.parse(data.toString('utf8')));
  }

  write(data: Buffer) {
    this.characteristic.notify(data);
  }

  send(message: Message, context?: TransportContext): void {
    this.write(Buffer.from(JSON.stringify(message)));
  }
}
