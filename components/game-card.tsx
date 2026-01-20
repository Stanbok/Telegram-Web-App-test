'use client';

import { Game } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Award, Clock, TrendingUp } from 'lucide-react';

interface GameCardProps {
  game: Game;
  onPlay: (gameId: string) => void;
}

export function GameCard({ game, onPlay }: GameCardProps) {
  const difficultyColors = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700',
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="flex gap-4 p-4">
        {/* Game Thumbnail */}
        <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
          <img
            src={game.thumbnail || '/placeholder.jpg'}
            alt={game.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <Play size={32} className="text-white" />
          </div>
        </div>

        {/* Game Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-base mb-1 truncate">{game.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {game.description}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Award size={14} className="text-purple-600" />
              <span className="font-medium text-purple-600">{game.points} نقطة</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{game.duration} دقيقة</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp size={14} />
              <span>{game.playCount} لعبة</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs">
              {game.category}
            </Badge>
            <Badge className={`text-xs ${difficultyColors[game.difficulty]}`}>
              {game.difficulty === 'easy' ? 'سهل' : game.difficulty === 'medium' ? 'متوسط' : 'صعب'}
            </Badge>
            {game.network && (
              <Badge variant="secondary" className="text-xs">
                {game.network.name}
              </Badge>
            )}
          </div>

          {/* Play Button */}
          <Button
            onClick={() => onPlay(game.id)}
            size="sm"
            className="w-full text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
          >
            <Play size={16} className="mr-2" />
            العب الآن
          </Button>
        </div>
      </div>
    </Card>
  );
}
