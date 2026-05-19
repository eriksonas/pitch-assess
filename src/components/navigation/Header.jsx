import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import Logo from '../Logo';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile, signOut } = useAuth();
  const { t } = useTranslation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef?.current && !userMenuRef?.current?.contains(event?.target)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event?.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isUserMenuOpen]);

  const handleLogoClick = () => {
    navigate('/pitch-upload-dashboard');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  // Don't show full header on auth pages
  const isAuthPage = location?.pathname === '/signin' || location?.pathname === '/signup';
  if (isAuthPage) {
    return (
      <header className="header-nav">
        <div className="header-container">
          <div className="header-brand">
            <button
              onClick={() => navigate('/signin')}
              className="header-logo hover-lift press-scale"
              aria-label="PitchAssess Home"
            >
              <Logo size={26} className="text-white" />
            </button>
            <h1 className="header-title">{t('header.title')}</h1>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="header-nav">
      <div className="header-container">
        <div className="header-brand">
          <button
            onClick={handleLogoClick}
            className="header-logo hover-lift press-scale"
            aria-label="PitchAssess Home"
          >
            <Logo size={26} className="text-white" />
          </button>
          <h1 className="header-title">{t('header.title')}</h1>
        </div>

        <div className="header-actions">
          {user && (
            <>
              <Button
                variant="ghost"
                size="sm"
                iconName="BarChart3"
                iconPosition="left"
                onClick={() => navigate('/analytics-dashboard')}
                className="hidden md:inline-flex"
              >
                {t('header.analytics')}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                iconName="GitCompare"
                iconPosition="left"
                onClick={() => navigate('/pitch-version-tracker')}
                className="hidden md:inline-flex"
              >
                {t('header.versionTracker')}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                iconName="BookOpen"
                iconPosition="left"
                onClick={() => navigate('/pitch-template-library')}
                className="hidden md:inline-flex"
              >
                {t('header.templates')}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                iconName="Save"
                iconPosition="left"
                onClick={() => navigate('/saved-pitches')}
                className="hidden md:inline-flex"
              >
                {t('header.savedPitches')}
              </Button>
            </>
          )}

          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-base press-scale"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="User" size={16} className="text-primary" />
                </div>
                <span className="hidden md:inline text-sm font-medium text-foreground">
                  {userProfile?.full_name || 'User'}
                </span>
                <Icon name={isUserMenuOpen ? "ChevronUp" : "ChevronDown"} size={16} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg border border-border shadow-elevation-medium py-2 animate-fade-in z-50">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50 transition-base flex items-center gap-2"
                  >
                    <Icon name="User" size={16} />
                    {t('header.profile')}
                  </button>
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50 transition-base flex items-center gap-2"
                  >
                    <Icon name="Settings" size={16} />
                    {t('header.settings')}
                  </button>
                  <div className="border-t border-border my-2"></div>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-left text-sm text-error hover:bg-error/10 transition-base flex items-center gap-2"
                  >
                    <Icon name="LogOut" size={16} />
                    {t('header.signOut')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              iconName="LogIn"
              iconPosition="left"
              onClick={() => navigate('/signin')}
            >
              {t('header.signIn')}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;