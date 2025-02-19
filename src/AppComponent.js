import React, { useRef, useState, useEffect } from 'react';
import { cases } from './utils/cases';

export function Carousel() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playingSlideId, setPlayingSlideId] = useState(null);
    const [containerWidth, setContainerWidth] = useState(window.innerWidth * 0.8)
    const [currentIndex, setCurrentIndex] = useState(cases.length - 1);
    const [noTransition, setNoTransition] = useState(false);
    const videoRef = useRef(null);
    const videoIaRef = useRef(null);

    const tripleSlides = [...cases, ...cases, ...cases];

    const getResponsiveSizes = () => {
        const screenWidth = window.innerWidth;

        switch (true) {
            case screenWidth < 640: // < sm
                return {
                    inactiveWidth: 54,
                    activeWidth: 390
                };
            // case screenWidth < 768: // sm
            //     return {
            //         inactiveWidth: 62,
            //         activeWidth: 390
            //     };
            case screenWidth < 1024: // md
                return {
                    inactiveWidth: 88,
                    activeWidth: 493
                };
            case screenWidth < 1280: // lg
                return {
                    inactiveWidth: 107,
                    activeWidth: 599
                };
            case screenWidth < 1536: // xl
                return {
                    inactiveWidth: 128,
                    activeWidth: 707
                };
            default: // 2xl (≥1536px)
                return {
                    inactiveWidth: 172,
                    activeWidth: 1090
                };
        }
    };

    const handleVideoControl = async (action) => {
        try {
            if (action === 'play') {
                if (videoRef.current && videoIaRef.current) {
                    const playPromises = [
                        videoRef.current.play(),
                        videoIaRef.current.play()
                    ];
                    await Promise.all(playPromises);
                }
            } else if (action === 'pause') {
                if (videoRef.current && videoIaRef.current) {
                    videoRef.current.pause();
                    videoIaRef.current.pause();
                }
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Erro ao controlar vídeos:', error);
            }
        }
    };

    const teleportWithoutTransition = (newIndex) => {
        setNoTransition(true);
        setCurrentIndex(newIndex);
    };

    const handlePrev = () => {
        setCurrentIndex(prev => prev - 1);
    };

    const handleNext = () => {
        setCurrentIndex(prev => prev + 1);
    };

    const handleTransitionEnd = () => {
        if (currentIndex < cases.length) {
            teleportWithoutTransition(currentIndex + cases.length);
        } else if (currentIndex >= cases.length * 2) {
            teleportWithoutTransition(currentIndex - cases.length);
        }
    };

    useEffect(() => {
        const handleResize = () => setContainerWidth(window.innerWidth * 0.8);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (noTransition) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setNoTransition(false);
                });
            });
        }
    }, [noTransition]);

    useEffect(() => {
        const handleIndexChange = async () => {
            try {
                handleVideoControl('pause');

                if (videoIaRef.current) {
                    videoIaRef.current.src = tripleSlides[currentIndex]?.videoApresentacaoIa;
                    await new Promise(resolve => {
                        videoIaRef.current.onloadeddata = resolve;
                        videoIaRef.current.load();
                    });
                }

                setIsPlaying(false);
                setPlayingSlideId(null);
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Erro ao mudar índice:', error);
                }
            }
        };

        handleIndexChange();
    }, [currentIndex]);
    const getSlideStyle = (index) => {
        const screenWidth = window.innerWidth;
        const isCenter = index === currentIndex;

        let dimensions;
        switch (true) {
            case screenWidth < 640: // < sm
                dimensions = {
                    centerWidth: '358px',
                    centerHeight: '156px',
                    sideWidth: '48px',
                    sideHeight: '156px',
                    centerMargin: '0 8px',
                    sideMargin: '0 3px'
                };
                break;

            // case screenWidth < 768: // sm
            //     dimensions = {
            //         centerWidth: '358px',
            //         centerHeight: '156px',
            //         sideWidth: '54px',
            //         sideHeight: '156px',
            //         centerMargin: '0 10px',
            //         sideMargin: '0 4px'
            //     };
            //     break;

            case screenWidth < 1024: // md
                dimensions = {
                    centerWidth: '463px',
                    centerHeight: '204px',
                    sideWidth: '78px',
                    sideHeight: '204px',
                    centerMargin: '0 15px',
                    sideMargin: '0 5px'
                };
                break;

            case screenWidth < 1280: // lg
                dimensions = {
                    centerWidth: '563px',
                    centerHeight: '248px',
                    sideWidth: '95px',
                    sideHeight: '248px',
                    centerMargin: '0 18px',
                    sideMargin: '0 6px'
                };
                break;

            case screenWidth < 1536: // xl
                dimensions = {
                    centerWidth: '663px',
                    centerHeight: '292px',
                    sideWidth: '112px',
                    sideHeight: '292px',
                    centerMargin: '0 22px',
                    sideMargin: '0 8px'
                };
                break;

            default: // 2xl (≥1536px)
                dimensions = {
                    centerWidth: '1064px',
                    centerHeight: '470px',
                    sideWidth: '152px',
                    sideHeight: '470px',
                    centerMargin: '0 26px',
                    sideMargin: '0 10px'
                };
        }

        return {
            width: isCenter ? dimensions.centerWidth : dimensions.sideWidth,
            height: isCenter ? dimensions.centerHeight : dimensions.sideHeight,
            zIndex: isCenter ? 10 : 1,
            margin: isCenter ? dimensions.centerMargin : dimensions.sideMargin,
            transition: noTransition ? 'none' : 'all 0.5s ease'
        };
    };

    const getImageOpacity = (index) => {
        const distance = Math.abs(index - currentIndex);
        return Math.max(1 - (distance * 0.2), 0.1);
    };

    const getWrapperStyle = () => {
        const { inactiveWidth, activeWidth } = getResponsiveSizes();
        const totalWidthBefore = currentIndex * inactiveWidth;
        const activeCenter = totalWidthBefore + (activeWidth / 2);
        const offset = (containerWidth / 2) - activeCenter;

        return {
            transform: `translateX(${offset}px)`,
            transition: noTransition ? 'none' : 'transform 0.5s ease'
        };
    };

    const getNavigationStyle = () => {
        const screenWidth = window.innerWidth;
        let centerPosition;
        let navigationWidth;

        switch (true) {
            case screenWidth < 640: // < sm
                centerPosition = (containerWidth / 2) - (280 / 2) - 8;
                navigationWidth = 280
                break;
            // case screenWidth < 768: // sm
            //     centerPosition = (containerWidth / 2) - (320 / 2) - 10;
            //     break;
            case screenWidth < 1024: // md
                centerPosition = (containerWidth / 2) - (463 / 2) - 15;
                navigationWidth = 463
                break;
            case screenWidth < 1280: // lg
                centerPosition = (containerWidth / 2) - (563 / 2) - 18;
                navigationWidth = 563
                break;
            case screenWidth < 1536: // xl
                centerPosition = (containerWidth / 2) - (663 / 2) - 22;
                navigationWidth = 663
                break;
            default: // 2xl (≥1536px)
                centerPosition = (containerWidth / 2) - (1064 / 2) - 26;
                navigationWidth = 1064
        }

        return {
            left: `${centerPosition}px`,
            width: `${navigationWidth}px`,
            transform: 'none',
            transition: noTransition ? 'none' : 'all 0.5s ease'
        };
    };

    const handleVideoClick = async (slideId) => {
        if (playingSlideId !== slideId) {
            try {
                handleVideoControl('pause');
                setPlayingSlideId(slideId);
                setIsPlaying(true);

                if (videoIaRef.current) {
                    videoIaRef.current.src = tripleSlides[currentIndex]?.videoApresentacaoIa;
                    await new Promise(resolve => {
                        videoIaRef.current.onloadeddata = resolve;
                        videoIaRef.current.load();
                    });
                }

                await new Promise(resolve => setTimeout(resolve, 100));
                await handleVideoControl('play');
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Erro ao manipular vídeo:', error);
                    setIsPlaying(false);
                    setPlayingSlideId(null);
                }
            }
        }
    };

    return (
        <div className="carrossel-container">
            <div
                className="carrossel-wrapper"
                style={getWrapperStyle()}
                onTransitionEnd={handleTransitionEnd}
            >
                {tripleSlides.map((slide, index) => (
                    <div
                        key={`${slide.id}-${index}`}
                        className={`slide ${index === currentIndex ? 'center' : ''}`}
                        style={getSlideStyle(index)}
                    >
                        <div
                            className="normal-img"
                            style={{
                                backgroundImage: `url(${slide.imgIndicador})`,
                                opacity: getImageOpacity(index)
                            }}
                        >
                        </div>
                        <div
                            className="highlight-img"
                            style={{ backgroundImage: `url(${slide.banner})` }}
                            onClick={() => handleVideoClick(slide.id)}
                        >
                            {isPlaying &&
                                playingSlideId === slide.id &&
                                index === currentIndex && (
                                    <video
                                        className="video"
                                        controls
                                        ref={videoRef}
                                        onPlay={() => handleVideoControl('play')}
                                        onPause={() => handleVideoControl('pause')}
                                    >
                                        <source
                                            src={tripleSlides[currentIndex]?.videoApresentacao}
                                            type="video/mp4"
                                        />
                                        Seu navegador não suporta a tag de vídeo.
                                    </video>
                                )}
                        </div>
                    </div>
                ))}
            </div>
            <div
                className="navegacao"
                style={getNavigationStyle()}
            >
                <div className="nav-controls">
                    <button onClick={handlePrev} className="nav-button">
                        <i className="las la-angle-double-left"></i>
                    </button>
                    <button onClick={handleNext} className="nav-button">
                        <i className="las la-angle-double-right"></i>
                    </button>
                </div>
                <div className="nav-dots">
                    {cases.map((_, index) => (
                        <span
                            key={index}
                            className={`dot ${currentIndex % cases.length === index ? 'active' : ''}`}
                        />
                    ))}
                </div>
                <div className="nav-case-link">
                    <button className="case-button">
                        Acesse a página do case
                    </button>
                </div>
            </div>
            <img
                src='https://intranet.seatecnologia.com.br/documents/d/guest/mesa'
                alt='mesa'
                id='mesa-apresentacao'
            />
            <div id='dani-wrapper'>
                <video
                    className="video-avatar-dani"
                    ref={videoIaRef}
                    muted
                >
                    <source
                        src={tripleSlides[currentIndex]?.videoApresentacaoIa}
                        type="video/mp4"
                    />
                    Seu navegador não suporta a tag de vídeo.
                </video>
            </div>
        </div>
    );
}
