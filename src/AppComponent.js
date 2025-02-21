import React, { useRef, useState, useEffect, useMemo } from 'react';
import { cases } from './utils/cases';
import { useWindowWidth } from './hooks/useWindowWidth';
import { getResponsiveSizes } from './utils/getResponsiveSizes';
import { loadVideo } from './utils/loadVideo';
import { Slide } from './components/Slide';
import { Navigation } from './components/Navigation';
import { getNavigationSizes, getSlideDimensions } from './utils/styles';

export function Carousel() {
  const windowWidth = useWindowWidth();
  const containerWidth = windowWidth * 0.8;
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingSlideId, setPlayingSlideId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(cases.length - 1);
  const [noTransition, setNoTransition] = useState(false);

  const videoRef = useRef(null);    // Vídeo principal
  const videoIaRef = useRef(null);    // Vídeo da Dani

  // Cria uma lista com os slides repetidos para efeito de loop
  const tripleSlides = useMemo(() => cases.concat(cases, cases), []);
  const navSizes = getNavigationSizes(windowWidth, containerWidth);
  const centerPosition = navSizes.centerPosition;
  const dimensions = getSlideDimensions(windowWidth);

  /* Controle dos vídeos */
  function handleVideoControl(action) {
    try {
      if (action === 'play') {
        if (videoRef.current && videoIaRef.current) {
          return Promise.all([
            videoRef.current.play(),
            videoIaRef.current.play()
          ]);
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
  }

  /* Sincronização dos vídeos ao finalizar o seek no master */
  function handleSeeked() {
    if (videoRef.current && videoIaRef.current) {
      videoIaRef.current.currentTime = videoRef.current.currentTime;
    }
  }

  useEffect(() => {
    if (isPlaying && videoRef.current && videoIaRef.current) {
      videoIaRef.current.currentTime = videoRef.current.currentTime;
    }
  }, [isPlaying]);

  /* Sincronização contínua: Enquanto o vídeo master atualiza o tempo, ajusta o seguidor se houver diferença */
  useEffect(() => {
    const master = videoRef.current;
    if (!master) return;
    function syncTime() {
      if (videoRef.current && videoIaRef.current) {
        const masterTime = videoRef.current.currentTime;
        const followerTime = videoIaRef.current.currentTime;
        let diff = masterTime - followerTime;
        if (diff < 0) {
          diff = -diff;
        }
        if (diff > 0.2) {
          videoIaRef.current.currentTime = masterTime;
        }
      }
    }
    master.addEventListener('timeupdate', syncTime);
    return () => {
      master.removeEventListener('timeupdate', syncTime);
    };
  }, []);

  /* Effect para monitorar buffering */
  useEffect(() => {
    function setupEventListeners() {
      const master = videoRef.current;
      const follower = videoIaRef.current;
      if (!master || !follower) return;

      function onWaiting() {
        handleVideoControl('pause');
      }

      function onCanPlayThrough() {
        if (master.readyState >= 3 && follower.readyState >= 3) {
          handleVideoControl('play');
        }
      }

      master.addEventListener('waiting', onWaiting);
      follower.addEventListener('waiting', onWaiting);
      master.addEventListener('canplaythrough', onCanPlayThrough);
      follower.addEventListener('canplaythrough', onCanPlayThrough);

      return () => {
        master.removeEventListener('waiting', onWaiting);
        follower.removeEventListener('waiting', onWaiting);
        master.removeEventListener('canplaythrough', onCanPlayThrough);
        follower.removeEventListener('canplaythrough', onCanPlayThrough);
      };
    }

    if (videoRef.current && videoIaRef.current) {
      setupEventListeners();
    } else {
      const intervalId = setInterval(() => {
        if (videoRef.current && videoIaRef.current) {
          setupEventListeners();
          clearInterval(intervalId);
        }
      }, 500);
      return () => clearInterval(intervalId);
    }
  }, []);

  /* Atualiza o índice sem transição para o loop infinito */
  function teleportWithoutTransition(newIndex) {
    setNoTransition(true);
    setCurrentIndex(newIndex);
  }
  function handlePrev() {
    setCurrentIndex(prev => prev - 1);
  }
  function handleNext() {
    setCurrentIndex(prev => prev + 1);
  }
  function handleTransitionEnd() {
    const slidesLength = cases.length;
    if (currentIndex < slidesLength) {
      teleportWithoutTransition(currentIndex + slidesLength);
    } else if (currentIndex >= slidesLength * 2) {
      teleportWithoutTransition(currentIndex - slidesLength);
    }
  }

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
    function handleIndexChange() {
      (async () => {
        try {
          await handleVideoControl('pause');
          const currentSlide = tripleSlides[currentIndex];
          if (videoIaRef.current && currentSlide && currentSlide.videoApresentacaoIa) {
            await loadVideo(videoIaRef.current, currentSlide.videoApresentacaoIa);
          }
          setIsPlaying(false);
          setPlayingSlideId(null);
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Erro ao mudar índice:', error);
          }
        }
      })();
    }
    handleIndexChange();
  }, [currentIndex, tripleSlides]);

  /* Ao clicar no slide, dispara a reprodução do vídeo */
  const handleVideoClick = (slideId) => {
    (async () => {
      if (playingSlideId !== slideId) {
        try {
          await handleVideoControl('pause');
          setPlayingSlideId(slideId);
          setIsPlaying(true);
          const currentSlide = tripleSlides[currentIndex];
          if (videoIaRef.current && currentSlide && currentSlide.videoApresentacaoIa) {
            await loadVideo(videoIaRef.current, currentSlide.videoApresentacaoIa);
          }
          await Promise.all([
            waitForVideoToBeReady(videoRef.current),
            waitForVideoToBeReady(videoIaRef.current)
          ]);
          videoIaRef.current.currentTime = videoRef.current.currentTime;
          await handleVideoControl('play');
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Erro ao manipular vídeo:', error);
            setIsPlaying(false);
            setPlayingSlideId(null);
          }
        }
      }
    })();
  };

  /* Função auxiliar para aguardar que um vídeo esteja pronto para reprodução */
  const waitForVideoToBeReady = (video) => {
    return new Promise((resolve) => {
      if (!video) return resolve();
      if (video.readyState >= 3) {
        return resolve();
      }
      const onCanPlayThrough = () => {
        video.removeEventListener('canplaythrough', onCanPlayThrough);
        resolve();
      };
      video.addEventListener('canplaythrough', onCanPlayThrough);
    });
  };

  // Efeito que dispara um timeout único para sincronizar os vídeos após 1 segundo quando isPlaying for true
  useEffect(() => {
    if (isPlaying) {
      const syncTimeout = setTimeout(() => {
        if (videoRef.current && videoIaRef.current) {
          const masterTime = videoRef.current.currentTime;
          const followerTime = videoIaRef.current.currentTime;
          let diff = masterTime - followerTime;
          if (diff < 0) {
            diff = -diff;
          }
          if (diff > 0.3) {
            videoIaRef.current.currentTime = masterTime;
          }
        }
      }, 1000);
      return () => clearTimeout(syncTimeout);
    }
  }, [isPlaying]);

  const respSizes = getResponsiveSizes(windowWidth);
  const inactiveWidth = respSizes.inactiveWidth;
  const activeWidth = respSizes.activeWidth;
  const totalWidthBefore = currentIndex * inactiveWidth;
  const activeCenter = totalWidthBefore + activeWidth / 2;
  const wrapperOffset = windowWidth < 660
    ? (windowWidth / 2) - activeCenter
    : (containerWidth / 2) - activeCenter;
  const wrapperStyle = {
    transform: `translateX(${wrapperOffset}px)`,
    transition: noTransition ? 'none' : 'transform 0.5s ease'
  };

  return (
    <div className="carrossel-container">
      <div className="carrossel-wrapper" style={wrapperStyle} onTransitionEnd={handleTransitionEnd}>
        {tripleSlides.map((slide, index) => (
          <Slide
            key={slide.id + '-' + index}
            slide={slide}
            index={index}
            currentIndex={currentIndex}
            noTransition={noTransition}
            handleVideoClick={handleVideoClick}
            isPlaying={isPlaying}
            playingSlideId={playingSlideId}
            videoRef={videoRef}
            handleVideoControl={handleVideoControl}
            handleSeeked={handleSeeked}
            windowWidth={windowWidth}
          />
        ))}
      </div>

      <div className="nav-case-link mobile" style={{ left: centerPosition + 'px', margin: dimensions.center.margin }}>
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
        <video className="video-avatar-dani" ref={videoIaRef} preload="metadata" muted>
          <source src={(tripleSlides[currentIndex] && tripleSlides[currentIndex].videoApresentacaoIa)} type="video/mp4" />
          Seu navegador não suporta a tag de vídeo.
        </video>
      </div>
    </div>
  );
}
