import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DrawingCanvas from "@/components/DrawingCanvas";
import { getDrawingById, saveDrawing, generateDrawingId } from "@/lib/drawingStorage";
import { toast } from "sonner";
import { Helmet } from "react-helmet";

const Drawing = () => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [drawingId, setDrawingId] = useState<string>("");
  const [drawingData, setDrawingData] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // If id is "new", create a new drawing
    if (id === "new") {
      setDrawingId(generateDrawingId());
      setIsLoading(false);
      return;
    }

    // Otherwise, load the existing drawing
    if (id) {
      const drawing = getDrawingById(id);
      if (drawing) {
        setDrawingId(drawing.id);
        setDrawingData(drawing.data);
        setIsLoading(false);
      } else {
        toast.error("Рисунок не найден", {
          description: "Запрошенный рисунок не существует или был удален"
        });
        navigate("/gallery");
      }
    }
  }, [id, navigate]);

  const handleSaveDrawing = (canvasData: string, thumbnail: string) => {
    if (!drawingId) return;
    
    // Create a name based on date if it's a new drawing
    const now = new Date();
    const name = `Рисунок от ${now.toLocaleDateString('ru-RU')}`;
    
    saveDrawing({
      id: drawingId,
      name,
      data: canvasData,
      thumbnail,
      createdAt: Date.now()
    });
    
    toast("Рисунок сохранен", {
      description: "Ваш рисунок успешно сохранен"
    });
    
    navigate("/save");
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;700&family=Shantell+Sans&family=Caveat&family=Press+Start+2P&family=Prosto+One&family=Great+Vibes&family=Marck+Script&display=swap" rel="stylesheet" />
        <style>
          {`
            @font-face {
              font-family: 'Tiny5';
              src: url('https://cdn.jsdelivr.net/gh/fontsub/Tiny5@main/Tiny5-Regular.ttf') format('truetype');
              font-weight: normal;
              font-style: normal;
            }
          `}
        </style>
      </Helmet>
      
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
        </div>
      ) : (
        <DrawingCanvas 
          drawingId={drawingId}
          initialData={drawingData}
          onSave={handleSaveDrawing}
        />
      )}
    </div>
  );
};

export default Drawing;
