export function requestFullscreen(
  element: HTMLElement
) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  }
}

export function isFullscreen(): boolean {
  return !!document.fullscreenElement;
}
