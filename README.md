# Auto-Scroll browser extension for non-Windows platforms

*The result of me trying out Cline and Cursor one random day, to make macOS a little bit more suitable for being used with a mouse. In true vibe coding fashion, I didn't actually read the code (much), there may be bugs and other nonsense, no guarantees (that includes the rest of this README). What I can confirm is that the extension doesn't contact any servers (unless you count the fact that its settings use the [sync storage](https://developer.chrome.com/docs/extensions/reference/api/storage#property-sync)) and doesn't send any data anywhere (which is pretty important for something that injects a bit of JS into every page).*

![demo](/demo.webp)

A Chrome/Edge extension that brings Windows-style auto-scroll functionality to macOS/Linux browsers. This extension allows you to scroll web pages by pressing the middle mouse button and moving the cursor, similar to the auto-scroll feature available in Windows.

## Usage

- middle click somewhere *outside of a link* to actiavte (links still open in new tab as normal)
- when active, page scrolls towards your mouse cursor - the further away the cursor is from the activation point, the faster it goes
- when activated, left click, or middle click anywhere on the page to deactivate, or press Esc
- if the page is full of clickable links (e.g. YouTube home page), if you push down the middle mouse button and then drag the mouse a little bit, auto-scroll will still activate (you can then release the mouse button)
- configurable speed, dead zones and other settings (the defaults may not be suitable for all screen sizes and resolutions, I haven't made it responsive like that yet)
- should mostly work for nested scrollable containers

## Installation

Since this extension is not published to the Chrome Web Store or Microsoft Edge Add-ons, you'll need to install it in developer mode:

### Chrome

1. Build the extension:
   ```
   npm install
   npm run build:prod
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" by toggling the switch in the top-right corner

4. Click "Load unpacked" and select the `dist` folder from this project

5. The extension should now be installed and active

### Edge

1. Build the extension:
   ```
   npm install
   npm run build:prod
   ```

2. Open Edge and navigate to `edge://extensions/`

3. Enable "Developer mode" by toggling the switch in the left sidebar

4. Click "Load unpacked" and select the `dist` folder from this project

5. The extension should now be installed and active

## Usage

1. Navigate to any webpage

2. Press the middle mouse button (scroll wheel click) anywhere on the page

3. A white circle with black directional arrows will appear at the click position

4. Move your mouse relative to this circle:
   - Moving above the circle scrolls up
   - Moving below the circle scrolls down
   - Moving to the left scrolls left
   - Moving to the right scrolls right
   - The further you move from the circle, the faster the scrolling

5. To stop auto-scrolling, click any mouse button or press the Escape key

## Customization

You can customize the scroll speed multiplier:

1. Right-click the extension icon in your browser toolbar

2. Select "Options" from the menu

3. Adjust the "Base Speed Multiplier" slider:
   - Higher values make scrolling faster
   - Lower values make scrolling slower

4. Click "Save Options" to apply your changes

## Testing

A test page is included to help you verify the extension's functionality:

1. Build the extension as described above

2. Open the `dist/test.html` file in your browser

3. Try the auto-scroll feature on the various scrollable elements on the page

## Development

To modify or enhance the extension:

1. Clone this repository

2. Install dependencies:
   ```
   npm install
   ```

3. Make your changes to the source code in the `src` directory

4. Build the extension:
   ```
   npm run build:prod
   ```

5. For continuous development, use the watch mode:
   ```
   npm run watch
   ```

6. Load the extension from the `dist` folder as described in the Installation section

## License

MIT
