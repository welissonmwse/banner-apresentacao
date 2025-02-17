export const BREAKPOINTS = {
    mobile: 320,
    tablet: 768,
    laptop: 1024,
    desktop: 1440,
    largeDesktop: 1920
};

export const getResponsiveValues = (screenWidth) => {
    if (screenWidth >= BREAKPOINTS.largeDesktop) {
        return {
            activeWidth: '963px',
            inactiveWidth: '182px',
            height: '492px',
            margin: '0 20px'
        };
    }
    if (screenWidth >= BREAKPOINTS.desktop) {
        return {
            activeWidth: '863px',
            inactiveWidth: '152px',
            height: '392px',
            margin: '0 15px'
        };
    }
    if (screenWidth >= BREAKPOINTS.laptop) {
        return {
            activeWidth: '763px',
            inactiveWidth: '132px',
            height: '342px',
            margin: '0 12px'
        };
    }
    if (screenWidth >= BREAKPOINTS.tablet) {
        return {
            activeWidth: '663px',
            inactiveWidth: '122px',
            height: '292px',
            margin: '0 10px'
        };
    }
    return {
        activeWidth: '563px',
        inactiveWidth: '102px',
        height: '242px',
        margin: '0 8px'
    };
};