// Viewport-based Spatial Navigation Engine for D-pad & Remote Controls

const FOCUSABLE_SELECTOR =
  'button:not([disabled]):not([tabindex="-1"]), ' +
  'input:not([disabled]):not([tabindex="-1"]), ' +
  'select:not([disabled]):not([tabindex="-1"]), ' +
  'textarea:not([disabled]):not([tabindex="-1"]), ' +
  '[tabindex="0"]:not([disabled]):not([tabindex="-1"]), ' +
  'a:not([disabled]):not([tabindex="-1"])';

function isVisible(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;

  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;

  // Recursively check if parent is hidden
  let parent = el.parentElement;
  while (parent) {
    const parentStyle = window.getComputedStyle(parent);
    if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden') return false;
    parent = parent.parentElement;
  }

  return el.getAttribute('aria-hidden') !== 'true';
}

function isTypingActive(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tagName = el.tagName.toLowerCase();
  const type = el.getAttribute('type')?.toLowerCase() || '';

  if (tagName === 'textarea') return true;
  if (tagName === 'input' && ['text', 'search', 'password', 'email', 'number', 'tel', 'url'].includes(type)) {
    return true;
  }
  return false;
}

function isSliderActive(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tagName = el.tagName.toLowerCase();
  const type = el.getAttribute('type')?.toLowerCase() || '';
  return tagName === 'input' && type === 'range';
}

function isSelectActive(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  return el.tagName.toLowerCase() === 'select';
}

function getNextFocus(direction: 'left' | 'right' | 'up' | 'down'): HTMLElement | null {
  const active = document.activeElement as HTMLElement;

  // TV-friendly focus trapping: search for active modals/overlays (fixed z-50 or dialog)
  let scopeContainer: HTMLElement | null = null;
  const overlays = Array.from(document.querySelectorAll('.fixed.z-50, [role="dialog"], .modal-container')) as HTMLElement[];
  if (overlays.length > 0) {
    scopeContainer = overlays[overlays.length - 1]; // Pick topmost modal
  }

  // If a modal is open and the current focused element is NOT inside it, force focus to jump to the first element in the modal
  if (scopeContainer && (!active || !scopeContainer.contains(active))) {
    const candidates = Array.from(scopeContainer.querySelectorAll(FOCUSABLE_SELECTOR)) as HTMLElement[];
    const visible = candidates.filter(isVisible);
    return visible[0] || null;
  }

  const elements = scopeContainer
    ? Array.from(scopeContainer.querySelectorAll(FOCUSABLE_SELECTOR)) as HTMLElement[]
    : Array.from(document.querySelectorAll(FOCUSABLE_SELECTOR)) as HTMLElement[];

  const candidates = elements.filter((el) => el !== active && isVisible(el));

  if (!active || active === document.body) {
    return candidates[0] || null;
  }

  const activeRect = active.getBoundingClientRect();
  const activeCenter = {
    x: activeRect.left + activeRect.width / 2,
    y: activeRect.top + activeRect.height / 2,
  };

  let bestCandidate: HTMLElement | null = null;
  let bestScore = Infinity;

  for (const cand of candidates) {
    const candRect = cand.getBoundingClientRect();
    const candCenter = {
      x: candRect.left + candRect.width / 2,
      y: candRect.top + candRect.height / 2,
    };

    let isDirectionMatch = false;
    let primaryDiff = 0;
    let secondaryDiff = 0;

    switch (direction) {
      case 'right':
        // Candidate left boundary must be to the right of active element (allow overlap up to 4px)
        isDirectionMatch = candRect.left >= activeRect.right - 4 || candCenter.x > activeCenter.x;
        primaryDiff = candRect.left - activeRect.left;
        secondaryDiff = Math.abs(candCenter.y - activeCenter.y);
        break;
      case 'left':
        isDirectionMatch = candRect.right <= activeRect.left + 4 || candCenter.x < activeCenter.x;
        primaryDiff = activeRect.right - candRect.right;
        secondaryDiff = Math.abs(candCenter.y - activeCenter.y);
        break;
      case 'down':
        isDirectionMatch = candRect.top >= activeRect.bottom - 4 || candCenter.y > activeCenter.y;
        primaryDiff = candRect.top - activeRect.top;
        secondaryDiff = Math.abs(candCenter.x - activeCenter.x);
        break;
      case 'up':
        isDirectionMatch = candRect.bottom <= activeRect.top + 4 || candCenter.y < activeCenter.y;
        primaryDiff = activeRect.bottom - candRect.bottom;
        secondaryDiff = Math.abs(candCenter.x - activeCenter.x);
        break;
    }

    if (!isDirectionMatch) continue;

    // Weight penalty for diagonal deviations. Vertical jumps penalize horizontal deviations, and vice versa.
    const alignmentPenalty = direction === 'left' || direction === 'right' ? 3.5 : 2.0;
    const score = primaryDiff + secondaryDiff * alignmentPenalty;

    if (score < bestScore) {
      bestScore = score;
      bestCandidate = cand;
    }
  }

  return bestCandidate;
}

export function initSpatialNavigation() {
  const handleKeyDown = (e: KeyboardEvent) => {
    const active = document.activeElement as HTMLElement;
    const isTyping = isTypingActive();
    const isSlider = isSliderActive();
    const isSelect = isSelectActive();

    // Escape key handler: exit inputs or go back
    if (e.key === 'Escape') {
      e.preventDefault();
      if (isTyping && active) {
        active.blur();
      } else {
        window.dispatchEvent(new CustomEvent('leestreamtv:back'));
      }
      return;
    }

    // Backspace key handler (outside inputs)
    if (e.key === 'Backspace' && !isTyping) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('leestreamtv:back'));
      return;
    }

    // Map Enter key for checkboxes (TV Remote select)
    if (e.key === 'Enter' && active && active.tagName === 'INPUT' && active.getAttribute('type') === 'checkbox') {
      e.preventDefault();
      active.click();
      return;
    }

    // Map Enter / Space to click events on custom focusable components
    if ((e.key === 'Enter' || e.key === ' ') && !isTyping) {
      if (
        active &&
        active.tagName !== 'BUTTON' &&
        active.tagName !== 'INPUT' &&
        active.tagName !== 'SELECT' &&
        active.tagName !== 'A'
      ) {
        e.preventDefault();
        active.click();
        return;
      }
    }

    let direction: 'left' | 'right' | 'up' | 'down' | null = null;

    if (e.key === 'ArrowRight') {
      if (!isSlider && !isTyping) {
        direction = 'right';
      }
    } else if (e.key === 'ArrowLeft') {
      if (!isSlider && !isTyping) {
        direction = 'left';
      }
    } else if (e.key === 'ArrowDown') {
      if (!isSelect) {
        direction = 'down';
      }
    } else if (e.key === 'ArrowUp') {
      if (!isSelect) {
        direction = 'up';
      }
    }

    if (direction) {
      e.preventDefault();
      const nextFocus = getNextFocus(direction);
      if (nextFocus) {
        nextFocus.focus();
        nextFocus.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      } else if (!document.activeElement || document.activeElement === document.body) {
        // Fallback to first visible element
        const elements = Array.from(document.querySelectorAll(FOCUSABLE_SELECTOR)) as HTMLElement[];
        const visible = elements.filter(isVisible);
        if (visible.length > 0) {
          visible[0].focus();
        }
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}

