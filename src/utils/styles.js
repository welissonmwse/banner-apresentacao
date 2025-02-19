export const getSlideDimensions = (width) => {
    if (width < 640) {
        return {
            center: { width: '358px', height: '156px', margin: '0 8px' },
            side: { width: '48px', height: '156px', margin: '0 3px' }
        };
    } else if (width < 1024) {
        return {
            center: { width: '463px', height: '204px', margin: '0 15px' },
            side: { width: '78px', height: '204px', margin: '0 5px' }
        };
    } else if (width < 1280) {
        return {
            center: { width: '563px', height: '248px', margin: '0 18px' },
            side: { width: '95px', height: '248px', margin: '0 6px' }
        };
    } else if (width < 1536) {
        return {
            center: { width: '663px', height: '292px', margin: '0 22px' },
            side: { width: '112px', height: '292px', margin: '0 8px' }
        };
    } else {
        return {
            center: { width: '1064px', height: '470px', margin: '0 26px' },
            side: { width: '152px', height: '470px', margin: '0 10px' }
        };
    }
};

export const getNavigationSizes = (width, containerWidth) => {
    if (width < 640) {
        return { centerPosition: (containerWidth / 2) - (280 / 2) - 8, navigationWidth: 280 };
    } else if (width < 1024) {
        return { centerPosition: (containerWidth / 2) - (463 / 2) - 15, navigationWidth: 463 };
    } else if (width < 1280) {
        return { centerPosition: (containerWidth / 2) - (563 / 2) - 18, navigationWidth: 563 };
    } else if (width < 1536) {
        return { centerPosition: (containerWidth / 2) - (663 / 2) - 22, navigationWidth: 663 };
    } else {
        return { centerPosition: (containerWidth / 2) - (1064 / 2) - 26, navigationWidth: 1064 };
    }
};
