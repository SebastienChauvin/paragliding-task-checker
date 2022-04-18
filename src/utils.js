export function formatDuration(durationSec) {
  return new Date(durationSec * 1000).toISOString().substr(12, 7);
}