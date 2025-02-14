import React, { useRef, useState } from 'react';
import { cases } from './ultils/cases';

// Array de dados dos slides, cada objeto contém informações para estados normal e destacado
// const slidesData = [
// 	{
// 		normalBg: "#a00",
// 		normalText: "1-V",
// 		highlightBg: "#f00",
// 		highlightText: "1-H"
// 	},
// 	{
// 		normalBg: "#0a0",
// 		normalText: "2-V",
// 		highlightBg: "#0f0",
// 		highlightText: "2-H"
// 	},
// 	{
// 		normalBg: "#00a",
// 		normalText: "3-V",
// 		highlightBg: "#00f",
// 		highlightText: "3-H"
// 	},
// 	{
// 		normalBg: "#aa0",
// 		normalText: "4-V",
// 		highlightBg: "#ff0",
// 		highlightText: "4-H"
// 	},
// 	{
// 		normalBg: "#a0a",
// 		normalText: "5-V",
// 		highlightBg: "#f0f",
// 		highlightText: "5-H"
// 	}
// ];

export function Carousel() {
	const [isPlaying, setIsPlaying] = useState(false)
	// Estado para controlar qual slide está ativo (começa com length para posicionar no meio do array triplicado)
	const [currentIndex, setCurrentIndex] = useState(cases.length);
	// Estado para controlar quando desabilitar as transições durante o teleporte
	const [noTransition, setNoTransition] = useState(false);
	// Triplica o array de slides para permitir navegação infinita
	const tripleSlides = [...cases, ...cases, ...cases];

	const videoRef = useRef(null)

	// Constantes para cálculos de posicionamento
	const INACTIVE_WIDTH = 220; // Largura total do slide inativo (200px + 20px de margem)
	const ACTIVE_WIDTH = 683;   // Largura total do slide ativo (400px + 20px de margem)

	// Função equivalente ao teleportaSemReanimar do HTML
	const teleportaSemReanimar = (novoIndex) => {
		// Desativa transições
		setNoTransition(true);
		// Atualiza o índice
		setCurrentIndex(novoIndex);
	};

	// Handler para navegar para o slide anterior
	const handlePrev = () => {
		setCurrentIndex(prev => prev - 1);
	};

	// Handler para navegar para o próximo slide
	const handleNext = () => {
		setCurrentIndex(prev => prev + 1);
	};

	// Função executada quando a transição termina
	const handleTransitionEnd = () => {
		// Se passamos do bloco do meio, teleporta sem reanimar
		if (currentIndex < cases.length) {
			teleportaSemReanimar(currentIndex + cases.length);
		} else if (currentIndex >= cases.length * 2) {
			teleportaSemReanimar(currentIndex - cases.length);
		}
	};

	// Effect para reativar as transições após o teleporte
	React.useEffect(() => {
		if (noTransition) {
			// Aguarda o próximo frame para garantir que as mudanças de estilo foram aplicadas
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setNoTransition(false);
				});
			});
		}
	}, [noTransition]);

	// Calcula os estilos para cada slide individual
	const getSlideStyle = (index) => {
		const isCenter = index === currentIndex;
		return {
			width: isCenter ? '663px' : '200px', // Slide ativo é maior
			height: '343px',
			opacity: isCenter ? 1 : 0.7,         // Slide ativo é mais opaco
			zIndex: isCenter ? 10 : 1,           // Slide ativo fica acima
			margin: '0 10px',
			// Remove todas as transições quando noTransition é true
			transition: noTransition ? 'none' : 'all 0.5s ease'
		};
	};

	// Calcula o posicionamento do wrapper inteiro
	const getWrapperStyle = () => {
		const containerWidth = window.innerWidth * 0.8;           // Largura do container
		const totalWidthBefore = currentIndex * INACTIVE_WIDTH;   // Soma das larguras até o slide atual
		const activeCenter = totalWidthBefore + (ACTIVE_WIDTH / 2); // Centro do slide ativo
		const offset = (containerWidth / 2) - activeCenter;       // Offset para centralizar

		return {
			transform: `translateX(${offset}px)`,
			// Remove todas as transições quando noTransition é true
			transition: noTransition ? 'none' : 'transform 0.5s ease'
		};
	};

	function handleVideoClick() {
		setIsPlaying(true)
		console.log(videoRef.current)
		if (!videoRef.current) return

		videoRef.current.play()
	}

	return (
		<div className="carrossel-container">
			{/* Wrapper principal com posicionamento calculado */}
			<div
				className="carrossel-wrapper"
				style={getWrapperStyle()}
				onTransitionEnd={handleTransitionEnd}
			>
				{/* Mapeia os slides triplicados */}
				{tripleSlides.map((slide, index) => (
					<div
						key={slide.id}
						// Adiciona classe 'center' ao slide ativo
						className={`slide ${index === currentIndex ? 'center' : ''}`}
						style={getSlideStyle(index)}
					>
						{/* Div para visualização normal */}
						<div
							className="normal-img"
							style={{ background: `url(${slide.imgIndicador})` }}
						>
						</div>
						{/* Div para visualização destacada */}
						<div
							className="highlight-img"
							style={{ background: `url(${slide.banner})` }}
							onClick={handleVideoClick}
						>
							{isPlaying && (
								<video
									class="video"
									controls
									preload="metadata"
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
			{/* Botões de navegação */}
			<div className="navegacao">
				<button onClick={handlePrev}>◀</button>
				<button onClick={handleNext}>▶</button>
			</div>
		</div>
	);
}


