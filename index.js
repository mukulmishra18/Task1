import Controller from './controllers/controller.js';

const audio = document.querySelector('audio');
const video = document.querySelector('video');

let mediaController = new Controller(audio, video);
