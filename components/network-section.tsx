'use client';

import { Network, Task, Game, Survey } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { TaskCard } from './task-card';
import { GameCard } from './game-card';
import { SurveyCard } from './survey-card';

interface NetworkSectionProps {
  network: Network;
  content: (Task | Game | Survey)[];
  contentType: 'tasks' | 'games' | 'surveys';
  onStartTask?: (taskId: string) => void;
  onCheckTask?: (taskId: string) => void;
  onPlayGame?: (gameId: string) => void;
  onStartSurvey?: (surveyId: string) => void;
  checkingTaskId?: string;
}

export function NetworkSection({
  network,
  content,
  contentType,
  onStartTask,
  onCheckTask,
  onPlayGame,
  onStartSurvey,
  checkingTaskId,
}: NetworkSectionProps) {
  return (
    <div className="mb-8">
      {/* Network Header */}
      <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
        <div className="flex items-center gap-3 mb-2">
          {network.logo && (
            <img
              src={network.logo}
              alt={network.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              {network.name}
              <Badge variant="secondary" className="text-xs">
                {content.length} {contentType === 'tasks' ? 'مهمة' : contentType === 'games' ? 'لعبة' : 'استطلاع'}
              </Badge>
            </h2>
            {network.description && (
              <p className="text-sm text-gray-600 mt-1">{network.description}</p>
            )}
          </div>
          <ChevronRight className="text-gray-400" size={20} />
        </div>
      </div>

      {/* Content Grid */}
      <div className="space-y-3">
        {content.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <p className="text-sm">لا يوجد محتوى متاح حالياً</p>
          </Card>
        ) : (
          content.map((item) => {
            if (contentType === 'tasks' && onStartTask && onCheckTask) {
              return (
                <TaskCard
                  key={item.id}
                  task={item as Task}
                  onStart={onStartTask}
                  onCheck={onCheckTask}
                  checking={checkingTaskId === item.id}
                />
              );
            }
            if (contentType === 'games' && onPlayGame) {
              return (
                <GameCard
                  key={item.id}
                  game={item as Game}
                  onPlay={onPlayGame}
                />
              );
            }
            if (contentType === 'surveys' && onStartSurvey) {
              return (
                <SurveyCard
                  key={item.id}
                  survey={item as Survey}
                  onStart={onStartSurvey}
                />
              );
            }
            return null;
          })
        )}
      </div>
    </div>
  );
}
