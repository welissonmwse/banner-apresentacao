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
  const [isLoading, setIsLoading] = useState(false);
  const [isClickDisabled, setIsClickDisabled] = useState(false);

  const videoRef = useRef(null);    // Vídeo principal
  const videoIaRef = useRef(null);  // Vídeo da Dani

  // Cria uma lista com os slides repetidos para efeito de loop
  const tripleSlides = useMemo(() => cases.concat(cases, cases), []);
  const navSizes = getNavigationSizes(windowWidth, containerWidth);
  const centerPosition = navSizes.centerPosition;
  const dimensions = getSlideDimensions(windowWidth);

  /* Controle dos vídeos */
  function handleVideoControl(action) {
    if (!videoRef.current || !videoIaRef.current) return Promise.resolve();

    try {
      if (action === 'play') {
        return Promise.allSettled([
          videoRef.current.play().catch(err => {
            console.warn('Master video play error:', err);
            return false;
          }),
          videoIaRef.current.play().catch(err => {
            console.warn('IA video play error:', err);
            return false;
          })
        ]);
      } else if (action === 'pause') {
        try {
          videoRef.current.pause();
          videoIaRef.current.pause();
          return Promise.resolve();
        } catch (e) {
          console.warn('Pause error:', e);
          return Promise.resolve();
        }
      }
      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao controlar vídeos:', error);
      return Promise.resolve();
    }
  }

  /* Sincronização dos vídeos ao finalizar o seek no master */
  function handleSeeked() {
    if (videoRef.current && videoIaRef.current && videoRef.current.readyState >= 2) {
      videoIaRef.current.currentTime = videoRef.current.currentTime;
    }
  }

  /* Sincronização inicial quando o vídeo começa a reproduzir */
  useEffect(() => {
    if (isPlaying && videoRef.current && videoIaRef.current) {
      videoIaRef.current.currentTime = videoRef.current.currentTime;
    }
  }, [isPlaying]);

  /* Sincronização contínua: Usando uma única fonte de sincronização*/
  useEffect(() => {
    const master = videoRef.current;
    if (!master) return;

    let syncInProgress = false;
    let lastSyncTime = 0;

    function syncTime() {
      // Evitar sincronizações muito frequentes (limitação de taxa)
      const now = Date.now();
      if (now - lastSyncTime < 250 || syncInProgress || !isPlaying) return;

      if (videoRef.current && videoIaRef.current) {
        const masterTime = videoRef.current.currentTime;
        const followerTime = videoIaRef.current.currentTime;
        const diff = Math.abs(masterTime - followerTime);

        if (diff > 0.2) {
          syncInProgress = true;
          lastSyncTime = now;

          try {
            videoIaRef.current.currentTime = masterTime;
          } catch (e) {
            console.warn('Erro ao sincronizar vídeos:', e);
          }

          // Garantir que a flag seja liberada após um tempo
          setTimeout(() => {
            syncInProgress = false;
          }, 100);
        }
      }
    }

    master.addEventListener('timeupdate', syncTime);
    return () => {
      master.removeEventListener('timeupdate', syncTime);
    };
  }, [isPlaying]);

  /* Efeito para monitorar buffering */
  useEffect(() => {
    const setupEventListeners = () => {
      const master = videoRef.current;
      const follower = videoIaRef.current;
      if (!master || !follower) return;

      // Timers para debounce dos eventos
      let waitingTimer = null;
      let playbackTimer = null;

      function onWaiting() {
        clearTimeout(waitingTimer);
        // Não ative o loading imediatamente - espere para confirmar que não é um pequeno atraso
        waitingTimer = setTimeout(() => {
          if (videoRef.current && videoIaRef.current) {
            setIsLoading(true);
            // Apenas pause se ainda estiver com baixo readyState após o timeout
            if (videoRef.current.readyState < 3 || videoIaRef.current.readyState < 3) {
              handleVideoControl('pause');
            }
          }
        }, 300);
      }

      function onCanPlayThrough() {
        clearTimeout(playbackTimer);
        playbackTimer = setTimeout(() => {
          if (!videoRef.current || !videoIaRef.current) return;

          // Só tente reproduzir se ambos os vídeos estiverem prontos
          if (videoRef.current.readyState >= 3 && videoIaRef.current.readyState >= 3) {
            setIsLoading(false);

            // Retome a reprodução apenas se realmente estiver em estado de "playing"
            if (isPlaying && videoRef.current.paused && videoIaRef.current.paused) {
              handleVideoControl('play').catch(err => console.warn('Play after buffering error:', err));
            }
          }
        }, 200);
      }

      master.addEventListener('waiting', onWaiting);
      follower.addEventListener('waiting', onWaiting);
      master.addEventListener('canplaythrough', onCanPlayThrough);
      follower.addEventListener('canplaythrough', onCanPlayThrough);

      // Adicionar manipulador de erro para evitar travamentos
      function onError(e) {
        console.error('Erro de vídeo:', e);
        setIsLoading(false);
        setIsPlaying(false);
      }

      master.addEventListener('error', onError);
      follower.addEventListener('error', onError);

      return () => {
        clearTimeout(waitingTimer);
        clearTimeout(playbackTimer);
        master.removeEventListener('waiting', onWaiting);
        follower.removeEventListener('waiting', onWaiting);
        master.removeEventListener('canplaythrough', onCanPlayThrough);
        follower.removeEventListener('canplaythrough', onCanPlayThrough);
        master.removeEventListener('error', onError);
        follower.removeEventListener('error', onError);
      };
    };

    let cleanup = null;

    if (videoRef.current && videoIaRef.current) {
      cleanup = setupEventListeners();
    } else {
      const intervalId = setInterval(() => {
        if (videoRef.current && videoIaRef.current) {
          cleanup = setupEventListeners();
          clearInterval(intervalId);
        }
      }, 500);

      return () => {
        clearInterval(intervalId);
        if (cleanup) cleanup();
      };
    }

    return () => {
      if (cleanup) cleanup();
    };
  }, [isPlaying]);

  /* Efeito para tratar eventos de seeking e seeked no vídeo master*/
  useEffect(() => {
    const master = videoRef.current;
    if (!master) return;

    let seekingTimeout = null;

    function onSeeking() {
      setIsLoading(true);
      // Limpar timeout anterior se existir
      clearTimeout(seekingTimeout);
      // Definir um timeout de segurança para remover o estado de loading
      seekingTimeout = setTimeout(() => setIsLoading(false), 3000);
    }

    function onSeekedWrapper() {
      clearTimeout(seekingTimeout);
      handleSeeked();
      setIsLoading(false);
    }

    master.addEventListener('seeking', onSeeking);
    master.addEventListener('seeked', onSeekedWrapper);

    return () => {
      clearTimeout(seekingTimeout);
      master.removeEventListener('seeking', onSeeking);
      master.removeEventListener('seeked', onSeekedWrapper);
    };
  }, []);

  /* Atualiza o índice sem transição para o loop infinito */
  function teleportWithoutTransition(newIndex) {
    setNoTransition(true);
    setCurrentIndex(newIndex);
  }

  function handlePrev() {
    if (isClickDisabled) return;
    setIsClickDisabled(true);
    setCurrentIndex(prev => prev - 1);
    setTimeout(() => setIsClickDisabled(false), 600);
  }

  function handleNext() {
    if (isClickDisabled) return;
    setIsClickDisabled(true);
    setCurrentIndex(prev => prev + 1);
    setTimeout(() => setIsClickDisabled(false), 600);
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
      const id = requestAnimationFrame(() => {
        const id2 = requestAnimationFrame(() => {
          setNoTransition(false);
        });
        return () => cancelAnimationFrame(id2);
      });
      return () => cancelAnimationFrame(id);
    }
  }, [noTransition]);

  /* Ao mudar o índice, pausa os vídeos e carrega o novo vídeo de apoio  */
  useEffect(() => {
    let isMounted = true;
    const handleIndexChange = async () => {
      try {
        await handleVideoControl('pause');

        if (!isMounted) return;

        const currentSlide = tripleSlides[currentIndex];
        if (videoIaRef.current && currentSlide && currentSlide.videoApresentacaoIa) {
          try {
            await loadVideo(videoIaRef.current, currentSlide.videoApresentacaoIa);
          } catch (error) {
            console.warn('Erro ao carregar vídeo de apoio:', error);
          }
        }

        if (isMounted) {
          setIsPlaying(false);
          setPlayingSlideId(null);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Erro ao mudar índice:', error);
        }
      }
    };

    handleIndexChange();

    return () => {
      isMounted = false;
    };
  }, [currentIndex, tripleSlides]);

  /* Função auxiliar para aguardar que um vídeo esteja pronto */
  const waitForVideoToBeReady = (video) => {
    return new Promise((resolve) => {
      if (!video) return resolve();

      if (video.readyState >= 3) {
        return resolve();
      }

      const timeout = setTimeout(() => {
        video.removeEventListener('canplaythrough', onCanPlayThrough);
        console.warn('Timeout esperando vídeo estar pronto');
        resolve();
      }, 5000);

      const onCanPlayThrough = () => {
        clearTimeout(timeout);
        video.removeEventListener('canplaythrough', onCanPlayThrough);
        resolve();
      };

      video.addEventListener('canplaythrough', onCanPlayThrough);
    });
  };

  /* Ao clicar no slide, dispara a reprodução do vídeo - com debounce */
  const handleVideoClick = (slideId) => {
    if (isClickDisabled) return;

    setIsClickDisabled(true);
    setTimeout(() => setIsClickDisabled(false), 1000);

    (async () => {
      if (playingSlideId !== slideId) {
        try {
          setIsLoading(true);
          await handleVideoControl('pause');

          setPlayingSlideId(slideId);
          setIsPlaying(true);

          const currentSlide = tripleSlides[currentIndex];
          if (videoIaRef.current && currentSlide && currentSlide.videoApresentacaoIa) {
            try {
              await loadVideo(videoIaRef.current, currentSlide.videoApresentacaoIa);
            } catch (error) {
              console.warn('Erro ao carregar vídeo IA:', error);
            }
          }

          try {
            await Promise.allSettled([
              waitForVideoToBeReady(videoRef.current),
              waitForVideoToBeReady(videoIaRef.current)
            ]);
          } catch (error) {
            console.warn('Erro ao aguardar vídeos:', error);
          }

          if (videoRef.current && videoIaRef.current) {
            try {
              videoIaRef.current.currentTime = videoRef.current.currentTime;
              await handleVideoControl('play');
            } catch (error) {
              console.warn('Erro ao iniciar reprodução:', error);
            }
          }

          setIsLoading(false);
        } catch (error) {
          console.error('Erro ao manipular vídeo:', error);
          setIsPlaying(false);
          setPlayingSlideId(null);
          setIsLoading(false);
        }
      }
    })();
  };
