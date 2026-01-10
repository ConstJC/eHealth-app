import { useState, useEffect, useCallback } from 'react';
import { tokenStorage } from '@/lib/auth';
import type { MenuItem } from '@/app/api/menu-items/route';

interface UseMenuItemsReturn {
  menuItems: MenuItem[];
  topLevelItems: MenuItem[];
  settingsMenu: MenuItem | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage menu items from backend
 */
export function useMenuItems(): UseMenuItemsReturn {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const accessToken = tokenStorage.getAccessToken();
      
      if (!accessToken) {
        setError('No access token available');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/menu-items', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch menu items');
      }

      const data: MenuItem[] = await response.json();
      setMenuItems(data);
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to fetch menu items';
      setError(errorMessage);
      console.error('Error fetching menu items:', err);
      // Set empty array on error to prevent UI breakage
      setMenuItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  // Separate top-level items (no parent) from Settings menu
  const topLevelItems = menuItems.filter(item => !item.parentId);
  const settingsMenu = menuItems.find(item => item.href === '/settings' || item.label.toLowerCase() === 'settings') || null;

  return {
    menuItems,
    topLevelItems,
    settingsMenu,
    isLoading,
    error,
    refetch: fetchMenuItems,
  };
}

