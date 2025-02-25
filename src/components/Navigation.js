import React from 'react';
import { getNavigationSizes, getSlideDimensions } from '../utils/styles';

export function Navigation({
    containerWidth,
    currentIndex,
    noTransition,
    onPrev,
    onNext,
    totalCases,
    windowWidth
}) {
    const { centerPosition, navigationWidth } = getNavigationSizes(windowWidth, containerWidth);
    const dimensions = getSlideDimensions(windowWidth);
    const navStyle = {
        left: `${centerPosition}px`,
        right: `${centerPosition}px`,
        margin: dimensions.center.margin,
        width: windowWidth < 1024 ? 'auto' : `${navigationWidth}px`,
        transform: 'none',
        transition: noTransition ? 'none' : 'all 0.5s ease'
    };

    return (
        <div className='navegacao-wrapper'>
            <div className="navegacao" style={navStyle}>
                <div className="nav-controls">
                    <button onClick={onPrev} className="nav-button">
                        <i className="las la-angle-double-left"></i>
                    </button>
                    <button onClick={onNext} className="nav-button">
                        <i className="las la-angle-double-right"></i>
                    </button>
                </div>
                <div className="nav-dots">
                    {Array.from({ length: totalCases }).map((_, index) => (
                        <span
                            key={index}
                            className={`dot-carrossel ${currentIndex % totalCases === index ? 'active' : ''}`}
                        />
                    ))}
                </div>
                <div className="nav-case-link desktop">
                    <a href='/web/guest/cases' className="case-button">Acesse a página do case</a>
                </div>
            </div>
        </div>
    );
}
