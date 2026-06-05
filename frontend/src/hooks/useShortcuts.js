import { useEffect, useRef } from 'react';

export function useShortcuts(shortcutMap) {
  const mapRef = useRef(shortcutMap);

  useEffect(() => {
    mapRef.current = shortcutMap;
  }, [shortcutMap]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'PAPER-INPUT' || 
        target.isContentEditable
      ) {
        return;
      }

      const isMod = event.ctrlKey;

      const key = event.key.toLowerCase();

      const pressedKeys = [];
      if (isMod) pressedKeys.push('mod');
      
      if (key !== 'control') {
        pressedKeys.push(key);
      }

      const combination = pressedKeys.join('+');

      const handler = mapRef.current[combination];
      if (handler) {
        event.preventDefault();
        handler(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}