import React, { useRef, useState, useEffect } from 'react';
import { cases } from './ultils/cases';
import { getResponsiveValues } from './config';

export function Carousel() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playingSlideId, setPlayingSlideId] = useState(null);
    const [containerWidth, setContainerWidth] = useState(window.innerWidth * 0.8)
    const [currentIndex, setCurrentIndex] = useState(cases.length - 1);
    const [noTransition, setNoTransition] = useState(false);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const videoRef = useRef(null);
    const videoIaRef = useRef(null);

    const tripleSlides = [...cases, ...cases, ...cases];

    const responsiveValues = getResponsiveValues(screenWidth);
    const INACTIVE_WIDTH = parseInt(responsiveValues.inactiveWidth);
    const ACTIVE_WIDTH = parseInt(responsiveValues.activeWidth);

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
        const handleResize = () => {
            setContainerWidth(window.innerWidth * 0.8);
            setScreenWidth(window.innerWidth);
        };
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

    useEffect(() => {
        const handleFragmentClick = () => {
            handleVideoControl('pause');
            setIsPlaying(false);
            setPlayingSlideId(null);
        };

        const fragmentButton = document.getElementById('fale-conosco__carrossel__btn');
        if (fragmentButton) {
            fragmentButton.addEventListener('click', handleFragmentClick);
        }

        return () => {
            if (fragmentButton) {
                fragmentButton.removeEventListener('click', handleFragmentClick);
            }
        };
    }, []);

    const getSlideStyle = (index) => {
        const isCenter = index === currentIndex;
        const values = getResponsiveValues(screenWidth);
        
        return {
            width: isCenter ? values.activeWidth : values.inactiveWidth,
            height: values.height,
            zIndex: isCenter ? 10 : 1,
            margin: values.margin,
            transition: noTransition ? 'none' : 'all 0.5s ease'
        };
    };

    const getImageOpacity = (index) => {
        const distance = Math.abs(index - currentIndex);
        return Math.max(1 - (distance * 0.2), 0.1);
    };

    const getWrapperStyle = () => {
        const totalWidthBefore = currentIndex * INACTIVE_WIDTH;
        const activeCenter = totalWidthBefore + (ACTIVE_WIDTH / 2);
        const offset = (containerWidth / 2) - activeCenter;

        return {
            transform: `translateX(${offset}px)`,
            transition: noTransition ? 'none' : 'transform 0.5s ease'
        };
    };

    const getNavigationStyle = () => {
        const centerPosition = (containerWidth / 2) - (ACTIVE_WIDTH / 2);

        return {
            left: `${centerPosition}px`,
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