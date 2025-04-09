
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
  const drawing = drawings.find(drawing => drawing.id === id);
  
  if (drawing) {
    console.log(`Found drawing with ID ${id}:`, drawing.name);
    return drawing;
  }
  
  console.log(`Drawing with ID ${id} not found`);
  return null;
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
    console.log(`Updating existing drawing: ${drawing.name}`);
    drawings[existingIndex] = updatedDrawing;
  } else {
    console.log(`Adding new drawing: ${drawing.name}`);
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
    console.log(`No drawing found with ID ${id} to delete`);
    return false; // Nothing was deleted
  }
  
  console.log(`Deleted drawing with ID ${id}`);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDrawings));
  return true;
};

/**
 * Generate a unique ID for a new drawing
 */
export const generateDrawingId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Import a drawing from a .yrd file
 */
export const importDrawingFromYRD = (yrdContent: string): StoredDrawing | null => {
  try {
    const yrdData = JSON.parse(yrdContent);
    if (yrdData.type !== "yourDrawing" || !yrdData.canvasJSON) {
      console.error("Invalid YRD file format");
      return null;
    }
    
    const drawingId = generateDrawingId();
    const now = Date.now();
    
    const newDrawing: StoredDrawing = {
      id: drawingId,
      name: `Импортированный рисунок ${new Date().toLocaleDateString('ru-RU')}`,
      data: JSON.stringify(yrdData),
      thumbnail: "", // Will be generated when the drawing is first rendered
      createdAt: yrdData.metadata?.createdAt || now,
      updatedAt: now
    };
    
    return newDrawing;
  } catch (error) {
    console.error("Error parsing YRD file:", error);
    return null;
  }
};
