# Palette's Journal

## 2024-05-22 - Accessibility in Canvas Overlays
**Learning:** HTML overlays in 3D apps (via @react-three/drei Html) often miss standard accessibility attributes because they are thought of as part of the 3D scene.
**Action:** Always check `Html` wrapped components for standard ARIA roles and labels.

## 2024-05-22 - Keyboard Support on Divs
**Learning:** Using `div` with `onClick` for interaction (like Dialog advancing) excludes keyboard users.
**Action:** Always add `tabIndex="0"`, `role`, and `onKeyDown` handling Enter/Space when making non-interactive elements interactive.
