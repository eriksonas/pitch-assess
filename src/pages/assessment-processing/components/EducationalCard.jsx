import React from 'react';
import Icon from '../../../components/AppIcon';

const EducationalCard = ({ title, content, iconName, category }) => {
  const getCategoryColor = () => {
    switch (category) {
      case 'structure':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'content':
        return 'bg-teal-500/10 text-teal-600 dark:text-teal-400';
      case 'delivery':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      case 'audience':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-5 lg:p-6 hover-lift">
      <div className="flex items-start gap-3 md:gap-4">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getCategoryColor()}`}>
          <Icon name={iconName} size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-heading font-semibold text-foreground text-sm md:text-base mb-2">
            {title}
          </h4>
          <p className="caption text-muted-foreground leading-relaxed">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EducationalCard;