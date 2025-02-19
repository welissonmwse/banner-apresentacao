import React, { useRef, useState, useEffect, useMemo } from 'react';
import { cases } from './utils/cases';
import { useWindowWidth } from './hooks/useWindowWidth'
import { getResponsiveSizes } from './utils/getResponsiveSizes';
import { loadVideo } from './utils/loadVideo';
import {Slide} from './components/Slide';
import { Navigation } from './components/Navigation';

export function Carousel() {
    const windowWidth = useWindowWidth();
    const containerWidth = windowWidth * 0.8;
    const [isPlaying, setIsPlaying] = useState(false);
    const [playingSlideId, setPlayingSlideId] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(cases.length - 1);
    const [noTransition, setNoTransition] = useState(false);
    const videoRef = useRef(null);
    const videoIaRef = useRef(null);

    // Cria uma lista com os slides repetidos para efeito de loop
    const tripleSlides = useMemo(() => [...cases, ...cases, ...cases], []);

    /* Controle dos vídeos */
    const handleVideoControl = async (action) => {
        try {
            if (action === 'play') {
                if (videoRef.current && videoIaRef.current) {
                    await Promise.all([videoRef.current.play(), videoIaRef.current.play()]);
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

    /* Atualiza o índice sem transição para o loop infinito */
    const teleportWithoutTransition = (newIndex) => {
        setNoTransition(true);
        setCurrentIndex(newIndex);
    };

    const handlePrev = () => setCurrentIndex((prev) => prev - 1);
    const handleNext = () => setCurrentIndex((prev) => prev + 1);

    const handleTransitionEnd = () => {
        const slidesLength = cases.length;
        if (currentIndex < slidesLength) {
            teleportWithoutTransition(currentIndex + slidesLength);
        } else if (currentIndex >= slidesLength * 2) {
            teleportWithoutTransition(currentIndex - slidesLength);
        }
    };

    /* Remove a flag de "noTransition" no próximo frame */
    useEffect(() => {
        if (noTransition) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setNoTransition(false);
                });
            });
        }
    }, [noTransition]);

    /* Ao mudar o índice, pausa os vídeos e carrega o novo vídeo de apoio */
    useEffect(() => {
        const handleIndexChange = async () => {
            try {
                await handleVideoControl('pause');
                const currentSlide = tripleSlides[currentIndex];
                if (videoIaRef.current && currentSlide?.videoApresentacaoIa) {
                    await loadVideo(videoIaRef.current, currentSlide.videoApresentacaoIa);
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
    }, [currentIndex, tripleSlides]);

    /* Ao clicar no slide, dispara a reprodução do vídeo */
    const handleVideoClick = async (slideId) => {
        if (playingSlideId !== slideId) {
            try {
                await handleVideoControl('pause');
                setPlayingSlideId(slideId);
                setIsPlaying(true);
                const currentSlide = tripleSlides[currentIndex];
                if (videoIaRef.current && currentSlide?.videoApresentacaoIa) {
                    await loadVideo(videoIaRef.current, currentSlide.videoApresentacaoIa);
                }
                // Pequena espera para garantir o load
                await new Promise((resolve) => setTimeout(resolve, 100));
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

    /* Cálculo do deslocamento do wrapper centralizado */
    const { inactiveWidth, activeWidth } = getResponsiveSizes(windowWidth);
    const totalWidthBefore = currentIndex * inactiveWidth;
    const activeCenter = totalWidthBefore + activeWidth / 2;
    const wrapperOffset = (containerWidth / 2) - activeCenter;
    const wrapperStyle = {
        transform: `translateX(${wrapperOffset}px)`,
        transition: noTransition ? 'none' : 'transform 0.5s ease'
    };

    return (
        <div className="carrossel-container">
            <div
                className="carrossel-wrapper"
                style={wrapperStyle}
                onTransitionEnd={handleTransitionEnd}
            >
                {tripleSlides.map((slide, index) => (
                    <Slide
                        key={`${slide.id}-${index}`}
                        slide={slide}
                        index={index}
                        currentIndex={currentIndex}
                        noTransition={noTransition}
                        handleVideoClick={handleVideoClick}
                        isPlaying={isPlaying}
                        playingSlideId={playingSlideId}
                        videoRef={videoRef}
                        handleVideoControl={handleVideoControl}
                        windowWidth={windowWidth}
                    />
                ))}
            </div>

            <div className="nav-case-link mobile">
                <button className="case-button">Acesse a página do case</button>
            </div>

            <Navigation
                containerWidth={containerWidth}
                currentIndex={currentIndex}
                noTransition={noTransition}
                onPrev={handlePrev}
                onNext={handleNext}
                totalCases={cases.length}
                windowWidth={windowWidth}
            />

            <img
                src="https://intranet.seatecnologia.com.br/documents/d/guest/mesa"
                alt="mesa"
                id="mesa-apresentacao"
            />

            <div id="dani-wrapper">
                <video className="video-avatar-dani" ref={videoIaRef} muted>
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
