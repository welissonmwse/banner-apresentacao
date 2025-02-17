import React, { useRef, useState, useEffect } from 'react';
import { cases } from './ultils/cases';

export function Carousel() {
	const [isPlaying, setIsPlaying] = useState(false);
	const [playingSlideId, setPlayingSlideId] = useState(null);
	const [containerWidth, setContainerWidth] = useState(window.innerWidth * 0.8)
	const [currentIndex, setCurrentIndex] = useState(cases.length - 1);
	const [noTransition, setNoTransition] = useState(false);
	const videoRef = useRef(null);
	const videoIaRef = useRef(null);

	// Faça cópia tripla dos slides (sim, essa gambiarra continua, mas pelo menos tá organizada)
	const tripleSlides = [...cases, ...cases, ...cases];

	// Constantes mágicas? Melhorei um pouquinho pra você não ser tão medíocre
	const INACTIVE_WIDTH = 132;
	const ACTIVE_WIDTH = 683;

	// Renomeei a função para inglês, assim você aprende a ter consistência
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

	// Corrija esse loop infinito de slides sem ficar cagando a transição toda vez
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
		if (videoRef.current) {
			videoRef.current.pause();
			videoIaRef.current.pause();
			setIsPlaying(false);
			setPlayingSlideId(null);
		}
	}, [currentIndex]);

	const getSlideStyle = (index) => {
		const isCenter = index === currentIndex;
		return {
			width: isCenter ? '663px' : '112px',
			height: '292px',
			opacity: isCenter ? 1 : 0.7,
			zIndex: isCenter ? 10 : 1,
			margin: '0 10px',
			transition: noTransition ? 'none' : 'all 0.5s ease'
		};
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

	const handleVideoClick = (slideId) => {
		if (playingSlideId !== slideId) {
			if (videoRef.current) {
				videoRef.current.pause();
				videoIaRef.current.pause();
			}
			setPlayingSlideId(slideId);
			setIsPlaying(true);

			setTimeout(() => {
				if (videoRef.current && videoIaRef.current) {
					const mainVideoPromise = videoRef.current.play();
					const iaVideoPromise = videoIaRef.current.play();

					Promise.all([mainVideoPromise, iaVideoPromise]).catch(error => {
						console.error("Erro ao iniciar os vídeos:", error);
						setIsPlaying(false);
						setPlayingSlideId(null);
					});
				}
			}, 0);
		} else {
			// Toggle play/pause quando clicar no mesmo vídeo
			if (videoRef.current && videoIaRef.current) {
				if (videoRef.current.paused) {
					videoRef.current.play();
					videoIaRef.current.play();
					setIsPlaying(true);
				} else {
					videoRef.current.pause();
					videoIaRef.current.pause();
					// setIsPlaying(false);
				}
			}
		}
	};

	// Adicione este useEffect para sincronizar os eventos de play/pause
	useEffect(() => {
		if (videoRef.current && videoIaRef.current) {
			const mainVideo = videoRef.current;
			const iaVideo = videoIaRef.current;

			const handleMainVideoPause = () => {
				iaVideo.pause();
				// setIsPlaying(false);
			};

			const handleMainVideoPlay = () => {
				iaVideo.play();
				// setIsPlaying(true);
			};

			mainVideo.addEventListener('pause', handleMainVideoPause);
			mainVideo.addEventListener('play', handleMainVideoPlay);

			return () => {
				mainVideo.removeEventListener('pause', handleMainVideoPause);
				mainVideo.removeEventListener('play', handleMainVideoPlay);
			};
		}
	}, [playingSlideId]);

	console.log(cases[currentIndex]?.videoApresentacaoIa)
	console.log(cases[currentIndex])
	console.log(cases[4])
	console.log(currentIndex)

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
							style={{ backgroundImage: `url(${slide.imgIndicador})` }}
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
									>
										<source
											src={slide.videoApresentacao}
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
				{!isPlaying ? (
					<img
						src='https://intranet.seatecnologia.com.br/documents/d/guest/dani-1'
						alt='Dani'
						id='dani-avatar__carrossel'
					/>
				) : (
					<video
						className="dani-avatar-video"
						ref={videoIaRef}
					// muted
					>
						<source
							src={tripleSlides[currentIndex]?.videoApresentacaoIa}
							type="video/mp4"
						/>
						Seu navegador não suporta a tag de vídeo.
					</video>
				)}
			</div>
		</div>
	);
}
