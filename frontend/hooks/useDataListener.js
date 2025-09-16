import { useEffect, useCallback, useRef } from 'react';
import { useDataRefresh } from '../contexts/DataRefreshContext';

export const useDataListener = (dataType, refreshCallback) => {
  const { refreshTriggers } = useDataRefresh();
  const previousTriggerRef = useRef(0);

  useEffect(() => {
    const currentTrigger = refreshTriggers[dataType];
    
    // Only call refresh if the trigger has actually changed (and it's not the initial value)
    if (currentTrigger > 0 && currentTrigger !== previousTriggerRef.current) {
      console.log(`📊 Data refresh triggered for ${dataType}, calling refresh callback`);
      previousTriggerRef.current = currentTrigger;
      
      // Add a small delay to prevent race conditions
      const timeoutId = setTimeout(() => {
        refreshCallback();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [refreshTriggers, dataType, refreshCallback]);
};