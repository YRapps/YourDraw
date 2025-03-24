import React, { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
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
  Download,
  X,
  Image as ImageIcon,
  Upload,
  Home,
  GridIcon,
  Trash2,
  Menu
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
import { toast } from "sonner";
import SaveOptions, { SaveOptions as SaveOptionsType } from "./SaveOptions";
import { Canvas as FabricCanvas, IText, PencilBrush, Circle, Triangle, Rect, Polygon, Image } from "fabric";

type Tool = 
  | "select" 
  | "brush" 
  | "eraser" 
  | "circle" 
  | "square" 
  | "triangle" 
  | "polygon" 
  | "text"
  | "fill"
  | "image";

type Menu = "tools" | "view" | "objects" | "none";

interface DrawingCanvasProps {
  drawingId: string;
  initialData?: string | null;
  onSave?: (canvasData: string, thumbnail: string) => void;
  onAutoSave?: (canvasData: string, thumbnail: string) => void;
}

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

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ 
  drawingId, 
  initialData, 
  onSave,
  onAutoSave
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const fontFileInputRef = useRef<HTMLInputElement>(null);
  const yrdFileInputRef = useRef<HTMLInputElement>(null);
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
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
  const [customFonts, setCustomFonts] = useState<{name: string, family: string}[]>([]);
  const [saveOptionsOpen, setSaveOptionsOpen] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const [menuVisible, setMenuVisible] = useState(true);
  const [previewText, setPreviewText] = useState("Пример текста");
  const isMobile = useIsMobile();
  const { toast: showToast } = useToast();
  const navigate = useNavigate();

  const triggerAutoSave = () => {
    if (!canvas || !onAutoSave) return;
    
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    const timer = setTimeout(() => {
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
      });
      onAutoSave(JSON.stringify(canvas.toJSON()), dataURL);
    }, 2000);
    
    setAutoSaveTimer(timer);
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const viewportHeight = window.innerHeight;
    const canvasHeight = viewportHeight * 0.8;
    const canvasWidth = window.innerWidth * 0.95;

    const fabricCanvas = new FabricCanvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: 'white',
      preserveObjectStacking: true,
      selection: true,
    });

    fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);
    fabricCanvas.freeDrawingBrush.color = strokeColor;
    fabricCanvas.freeDrawingBrush.width = brushSize;

    setCanvas(fabricCanvas);

    fabricCanvas.on('object:added', () => {
      if (isInitialDataLoaded) {
        saveCanvasState();
        triggerAutoSave();
      }
    });
    fabricCanvas.on('object:modified', () => {
      saveCanvasState();
      triggerAutoSave();
    });
    fabricCanvas.on('object:removed', () => {
      saveCanvasState();
      triggerAutoSave();
    });
    fabricCanvas.on('selection:created', handleSelectionCreated);
    fabricCanvas.on('selection:updated', handleSelectionCreated);
    fabricCanvas.on('selection:cleared', handleSelectionCleared);
    
    if (initialData) {
      console.log("Loading initial drawing data");
      try {
        const parsedData = JSON.parse(initialData);
        if (parsedData.type === "yourDrawing" && parsedData.canvasJSON) {
          console.log("Loading YRD format drawing");
          setTimeout(() => {
            fabricCanvas.loadFromJSON(parsedData.canvasJSON, () => {
              fabricCanvas.renderAll();
              setObjects(fabricCanvas.getObjects());
              console.log("Canvas loaded from YRD format successfully");
              setIsInitialDataLoaded(true);
              toast.success("Рисунок успешно загружен");
            });
          }, 300);
        } else {
          fabricCanvas.loadFromJSON(initialData, () => {
            fabricCanvas.renderAll();
            setObjects(fabricCanvas.getObjects());
            console.log("Canvas loaded from JSON successfully");
            setIsInitialDataLoaded(true);
            toast.success("Рисунок успешно загружен");
          });
        }
      } catch (error) {
        console.error("Error loading canvas data:", error);
        try {
          fabricCanvas.loadFromJSON(initialData, () => {
            fabricCanvas.renderAll();
            setObjects(fabricCanvas.getObjects());
            setIsInitialDataLoaded(true);
            toast.success("Рисунок успешно загружен");
          });
        } catch (e) {
          console.error("Failed to load canvas data even as regular JSON:", e);
          toast.error("Ошибка при загрузке рисунка");
          setIsInitialDataLoaded(true);
        }
      }
    } else {
      saveCanvasState();
      setIsInitialDataLoaded(true);
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      fabricCanvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!canvas) return;

    canvas.isDrawingMode = activeTool === "brush" || activeTool === "eraser";
    canvas.selection = activeTool === "select";

    if (canvas.freeDrawingBrush) {
      if (activeTool === "brush") {
        canvas.freeDrawingBrush.color = strokeColor;
        canvas.freeDrawingBrush.width = brushSize;
        canvas.freeDrawingBrush.globalCompositeOperation = "source-over";
      } else if (activeTool === "eraser") {
        canvas.freeDrawingBrush.color = "#ffffff";
        canvas.freeDrawingBrush.width = brushSize * 2;
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
        object = new Circle({
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
        object = new Rect({
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
        object = new Triangle({
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
        
        object = new Polygon(points, {
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

    const textObject = new IText(textInput, {
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

  const addImage = (file: File) => {
    if (!canvas) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgElement = document.createElement("img");
      imgElement.src = e.target?.result as string;
      imgElement.onload = () => {
        const fabricImage = new Image(imgElement, {
          left: canvas.width! / 2 - imgElement.width / 4,
          top: canvas.height! / 2 - imgElement.height / 4,
          scaleX: 0.5,
          scaleY: 0.5,
          opacity: opacity / 100,
        });
        
        canvas.add(fabricImage);
        canvas.setActiveObject(fabricImage);
        canvas.renderAll();
        saveCanvasState();
      };
    };
    reader.readAsDataURL(file);
    setActiveTool('select');
  };

  const setBackgroundImage = (file: File) => {
    if (!canvas) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgElement = document.createElement("img");
      imgElement.src = e.target?.result as string;
      imgElement.onload = () => {
        canvas.setBackgroundImage(new Image(imgElement), () => {
          canvas.renderAll();
          saveCanvasState();
          toast.success("Фоновое изображение успешно установлено");
        });
      };
    };
    reader.readAsDataURL(file);
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

    if (tool === 'image') {
      fileInputRef.current?.click();
      return;
    }

    if (tool === 'fill' && canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        activeObject.set('fill', fillColor);
        canvas.renderAll();
        saveCanvasState();
        toast.success("Объект заполнен выбранным цветом");
      } else {
        canvas.backgroundColor = fillColor;
        canvas.renderAll();
        saveCanvasState();
        toast.success("Фон заполнен выбранным цветом");
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
    toast.success("Изменения применены");
  };

  const updateText = () => {
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (!activeObject || (activeObject.type !== 'textbox' && activeObject.type !== 'i-text')) return;
    
    setTextInput(activeObject.text || '');
    setTextDialogOpen(true);

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

  const handleSaveOptions = (options: SaveOptionsType) => {
    if (!canvas) return;
    
    const originalBgColor = canvas.backgroundColor;
    if (options.background === "white") {
      canvas.backgroundColor = "white";
    } else {
      canvas.backgroundColor = "";
    }
    
    canvas.renderAll();
    
    if (options.format === "yrd") {
      const yrdData = {
        version: "1.0",
        type: "yourDrawing",
        canvasJSON: canvas.toJSON(),
        metadata: {
          createdAt: Date.now(),
          drawingId: drawingId,
          author: "user"
        }
      };
      
      const yrdContent = JSON.stringify(yrdData);
      
      if (options.saveToDevice) {
        const blob = new Blob([yrdContent], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${options.filename}.yrd`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success("Ваш рисунок был скачан в формате .yrd");
      } else if (onSave) {
        const thumbnailDataURL = canvas.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: 0.5,
        });
        onSave(yrdContent, thumbnailDataURL);
      }
    } else {
      const dataURL = canvas.toDataURL({
        format: options.format,
        quality: 1,
        multiplier: 2,
      });
      
      canvas.backgroundColor = originalBgColor;
      canvas.renderAll();
      
      if (options.saveToDevice) {
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `${options.filename}.${options.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(`Ваш рисунок был скачан в формате .${options.format}`);
      } else if (onSave) {
        onSave(JSON.stringify(canvas.toJSON()), dataURL);
      }
    }
    
    canvas.backgroundColor = originalBgColor;
    canvas.renderAll();
  };

  const saveAsPNG = () => {
    setSaveOptionsOpen(true);
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

  const closeMenu = () => {
    setActiveMenu("none");
    setMenuVisible(false);
  };

  const openMenu = () => {
    setActiveMenu("tools");
    setMenuVisible(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    addImage(files[0]);
    
    e.target.value = '';
  };

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setBackgroundImage(files[0]);
    
    e.target.value = '';
  };

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const fontFile = files[0];
    const fontName = fontFile.name.split('.')[0];
    const fontUrl = URL.createObjectURL(fontFile);
    
    const fontFace = `
      @font-face {
        font-family: '${fontName}';
        src: url('${fontUrl}') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
    `;
    
    const style = document.createElement('style');
    style.textContent = fontFace;
    document.head.appendChild(style);
    
    setCustomFonts(prev => [...prev, { name: fontName, family: `${fontName}, sans-serif` }]);
    
    toast.success(`Шрифт ${fontName} успешно добавлен и доступен для использования`);
    
    e.target.value = '';
  };

  const handleImportYRD = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !canvas) return;
    
    const file = files[0];
    if (!file.name.endsWith('.yrd')) {
      toast.error("Выберите файл в формате .yrd");
      e.target.value = '';
      return;
    }
    
    toast("Загрузка рисунка...");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const yrdData = JSON.parse(e.target?.result as string);
        if (yrdData.type === "yourDrawing" && yrdData.canvasJSON) {
          canvas.clear();
          setTimeout(() => {
            canvas.loadFromJSON(yrdData.canvasJSON, () => {
              canvas.renderAll();
              setObjects(canvas.getObjects());
              toast.success("Рисунок .yrd успешно импортирован");
              saveCanvasState();
            });
          }, 300);
        } else {
          toast.error("Некорректный формат .yrd файла");
        }
      } catch (error) {
        console.error("Error importing .yrd file:", error);
        toast.error("Ошибка при импорте файла");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const toolButtons = [
    { tool: "select", icon: <MousePointer size={20} />, ariaLabel: "Выделение" },
    { tool: "brush", icon: <Brush size={20} />, ariaLabel: "Кисть" },
    { tool: "eraser", icon: <Eraser size={20} />, ariaLabel: "Ластик" },
    { tool: "circle", icon: <CircleIcon size={20} />, ariaLabel: "Круг" },
    { tool: "square", icon: <Square size={20} />, ariaLabel: "Квадрат" },
    { tool: "triangle", icon: <TriangleIcon size={20} />, ariaLabel: "Треугольник" },
    { tool: "polygon", icon: <Hexagon size={20} />, ariaLabel: "Многоугольник" },
    { tool: "text", icon: <Text size={20} />, ariaLabel: "Текст" },
    { tool: "fill", icon: <PaintBucket size={20} />, ariaLabel: "Заливка" },
    { tool: "image", icon: <ImageIcon size={20} />, ariaLabel: "Изображение" },
  ];

  const colorSwatches = [
    "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", 
    "#ffff00", "#00ffff", "#ff00ff", "#ff9900", "#9900ff"
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="fixed top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="flex gap-2 flex-wrap">
          {!menuVisible && (
            <Button 
              variant="outline"
              className="shadow-md bg-white"
              onClick={openMenu}
              aria-label="Открыть меню"
            >
              <Menu size={20} />
            </Button>
          )}
          
          <Link to="/">
            <Button 
              variant="outline"
              className="shadow-md bg-white"
              aria-label="На главную"
            >
              <Home size={20} />
            </Button>
          </Link>
          
          <Link to="/gallery">
            <Button 
              variant="outline"
              className="shadow-md bg-white"
              aria-label="Галерея"
            >
              <GridIcon size={20} />
            </Button>
          </Link>
          
          <Button 
            variant="outline"
            className="shadow-md bg-white"
            onClick={handleUndo}
            aria-label="Отменить"
          >
            <Undo size={20} />
          </Button>
          
          <Button 
            variant="outline"
            className="shadow-md bg-white"
            onClick={() => yrdFileInputRef.current?.click()}
            aria-label="Импортировать .yrd"
          >
            <Upload size={20} />
          </Button>
        </div>
        
        <Button 
          variant="default"
          className="shadow-md"
          onClick={saveAsPNG}
        >
          <Save size={20} className={cn("mr-2", isMobile && "mr-0")} />
          {!isMobile && "Сохранить"}
        </Button>
      </div>

      <SaveOptions
        isOpen={saveOptionsOpen}
        onClose={() => setSaveOptionsOpen(false)}
        onSave={handleSaveOptions}
      />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <input
        type="file"
        ref={backgroundInputRef}
        onChange={handleBackgroundChange}
        accept="image/*"
        className="hidden"
      />
      
      <input
        type="file"
        ref={fontFileInputRef}
        onChange={handleFontUpload}
        accept=".ttf,.otf,.woff,.woff2"
        className="hidden"
      />
      
      <input
        type="file"
        ref={yrdFileInputRef}
        onChange={handleImportYRD}
        accept=".yrd"
        className="hidden"
      />

      <div className="canvas-container bg-white bg-opacity-80 rounded-2xl shadow-xl mb-20 overflow-hidden mt-16">
        <canvas ref={canvasRef} className="canvas" />
      </div>

      {menuVisible && (
        <div className={cn("menu-container z-10", isMobile ? "w-full" : "w-auto")}>
          <div className="flex justify-around mb-4 relative">
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
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-0 top-0"
              onClick={closeMenu}
            >
              <X size={18} />
            </Button>
          </div>

          {activeMenu === "tools" && (
            <div className="grid grid-cols-5 gap-4 justify-items-center">
              {toolButtons.map((btn) => (
                <button
                  key={btn.tool}
                  className={cn("tool-btn", activeTool === btn.tool && "active")}
                  onClick={() => handleToolClick(btn.tool as Tool)}
                  aria-label={btn.ariaLabel}
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
                    <SelectTrigger className={cn("w-32", isMobile && "w-24")}>
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
                      {customFonts.map((font) => (
                        <SelectItem 
                          key={font.name} 
                          value={font.family}
                          style={{ fontFamily: font.family }}
                        >
                          {font.name} (Custom)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between items-center flex-wrap">
                  <span className="text-sm font-medium mb-2">Стиль шрифта:</span>
                  <div className="flex space-x-2">
                    <Button 
                      variant={fontStyle === "normal" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setFontStyle("normal")}
                      className={cn("min-w-[60px]", isMobile && "min-w-[40px] px-2")}
                    >
                      Обычный
                    </Button>
                    <Button 
                      variant={fontStyle === "bold" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setFontStyle("bold")}
                      className={cn("min-w-[60px] font-bold", isMobile && "min-w-[40px] px-2")}
                    >
                      Жирный
                    </Button>
                    <Button 
                      variant={fontStyle === "italic" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setFontStyle("italic")}
                      className={cn("min-w-[60px] italic", isMobile && "min-w-[40px] px-2")}
                    >
                      Курсив
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center flex-wrap">
                  <span className="text-sm font-medium mb-2">Размер шрифта:</span>
                  <div className="flex items-center space-x-2">
                    <Slider 
                      value={[fontSize]} 
                      onValueChange={(val) => setFontSize(val[0])} 
                      min={8} 
                      max={72} 
                      step={1}
                      className={cn("w-32", isMobile && "w-24")}
                    />
                    <span className="text-xs font-mono w-10 text-center">{fontSize}px</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium">Предпросмотр:</span>
                </div>
                <div 
                  className="w-full bg-white border rounded-md p-3 mb-4 text-center"
                  style={{ 
                    fontFamily: fontFamily, 
                    fontSize: `${fontSize}px`,
                    fontStyle: fontStyle === "italic" ? "italic" : "normal",
                    fontWeight: fontStyle === "bold" ? "bold" : "normal",
                    color: strokeColor,
                  }}
                >
                  {previewText}
                </div>
                <div className="w-full">
                  <Input
                    placeholder="Введите текст для предпросмотра"
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    className="mb-4"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Загрузить шрифт:</span>
                  <Button variant="outline" size="sm" onClick={() => fontFileInputRef.current?.click()}>
                    <Upload size={16} className="mr-2" />
                    Загрузить
                  </Button>
                </div>

                <Button
                  className="w-full mt-2"
                  onClick={applyChangesToSelectedObject}
                >
                  Применить изменения
                </Button>

                <Button
                  className="w-full mt-2"
                  variant="outline"
                  onClick={updateText}
                >
                  Изменить текст
                </Button>
              </div>
            </div>
          )}

          {activeMenu === "objects" && (
            <div className="space-y-4">
              <div className={cn("flex justify-between items-center", isMobile && "flex-col items-start gap-2")}>
                <span className="text-sm font-medium">Управление слоями:</span>
                <div className={cn("flex space-x-2", isMobile && "flex-wrap gap-2")}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={bringToFront}
                    aria-label="На передний план"
                  >
                    <Layers size={16} className="mr-1" />
                    Вперед
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={sendToBack}
                    aria-label="На задний план"
                  >
                    <Layers size={16} className="mr-1 transform rotate-180" />
                    Назад
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => deleteObject()}
                    aria-label="Удалить"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Удалить
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Объекты на холсте:</span>
                  <span className="text-xs text-gray-500">{objects.length} объектов</span>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1 border rounded-md p-2">
                  {objects.map((obj, index) => (
                    <div 
                      key={index}
                      className="px-2 py-1 rounded hover:bg-gray-100 cursor-pointer flex justify-between items-center text-sm"
                      onClick={() => {
                        if (canvas) {
                          canvas.setActiveObject(obj);
                          canvas.renderAll();
                        }
                      }}
                    >
                      <div>
                        <span className="font-medium">
                          {obj.type === 'rect' ? 'Прямоугольник' :
                           obj.type === 'circle' ? 'Круг' :
                           obj.type === 'triangle' ? 'Треугольник' :
                           obj.type === 'polygon' ? 'Многоугольник' :
                           obj.type === 'i-text' ? `Текст: "${obj.text?.slice(0, 15)}${obj.text?.length > 15 ? '...' : ''}"` :
                           obj.type === 'image' ? 'Изображение' :
                           obj.type === 'path' ? 'Линия' : 
                           obj.type}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0" 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteObject(obj);
                        }}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                  {objects.length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-2">
                      Нет объектов на холсте
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Фоновое изображение:</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => backgroundInputRef.current?.click()}
                  >
                    <Upload size={16} className="mr-1" />
                    Загрузить
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Text dialog */}
      <Dialog open={textDialogOpen} onOpenChange={setTextDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Добавление текста</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <Input
              placeholder="Введите текст"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="col-span-2"
            />
            <div className="flex items-center justify-between">
              <span>Шрифт:</span>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger className="w-40">
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
            <div className="flex items-center justify-between">
              <span>Размер:</span>
              <div className="flex items-center space-x-2">
                <Slider 
                  value={[fontSize]} 
                  onValueChange={(values) => setFontSize(values[0])} 
                  max={72} 
                  min={8} 
                  step={1}
                  className="w-40"
                />
                <span className="w-8 text-center">{fontSize}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTextDialogOpen(false)}>
              Отмена
            </Button>
            <Button type="button" onClick={addText}>
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Polygon dialog */}
      <Dialog open={polygonSidesDialogOpen} onOpenChange={setPolygonSidesDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Многоугольник</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="flex items-center justify-between">
              <span>Количество сторон:</span>
              <div className="flex items-center space-x-2">
                <Slider 
                  value={[polygonSides]} 
                  onValueChange={(values) => setPolygonSides(values[0])} 
                  max={12} 
                  min={3} 
                  step={1}
                  className="w-40"
                />
                <span className="w-8 text-center">{polygonSides}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPolygonSidesDialogOpen(false)}>
              Отмена
            </Button>
            <Button type="button" onClick={() => {
              setPolygonSidesDialogOpen(false);
              addShape('polygon');
            }}>
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DrawingCanvas;
