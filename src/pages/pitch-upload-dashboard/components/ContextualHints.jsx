import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';

const ContextualHints = ({ domain, audienceType, language }) => {
  const { t } = useTranslation();

  const getHintContent = () => {
    if (!domain && !audienceType) {
      return {
        title: t('contextualHints.gettingStarted'),
        description: t('contextualHints.gettingStartedDesc'),
        icon: 'Info',
        color: 'primary'
      };
    }

    if (domain && !audienceType) {
      const domainHints = {
        'biotech': {
          title: t('contextualHints.biotechFocus'),
          description: t('contextualHints.biotechDesc'),
          icon: 'Microscope',
          color: 'success'
        },
        'photonics': {
          title: t('contextualHints.photonicsFocus'),
          description: t('contextualHints.photonicsDesc'),
          icon: 'Lightbulb',
          color: 'warning'
        },
        'electronics': {
          title: t('contextualHints.electronicsFocus'),
          description: t('contextualHints.electronicsDesc'),
          icon: 'Cpu',
          color: 'accent'
        },
        'medtech': {
          title: t('contextualHints.medtechFocus'),
          description: t('contextualHints.medtechDesc'),
          icon: 'Heart',
          color: 'error'
        },
        'deeptech': {
          title: t('contextualHints.deeptechFocus'),
          description: t('contextualHints.deeptechDesc'),
          icon: 'Atom',
          color: 'secondary'
        }
      };
      return domainHints?.[domain] || domainHints?.['deeptech'];
    }

    if (domain && audienceType) {
      const audienceHints = {
        'startup-contest': {
          title: t('contextualHints.startupContestExpectations'),
          description: t('contextualHints.startupContestDesc'),
          icon: 'Trophy',
          color: 'warning'
        },
        'tech-transfer': {
          title: t('contextualHints.techTransferExpectations'),
          description: t('contextualHints.techTransferDesc'),
          icon: 'Building2',
          color: 'primary'
        },
        'funding-agency': {
          title: t('contextualHints.fundingAgencyExpectations'),
          description: t('contextualHints.fundingAgencyDesc'),
          icon: 'Landmark',
          color: 'success'
        },
        'venture-capital': {
          title: t('contextualHints.ventureCapitalExpectations'),
          description: t('contextualHints.ventureCapitalDesc'),
          icon: 'TrendingUp',
          color: 'accent'
        },
        'investor': {
          title: t('contextualHints.investorExpectations'),
          description: t('contextualHints.investorDesc'),
          icon: 'Users',
          color: 'secondary'
        },
        'customer': {
          title: t('contextualHints.customerExpectations'),
          description: t('contextualHints.customerDesc'),
          icon: 'ShoppingCart',
          color: 'primary'
        }
      };
      return audienceHints?.[audienceType] || audienceHints?.['venture-capital'];
    }

    return null;
  };

  const hint = getHintContent();

  if (!hint) return null;

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg bg-${hint?.color}/10 flex items-center justify-center flex-shrink-0`}>
          <Icon 
            name={hint?.icon} 
            size={24} 
            className={`text-${hint?.color}`}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-heading font-semibold text-foreground mb-2 text-sm md:text-base">
            {hint?.title}
          </h4>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            {hint?.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContextualHints;