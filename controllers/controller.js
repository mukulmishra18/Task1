import createMediaSource from '../utils/mediasource_util.js';
import AudioController from './audio_controller.js';
import VideoController from './video_controller.js';

export default class Controller {
	constructor(audio, video) {
    this._mediaSource = createMediaSource();

    this._audioController = new AudioController();
    this._videoController = new VideoController(video);

    this._mediaSource.onsourceopen = this._onMediaSourceOpen.bind(this);
    video.src = window.URL.createObjectURL(this._mediaSource);
    audio.src = window.URL.createObjectURL(this._mediaSource);

    video.addEventListener('play', () => { audio.play(); });
    video.addEventListener('pause', () => { audio.pause(); });
  }

  _onMediaSourceOpen() {
    this._videoController.onMediaSourceOpen(this._mediaSource);
    this._audioController.onMediaSourceOpen(this._mediaSource);
  }
}
