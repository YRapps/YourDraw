
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, Image, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getAllDrawings, deleteDrawing, StoredDrawing } from "@/lib/drawingStorage";
import { Helmet } from "react-helmet";

const Gallery = () => {
  const [drawings, setDrawings] = useState<StoredDrawing[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadDrawings();
  }, []);

  const loadDrawings = () => {
    const savedDrawings = getAllDrawings();
    setDrawings(savedDrawings.sort((a, b) => b.updatedAt - a.updatedAt));
  };

  const handleDeleteDrawing = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm("Вы уверены, что хотите удалить этот рисунок?")) {
      deleteDrawing(id);
      loadDrawings();
      toast("Рисунок удален", {
        description: "Рисунок был успешно удален",
      });
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;700&display=swap" rel="stylesheet" />
      </Helmet>
      
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-purple-700" style={{ fontFamily: 'Comfortaa, cursive' }}>
            Мои рисунки
          </h1>
          
          <div className="flex space-x-4">
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                На главную
              </Button>
            </Link>
            
            <Link to="/drawing/new">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Новый рисунок
              </Button>
            </Link>
          </div>
        </div>
        
        {drawings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <Image className="mx-auto mb-4 text-gray-400" size={64} />
            <h2 className="text-2xl font-semibold mb-2">У вас пока нет рисунков</h2>
            <p className="text-gray-500 mb-6">Создайте свой первый рисунок, чтобы он появился здесь</p>
            <Link to="/drawing/new">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Создать рисунок
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {drawings.map((drawing) => (
              <Link 
                to={`/drawing/${drawing.id}`} 
                key={drawing.id} 
                className="block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img 
                    src={drawing.thumbnail} 
                    alt={drawing.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg mb-1 truncate">{drawing.name}</h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(drawing.updatedAt)}
                      </p>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700 -mt-1 -mr-2"
                      onClick={(e) => handleDeleteDrawing(drawing.id, e)}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
