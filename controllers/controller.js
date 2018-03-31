import createMediaSource from '../utils/mediasource_util.js';
import AudioController from './audio_controller.js';
import VideoController from './video_controller.js';

export default class Controller {
	constructor(audio, video) {
    this._mediaSource = createMediaSource();
    this._audioController = new AudioController(this._mediaSource);
    this._videoController = new VideoController(this._mediaSource);
    video.addEventListener('play', () => { audio.play(); });
    video.addEventListener('pause', () => { audio.pause(); });
  }
}
