
import DrawingCanvas from "@/components/DrawingCanvas";
import { useEffect } from "react";
import { toast } from "sonner";

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
      <DrawingCanvas />
    </div>
  );
};

export default Index;
