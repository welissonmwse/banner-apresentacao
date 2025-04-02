export const getSlideDimensions = (width) => {
    if (width < 640) {
        return {
            center: { width: '358px', height: '157px', "margin-inline": 16 },
            side: { width: '48px', height: '157px', "margin-inline": 3 }
        };
    } else if (width < 1024) {
        return {
            center: { width: '463px', height: '204px', "margin-inline": 15 },
            side: { width: '78px', height: '204px', "margin-inline": 5 }
        };
    } else if (width < 1280) {
        return {
            center: { width: '563px', height: '248px', "margin-inline": 18 },
            side: { width: '95px', height: '248px', "margin-inline": 6 }
        };
    } else if (width < 1536) {
        return {
            center: { width: '663px', height: '292px', "margin-inline": 22 },
            side: { width: '112px', height: '292px', "margin-inline": 8 }
        };
    } else {
        return {
            center: { width: '1077px', height: '470px', "margin-inline": 26 },
            side: { width: '152px', height: '470px', "margin-inline": 10 }
        };
    }
};

export const getNavigationSizes = (width, containerWidth) => {
    if (width < 640) {
        return { centerPosition: (containerWidth / 2) - (280 / 2) - 16, navigationWidth: 280 };
    } else if (width < 1024) {
        return { centerPosition: (containerWidth / 2) - (463 / 2) - 15, navigationWidth: 463 };
    } else if (width < 1280) {
        return { centerPosition: (containerWidth / 2) - (563 / 2) - 18, navigationWidth: 563 };
    } else if (width < 1536) {
        return { centerPosition: (containerWidth / 2) - (663 / 2) - 22, navigationWidth: 663 };
    } else {
        return { centerPosition: (containerWidth / 2) - (1077 / 2) - 26, navigationWidth: 1077 };
    }
};
