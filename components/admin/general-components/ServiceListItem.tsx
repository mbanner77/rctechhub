// components/ServiceItemList.tsx
import { FC, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface ServiceItemListProps {
  headline: string;
  items: string[];
  onSave: (items: string[]) => void;
}

export const ServiceItemList: FC<ServiceItemListProps> = ({
  headline,
  items,
  onSave,
}) => {
  const [localItems, setLocalItems] = useState<string[]>(items || []);
  const [dirty, setDirty] = useState(false);

  // Sync local state if parent changes (optional, for robustness)
  useEffect(() => {
    setLocalItems(items || []);
    setDirty(false);
  }, [items]);
  
  const handleItemChange = (idx: number, value: string) => {
    const updated = [...localItems];
    updated[idx] = value;
    setLocalItems(updated);
    setDirty(true);
  };

  const handleAddItem = () => {
    setLocalItems([...localItems, '']);
    setDirty(true);
  };

  const handleDeleteItem = (idx: number) => {
    const updated = [...localItems];
    updated.splice(idx, 1);
    setLocalItems(updated);
    setDirty(true);
  };

  // Sync changes with parent component without auto-saving
  useEffect(() => {
    if (dirty) {
      // Get valid items and send to parent component
      const validItems = localItems.map(item => item.trim()).filter(item => item.length > 0);
      onSave(validItems);
      setDirty(false);
    }
  }, [dirty, onSave, localItems]);

  return (
    <>
      <h3 className="text-lg font-semibold mb-2">{headline}</h3>
      <div className="space-y-2" id={`${headline.toLowerCase().replace(/\s/g, '-')}-container`}>
        {localItems.length > 0 ? (
          localItems.map((item, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <Input
                className="flex-grow"
                value={item}
                onChange={e => handleItemChange(idx, e.target.value)}
                placeholder={`${headline.split(' ')[0]} #${idx + 1}`}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => handleDeleteItem(idx)}
                aria-label={`Delete item ${idx + 1} from ${headline}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">Noch keine Leistungen hinzugefügt.</p>
        )}
      </div>
      <div className="flex gap-2 mt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
        >
          Hinzufügen
        </Button>
      </div>
    </>
  );
};