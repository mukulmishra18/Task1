import createPromiseCapability from '../utils/promise_capability.js';

export default class AudioController {
  constructor() {
    this._baseUrl = 'https://bitmovin-a.akamaihd.net/content/art-of-motion_drm/audio/1_stereo_192000/cenc_dash/';
    this._initUrl = this._baseUrl + 'init.mp4';
    this._templateUrl = this._baseUrl + 'segment_$Number$.m4s';
    this._numberOfChunks = 52;
    this._index = 0;
  }

  onMediaSourceOpen(mediaSource) {
    this._sourceBuffer = mediaSource.addSourceBuffer('audio/mp4; codecs="mp4a.40.2"');
    this._sourceBuffer.addEventListener('updateend', this._nextSegment.bind(this));
    return this._getChunk(this._initUrl).then((chunk) => {
      return this._appendToBuffer(chunk);
    });
  }

  _appendToBuffer(chunk) {
    if (chunk) {
      this._sourceBuffer.appendBuffer(new Uint8Array(chunk));
    }
  }

  _nextSegment() {
    let url = this._templateUrl.replace('$Number$', this._index);
    this._getChunk(url).then((chunk) => {
      this._index++;
      if (this._index > this._numberOfChunks) {
        this._sourceBuffer.removeEventListener('updateend', this._nextSegment.bind(this));
      }

      return this._appendToBuffer(chunk);
    });
  }

  _getChunk(url) {
    let xhrCapability = createPromiseCapability();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function(e) {
      if (xhr.status != 200) {
        console.warn('Unexpected status code ' + xhr.status + ' for ' + url);
        return false;
      }
      xhrCapability.resolve(xhr.response);
    };
    xhr.send();

    return xhrCapability.promise;
  }
}
