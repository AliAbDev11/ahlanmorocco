import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useFullscreen } from '@/hooks/useFullscreen';
import { cn } from '@/lib/utils';

interface FullscreenButtonProps {
  variant?: 'default' | 'ghost' | 'outline';
  showLabel?: boolean;
  className?: string;
}

export const FullscreenButton = ({ 
  variant = 'outline', 
  showLabel = true,
  className 
}: FullscreenButtonProps) => {
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size={showLabel ? 'default' : 'icon'}
          onClick={toggleFullscreen}
          className={cn('gap-2', className)}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="h-4 w-4" />
              {showLabel && <span className="hidden sm:inline">Exit Fullscreen</span>}
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4" />
              {showLabel && <span className="hidden sm:inline">Fullscreen</span>}
            </>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isFullscreen ? 'Exit fullscreen (F11)' : 'Enter fullscreen (F11)'}</p>
      </TooltipContent>
    </Tooltip>
  );
};
