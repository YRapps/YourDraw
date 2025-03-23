
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Grid } from "lucide-react";

const Save = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Сохранено</h1>
        <p className="text-slate-600 mb-6">
          Ваша работа успешно сохранена в браузере
        </p>
        <div className="flex flex-col space-y-3">
          <Link to="/gallery">
            <Button className="w-full" variant="default">
              <Grid className="mr-2 h-4 w-4" /> Просмотреть все рисунки
            </Button>
          </Link>
          <Link to="/">
            <Button className="w-full" variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться на главную
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Save;
