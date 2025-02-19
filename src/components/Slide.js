/* Componente que renderiza cada slide */
import React from 'react';
import {  getSlideDimensions } from '../utils/styles'

export const Slide = ({
    slide,
    index,
    currentIndex,
    noTransition,
    handleVideoClick,
    isPlaying,
    playingSlideId,
    videoRef,
    handleVideoControl,
    windowWidth
}) => {
    const isCenter = index === currentIndex;
    const dimensions = getSlideDimensions(windowWidth);

    const slideStyle = {
        width: isCenter ? dimensions.center.width : dimensions.side.width,
        height: isCenter ? dimensions.center.height : dimensions.side.height,
        margin: isCenter ? dimensions.center.margin : dimensions.side.margin,
        zIndex: isCenter ? 10 : 1,
        transition: noTransition ? 'none' : 'all 0.5s ease'
    };

    const imageOpacity = Math.max(1 - (Math.abs(index - currentIndex) * 0.2), 0.1);

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
                style={{ backgroundImage: `url(${slide.banner})` }}
                onClick={() => handleVideoClick(slide.id)}
            >
                {isPlaying && playingSlideId === slide.id && isCenter && (
                    <video
                        className="video"
                        controls
                        ref={videoRef}
                        onPlay={() => handleVideoControl('play')}
                        onPause={() => handleVideoControl('pause')}
                    >
                        <source src={slide.videoApresentacao} type="video/mp4" />
                        Seu navegador não suporta a tag de vídeo.
                    </video>
                )}
            </div>
        </div>
    );
};
