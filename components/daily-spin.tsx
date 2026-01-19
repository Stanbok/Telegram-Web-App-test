'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTelegram } from '@/lib/telegram-provider';
import { dailySpin } from '@/lib/api-client';

interface DailySpinProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSpinSuccess?: (userData: any) => void;
}

const SPIN_OPTIONS = [10, 50, 100, 250, 500, 15, 75, 200];

export function DailySpin({ open, onOpenChange, onSpinSuccess }: DailySpinProps) {
  const { initData } = useTelegram();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alreadySpun, setAlreadySpun] = useState(false);
  const [spinAttempted, setSpinAttempted] = useState(false);

  useEffect(() => {
    if (open) {
      drawWheel();
      // Reset states when modal opens
      setSpinAttempted(false);
      setAlreadySpun(false);
    }
  }, [open]);

  // Redraw wheel when rotation changes
  useEffect(() => {
    drawWheel();
  }, [rotation]);

  function drawWheel() {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const sliceAngle = (Math.PI * 2) / SPIN_OPTIONS.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw wheel slices
    SPIN_OPTIONS.forEach((value, index) => {
      const startAngle = index * sliceAngle + rotation;
      const endAngle = (index + 1) * sliceAngle + rotation;

      // Colors
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
        '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
      ];
      ctx.fillStyle = colors[index % colors.length];

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`${value}`, radius - 20, 5);
      ctx.restore();
    });

    // Draw center circle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    ctx.fill();

    // Draw pointer at top
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.moveTo(centerX - 10, 15);
    ctx.lineTo(centerX + 10, 15);
    ctx.lineTo(centerX, 30);
    ctx.closePath();
    ctx.fill();
  }

  async function handleSpin() {
    // FIXED: Prevent multiple spins and only call API once
    if (isSpinning || isProcessing || alreadySpun || spinAttempted || !initData) return;

    setIsProcessing(true);
    setIsSpinning(true);
    setSpinAttempted(true);

    try {
      // Call the API ONCE before starting animation
      const result = await dailySpin(initData);
      
      if (result.already_spun) {
        setAlreadySpun(true);
        setIsSpinning(false);
        setIsProcessing(false);
        return;
      }

      if (!result.success) {
        setIsSpinning(false);
        setIsProcessing(false);
        return;
      }

      // Animation
      const spins = 8;
      const extraDeg = Math.random() * 360;
      const finalRotation = spins * 360 + extraDeg;

      let currentRotation = rotation;
      const duration = 3000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth deceleration
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        currentRotation = rotation + finalRotation * easeProgress;

        setRotation(currentRotation);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsSpinning(false);

          // Determine winning option
          const sliceAngle = 360 / SPIN_OPTIONS.length;
          const normalizedRotation = (360 - (currentRotation % 360)) % 360;
          const winningIndex = Math.floor(normalizedRotation / sliceAngle) % SPIN_OPTIONS.length;
          setLastWin(SPIN_OPTIONS[winningIndex]);

          // Update user data from API response
          setAlreadySpun(true);
          if (onSpinSuccess && result.user) {
            onSpinSuccess(result.user);
          }

          setIsProcessing(false);

          // Haptic feedback
          if ((window as any).Telegram?.WebApp) {
            (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
          }
        }
      };

      requestAnimationFrame(animate);
    } catch (error: any) {
      console.error('Failed to spin:', error);
      setIsSpinning(false);
      setIsProcessing(false);
      
      // Check if error indicates already spun
      if (error.message?.includes('already') || error.message?.includes('today')) {
        setAlreadySpun(true);
      }
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <h2 className="text-2xl font-bold text-center">🎰 السحب اليومي</h2>

        <div className="flex justify-center">
          <div className="relative w-80 h-80">
            <canvas
              ref={canvasRef}
              width={320}
              height={320}
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'none' : 'transform 0.1s',
              }}
              className="w-full h-full"
            />
          </div>
        </div>

        {lastWin && (
          <div className="bg-gradient-to-r from-primary to-accent rounded-lg p-4 text-center text-primary-foreground">
            <p className="text-sm opacity-90">آخر جائزة</p>
            <p className="text-4xl font-bold">🎉 {lastWin}</p>
            <p className="text-sm opacity-90 mt-2">نقطة</p>
          </div>
        )}

        {alreadySpun && !lastWin && (
          <div className="bg-yellow-100 dark:bg-yellow-900 rounded-lg p-4 text-center">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              لقد قمت بالسحب اليوم! عد غداً 🎰
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleSpin}
            disabled={isSpinning || alreadySpun || spinAttempted}
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-lg disabled:opacity-50"
            size="lg"
          >
            {isSpinning ? '⏳ يدور...' : alreadySpun ? '✓ تم السحب' : '🎡 ادر العجلة'}
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1"
          >
            إغلاق
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          الجوائز عشوائية - سحبة واحدة فقط كل 24 ساعة
        </p>
      </Card>
    </div>
  );
}
