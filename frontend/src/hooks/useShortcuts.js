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

      let key = event.key.toLowerCase();
      if (event.code) {
        if (event.code.startsWith('Key')) {
          key = event.code.slice(3).toLowerCase();
        } else if (event.code.startsWith('Digit')) {
          key = event.code.slice(5);
        }
      }

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