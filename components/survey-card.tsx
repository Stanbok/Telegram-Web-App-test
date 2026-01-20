'use client';

import { Survey } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Award, Clock, Users, CheckCircle2 } from 'lucide-react';

interface SurveyCardProps {
  survey: Survey;
  onStart: (surveyId: string) => void;
}

export function SurveyCard({ survey, onStart }: SurveyCardProps) {
  const progressPercentage = survey.maxResponses > 0 
    ? (survey.currentResponses / survey.maxResponses) * 100 
    : 0;
  const isAvailable = survey.active && survey.currentResponses < survey.maxResponses;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg border-r-4 border-r-emerald-500">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 rounded-lg bg-emerald-100">
              <FileText size={24} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base mb-1">{survey.title}</h3>
              <p className="text-xs text-muted-foreground">استطلاع رأي</p>
            </div>
          </div>
          {!isAvailable && (
            <Badge className="bg-gray-100 text-gray-700">
              مكتمل
            </Badge>
          )}
          {survey.network && (
            <Badge variant="outline" className="text-xs">
              {survey.network.name}
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3">{survey.description}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Award size={14} className="text-emerald-600" />
            <span className="font-medium text-emerald-600">{survey.points} نقطة</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{survey.estimatedTime} دقيقة</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText size={14} />
            <span>{survey.questions.length} سؤال</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>الردود</span>
            <span>{survey.currentResponses}/{survey.maxResponses}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Expiry Date */}
        {survey.expiresAt && (
          <p className="text-xs text-muted-foreground mb-3">
            ينتهي في: {new Date(survey.expiresAt).toLocaleDateString('ar')}
          </p>
        )}

        {/* Action Button */}
        {isAvailable ? (
          <Button
            onClick={() => onStart(survey.id)}
            size="sm"
            className="w-full text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
          >
            <FileText size={16} className="mr-2" />
            ابدأ الاستطلاع
          </Button>
        ) : (
          <Button
            disabled
            size="sm"
            variant="outline"
            className="w-full text-xs"
          >
            <CheckCircle2 size={16} className="mr-2" />
            الاستطلاع مكتمل
          </Button>
        )}
      </div>
    </Card>
  );
}
