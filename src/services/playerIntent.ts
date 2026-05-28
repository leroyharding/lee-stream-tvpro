// URL Sanitization per System Design Specification
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  return url
    .replace(/ /g, '%20')
    .replace(/\[/g, '%5B')
    .replace(/\]/g, '%5D')
    .replace(/#/g, '%23');
}

// User Agent injected to bypass stream host hotlinking restrictions
export const STANDARD_USER_AGENT = 
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Global declaration for the Kotlin Javascript Interface wrapper
declare global {
  interface Window {
    LeeStreamTVBridge?: {
      launchVideoIntent(
        url: string,
        title: string,
        packageName: string,
        userAgent: string
      ): void;
    };
  }
}

export interface LaunchIntentOptions {
  url: string;
  title: string;
  packageName: string; // e.g. 'org.videolan.vlc'
}

export function launchAndroidIntent(options: LaunchIntentOptions): boolean {
  const cleanUrl = sanitizeUrl(options.url);
  
  // 1. If running inside the native Android Wrapper with LeeStreamTVBridge
  if (window.LeeStreamTVBridge && typeof window.LeeStreamTVBridge.launchVideoIntent === 'function') {
    try {
      window.LeeStreamTVBridge.launchVideoIntent(
        cleanUrl,
        options.title,
        options.packageName,
        STANDARD_USER_AGENT
      );
      return true;
    } catch (err) {
      console.error('Failed to execute native Kotlin bridge:', err);
    }
  }

  // 2. Fallback: Generate generic Android Intent scheme URI for mobile web browsers
  // This enables opening VLC/MX Player directly from Chrome/Firefox on Android
  try {
    // We strip the scheme from cleanUrl to put in the intent string
    const urlObj = new URL(cleanUrl);
    const scheme = urlObj.protocol.replace(':', '');
    const hostAndPath = cleanUrl.replace(`${scheme}://`, '');

    let intentUri = `intent://${hostAndPath}#Intent;scheme=${scheme};action=android.intent.action.VIEW;type=video/*;`;
    
    if (options.packageName && options.packageName !== 'default') {
      intentUri += `package=${options.packageName};`;
    }

    // Add string extras
    intentUri += `S.title=${encodeURIComponent(options.title)};`;
    intentUri += `S.displayName=${encodeURIComponent(options.title)};`;
    
    // Inject headers
    intentUri += `S.headers=${encodeURIComponent(`User-Agent: ${STANDARD_USER_AGENT}`)};`;
    intentUri += `end`;

    // Trigger navigation
    const link = document.createElement('a');
    link.href = intentUri;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error('Failed to create intent fallback URL:', err);
    return false;
  }
}

export function getPlayerNames(): { [key: string]: string } {
  return {
    'org.videolan.vlc': 'VLC Player',
    'com.mxtech.videoplayer.ad': 'MX Player (Free)',
    'com.mxtech.videoplayer.pro': 'MX Player (Pro)',
    'com.brouken.player': 'Just Player',
    'default': 'System Default Player'
  };
}
