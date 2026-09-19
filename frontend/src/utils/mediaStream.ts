// Global Media Stream Registry to ensure cameras/microphones are stopped immediately on test completion or unmount

const activeStreams = new Set<MediaStream>();

export function registerMediaStream(stream: MediaStream | null) {
  if (!stream) return;
  activeStreams.add(stream);
}

export function unregisterMediaStream(stream: MediaStream | null) {
  if (!stream) return;
  activeStreams.delete(stream);
}

export function stopMediaStream(stream: MediaStream | null) {
  if (!stream) return;
  try {
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch (e) {
        console.warn('Error stopping track:', e);
      }
    });
  } catch (e) {
    console.warn('Error stopping media stream:', e);
  }
  activeStreams.delete(stream);
}

export function stopAllMediaStreams() {
  activeStreams.forEach((stream) => {
    stopMediaStream(stream);
  });
  activeStreams.clear();
}
