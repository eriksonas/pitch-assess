import React from 'react';

const ProgressBar = ({ progress, label }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-heading font-medium text-foreground text-sm md:text-base">
          {label}
        </span>
        <span className="mono font-semibold text-primary text-sm md:text-base">
          {progress}%
        </span>
      </div>
      <div className="relative h-3 md:h-4 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;