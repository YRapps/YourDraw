
import React, { useEffect, useRef, useState } from "react";
import { Canvas, IText } from "fabric";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { 
  Circle as CircleIcon, 
  Square, 
  Triangle as TriangleIcon, 
  Hexagon, 
  Brush, 
  Eraser, 
  Text, 
  MousePointer, 
  Undo, 
  Save, 
  Layers,
  PaintBucket,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AVAILABLE_FONTS = [
  { name: "Arial", family: "Arial, sans-serif", style: "normal" },
  { name: "Comfortaa", family: "Comfortaa, cursive", style: "normal" },
  { name: "Shantell Sans", family: "Shantell Sans, cursive", style: "normal" },
  { name: "Caveat", family: "Caveat, cursive", style: "normal" },
  { name: "Tiny5", family: "Tiny5, cursive", style: "normal" },
  { name: "Press Start 2P", family: "Press Start 2P, cursive", style: "normal" },
  { name: "Prosto One", family: "Prosto One, cursive", style: "normal" },
  { name: "Great Vibes", family: "Great Vibes, cursive", style: "normal" },
  { name: "Marck Script", family: "Marck Script, cursive", style: "normal" }
];

type Tool = 
  | "select" 
  | "brush" 
  | "eraser" 
  | "circle" 
  | "square" 
  | "triangle" 
  | "polygon" 
  | "text"
  | "fill";

type Menu = "tools" | "view" | "objects";

const DrawingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [activeMenu, setActiveMenu] = useState<Menu>("tools");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [fillColor, setFillColor] = useState("rgba(0, 0, 0, 0)");
  const [brushSize, setBrushSize] = useState(5);
  const [opacity, setOpacity] = useState(100);
  const [cornerRadius, setCornerRadius] = useState(0);
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState("Arial, sans-serif");
  const [fontStyle, setFontStyle] = useState<"normal" | "italic" | "bold">("normal");
  const [textDialogOpen, setTextDialogOpen] = useState(false);
  const [polygonSidesDialogOpen, setPolygonSidesDialogOpen] = useState(false);
  const [polygonSides, setPolygonSides] = useState(5);
  const [textInput, setTextInput] = useState("");
  const [objects, setObjects] = useState<any[]>([]);
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { toast } = useToast();

  useEffect(() => {
    if (!canvasRef.current) return;

    const viewportHeight = window.innerHeight;
    const canvasHeight = viewportHeight * 0.8;
    const canvasWidth = window.innerWidth * 0.95;

    const fabricCanvas = new Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: 'transparent',
      preserveObjectStacking: true,
      selection: true,
    });

    setCanvas(fabricCanvas);

    fabricCanvas.on('object:added', () => saveCanvasState());
    fabricCanvas.on('object:modified', () => saveCanvasState());
    fabricCanvas.on('object:removed', () => saveCanvasState());
    fabricCanvas.on('selection:created', handleSelectionCreated);
    fabricCanvas.on('selection:updated', handleSelectionCreated);
    fabricCanvas.on('selection:cleared', handleSelectionCleared);
    
    saveCanvasState();

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!canvas) return;
    setObjects(canvas.getObjects());
  }, [canvas, canvasHistory]);

  useEffect(() => {
    if (!canvas) return;

    canvas.isDrawingMode = activeTool === "brush" || activeTool === "eraser";
    canvas.selection = activeTool === "select";

    if (activeTool === "brush") {
      canvas.freeDrawingBrush.color = strokeColor;
      canvas.freeDrawingBrush.width = brushSize;
    } else if (activeTool === "eraser") {
      // Use a composite operation that simulates erasing
      canvas.freeDrawingBrush.color = "#ffffff";
      canvas.freeDrawingBrush.width = brushSize * 2;
      if (canvas.freeDrawingBrush.globalCompositeOperation) {
        canvas.freeDrawingBrush.globalCompositeOperation = "destination-out";
      }
    }
  }, [activeTool, strokeColor, brushSize, canvas]);

  const saveCanvasState = () => {
    if (!canvas) return;
    
    const currentState = JSON.stringify(canvas.toJSON());
    
    if (historyIndex < canvasHistory.length - 1) {
      setCanvasHistory(prev => prev.slice(0, historyIndex + 1));
    }
    
    setCanvasHistory(prev => [...prev, currentState]);
    setHistoryIndex(prev => prev + 1);

    setObjects(canvas.getObjects());
  };

  const handleUndo = () => {
    if (!canvas || historyIndex <= 0) return;
    
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    
    canvas.loadFromJSON(canvasHistory[newIndex], () => {
      canvas.renderAll();
      setObjects(canvas.getObjects());
    });
  };

  const handleSelectionCreated = (e: any) => {
    const selectedObject = e.selected?.[0] || canvas?.getActiveObject();
    if (!selectedObject) return;

    if (selectedObject.type === 'rect') {
      setCornerRadius(selectedObject.rx || 0);
    }
    
    setOpacity(selectedObject.opacity * 100 || 100);
    setFillColor(selectedObject.fill || 'transparent');
    setStrokeColor(selectedObject.stroke || '#000000');
    
    if (selectedObject.type === 'textbox' || selectedObject.type === 'i-text') {
      setFontFamily(selectedObject.fontFamily || 'Arial, sans-serif');
      setFontSize(selectedObject.fontSize || 24);
      setFontStyle(
        selectedObject.fontStyle === 'italic' 
          ? 'italic' 
          : selectedObject.fontWeight === 'bold' 
            ? 'bold' 
            : 'normal'
      );
    }
  };

  const handleSelectionCleared = () => {
    setFillColor('rgba(0, 0, 0, 0)');
    setStrokeColor('#000000');
    setOpacity(100);
    setCornerRadius(0);
    setFontSize(24);
    setFontFamily('Arial, sans-serif');
    setFontStyle('normal');
  };

  const addShape = (shape: string) => {
    if (!canvas) return;

    let object: any;

    switch (shape) {
      case 'circle':
        object = new fabric.Circle({
          radius: 50,
          left: canvas.width! / 2 - 50,
          top: canvas.height! / 2 - 50,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: 2,
          opacity: opacity / 100,
        });
        break;
      case 'square':
        object = new fabric.Rect({
          width: 100,
          height: 100,
          left: canvas.width! / 2 - 50,
          top: canvas.height! / 2 - 50,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: 2,
          opacity: opacity / 100,
          rx: cornerRadius,
          ry: cornerRadius,
        });
        break;
      case 'triangle':
        object = new fabric.Triangle({
          width: 100,
          height: 100,
          left: canvas.width! / 2 - 50,
          top: canvas.height! / 2 - 50,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: 2,
          opacity: opacity / 100,
        });
        break;
      case 'polygon':
        const points = [];
        const sides = polygonSides;
        const radius = 50;
        
        for (let i = 0; i < sides; i++) {
          const angle = (i * 2 * Math.PI) / sides;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          points.push({ x, y });
        }
        
        object = new fabric.Polygon(points, {
          left: canvas.width! / 2 - radius,
          top: canvas.height! / 2 - radius,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: 2,
          opacity: opacity / 100,
        });
        break;
      default:
        return;
    }

    canvas.add(object);
    canvas.setActiveObject(object);
    canvas.renderAll();
    setActiveTool('select');
  };

  const addText = () => {
    if (!canvas || !textInput) return;

    const textObject = new fabric.IText(textInput, {
      left: canvas.width! / 2 - 100,
      top: canvas.height! / 2 - 20,
      width: 200,
      fontSize: fontSize,
      fontFamily: fontFamily,
      fontStyle: fontStyle === 'italic' ? 'italic' : 'normal',
      fontWeight: fontStyle === 'bold' ? 'bold' : 'normal',
      fill: strokeColor,
      opacity: opacity / 100,
      textAlign: 'center',
    });

    canvas.add(textObject);
    canvas.setActiveObject(textObject);
    canvas.renderAll();
    setTextDialogOpen(false);
    setTextInput('');
    setActiveTool('select');
  };

  const handleToolClick = (tool: Tool) => {
    if (tool === 'polygon') {
      setPolygonSidesDialogOpen(true);
      return;
    }
    
    if (tool === 'text') {
      setTextDialogOpen(true);
      return;
    }

    if (tool === 'fill' && canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        activeObject.set('fill', fillColor);
        canvas.renderAll();
        saveCanvasState();
      } else {
        canvas.backgroundColor = fillColor;
        canvas.renderAll();
        saveCanvasState();
      }
      return;
    }

    if (tool === 'circle' || tool === 'square' || tool === 'triangle') {
      addShape(tool);
      return;
    }

    setActiveTool(tool);
  };

  const applyChangesToSelectedObject = () => {
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    
    activeObject.set({
      fill: fillColor,
      stroke: strokeColor,
      opacity: opacity / 100,
    });
    
    if (activeObject.type === 'rect') {
      activeObject.set({
        rx: cornerRadius,
        ry: cornerRadius,
      });
    }
    
    if (activeObject.type === 'textbox' || activeObject.type === 'i-text') {
      activeObject.set({
        fontSize: fontSize,
        fontFamily: fontFamily,
        fontStyle: fontStyle === 'italic' ? 'italic' : 'normal',
        fontWeight: fontStyle === 'bold' ? 'bold' : 'normal',
      });
    }
    
    canvas.renderAll();
    saveCanvasState();
  };

  const updateText = () => {
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (!activeObject || (activeObject.type !== 'textbox' && activeObject.type !== 'i-text')) return;
    
    setTextInput(activeObject.text || '');
    setTextDialogOpen(true);

    // After editing, update the text
    if (textInput) {
      activeObject.set({
        text: textInput,
        fontSize: fontSize,
        fontFamily: fontFamily,
        fontStyle: fontStyle === 'italic' ? 'italic' : 'normal',
        fontWeight: fontStyle === 'bold' ? 'bold' : 'normal',
      });
      canvas.renderAll();
      saveCanvasState();
    }
  };

  const saveAsPNG = () => {
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });
    
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `drawing-${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Сохранено",
      description: "Рисунок сохранен на вашем устройстве",
    });
  };

  const bringToFront = () => {
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    
    activeObject.bringToFront();
    canvas.renderAll();
    saveCanvasState();
  };

  const sendToBack = () => {
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    
    activeObject.sendToBack();
    canvas.renderAll();
    saveCanvasState();
  };

  const deleteObject = (obj?: any) => {
    if (!canvas) return;
    
    const objectToDelete = obj || canvas.getActiveObject();
    if (!objectToDelete) return;
    
    canvas.remove(objectToDelete);
    canvas.renderAll();
    saveCanvasState();
  };

  const toolButtons = [
    { tool: "select", icon: <MousePointer size={20} />, label: "Выделение" },
    { tool: "brush", icon: <Brush size={20} />, label: "Кисть" },
    { tool: "eraser", icon: <Eraser size={20} />, label: "Ластик" },
    { tool: "circle", icon: <CircleIcon size={20} />, label: "Круг" },
    { tool: "square", icon: <Square size={20} />, label: "Квадрат" },
    { tool: "triangle", icon: <TriangleIcon size={20} />, label: "Треугольник" },
    { tool: "polygon", icon: <Hexagon size={20} />, label: "Многоугольник" },
    { tool: "text", icon: <Text size={20} />, label: "Текст" },
    { tool: "fill", icon: <PaintBucket size={20} />, label: "Заливка" },
  ];

  const colorSwatches = [
    "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", 
    "#ffff00", "#00ffff", "#ff00ff", "#ff9900", "#9900ff"
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="canvas-container bg-white bg-opacity-80 rounded-2xl shadow-xl mb-20 overflow-hidden">
        <canvas ref={canvasRef} className="canvas" />
      </div>

      <div className="fixed top-4 left-4 right-4 flex justify-between items-center">
        <Button 
          variant="outline"
          className="shadow-md bg-white"
          onClick={handleUndo}
        >
          <Undo size={20} />
        </Button>
        
        <Button 
          variant="outline"
          className="shadow-md bg-white"
          onClick={saveAsPNG}
        >
          <Download size={20} />
        </Button>
      </div>

      <div className="menu-container z-10">
        <div className="flex justify-around mb-4">
          <button
            className={cn("menu-tab", activeMenu === "tools" && "active")}
            onClick={() => setActiveMenu("tools")}
          >
            Инструменты
          </button>
          <button
            className={cn("menu-tab", activeMenu === "view" && "active")}
            onClick={() => setActiveMenu("view")}
          >
            Вид
          </button>
          <button
            className={cn("menu-tab", activeMenu === "objects" && "active")}
            onClick={() => setActiveMenu("objects")}
          >
            Объекты
          </button>
        </div>

        {activeMenu === "tools" && (
          <div className="grid grid-cols-5 gap-4 justify-items-center">
            {toolButtons.map((btn) => (
              <button
                key={btn.tool}
                className={cn("tool-btn", activeTool === btn.tool && "active")}
                onClick={() => handleToolClick(btn.tool as Tool)}
                title={btn.label}
              >
                {btn.icon}
              </button>
            ))}
          </div>
        )}

        {activeMenu === "view" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Цвет кисти:</span>
              <div className="flex space-x-2">
                {colorSwatches.slice(0, 5).map((color) => (
                  <div
                    key={color}
                    className={cn("color-swatch", strokeColor === color && "active")}
                    style={{ backgroundColor: color, borderColor: color === "#ffffff" ? "#ddd" : color }}
                    onClick={() => setStrokeColor(color)}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              {colorSwatches.slice(5).map((color) => (
                <div
                  key={color}
                  className={cn("color-swatch", strokeColor === color && "active")}
                  style={{ backgroundColor: color }}
                  onClick={() => setStrokeColor(color)}
                />
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <div className="color-swatch relative" style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}>
                    <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">+</span>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Выберите цвет:</label>
                    <Input 
                      type="color" 
                      value={strokeColor} 
                      onChange={(e) => setStrokeColor(e.target.value)} 
                      className="w-full h-10"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Цвет заливки:</span>
                <div className="flex space-x-2">
                  <div 
                    className={cn("color-swatch", fillColor === "rgba(0, 0, 0, 0)" && "active")}
                    style={{ 
                      backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                      backgroundSize: '10px 10px',
                      backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px'
                    }}
                    onClick={() => setFillColor("rgba(0, 0, 0, 0)")}
                  />
                  {colorSwatches.slice(0, 4).map((color) => (
                    <div
                      key={`fill-${color}`}
                      className={cn("color-swatch", fillColor === color && "active")}
                      style={{ backgroundColor: color, borderColor: color === "#ffffff" ? "#ddd" : color }}
                      onClick={() => setFillColor(color)}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                {colorSwatches.slice(4, 9).map((color) => (
                  <div
                    key={`fill-${color}`}
                    className={cn("color-swatch", fillColor === color && "active")}
                    style={{ backgroundColor: color }}
                    onClick={() => setFillColor(color)}
                  />
                ))}
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="color-swatch relative" style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}>
                      <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">+</span>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Выберите цвет заливки:</label>
                      <Input 
                        type="color" 
                        value={fillColor === "rgba(0, 0, 0, 0)" ? "#ffffff" : fillColor} 
                        onChange={(e) => setFillColor(e.target.value)} 
                        className="w-full h-10"
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Непрозрачность:</span>
                <span className="text-xs font-mono">{opacity}%</span>
              </div>
              <Slider 
                value={[opacity]} 
                onValueChange={(val) => setOpacity(val[0])} 
                max={100} 
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Размер кисти:</span>
                <span className="text-xs font-mono">{brushSize}px</span>
              </div>
              <Slider 
                value={[brushSize]} 
                onValueChange={(val) => setBrushSize(val[0])} 
                min={1} 
                max={50} 
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Углы фигуры:</span>
                <span className="text-xs font-mono">{cornerRadius}px</span>
              </div>
              <Slider 
                value={[cornerRadius]} 
                onValueChange={(val) => setCornerRadius(val[0])} 
                min={0} 
                max={50} 
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Шрифт:</span>
                <Select 
                  value={fontFamily} 
                  onValueChange={setFontFamily}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Выберите шрифт" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_FONTS.map((font) => (
                      <SelectItem 
                        key={font.name} 
                        value={font.family}
                        style={{ fontFamily: font.family }}
                      >
                        {font.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Размер шрифта:</span>
                <span className="text-xs font-mono">{fontSize}px</span>
              </div>
              <Slider 
                value={[fontSize]} 
                onValueChange={(val) => setFontSize(val[0])} 
                min={10} 
                max={100} 
                step={1}
              />

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Стиль шрифта:</span>
                <div className="flex space-x-2">
                  <Button
                    variant={fontStyle === "normal" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFontStyle("normal")}
                    className="w-10 h-8"
                  >
                    Аа
                  </Button>
                  <Button
                    variant={fontStyle === "bold" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFontStyle("bold")}
                    className="w-10 h-8 font-bold"
                  >
                    Аа
                  </Button>
                  <Button
                    variant={fontStyle === "italic" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFontStyle("italic")}
                    className="w-10 h-8 italic"
                  >
                    Аа
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                variant="default" 
                onClick={applyChangesToSelectedObject}
                className="w-full"
              >
                Применить изменения
              </Button>
            </div>

            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={updateText}
                className="w-full"
              >
                Редактировать текст
              </Button>
            </div>
          </div>
        )}

        {activeMenu === "objects" && (
          <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Объекты на холсте:</span>
              <span className="text-xs text-muted-foreground">{objects.length} объектов</span>
            </div>

            {objects.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Нет объектов на холсте
              </div>
            ) : (
              objects.map((obj, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center p-2 rounded-lg bg-white shadow-sm"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-primary" />
                    <span className="text-sm font-medium">
                      {obj.type === 'circle' && 'Круг'}
                      {obj.type === 'rect' && 'Прямоугольник'}
                      {obj.type === 'triangle' && 'Треугольник'}
                      {obj.type === 'polygon' && 'Многоугольник'}
                      {obj.type === 'textbox' && `Текст: ${(obj as fabric.Textbox).text?.slice(0, 15)}${(obj as fabric.Textbox).text?.length! > 15 ? '...' : ''}`}
                      {obj.type === 'path' && 'Линия'}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => {
                        if (canvas) {
                          canvas.setActiveObject(obj);
                          canvas.renderAll();
                        }
                      }}
                    >
                      <MousePointer size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => bringToFront()}
                    >
                      <Layers size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteObject(obj)}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="w-4 h-4"
                      >
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </Button>
                  </div>
                </div>
              ))
            )}

            <div className="flex justify-between mt-4">
              <Button 
                variant="outline" 
                onClick={bringToFront}
                className="flex-1 mr-2"
              >
                На передний план
              </Button>
              <Button 
                variant="outline" 
                onClick={sendToBack}
                className="flex-1"
              >
                На задний план
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={textDialogOpen} onOpenChange={setTextDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить текст</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Введите текст:</label>
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Ваш текст..."
                className="w-full"
              />
            </div>
            
            <Tabs defaultValue="font">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="font">Шрифт</TabsTrigger>
                <TabsTrigger value="style">Стиль</TabsTrigger>
                <TabsTrigger value="size">Размер</TabsTrigger>
              </TabsList>
              
              <TabsContent value="font" className="space-y-4 pt-2">
                <Select 
                  value={fontFamily} 
                  onValueChange={setFontFamily}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите шрифт" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_FONTS.map((font) => (
                      <SelectItem 
                        key={font.name} 
                        value={font.family}
                        style={{ fontFamily: font.family }}
                      >
                        {font.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>
              
              <TabsContent value="style" className="space-y-4 pt-2">
                <div className="flex space-x-2 justify-around">
                  <Button
                    variant={fontStyle === "normal" ? "default" : "outline"}
                    onClick={() => setFontStyle("normal")}
                    className="flex-1"
                  >
                    Обычный
                  </Button>
                  <Button
                    variant={fontStyle === "bold" ? "default" : "outline"}
                    onClick={() => setFontStyle("bold")}
                    className="flex-1 font-bold"
                  >
                    Жирный
                  </Button>
                  <Button
                    variant={fontStyle === "italic" ? "default" : "outline"}
                    onClick={() => setFontStyle("italic")}
                    className="flex-1 italic"
                  >
                    Курсив
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="size" className="space-y-4 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Размер шрифта: </span>
                    <span className="font-mono">{fontSize}px</span>
                  </div>
                  <Slider 
                    value={[fontSize]} 
                    onValueChange={(val) => setFontSize(val[0])} 
                    min={10} 
                    max={100} 
                    step={1}
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="border p-4 rounded-md text-center overflow-hidden" style={{ 
              fontFamily, 
              fontSize: `${fontSize}px`,
              fontStyle: fontStyle === 'italic' ? 'italic' : 'normal',
              fontWeight: fontStyle === 'bold' ? 'bold' : 'normal',
              color: strokeColor
            }}>
              {textInput || 'Предпросмотр текста'}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setTextDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              onClick={addText}
              disabled={!textInput.trim()}
            >
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={polygonSidesDialogOpen} onOpenChange={setPolygonSidesDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Выберите количество сторон</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Количество сторон: </span>
                <span className="font-mono">{polygonSides}</span>
              </div>
              <Slider 
                value={[polygonSides]} 
                onValueChange={(val) => setPolygonSides(val[0])} 
                min={3} 
                max={12} 
                step={1}
              />
            </div>
            
            <div className="border p-4 rounded-md flex justify-center">
              <svg width="100" height="100" viewBox="-50 -50 100 100">
                {Array.from({ length: polygonSides }).map((_, i) => {
                  const angle = (i * 2 * Math.PI) / polygonSides;
                  const x = 40 * Math.cos(angle);
                  const y = 40 * Math.sin(angle);
                  return i === 0 
                    ? `M ${x} ${y}` 
                    : `L ${x} ${y}`;
                }).join(' ') + ' Z'}
              </svg>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setPolygonSidesDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              onClick={() => {
                setPolygonSidesDialogOpen(false);
                addShape('polygon');
              }}
            >
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DrawingCanvas;
