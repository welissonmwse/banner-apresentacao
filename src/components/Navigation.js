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
    const isMobile = windowWidth < 1024;

    const navStyle = {
        left: `${windowWidth < 1900 ? centerPosition : centerPosition + dimensions.side['margin-inline']}px`,
        right: `${centerPosition}px`,
        "margin-inline": `${dimensions.center['margin-inline'] + (windowWidth < 1900 ? 0 : dimensions.side['margin-inline'])}px`,
        width: isMobile ? 'auto' : `${navigationWidth}px`,
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
