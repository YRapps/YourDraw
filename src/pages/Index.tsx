
import DrawingCanvas from "@/components/DrawingCanvas";
import { useEffect } from "react";
import { toast } from "sonner";
import { Helmet } from "react-helmet";

const Index = () => {
  useEffect(() => {
    // Show welcome toast on first load
    toast("Добро пожаловать в рисовалку!", {
      description: "Выберите инструмент и начните творить!",
      duration: 3000,
    });
    
    // Логируем, что компонент загрузился
    console.log("Приложение рисовалки загружено успешно");
  }, []);

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
      <DrawingCanvas />
    </div>
  );
};

export default Index;
