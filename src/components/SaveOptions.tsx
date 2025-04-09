
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download, Save } from "lucide-react";

interface SaveOptionsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (options: SaveOptions) => void;
}

export interface SaveOptions {
  format: "png" | "jpeg" | "webp";
  background: "transparent" | "white";
  filename: string;
  saveToDevice: boolean;
}

const SaveOptions: React.FC<SaveOptionsProps> = ({ isOpen, onClose, onSave }) => {
  const [options, setOptions] = useState<SaveOptions>({
    format: "png",
    background: "transparent",
    filename: `drawing-${new Date().toLocaleDateString('ru-RU').replace(/\//g, '-')}`,
    saveToDevice: false
  });

  const handleSave = (saveToDevice: boolean) => {
    onSave({
      ...options,
      saveToDevice
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Настройки сохранения</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="format">Формат</Label>
            <Select 
              value={options.format}
              onValueChange={(value: "png" | "jpeg" | "webp") => 
                setOptions({...options, format: value})
              }
            >
              <SelectTrigger id="format">
                <SelectValue placeholder="Выберите формат" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpeg">JPEG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Фон</Label>
            <RadioGroup 
              value={options.background}
              onValueChange={(value: "transparent" | "white") => 
                setOptions({...options, background: value})
              }
              className="flex"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="transparent" id="transparent" />
                <Label htmlFor="transparent" className="cursor-pointer">Прозрачный</Label>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <RadioGroupItem value="white" id="white" />
                <Label htmlFor="white" className="cursor-pointer">Белый</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="filename">Имя файла</Label>
            <Input 
              id="filename" 
              value={options.filename}
              onChange={(e) => setOptions({...options, filename: e.target.value})}
            />
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => handleSave(true)}
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" /> 
            Скачать на устройство
          </Button>
          <Button 
            type="submit" 
            onClick={() => handleSave(false)}
            className="flex-1"
          >
            <Save className="mr-2 h-4 w-4" /> 
            Сохранить в браузере
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveOptions;
