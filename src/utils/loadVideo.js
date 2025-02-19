/* Helper para carregar vídeos */
export const loadVideo = (videoElement, src) => {
    return new Promise((resolve, reject) => {
        if (!videoElement) return reject(new Error('Elemento de vídeo não encontrado'));
        videoElement.src = src;
        videoElement.onloadeddata = () => resolve();
        videoElement.onerror = (err) => reject(err);
        videoElement.load();
    });
};