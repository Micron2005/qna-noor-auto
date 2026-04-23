# QNA AutoZone / O'Reilly Vehicle Auto-Switcher

When you click **AutoZone** or **O'Reilly** on QNA's Lookup page, this tiny
Chrome extension auto-fills the VIN (or plate) into AutoZone Pro / First
Call's Add Vehicle dialog so every parts search in that tab is scoped to
the right vehicle.

Without the extension, the site still works — the VIN is just copied to
your clipboard and you paste it manually. The extension turns the
paste-and-add step into one click.

## What it does

- Runs only on `autozonepro.com` and `firstcallonline.com`.
- Reads a URL hash like `#qna-vin=1HGCM82633A004352` that our Lookup page
  adds when you click the supplier button.
- Shows a floating bar in the bottom-right: "QNA: set vehicle · VIN
  1HGCM82633A004352 · Fill Add Vehicle".
- When you click the supplier's **Change** / **Add Vehicle** button, the
  extension finds the VIN input in the dialog and fills it. You click
  ADD on their side — done.
- No auto-clicking of ADD, so the extension never submits anything
  without your explicit confirmation on the supplier's site.

## Permissions

Only these two domains:

- `https://www.autozonepro.com/*`
- `https://www.firstcallonline.com/*`

No access to any other site. No access to your AutoZone / O'Reilly
login. The extension runs entirely inside your browser — it never talks
to our servers.

## Install (one time, ~30 seconds)

1. Download this folder to your PC. Easiest way:
   - Go to https://github.com/Micron2005/qna-noor-auto
   - Click the green **Code** button → **Download ZIP**
   - Unzip it somewhere (e.g. Desktop). Inside you'll have a folder
     called `qna-noor-auto-main` with `chrome-extension/` inside it.
2. Open Chrome and go to `chrome://extensions/`.
3. In the top-right, turn on **Developer mode**.
4. Click **Load unpacked** (top-left).
5. Browse to the `chrome-extension/` folder from step 1 and click
   **Select Folder**.
6. You're done. Chrome may show it as "unpacked" with an orange dot
   next to it — that's normal for developer-mode extensions.

## Update

When we ship a new version of the extension, replace the folder contents
with the new files, then hit the circular-arrow **reload** button on
Chrome's extensions page (`chrome://extensions/`).

## Uninstall

Go to `chrome://extensions/`, find "QNA AutoZone / O'Reilly Vehicle
Auto-Switcher", and click **Remove**. Clicking supplier buttons still
works — you'll just be back to the paste-the-VIN workflow.
