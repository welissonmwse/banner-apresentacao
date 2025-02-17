import React, { useRef, useState, useEffect } from 'react';
import { cases } from './ultils/cases';
import { getResponsiveValues } from './ultils/responsiveValues';
import { getResponsiveValues } from './ultils/responsiveValues';

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
			case screenWidth >= 1440:
				return {
					inactiveWidth: 128, // 112px + 16px (margins)
					activeWidth: 707    // 663px + 44px (margins)
				};
			case screenWidth >= 1024:
				return {
					inactiveWidth: 107, // 95px + 12px (margins)
					activeWidth: 599    // 563px + 36px (margins)
				};
			case screenWidth >= 768:
				return {
					inactiveWidth: 88,  // 78px + 10px (margins)
					activeWidth: 493    // 463px + 30px (margins)
				};
			default: // Mobile (<768px)
				return {
					inactiveWidth: 62,  // 54px + 8px (margins)
					activeWidth: 340    // 320px + 20px (margins)
				};
		}
	};

	const handleVideoControl = (action) => {
		if (action === 'play') {
			if (videoRef.current && videoIaRef.current) {
				videoRef.current.play();
				videoIaRef.current.play();
			}
		} else if (action === 'pause') {
			if (videoRef.current && videoIaRef.current) {
				videoRef.current.pause();
				videoIaRef.current.pause();
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
		handleVideoControl('pause');
		if (videoIaRef.current) {
			videoIaRef.current.src = tripleSlides[currentIndex]?.videoApresentacaoIa;
			videoIaRef.current.load();
		}
		setIsPlaying(false);
		setPlayingSlideId(null);
	}, [currentIndex]);

	const getSlideStyle = (index) => {
		const screenWidth = window.innerWidth;
		const isCenter = index === currentIndex;

		// Objeto para armazenar as dimensões
		let dimensions;

		switch (true) {
			case screenWidth >= 1440:
				dimensions = {
					centerWidth: '663px',
					centerHeight: '292px',
					sideWidth: '112px',
					sideHeight: '292px',
					centerMargin: '0 22px',
					sideMargin: '0 8px'
				};
				break;

			case screenWidth >= 1024:
				dimensions = {
					centerWidth: '563px',
					centerHeight: '248px',
					sideWidth: '95px',
					sideHeight: '248px',
					centerMargin: '0 18px',
					sideMargin: '0 6px'
				};
				break;

			case screenWidth >= 768:
				dimensions = {
					centerWidth: '463px',
					centerHeight: '204px',
					sideWidth: '78px',
					sideHeight: '204px',
					centerMargin: '0 15px',
					sideMargin: '0 5px'
				};
				break;

			default: // Mobile (<768px)
				dimensions = {
					centerWidth: '320px',
					centerHeight: '141px',
					sideWidth: '54px',
					sideHeight: '141px',
					centerMargin: '0 10px',
					sideMargin: '0 4px'
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
		const { activeWidth } = getResponsiveSizes();
		const centerPosition = (containerWidth / 2) - (activeWidth / 2);

		return {
			left: `${centerPosition}px`,
			transform: 'none',
			transition: noTransition ? 'none' : 'all 0.5s ease'
		};
	};

	const handleVideoClick = (slideId) => {
		if (playingSlideId !== slideId) {
			handleVideoControl('pause');
			setPlayingSlideId(slideId);
			setIsPlaying(true);

			if (videoIaRef.current) {
				videoIaRef.current.src = tripleSlides[currentIndex]?.videoApresentacaoIa;
				videoIaRef.current.load();
			}

			setTimeout(() => {
				handleVideoControl('play');
			}, 0);
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
