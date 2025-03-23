
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, Image } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Helmet } from "react-helmet";

const Index = () => {
  useEffect(() => {
    // Show welcome toast on first load
    toast("Добро пожаловать в Вашу Рисовалку!", {
      description: "Создайте новый рисунок или откройте существующий",
      duration: 3000,
    });
    
    // Логируем, что компонент загрузился
    console.log("Главное меню загружено успешно");
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
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
      
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 text-center">
        <h1 className="text-5xl font-bold mb-8 text-purple-700" style={{ fontFamily: 'Comfortaa, cursive' }}>
          Ваша Рисовалка
        </h1>
        
        <p className="mb-10 text-lg text-gray-600">
          Создавайте и сохраняйте свои рисунки прямо в браузере
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link to="/drawing/new" className="block">
            <Button 
              variant="default" 
              size="lg" 
              className="w-full h-32 text-xl flex flex-col items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <PlusCircle size={36} />
              <span>Создать новый</span>
            </Button>
          </Link>
          
          <Link to="/gallery" className="block">
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full h-32 text-xl flex flex-col items-center justify-center gap-3 border-2"
            >
              <Image size={36} />
              <span>Мои рисунки</span>
            </Button>
          </Link>
        </div>
        
        <p className="text-sm text-gray-500">
          Все ваши рисунки сохраняются локально в браузере
        </p>
      </div>
    </div>
  );
};

export default Index;
