import createPromiseCapability from '../utils/promise_capability.js';

export default class AudioController {
  constructor(mediaSource) {
    this._baseUrl = 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/video/720_2400000/dash/';
    this._initUrl = this.baseUrl + 'init.mp4';
    this._templateUrl = this.baseUrl + 'segment_$Number$.m4s';
    this._mediaSource = mediaSource;
    this._numberOfChunks = 52;
    this._index = 0;

    this._mediaSource.onsourceopen = this._onMediaSourceOpen.bind(this);
  }

  _onMediaSourceOpen() {
    this._sourceBuffer = this._mediaSource.addSourceBuffer('video/mp4; codecs="avc1.4d401f"');
    this._sourceBuffer.addEventListener('updateend', this._nextSegment.bind(this));
    return this._getChunk(this._initUrl).then((chunk) => {
      this._appendToBuffer(chunk);
    });
  }


  _appendToBuffer(chunk) {
    return this._sourceBuffer.appendBuffer(chunk);
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
