# macOS Auto-Scroll Extension

A Chrome/Edge extension that brings Windows-style auto-scroll functionality to macOS browsers. This extension allows you to scroll web pages by pressing the middle mouse button and moving the cursor, similar to the auto-scroll feature available in Windows.

> **Note:** Before loading the extension, you'll need to add icon files to the `dist/icons` directory. Create three PNG files named `icon16.png`, `icon48.png`, and `icon128.png` with the respective dimensions.

## Debugging Information

If you're experiencing issues with the extension not working:

1. Check the browser console for any error messages
2. The extension now includes additional debugging logs that will appear in the console
3. A direct injection approach is now used which should be more reliable
4. Try opening the included `test-direct.html` file directly in your browser to test the functionality

## Features

- Middle-click anywhere to activate auto-scroll
- Move your mouse relative to the circle to control scroll direction and speed
- Scrolls the innermost scrollable element at the click position
- When a scrollable element reaches its limit, parent elements will scroll
- Customizable scroll speed multiplier
- Works on any webpage

## Installation

Since this extension is not published to the Chrome Web Store or Microsoft Edge Add-ons, you'll need to install it in developer mode:

### Chrome

1. Build the extension:
   ```
   npm install
   npm run build
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" by toggling the switch in the top-right corner

4. Click "Load unpacked" and select the `dist` folder from this project

5. The extension should now be installed and active

### Edge

1. Build the extension:
   ```
   npm install
   npm run build
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
   npm run build
   ```

5. For continuous development, use the watch mode:
   ```
   npm run watch
   ```

6. Load the extension from the `dist` folder as described in the Installation section

## License

MIT
