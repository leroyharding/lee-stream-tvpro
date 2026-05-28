import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, X, RefreshCw, ExternalLink, AlertTriangle, FastForward, Rewind, PictureInPicture, Cast } from 'lucide-react';
import Hls from 'hls.js';
import { StreamLink } from '../types';
import { launchAndroidIntent } from '../services/playerIntent';
import { hasCastSDK, initCastContext, createRemotePlayer, castStream } from '../services/chromecast';

interface VideoPlayerProps {
  stream: StreamLink;
  onClose: (currentTime?: number, duration?: number) => void;
  onSwitchStream?: () => void;
  targetPackage?: string;
  initialTime?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  stream,
  onClose,
  onSwitchStream,
  targetPackage = 'org.videolan.vlc',
  initialTime = 0
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState<boolean>(false);
  
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Chromecast Cast States
  const [isCasting, setIsCasting] = useState<boolean>(false);
  const [castDeviceName, setCastDeviceName] = useState<string>('');
  const [showCastButton, setShowCastButton] = useState<boolean>(false);
  const remotePlayerRef = useRef<any>(null);
  const remotePlayerControllerRef = useRef<any>(null);

  // TV remote control states
  const [showControls, setShowControls] = useState<boolean>(true);
  const [seekIndicator, setSeekIndicator] = useState<'forward' | 'backward' | null>(null);

  const controlsTimeoutRef = useRef<any>(null);
  const seekIndicatorTimeoutRef = useRef<any>(null);

  const handleClose = useCallback(() => {
    if (isCasting) {
      const cast = (window as any).cast;
      if (cast && cast.framework) {
        try {
          cast.framework.CastContext.getInstance().endCurrentSession(true);
        } catch (e) {}
      }
    }
    const video = videoRef.current;
    if (video) {
      onClose(video.currentTime, video.duration || 0);
    } else {
      onClose(currentTime, duration);
    }
  }, [onClose, isCasting, currentTime, duration]);