// Estilos do carrossel
const respSizes = getResponsiveSizes(windowWidth);
const inactiveWidth = respSizes.inactiveWidth;
const activeWidth = respSizes.activeWidth;
const offSet = respSizes.extraOffset || 0;
const totalWidthBefore = currentIndex * inactiveWidth;
const activeCenter = totalWidthBefore + activeWidth / 2;

// Nova condição para calcular o wrapperOffset
let wrapperOffset;
if (windowWidth >= 3800) {
  // Para telas muito grandes (acima de 3800px)
  wrapperOffset = (containerWidth / 2) - activeCenter - offSet;
} else if (windowWidth < 660) {
  // Para telas pequenas (abaixo de 660px)
  wrapperOffset = (windowWidth / 2) - activeCenter;
} else {
  // Para telas intermediárias
  wrapperOffset = (containerWidth / 2) - activeCenter;
}

const wrapperStyle = {
  transform: `translateX(${wrapperOffset}px)`,
  transition: noTransition ? 'none' : 'transform 0.5s ease'
};
  // Observa mudanças na classe "active" do mainContainer para pausar os videos caso necessário
  useEffect(() => {
    const mainContainer = document.querySelector('.sessao-inicio');
    if (!mainContainer) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          // Verifica se o elemento NÃO contém a classe "active"
          if (!mainContainer.classList.contains('active')) {
            // Se não tiver "active", pausa os vídeos
            handleVideoControl('pause');
          }
        }
      });
    });

    // Observa mudanças nos atributos do mainContainer
    observer.observe(mainContainer, { attributes: true });

    return () => {
      observer.disconnect();
    };
  }, []);


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
            isLoading={isLoading}
          />
        ))}
      </div>

      <div className="nav-case-link mobile" style={{ left: centerPosition + 'px', "margin-inline": dimensions.center['margin-inline'] }}>
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
        <video
          className="video-avatar-dani"
          ref={videoIaRef}
          preload="metadata"
          muted
          playsInline
        >
          <source src={(tripleSlides[currentIndex] && tripleSlides[currentIndex].videoApresentacaoIa)} type="video/mp4" />
          Seu navegador não suporta a tag de vídeo.
        </video>
      </div>
    </div>
  );
}
