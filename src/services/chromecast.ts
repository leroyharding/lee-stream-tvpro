// Chromecast/Google Cast Service Helper

export const hasCastSDK = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    !!(window as any).chrome &&
    !!(window as any).chrome.cast &&
    !!(window as any).cast &&
    !!(window as any).cast.framework
  );
};

export const initCastContext = () => {
  if (!hasCastSDK()) return null;

  const cast = (window as any).cast;
  const chrome = (window as any).chrome;

  try {
    const context = cast.framework.CastContext.getInstance();
    context.setOptions({
      receiverApplicationId: chrome.cast.media.DEFAULT_RECEIVER_APP_ID,
      autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGINAL_SHARE_CONNECTED
    });
    return context;
  } catch (err) {
    console.error('Failed to initialize Google CastContext:', err);
    return null;
  }
};

export const getCastContext = () => {
  if (!hasCastSDK()) return null;
  return (window as any).cast.framework.CastContext.getInstance();
};

export const createRemotePlayer = () => {
  if (!hasCastSDK()) return null;
  const cast = (window as any).cast;
  const player = new cast.framework.RemotePlayer();
  const controller = new cast.framework.RemotePlayerController(player);
  return { player, controller };
};

export const castStream = (
  streamUrl: string,
  title: string,
  provider: string,
  currentTime: number = 0
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!hasCastSDK()) {
      reject(new Error('Cast SDK not available'));
      return;
    }

    const cast = (window as any).cast;
    const chrome = (window as any).chrome;
    const context = cast.framework.CastContext.getInstance();
    const session = context.getCurrentSession();

    if (!session) {
      reject(new Error('No active Google Cast session'));
      return;
    }

    // Determine HLS content type or fallback
    const isHls = streamUrl.includes('.m3u8') || streamUrl.includes('hls');
    const contentType = isHls ? 'application/x-mpegURL' : 'video/mp4';

    const mediaInfo = new chrome.cast.media.MediaInfo(streamUrl, contentType);
    mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
    mediaInfo.metadata.title = title;
    mediaInfo.metadata.subtitle = `${provider} Stream`;
    mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;

    const request = new chrome.cast.media.LoadRequest(mediaInfo);
    request.currentTime = currentTime;
    request.autoplay = true;

    session.loadMedia(request).then(
      () => {
        console.log('Stream casted successfully');
        resolve();
      },
      (err: any) => {
        console.error('Chromecast stream load failed:', err);
        reject(err);
      }
    );
  });
};