  // Auto initialize stream URL
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream.url) return;

    setLoading(true);
    setError('');

    let hls: Hls | null = null;

    const isHls = stream.url.includes('.m3u8') || stream.url.includes('hls');

    const handleCanPlay = () => {
      setLoading(false);
      video.play().catch(err => {
        console.warn('Autoplay prevented', err);
        setIsPlaying(false);
      });
    };

    const handleLoadedMetadata = () => {
      if (initialTime > 0) {
        video.currentTime = initialTime;
      }
    };

    const handleError = (e: any) => {
      console.error('Video Playback Error', e);
      setLoading(false);
      setError('Browser playback blocked by cross-origin policies or unsupported video container.');
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    if (isHls && Hls.isSupported()) {
      hls = new Hls({
        maxMaxBufferLength: 30,
        enableWorker: true,
      });
      hls.loadSource(stream.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('HLS Network Error: The streaming server rejected the connection.');
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls?.recoverMediaError();
              break;
            default:
              setError('Fatal HLS Stream Error.');
              hls?.destroy();
              break;
          }
          setLoading(false);
        }
      });
    } else {
      // Native support
      video.src = stream.url;
      video.load();
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      if (hls) {
        hls.destroy();
      }
    };
  }, [stream.url, initialTime]);

  // Video time updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = useCallback(() => {
    if (isCasting && remotePlayerControllerRef.current) {
      remotePlayerControllerRef.current.playOrPause();
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isCasting]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (isCasting && remotePlayerRef.current && remotePlayerControllerRef.current) {
      remotePlayerRef.current.volumeLevel = val;
      remotePlayerControllerRef.current.setVolumeLevel();
      return;
    }
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (isCasting && remotePlayerControllerRef.current) {
      remotePlayerControllerRef.current.muteOrUnmute();
      return;
    }
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    videoRef.current.muted = nextMute;
    setIsMuted(nextMute);
    if (nextMute) {
      videoRef.current.volume = 0;
      setVolume(0);
    } else {
      videoRef.current.volume = 1;
      setVolume(1);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.error(err));
      setIsFullscreen(false);
    }
  };

  const enterMiniPlayer = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error(err));
      setIsFullscreen(false);
    }
    setIsMiniPlayer(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (isCasting && remotePlayerRef.current && remotePlayerControllerRef.current) {
      remotePlayerRef.current.currentTime = time;
      remotePlayerControllerRef.current.seek();
      return;
    }
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Chromecast Context setup and listener hook
  useEffect(() => {
    let castStateListener: any = null;
    let connectionListener: any = null;
    let timeListener: any = null;
    let durationListener: any = null;
    let stateListener: any = null;

    const setupCast = () => {
      const context = initCastContext();
      if (!context) return;

      const cast = (window as any).cast;
      const chrome = (window as any).chrome;

      const initialCastState = context.getCastState();
      setShowCastButton(initialCastState !== chrome.cast.CastState.NO_DEVICES_AVAILABLE);

      castStateListener = (event: any) => {
        setShowCastButton(event.castState !== chrome.cast.CastState.NO_DEVICES_AVAILABLE);
      };
      context.addEventListener(
        cast.framework.CastContextEventType.CAST_STATE_CHANGED,
        castStateListener
      );

      const { player, controller } = createRemotePlayer()!;
      remotePlayerRef.current = player;
      remotePlayerControllerRef.current = controller;

      connectionListener = async () => {
        if (player.isConnected) {
          const session = context.getCurrentSession();
          const device = session?.getCastDevice();
          const deviceName = device?.friendlyName || 'Chromecast';
          setCastDeviceName(deviceName);
          setIsCasting(true);

          const localVideo = videoRef.current;
          if (localVideo) {
            localVideo.pause();
          }

          try {
            const startPos = localVideo ? localVideo.currentTime : currentTime;
            await castStream(stream.url, stream.title, stream.provider, startPos);
          } catch (err) {
            console.error('Casting stream failed', err);
            setIsCasting(false);
          }
        } else {
          setIsCasting(false);
          setCastDeviceName('');
          const localVideo = videoRef.current;
          if (localVideo) {
            localVideo.currentTime = player.currentTime;
            localVideo.play().catch(() => {});
          }
        }
      };
      controller.addEventListener(
        cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
        connectionListener
      );

      timeListener = () => {
        setCurrentTime(player.currentTime);
      };
      controller.addEventListener(
        cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED,
        timeListener
      );

      durationListener = () => {
        setDuration(player.duration);
      };
      controller.addEventListener(
        cast.framework.RemotePlayerEventType.DURATION_CHANGED,
        durationListener
      );

      stateListener = () => {
        setIsPlaying(player.playerState === chrome.cast.media.PlayerState.PLAYING);
      };
      controller.addEventListener(
        cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED,
        stateListener
      );
    };

    if (hasCastSDK()) {
      setupCast();
    }

    const handleCastReady = () => {
      setupCast();
    };
    window.addEventListener('leestreamtv:cast-ready', handleCastReady);

    return () => {
      window.removeEventListener('leestreamtv:cast-ready', handleCastReady);
      
      const cast = (window as any).cast;
      if (cast && cast.framework) {
        const context = cast.framework.CastContext.getInstance();
        if (castStateListener) {
          context.removeEventListener(
            cast.framework.CastContextEventType.CAST_STATE_CHANGED,
            castStateListener
          );
        }
        if (remotePlayerControllerRef.current) {
          const controller = remotePlayerControllerRef.current;
          if (connectionListener) {
            controller.removeEventListener(
              cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
              connectionListener
            );
          }
          if (timeListener) {
            controller.removeEventListener(
              cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED,
              timeListener
            );
          }
          if (durationListener) {
            controller.removeEventListener(
              cast.framework.RemotePlayerEventType.DURATION_CHANGED,
              durationListener
            );
          }
          if (stateListener) {
            controller.removeEventListener(
              cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED,
              stateListener
            );
          }
        }
      }
    };
  }, [stream.url, stream.title, stream.provider, currentTime]);

  const handleCastClick = async () => {
    const cast = (window as any).cast;
    if (!cast) return;
    const context = cast.framework.CastContext.getInstance();
    
    if (isCasting) {
      context.endCurrentSession(true);
    } else {
      try {
        await context.requestSession();
      } catch (err) {
        console.error('Failed to request Google Cast session', err);
      }
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const mins = Math.floor(secs / 60);
    const remainSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainSecs.toString().padStart(2, '0')}`;
  };

  const handleLaunchNative = () => {
    launchAndroidIntent({
      url: stream.url,
      title: stream.title,
      packageName: targetPackage
    });
  };

  // TV Controls Auto-Hide Logic
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    
    if (isPlaying && !error && !loading) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    }
  }, [isPlaying, error, loading]);

  const triggerSeekIndicator = (dir: 'forward' | 'backward') => {
    setSeekIndicator(dir);
    if (seekIndicatorTimeoutRef.current) clearTimeout(seekIndicatorTimeoutRef.current);
    seekIndicatorTimeoutRef.current = setTimeout(() => {
      setSeekIndicator(null);
    }, 800);
  };

  // Sync controls overlay visibility with playback
  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, error, loading, resetControlsTimeout]);

  // Clean seek indicator timeout on unmount
  useEffect(() => {
    return () => {
      if (seekIndicatorTimeoutRef.current) clearTimeout(seekIndicatorTimeoutRef.current);
    };
  }, []);

  // Auto restore to fullscreen on error
  useEffect(() => {
    if (error && isMiniPlayer) {
      setIsMiniPlayer(false);
    }
  }, [error, isMiniPlayer]);

  // Keyboard remote control input router
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isMiniPlayer) return; // Allow normal spatial navigation when in mini-player mode
      
      const video = videoRef.current;
      if (!video || error) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          triggerSeekIndicator('backward');
          resetControlsTimeout();
          break;
        case 'ArrowRight':
          e.preventDefault();
          video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
          triggerSeekIndicator('forward');
          resetControlsTimeout();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          togglePlay();
          resetControlsTimeout();
          break;
        case 'ArrowUp':
        case 'ArrowDown':
          e.preventDefault();
          resetControlsTimeout();
          break;
        case 'Escape':
        case 'Backspace':
          e.preventDefault();
          handleClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [error, handleClose, togglePlay, resetControlsTimeout, isMiniPlayer]);

  return (
    <div 
      className={isMiniPlayer 
        ? "fixed bottom-6 right-6 w-80 sm:w-96 aspect-video z-40 bg-slate-950 rounded-2xl border-2 border-slate-800 shadow-2xl shadow-black/80 overflow-hidden flex flex-col items-center justify-center select-none transition-all duration-300 hover:border-red-600 focus-within:border-red-600 group" 
        : "fixed inset-0 z-50 bg-black flex flex-col items-center justify-center select-none"
      }
      tabIndex={isMiniPlayer ? 0 : -1}
      onKeyDown={(e) => {
        if (isMiniPlayer) {
          if (e.key === 'Enter') {
            e.preventDefault();
            setIsMiniPlayer(false);
          } else if (e.key === 'Escape' || e.key === 'Backspace') {
            e.preventDefault();
            handleClose();
          }
        }
      }}
    >
      
      {/* Container holding custom UI */}
      <div 
        ref={containerRef}
        onMouseMove={isMiniPlayer ? undefined : resetControlsTimeout}
        onClick={isMiniPlayer ? undefined : resetControlsTimeout}
        className="relative w-full h-full flex flex-col justify-between group overflow-hidden bg-black"
      >
        
        {/* Top Floating Header overlay */}
        {!isMiniPlayer && (
          <div 
            className={`absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/90 via-black/40 to-transparent p-6 flex items-center justify-between gap-4 transition-all duration-500 ${
              showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}
          >
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="p-2.5 rounded-full bg-slate-900/80 hover:bg-red-600 text-white transition-colors"
              title="Close Player"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col">
              <span className="text-white font-bold text-sm sm:text-base line-clamp-1">
                {stream.title}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] bg-red-600 font-bold px-1.5 py-0.2 rounded text-white uppercase">
                  {stream.resolution}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {stream.provider} Direct
                </span>
              </div>
            </div>
          </div>

          {/* Right utility buttons */}
          <div className="flex items-center gap-2">
            
            {/* Native Intent Shortcut */}
            <button
              onClick={handleLaunchNative}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/60 transition-colors"
              title="Launch in external player app (VLC/MX Player)"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>External App</span>
            </button>

            {onSwitchStream && (
              <button
                onClick={onSwitchStream}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 text-xs font-semibold border border-red-800/60 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Switch Source</span>
              </button>
            )}
          </div>
        </div>
        )}

        {/* Video Element */}
        <div className={isMiniPlayer ? "w-full h-full relative" : "relative w-full h-full flex items-center justify-center my-auto"}>
          <video
            ref={videoRef}
            onClick={isMiniPlayer ? undefined : togglePlay}
            className={isMiniPlayer ? "w-full h-full object-cover bg-slate-950" : "w-full h-full max-h-screen object-contain"}
            playsInline
          />

          {/* Loading Spinner */}
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs z-10">
              <div className={`border-4 border-red-600 border-t-transparent rounded-full animate-spin ${isMiniPlayer ? 'w-8 h-8 mb-1' : 'w-12 h-12 mb-3'}`} />
              {!isMiniPlayer && <p className="text-slate-300 font-medium text-sm">Buffering High-Speed Stream...</p>}
            </div>
          )}

          {/* Error View */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
              <p className="text-white font-bold text-lg mb-1">Stream Playback Interrupted</p>
              <p className="text-slate-400 text-xs sm:text-sm max-w-md mb-6">{error}</p>
              
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleLaunchNative}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Launch in External Android Player</span>
                </button>

                {onSwitchStream && (
                  <button
                    onClick={onSwitchStream}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs"
                  >
                    Select Alternative Stream
                  </button>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] text-slate-500 max-w-sm">
                Stream servers often restrict browsers with hotlink protection. Native media players handle custom user agents automatically.
              </div>
            </div>
          )}

          {/* TV Remote Seek Indicator Overlay */}
          {seekIndicator && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
              <div className="bg-black/85 text-white border border-slate-800 rounded-full px-6 py-4 flex flex-col items-center gap-2 shadow-2xl animate-in zoom-in-95 duration-100">
                {seekIndicator === 'forward' ? (
                  <>
                    <FastForward className="w-8 h-8 text-red-500 fill-current" />
                    <span className="text-sm font-bold font-mono">+10s</span>
                  </>
                ) : (
                  <>
                    <Rewind className="w-8 h-8 text-red-500 fill-current" />
                    <span className="text-sm font-bold font-mono">-10s</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Chromecast casting connection overlay */}
          {isCasting && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-20 p-6 text-center animate-in fade-in duration-200">
              <div className="w-20 h-20 rounded-full bg-red-650/10 flex items-center justify-center border border-red-500/20 mb-6 shadow-lg shadow-red-950/20 animate-pulse">
                <Cast className="w-10 h-10 text-red-500 filter drop-shadow(0 0 8px rgba(239,68,68,0.5))" />
              </div>
              <p className="text-white font-black text-xl mb-2">Casting to Screen</p>
              <p className="text-red-400 font-bold text-sm tracking-wide bg-red-950/30 border border-red-900/30 px-4 py-1.5 rounded-full inline-flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span>Active on {castDeviceName}</span>
              </p>
              <p className="text-slate-500 text-xs mt-4 max-w-sm leading-relaxed">
                Use the player controls below to adjust volume, seek, pause, or resume playback on your receiver device.
              </p>
            </div>
          )}
        </div>

        {/* Mini-Player Overlay Controls */}
        {isMiniPlayer && (
          <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center gap-4 transition-all duration-300 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto z-30">
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="p-2.5 rounded-full bg-slate-900/90 text-white hover:bg-slate-800 border border-slate-700/60 transition-all hover:scale-110 active:scale-95 cursor-pointer"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMiniPlayer(false);
              }}
              className="p-2.5 rounded-full bg-slate-900/90 text-white hover:bg-slate-800 border border-slate-700/60 transition-all hover:scale-110 active:scale-95 cursor-pointer"
              title="Restore Fullscreen"
            >
              <Maximize className="w-5 h-5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="p-2.5 rounded-full bg-slate-900/90 text-white hover:bg-red-600 border border-slate-700/60 transition-all hover:scale-110 active:scale-95 cursor-pointer"
              title="Close Player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Bottom Floating Controls Overlay */}
        {!isMiniPlayer && (
          <div 
            className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black via-black/80 to-transparent p-6 flex flex-col gap-2 transition-all duration-500 ${
              showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
          >
          
          {/* Timeline slider */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono w-10 text-right shrink-0">
              {formatTime(currentTime)}
            </span>

            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-600"
            />

            <span className="text-[11px] text-slate-400 font-mono w-10 shrink-0">
              {formatTime(duration)}
            </span>
          </div>

          {/* Bottom Action Row */}
          <div className="flex items-center justify-between">
            
            {/* Left Play/Pause & Volume */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-2 rounded-lg text-white hover:bg-slate-800/80 transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <div className="flex items-center gap-2 group/vol">
                <button
                  onClick={toggleMute}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-red-600"
                />
              </div>
            </div>

            {/* Right Fullscreen & PiP toggles */}
            <div className="flex items-center gap-2">
              {showCastButton && (
                <button
                  onClick={handleCastClick}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    isCasting 
                      ? 'text-red-400 hover:text-red-300 bg-red-950/40 border border-red-900/40 hover:bg-red-950/60' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                  title={isCasting ? `Disconnect from ${castDeviceName}` : 'Cast to Device'}
                >
                  <Cast className={`w-5 h-5 ${isCasting ? 'animate-pulse text-red-500 fill-current' : ''}`} />
                </button>
              )}

              <button
                onClick={enterMiniPlayer}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
                title="Picture-in-Picture"
              >
                <PictureInPicture className="w-5 h-5" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>

          </div>

        </div>
        )}

      </div>

    </div>
  );
};
