
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export interface SaveOptions {
  format: "png" | "jpeg" | "yrd";
  background: "transparent" | "white";
  filename: string;
  saveToDevice: boolean;
}

interface SaveOptionsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (options: SaveOptions) => void;
}

const SaveOptions: React.FC<SaveOptionsProps> = ({ isOpen, onClose, onSave }) => {
  const [options, setOptions] = useState<SaveOptions>({
    format: "png",
    background: "transparent",
    filename: `drawing-${new Date().toISOString().slice(0, 10)}`,
    saveToDevice: true,
  });

  const handleSave = () => {
    onSave(options);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Сохранение рисунка</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Формат файла</Label>
            <RadioGroup
              value={options.format}
              onValueChange={(value) => setOptions({ ...options, format: value as "png" | "jpeg" | "yrd" })}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="png" id="format-png" />
                <Label htmlFor="format-png">PNG</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="jpeg" id="format-jpeg" />
                <Label htmlFor="format-jpeg">JPEG</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yrd" id="format-yrd" />
                <Label htmlFor="format-yrd">YRD (редактируемый)</Label>
              </div>
            </RadioGroup>
          </div>

          {options.format !== "yrd" && (
            <div className="space-y-2">
              <Label>Фон</Label>
              <RadioGroup
                value={options.background}
                onValueChange={(value) => setOptions({ ...options, background: value as "transparent" | "white" })}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="transparent" id="bg-transparent" />
                  <Label htmlFor="bg-transparent">Прозрачный</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="white" id="bg-white" />
                  <Label htmlFor="bg-white">Белый</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="space-y-2">
            <Label>Имя файла</Label>
            <Input
              value={options.filename}
              onChange={(e) => setOptions({ ...options, filename: e.target.value })}
              placeholder="Введите имя файла"
            />
          </div>

          <div className="space-y-2">
            <Label>Куда сохранить</Label>
            <RadioGroup
              value={options.saveToDevice ? "device" : "gallery"}
              onValueChange={(value) => setOptions({ ...options, saveToDevice: value === "device" })}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="device" id="save-device" />
                <Label htmlFor="save-device">Скачать на устройство</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gallery" id="save-gallery" />
                <Label htmlFor="save-gallery">В галерею рисунков</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveOptions;
