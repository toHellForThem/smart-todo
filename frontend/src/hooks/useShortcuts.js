import { useEffect, useRef } from 'react';
import { Keyboard } from 'react-native';

export function useShortcuts(shortcutMap) {
  const mapRef = useRef(shortcutMap);

  useEffect(() => {
    mapRef.current = shortcutMap;
  }, [shortcutMap]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      let key = event.key ? event.key.toLowerCase() : '';
      const tagName = target && target.tagName ? target.tagName.toUpperCase() : '';

      console.log('KeyDown event:', { key, tagName, isContentEditable: target?.isContentEditable });

      if (key === 'escape') {
        if (
          tagName === 'INPUT' || 
          tagName === 'TEXTAREA' || 
          tagName === 'PAPER-INPUT' || 
          (target && target.isContentEditable)
        ) {
          console.log('Escape pressed inside input, blurring...');
          try {
            Keyboard.dismiss();
          } catch (e) {
            console.log('Keyboard.dismiss failed:', e);
          }
          if (target && typeof target.blur === 'function') {
            try {
              target.blur();
            } catch (e) {
              console.log('target.blur failed:', e);
            }
          }
          event.preventDefault();
          return;
        }
      }

      if (
        tagName === 'INPUT' || 
        tagName === 'TEXTAREA' || 
        tagName === 'PAPER-INPUT' || 
        (target && target.isContentEditable)
      ) {
        return;
      }

      const isMod = event.ctrlKey || event.metaKey;
      const isAlt = event.altKey;
      const isShift = event.shiftKey;

      if (isMod && (key === 'r' || key === 's' || key === 'p' || key === 'f' || key === 'g' || key === 'h' || key === 'w' || key === 'q')) {
        event.preventDefault();
      }
      if (key === ' ') {
        key = 'space';
      }
      if (event.code) {
        if (event.code.startsWith('Key')) {
          key = event.code.slice(3).toLowerCase();
        } else if (event.code.startsWith('Digit')) {
          key = event.code.slice(5);
        }
      }

      if (key === 'control' || key === 'meta' || key === 'alt' || key === 'shift') {
        return;
      }

      const pressedKeys = [];
      if (isMod) pressedKeys.push('mod');
      if (isAlt) pressedKeys.push('alt');
      if (isShift) pressedKeys.push('shift');
      
      pressedKeys.push(key);

      const combination = pressedKeys.join('+');

      const handler = mapRef.current[combination];
      if (handler) {
        event.preventDefault();
        handler(event);
      }
    };

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, []);
}