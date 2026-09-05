PHOTO BOOTH WEB V1.2 — NO XCODE

V1.2 adds:
- Front-facing camera as the default selfie camera.
- Flip camera button to switch front/rear camera.
- Front-camera mirroring for natural selfies.
- Custom template upload (PNG/JPG).
- Custom template gallery with selection.
- Custom templates are stored locally on the iPad browser.
- Transparent PNG overlays are recommended for best results.

Use:
1. Host the folder on HTTPS.
2. Open it in Safari on the iPad.
3. Allow camera access.
4. Add to Home Screen.
5. Open Operator Settings to upload templates.

Custom templates:
- Best format: transparent PNG.
- Design the template at the same aspect ratio as the final camera image.
- The template is stretched to cover the full captured canvas.
- Templates are stored in this browser on this iPad.

Camera-quality note:
Safari/PWA cannot guarantee the same sensor-level still-photo controls as a native iPad app. V1.2 requests high resolution and prefers ImageCapture.takePhoto when exposed by the browser; otherwise it captures the actual negotiated video resolution.




V1.4 change: Fixed front-camera-only mode. Removed the camera flip button without breaking camera startup.
