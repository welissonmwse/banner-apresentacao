import { useEffect } from 'react';

export function useSyncVideos(videoMasterRef, videoFollowerRef) {
  useEffect(() => {
    const master = videoMasterRef.current;
    const follower = videoFollowerRef.current;

    if (!master || !follower) return;

    // Quando der play no master, dá play no follower
    const handlePlay = () => {
      // Caso o follower não esteja pronto para tocar, pode disparar um .play() assíncrono
      follower.play().catch((err) => {
        console.warn('Não foi possível dar play no vídeo seguidor:', err);
      });
    };

    // Quando der pause no master, pausa o follower
    const handlePause = () => {
      follower.pause();
    };

    // Quando o usuário buscar (seek) no master, atualiza o tempo do follower
    const handleSeeking = () => {
      // Atualiza imediatamente para evitar ficar fora de sincronia
      follower.currentTime = master.currentTime;
    };

    // Conforme o vídeo principal atualiza o tempo (timeupdate), forçamos o seguidor a acompanhar
    // Você pode fazer uma checagem para só sincronizar se a diferença for grande
    const handleTimeUpdate = () => {
      // Exemplo: se a diferença for maior que 0.3s, sincroniza
      if (Math.abs(master.currentTime - follower.currentTime) > 0.3) {
        follower.currentTime = master.currentTime;
      }
    };

    master.addEventListener('play', handlePlay);
    master.addEventListener('pause', handlePause);
    master.addEventListener('seeking', handleSeeking);
    master.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      master.removeEventListener('play', handlePlay);
      master.removeEventListener('pause', handlePause);
      master.removeEventListener('seeking', handleSeeking);
      master.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videoMasterRef, videoFollowerRef]);
}
