import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../../components/navigation/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const Settings = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n?.language || 'en');

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧', nativeName: 'English' },
    { code: 'pl', label: 'Polski', flag: '🇵🇱', nativeName: 'Polski' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪', nativeName: 'Deutsch' },
    { code: 'lt', label: 'Lietuvių', flag: '🇱🇹', nativeName: 'Lietuvių' },
  ];

  const handleLanguageChange = (langCode) => {
    setSelectedLanguage(langCode);
    i18n?.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-elevation-medium">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="Settings" size={32} className="text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                    {t('settings.title')}
                  </h1>
                  <p className="text-muted-foreground">{t('settings.subtitle')}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                iconName="X"
                onClick={() => navigate('/pitch-upload-dashboard')}
                aria-label="Close"
              />
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Icon name="Globe" size={20} className="text-primary" />
                  {t('settings.languagePreferences')}
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {t('settings.languageDescription')}
                </p>

                <div className="space-y-3">
                  {languages?.map((lang) => (
                    <button
                      key={lang?.code}
                      onClick={() => handleLanguageChange(lang?.code)}
                      className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                        selectedLanguage === lang?.code
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{lang?.flag}</span>
                        <div className="text-left">
                          <p className="font-medium text-foreground">{lang?.nativeName}</p>
                          <p className="text-sm text-muted-foreground">{lang?.label}</p>
                        </div>
                      </div>
                      {selectedLanguage === lang?.code && (
                        <div className="flex items-center gap-2">
                          <Icon name="Check" size={20} className="text-primary" />
                          <span className="text-sm font-medium text-primary">
                            {t('settings.active')}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Icon name="Info" size={16} className="text-primary" />
                    {t('settings.note')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.noteDescription')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;