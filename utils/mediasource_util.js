export default function createMediaSource {
  if (!window.MediaSource) {
    throw new Error('No Media Source API available');
  }
  return new MediaSource();
}
