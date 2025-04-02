export const getResponsiveSizes = (width) => {
    if (width < 640) return { inactiveWidth: 54, activeWidth: 390 };
    if (width < 1024) return { inactiveWidth: 88, activeWidth: 493 };
    if (width < 1280) return { inactiveWidth: 107, activeWidth: 599 };
    if (width < 1536) return { inactiveWidth: 128, activeWidth: 707 };
    if (width < 3800) return { inactiveWidth: 172, activeWidth: 1090 };


    return { inactiveWidth: 172, activeWidth: 1090, extraOffset: 500 };
};