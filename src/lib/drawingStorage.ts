
/**
 * Service for storing and retrieving drawings from browser's localStorage
 */

export interface StoredDrawing {
  id: string;
  name: string;
  thumbnail: string;
  data: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'saved_drawings';

/**
 * Get all stored drawings
 */
export const getAllDrawings = (): StoredDrawing[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to get drawings from storage:', error);
    return [];
  }
};

/**
 * Get a specific drawing by ID
 */
export const getDrawingById = (id: string): StoredDrawing | null => {
  const drawings = getAllDrawings();
  return drawings.find(drawing => drawing.id === id) || null;
};

/**
 * Save a new drawing or update an existing one
 */
export const saveDrawing = (drawing: Omit<StoredDrawing, 'updatedAt'>): StoredDrawing => {
  const drawings = getAllDrawings();
  const existingIndex = drawings.findIndex(d => d.id === drawing.id);
  
  const updatedDrawing = {
    ...drawing,
    updatedAt: Date.now()
  };
  
  if (existingIndex >= 0) {
    drawings[existingIndex] = updatedDrawing;
  } else {
    drawings.push(updatedDrawing);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drawings));
  return updatedDrawing;
};

/**
 * Delete a drawing by ID
 */
export const deleteDrawing = (id: string): boolean => {
  const drawings = getAllDrawings();
  const filteredDrawings = drawings.filter(drawing => drawing.id !== id);
  
  if (filteredDrawings.length === drawings.length) {
    return false; // Nothing was deleted
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDrawings));
  return true;
};

/**
 * Generate a unique ID for a new drawing
 */
export const generateDrawingId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
