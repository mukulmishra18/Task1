import createPromiseCapability from '../utils/promise_capability.js';

export default class VideoController {
  constructor(video) {
    this._video = video;
    this._baseUrl = 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/video/720_2400000/dash/';
    this._initUrl = this._baseUrl + 'init.mp4';
    this._templateUrl = this._baseUrl + 'segment_$Number$.m4s';
    this._numberOfChunks = 52;
    this._index = 0;
  }

  onMediaSourceOpen(mediaSource) {
    this._sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.4d401f"');
    this._sourceBuffer.addEventListener('updateend', this._nextSegment.bind(this));
    return this._getChunk(this._initUrl).then((chunk) => {
      this._appendToBuffer(chunk).then(() => {
        this._video.play();
      });
    });
  }


  _appendToBuffer(chunk) {
    let appendCapability = createPromiseCapability();
    if (chunk) {
      this._sourceBuffer.appendBuffer(new Uint8Array(chunk));
      appendCapability.resolve();
    }
    return appendCapability.promise;
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
