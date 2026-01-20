'use client';

import { Task, TaskType } from '@/lib/types';
import { getTaskTemplate, getTaskIcon } from '@/lib/task-templates';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Award, CheckCircle2, Copy } from 'lucide-react';
import { useState } from 'react';

interface TaskCardProps {
  task: Task;
  onStart: (taskId: string) => void;
  onCheck: (taskId: string) => void;
  checking?: boolean;
}

export function TaskCard({ task, onStart, onCheck, checking }: TaskCardProps) {
  const template = getTaskTemplate(task.type);
  const Icon = getTaskIcon(task.type);
  const [copied, setCopied] = useState(false);

  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in_progress' || task.status === 'verifying';
  const isAvailable = task.status === 'available' || !task.status;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card
      className="overflow-hidden transition-all hover:shadow-lg"
      style={{
        borderRight: `4px solid ${template.colorScheme.primary}`,
        backgroundColor: isCompleted ? template.colorScheme.secondary + '40' : 'white',
      }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: template.colorScheme.secondary }}
            >
              <Icon
                size={24}
                style={{ color: template.colorScheme.primary }}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base mb-1">{task.title}</h3>
              <p className="text-xs text-muted-foreground">{template.name}</p>
            </div>
          </div>
          {isCompleted && (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
              <CheckCircle2 size={14} className="mr-1" />
              مكتملة
            </Badge>
          )}
          {task.network && (
            <Badge variant="outline" className="text-xs">
              {task.network.name}
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>

        {/* Verification Code (for YouTube comment tasks) */}
        {task.type === 'youtube_comment' && task.verificationData?.code && (
          <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-medium text-blue-900 mb-2">
              كود التحقق (انسخ وضعه في تعليق):
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono bg-white px-3 py-2 rounded border border-blue-300 text-blue-800">
                {task.verificationData.code}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(task.verificationData!.code!)}
                className="shrink-0"
              >
                {copied ? (
                  <CheckCircle2 size={16} className="text-green-600" />
                ) : (
                  <Copy size={16} />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {task.instructions && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium mb-1">التعليمات:</p>
            <p className="text-xs text-gray-700 whitespace-pre-wrap">
              {task.instructions}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Award size={14} style={{ color: template.colorScheme.primary }} />
            <span className="font-medium" style={{ color: template.colorScheme.primary }}>
              {task.points} نقطة
            </span>
          </div>
          {template.defaultDuration && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{template.defaultDuration} ثانية</span>
            </div>
          )}
          {task.availability && (
            <div className="flex items-center gap-1">
              <span>متاح: {task.availability.remaining}/{task.availability.total}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isCompleted && (
          <div className="flex gap-2">
            {isAvailable && (
              <>
                <Button
                  onClick={() => window.open(task.targetUrl, '_blank')}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  style={{
                    borderColor: template.colorScheme.primary,
                    color: template.colorScheme.primary,
                  }}
                >
                  افتح المهمة
                </Button>
                <Button
                  onClick={() => onStart(task.id)}
                  size="sm"
                  className="flex-1 text-xs text-white"
                  style={{
                    background: `linear-gradient(135deg, ${template.colorScheme.primary} 0%, ${template.colorScheme.accent} 100%)`,
                  }}
                >
                  ابدأ المهمة
                </Button>
              </>
            )}
            {isInProgress && (
              <Button
                onClick={() => onCheck(task.id)}
                disabled={checking}
                size="sm"
                className="w-full text-xs text-white"
                style={{
                  background: `linear-gradient(135deg, ${template.colorScheme.primary} 0%, ${template.colorScheme.accent} 100%)`,
                }}
              >
                {checking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} className="mr-2" />
                    تحقق من الإكمال
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Completion timestamp */}
        {isCompleted && task.verificationData?.completedAt && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            أكملت في {new Date(task.verificationData.completedAt).toLocaleDateString('ar')}
          </p>
        )}
      </div>
    </Card>
  );
}
