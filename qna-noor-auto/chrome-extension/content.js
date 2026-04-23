// QNA AutoZone / O'Reilly Vehicle Auto-Switcher
//
// Our shop app opens AZP / First Call with a URL hash like:
//   #qna-vin=1HGCM82633A004352
//   #qna-plate=ABC1234&qna-state=VA
//
// This script watches for that hash and guides the user through the
// supplier's Add Vehicle dialog: it pops a floating toolbar with the
// VIN pre-filled, and auto-fills the VIN input as soon as the dialog
// appears. We don't auto-click ADD — just fill — so nothing surprising
// happens if the DOM layout changes on their side.

(function () {
  "use strict";

  const STYLE_ID = "qna-az-style";
  const BAR_ID = "qna-az-bar";

  function parseQnaHash() {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return null;
    const params = new URLSearchParams(hash);
    const vin = (params.get("qna-vin") || "").trim().toUpperCase();
    const plate = (params.get("qna-plate") || "").trim().toUpperCase();
    const state = (params.get("qna-state") || "").trim().toUpperCase();
    if (vin.length === 17) return { kind: "vin", value: vin };
    if (plate) return { kind: "plate", value: plate, state };
    return null;
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = `
      #${BAR_ID} {
        position: fixed; bottom: 16px; right: 16px; z-index: 2147483647;
        background: #111; color: #fff; border-radius: 10px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        font: 13px/1.3 system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
        padding: 12px 14px; max-width: 340px;
      }
      #${BAR_ID} .qna-title { font-weight: 600; margin-bottom: 4px; }
      #${BAR_ID} .qna-mono { font-family: ui-monospace, Menlo, Consolas, monospace;
        font-size: 12px; background: #222; border-radius: 6px; padding: 2px 6px;
        letter-spacing: 0.5px; }
      #${BAR_ID} .qna-row { margin-top: 6px; display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
      #${BAR_ID} button {
        background: #f97316; color: #111; border: 0; border-radius: 6px;
        padding: 6px 10px; font-weight: 600; cursor: pointer; font-size: 12px;
      }
      #${BAR_ID} button.qna-ghost {
        background: transparent; color: #fff; border: 1px solid #555; font-weight: 400;
      }
      #${BAR_ID} .qna-status { color: #a7f3d0; font-size: 12px; margin-top: 6px; }
      #${BAR_ID} .qna-error { color: #fca5a5; font-size: 12px; margin-top: 6px; }
    `;
    document.documentElement.appendChild(s);
  }

  function makeBar(payload) {
    injectStyles();
    let bar = document.getElementById(BAR_ID);
    if (bar) bar.remove();
    bar = document.createElement("div");
    bar.id = BAR_ID;
    const kindLabel = payload.kind === "vin" ? "VIN" : "Plate";
    const stateLabel =
      payload.kind === "plate" && payload.state ? ` (${payload.state})` : "";
    bar.innerHTML = `
      <div class="qna-title">QNA: set vehicle</div>
      <div>
        ${kindLabel}: <span class="qna-mono">${payload.value}</span>${stateLabel}
      </div>
      <div class="qna-row">
        <button id="qna-fill">Fill Add Vehicle</button>
        <button id="qna-copy" class="qna-ghost">Copy ${kindLabel}</button>
        <button id="qna-dismiss" class="qna-ghost">×</button>
      </div>
      <div id="qna-status" class="qna-status" hidden></div>
    `;
    document.body.appendChild(bar);

    const setStatus = (msg, isError) => {
      const el = document.getElementById("qna-status");
      if (!el) return;
      el.textContent = msg;
      el.hidden = false;
      el.className = isError ? "qna-error" : "qna-status";
    };

    document.getElementById("qna-fill").addEventListener("click", () => {
      const ok = fillAddVehicle(payload);
      if (ok) {
        setStatus("Filled. Click ADD on their dialog.");
      } else {
        setStatus(
          "Couldn't find the VIN input. Click Change / Add Vehicle on their top bar first, then hit Fill again.",
          true,
        );
      }
    });
    document.getElementById("qna-copy").addEventListener("click", () => {
      navigator.clipboard
        ?.writeText(payload.value)
        .then(() => setStatus("Copied to clipboard."))
        .catch(() => setStatus("Clipboard unavailable.", true));
    });
    document.getElementById("qna-dismiss").addEventListener("click", () => {
      bar.remove();
    });
  }

  /**
   * Look for a VIN-labeled input in the current DOM (any subtree, incl.
   * dialog roots outside body). Uses multiple strategies because AZP /
   * First Call both use framework-generated markup that can change.
   */
  function findInputByLabels(labelRegexes) {
    const inputs = Array.from(
      document.querySelectorAll('input[type="text"], input:not([type])'),
    );
    for (const input of inputs) {
      if (!isVisible(input)) continue;
      const hay = collectLabelText(input);
      for (const re of labelRegexes) {
        if (re.test(hay)) return input;
      }
    }
    return null;
  }

  function collectLabelText(input) {
    const parts = [];
    if (input.placeholder) parts.push(input.placeholder);
    if (input.name) parts.push(input.name);
    if (input.id) parts.push(input.id);
    if (input.getAttribute("aria-label"))
      parts.push(input.getAttribute("aria-label"));
    const labelledBy = input.getAttribute("aria-labelledby");
    if (labelledBy) {
      const labelEl = document.getElementById(labelledBy);
      if (labelEl?.textContent) parts.push(labelEl.textContent);
    }
    if (input.id) {
      const assoc = document.querySelector(`label[for="${cssEsc(input.id)}"]`);
      if (assoc?.textContent) parts.push(assoc.textContent);
    }
    const parentLabel = input.closest("label");
    if (parentLabel?.textContent) parts.push(parentLabel.textContent);
    // Walk up 3 levels looking for sibling headings
    let node = input.parentElement;
    for (let i = 0; i < 3 && node; i++) {
      const heading = node.querySelector("h1,h2,h3,h4,legend,strong,b");
      if (heading?.textContent) parts.push(heading.textContent);
      node = node.parentElement;
    }
    return parts.join(" | ").toLowerCase();
  }

  function cssEsc(s) {
    if (window.CSS && CSS.escape) return CSS.escape(s);
    return s.replace(/([^a-zA-Z0-9_-])/g, "\\$1");
  }

  function isVisible(el) {
    if (!el) return false;
    if (!el.offsetParent && getComputedStyle(el).position !== "fixed") {
      return false;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;
    if (el.disabled) return false;
    return true;
  }

  function setNativeValue(input, value) {
    const proto = Object.getPrototypeOf(input);
    const desc = Object.getOwnPropertyDescriptor(proto, "value");
    if (desc && desc.set) desc.set.call(input, value);
    else input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.dispatchEvent(
      new KeyboardEvent("keyup", { bubbles: true, key: "End" }),
    );
  }

  function fillAddVehicle(payload) {
    if (payload.kind === "vin") {
      const input =
        findInputByLabels([/vin/i, /vehicle\s*identification/i]) ||
        document.querySelector(
          'input[maxlength="17"], input[name*="vin" i], input[id*="vin" i]',
        );
      if (!input) return false;
      input.focus();
      setNativeValue(input, payload.value);
      return true;
    }
    // plate
    const plateInput =
      findInputByLabels([/license\s*plate/i, /plate/i]) ||
      document.querySelector(
        'input[name*="plate" i], input[id*="plate" i], input[placeholder*="plate" i]',
      );
    if (!plateInput) return false;
    plateInput.focus();
    setNativeValue(plateInput, payload.value);
    if (payload.state) {
      const stateSelect =
        document.querySelector('select[name*="state" i], select[id*="state" i]') ||
        findSelectByLabel([/state/i]);
      if (stateSelect) {
        const target = payload.state.toUpperCase();
        for (const opt of stateSelect.options) {
          if (opt.value.toUpperCase() === target) {
            stateSelect.value = opt.value;
            stateSelect.dispatchEvent(new Event("change", { bubbles: true }));
            break;
          }
        }
      }
    }
    return true;
  }

  function findSelectByLabel(regexes) {
    const selects = Array.from(document.querySelectorAll("select"));
    for (const sel of selects) {
      if (!isVisible(sel)) continue;
      const hay = collectLabelText(sel);
      for (const re of regexes) if (re.test(hay)) return sel;
    }
    return null;
  }

  // --- main ---

  function run() {
    const payload = parseQnaHash();
    if (!payload) return;
    // Initial attempt: some dialogs are rendered on page load (AZP's top
    // bar has the vehicle box visible). Try once, show the bar either way.
    makeBar(payload);
    tryAutofillWithRetries(payload);

    // If the user clicks Change / Add Vehicle, the dialog appears later.
    // Retry autofill whenever the DOM adds new inputs.
    const mo = new MutationObserver(() => {
      tryAutofillWithRetries(payload, 1);
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    // Stop observing after 5 minutes; the extension is meant for the
    // initial Add Vehicle flow, not an always-on watcher.
    setTimeout(() => mo.disconnect(), 5 * 60 * 1000);
  }

  const FILL_COOLDOWN_MS = 1500;
  let lastFillTs = 0;
  function tryAutofillWithRetries(payload, maxAttempts = 3) {
    const now = Date.now();
    if (now - lastFillTs < FILL_COOLDOWN_MS) return;
    for (let i = 0; i < maxAttempts; i++) {
      if (fillAddVehicle(payload)) {
        lastFillTs = Date.now();
        const status = document.getElementById("qna-status");
        if (status) {
          status.textContent = "Filled. Click ADD on their dialog.";
          status.hidden = false;
          status.className = "qna-status";
        }
        return true;
      }
    }
    return false;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
})();
