import React, { useRef, useState, useEffect } from 'react';
import { cases } from './ultils/cases';

export function Carousel() {
	const [isPlaying, setIsPlaying] = useState(false);
	const [playingSlideId, setPlayingSlideId] = useState(null);
	const [currentIndex, setCurrentIndex] = useState(cases.length);
	const [noTransition, setNoTransition] = useState(false);
	const tripleSlides = [...cases, ...cases, ...cases];
	const videoRef = useRef(null);

	const INACTIVE_WIDTH = 132;
	const ACTIVE_WIDTH = 683;

	const teleportaSemReanimar = (novoIndex) => {
		setNoTransition(true);
		setCurrentIndex(novoIndex);
	};

	const handlePrev = () => {
		setCurrentIndex(prev => prev - 1);
	};

	const handleNext = () => {
		setCurrentIndex(prev => prev + 1);
	};

	const handleTransitionEnd = () => {
		if (currentIndex < cases.length) {
			teleportaSemReanimar(currentIndex + cases.length);
		} else if (currentIndex >= cases.length * 2) {
			teleportaSemReanimar(currentIndex - cases.length);
		}
	};

	useEffect(() => {
		if (noTransition) {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setNoTransition(false);
				});
			});
		}
	}, [noTransition]);

	// Novo useEffect para parar o vídeo quando mudar de slide
	useEffect(() => {
		if (videoRef.current) {
			videoRef.current.pause();
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
		const containerWidth = window.innerWidth * 0.8;
		const totalWidthBefore = currentIndex * INACTIVE_WIDTH;
		const activeCenter = totalWidthBefore + (ACTIVE_WIDTH / 2);
		const offset = (containerWidth / 2) - activeCenter;

		return {
			transform: `translateX(${offset}px)`,
			transition: noTransition ? 'none' : 'transform 0.5s ease'
		};
	};

	function handleVideoClick(slideId) {
		if (playingSlideId !== slideId) {
			if (videoRef.current) {
				videoRef.current.pause();
			}
			setPlayingSlideId(slideId);
			setIsPlaying(true);

			setTimeout(() => {
				if (videoRef.current) {
					const playPromise = videoRef.current.play();
					if (playPromise !== undefined) {
						playPromise.catch(error => {
							console.log("Erro ao iniciar o vídeo:", error);
							setIsPlaying(false);
							setPlayingSlideId(null);
						});
					}
				}
			}, 0);
		}
	}

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
			<div className="navegacao">
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
						<i className="las la-arrow-right"></i>
					</button>
				</div>
			</div>
		</div>
	);
}
