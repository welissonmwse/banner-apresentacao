import React from 'react';
import { getSlideDimensions } from '../utils/styles';

export function Slide({
  slide,
  index,
  currentIndex,
  noTransition,
  handleVideoClick,
  isPlaying,
  playingSlideId,
  videoRef,
  handleVideoControl,
  handleSeeked,
  windowWidth,
  isLoading 
}) {
  const isCenter = index === currentIndex;
  const dimensions = getSlideDimensions(windowWidth);

  const diff = index - currentIndex;
  const diffValue = diff < 0 ? -diff : diff;
  const imageOpacity = Math.max(1 - (diffValue * 0.2), 0.1);

  const slideStyle = {
    width: isCenter ? dimensions.center.width : dimensions.side.width,
    height: isCenter ? dimensions.center.height : dimensions.side.height,
    margin: isCenter ? dimensions.center.margin : dimensions.side.margin,
    zIndex: isCenter ? 10 : 1,
    transition: noTransition ? 'none' : 'all 0.5s ease'
  };

  return (
    <div className={`slide ${isCenter ? 'center' : ''}`} style={slideStyle}>
      <div
        className="normal-img"
        style={{
          backgroundImage: `url(${slide.imgIndicador})`,
          opacity: imageOpacity
        }}
      />
      <div
        className="highlight-img"
        style={{ backgroundImage: `url(${slide.banner})`, position: 'relative' }}
        onClick={() => handleVideoClick(slide.id)}
      >
        {isPlaying && playingSlideId === slide.id && isCenter && (
          <div style={{ position: 'relative' }}>
            {isLoading && (
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            )}
            <video
              className="video"
              controls
              ref={videoRef}
              onPlay={() => handleVideoControl('play')}
              onPause={() => handleVideoControl('pause')}
              onSeeked={handleSeeked}
            >
              <source src={slide.videoApresentacao} type="video/mp4" />
              Seu navegador não suporta a tag de vídeo.
            </video>
          </div>
        )}
      </div>
    </div>
  );
}
