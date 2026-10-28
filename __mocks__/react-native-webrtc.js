class MediaStreamTrack {
  constructor() {
    this.enabled = true;
    this.stop = jest.fn();
  }
}
class MediaStream {
  constructor() {
    this.tracks = [new MediaStreamTrack()];
  }
  getTracks() {
    return this.tracks;
  }
  getAudioTracks() {
    return this.tracks;
  }
}
class RTCSessionDescription {
  constructor(init) {
    Object.assign(this, init);
  }
}
class RTCPeerConnection {
  constructor() {
    this.iceGatheringState = 'complete';
    this.localDescription = null;
    this.listeners = {};
  }
  addEventListener(name, fn) {
    this.listeners[name] = fn;
  }
  removeEventListener() {}
  addTrack() {}
  async setRemoteDescription() {}
  async setLocalDescription(desc) {
    this.localDescription = desc;
  }
  async createOffer() {
    return new RTCSessionDescription({ type: 'offer', sdp: 'v=0 offer' });
  }
  async createAnswer() {
    return new RTCSessionDescription({ type: 'answer', sdp: 'v=0 answer' });
  }
  close() {}
}
const mediaDevices = { getUserMedia: jest.fn(async () => new MediaStream()) };
const RTCAudioSession = { audioSessionDidActivate: jest.fn(), audioSessionDidDeactivate: jest.fn() };
module.exports = { RTCPeerConnection, RTCSessionDescription, MediaStream, MediaStreamTrack, mediaDevices, RTCAudioSession };
