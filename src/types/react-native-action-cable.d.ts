/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '@kesha-antonov/react-native-action-cable' {
  export class Cable {
    constructor(options: any);
    setChannel(name: string, subscription: any): any;
    channel(name: string): any;
  }

  export class ActionCable {
    static createConsumer(url: string): any;
  }
}
