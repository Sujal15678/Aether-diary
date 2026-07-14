import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Calendar } from 'lucide-react';

export const EntryCard = ({ entry, onEdit, onDelete }) => {
  const formattedDate = format(new Date(entry.created_at), 'MMMM dd, yyyy');
  const formattedTime = format(new Date(entry.created_at), 'h:mm a');
  
  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={`entry-card-${entry.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2" data-testid="entry-title">{entry.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formattedDate} at {formattedTime}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(entry)}
              data-testid={`edit-entry-${entry.id}`}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(entry)}
              data-testid={`delete-entry-${entry.id}`}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 whitespace-pre-wrap" data-testid="entry-content">{entry.content}</p>
      </CardContent>
    </Card>
  );
};
