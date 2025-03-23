
// Type definitions for fabric.js
declare module 'fabric' {
  const fabric: {
    Canvas: typeof Canvas;
    PencilBrush: typeof PencilBrush;
    Circle: typeof Circle;
    Rect: typeof Rect;
    Triangle: typeof Triangle;
    Polygon: typeof Polygon;
    IText: typeof IText;
    Path: typeof Path;
    Image: typeof Image;
  };
  
  export = fabric;
  
  class Canvas {
    constructor(element: HTMLCanvasElement | string, options?: any);
    width: number | undefined;
    height: number | undefined;
    backgroundColor: string;
    freeDrawingBrush: PencilBrush;
    isDrawingMode: boolean;
    selection: boolean;
    
    on(event: string, handler: Function): Canvas;
    add(...objects: any[]): Canvas;
    remove(...objects: any[]): Canvas;
    getObjects(): any[];
    getActiveObject(): any;
    setActiveObject(object: any): Canvas;
    renderAll(): Canvas;
    clear(): Canvas;
    dispose(): void;
    loadFromJSON(json: string, callback?: Function): Canvas;
    toJSON(propertiesToInclude?: string[]): any;
    toDataURL(options?: {
      format?: string;
      quality?: number;
      multiplier?: number;
    }): string;
    setBackgroundImage(image: any, callback: Function): Canvas;
    setBackgroundColor(color: string, callback?: Function): Canvas;
  }

  class PencilBrush {
    constructor(canvas: Canvas);
    color: string;
    width: number;
    globalCompositeOperation?: string;
  }

  class Circle {
    constructor(options?: any);
    set(options: any): Circle;
    bringToFront(): Circle;
    sendToBack(): Circle;
  }

  class Rect {
    constructor(options?: any);
    set(options: any): Rect;
    bringToFront(): Rect;
    sendToBack(): Rect;
  }

  class Triangle {
    constructor(options?: any);
    set(options: any): Triangle;
    bringToFront(): Triangle;
    sendToBack(): Triangle;
  }

  class Polygon {
    constructor(points: Array<{x: number, y: number}>, options?: any);
    set(options: any): Polygon;
    bringToFront(): Polygon;
    sendToBack(): Polygon;
  }

  class IText {
    constructor(text: string, options?: any);
    text: string;
    set(options: any): IText;
    bringToFront(): IText;
    sendToBack(): IText;
  }

  class Path {
    constructor(path: string, options?: any);
    set(options: any): Path;
    bringToFront(): Path;
    sendToBack(): Path;
  }

  class Image {
    constructor(element: HTMLImageElement, options?: any);
    set(options: any): Image;
    bringToFront(): Image;
    sendToBack(): Image;
    
    static fromURL(url: string, callback: Function, options?: any): void;
  }
}
