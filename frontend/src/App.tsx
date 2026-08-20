import React, { useState, useEffect } from 'react';
import { LanguageCode, DiseaseScanResult } from './types';
import { translations } from './utils/translations';
import { api } from './services/api';
import { speechService } from './utils/speechService';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { DetectPage } from './pages/DetectPage';
import { MarketPricesPage } from './pages/MarketPricesPage';
import { WeatherPage } from './pages/WeatherPage';
import { AdvisoryPage } from './pages/AdvisoryPage';
import { AssistantPage } from './pages/AssistantPage';
import { SchemesPage } from './pages/SchemesPage';
import { FarmerNewsPage } from './pages/FarmerNewsPage';
import { FarmResourcesPage } from './pages/FarmResourcesPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';

export const App: React.FC = () => {
  // App-level State
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    return (localStorage.getItem('agricare_lang') as LanguageCode) || 'en';
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [farmerName, setFarmerName] = useState<string>("Ramesh Patel");
  const [farmerPhone, setFarmerPhone] = useState<string>("+91 98480 12345");
  
  // Cross-module Context State
  const [activeDiagnosisContext, setActiveDiagnosisContext] = useState<DiseaseScanResult | null>(null);
  const [marketInitialCrop, setMarketInitialCrop] = useState<string>('Tomato');

  const t = translations[currentLanguage];

  const handleLanguageChange = (lang: LanguageCode) => {
    speechService.onLanguageChange(lang);
    setCurrentLanguage(lang);
    localStorage.setItem('agricare_lang', lang);
  };

  const handleNavigate = (tab: string, extra?: any) => {
    if (tab === 'market-prices' && extra?.crop) {
      setMarketInitialCrop(extra.crop);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAskAssistantWithDiagnosis = (report: DiseaseScanResult) => {
    setActiveDiagnosisContext(report);
    setActiveTab('assistant');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveScanToHistory = async (report: DiseaseScanResult) => {
    try {
      await api.saveScan(report);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoginSuccess = (user: any) => {
    if (user?.name) setFarmerName(user.name);
    if (user?.phone) setFarmerPhone(user.phone);
    if (user?.preferred_language) handleLanguageChange(user.preferred_language);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Main Navigation */}
      <Navbar
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        activeTab={activeTab}
        onTabChange={handleNavigate}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        farmerName={farmerName}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Drawer & Sidebar with 11 Modules */}
        <Sidebar
          currentLanguage={currentLanguage}
          activeTab={activeTab}
          onTabChange={handleNavigate}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="app-container page-enter" key={activeTab}>
            {activeTab === 'dashboard' && (
              <DashboardPage
                language={currentLanguage}
                onNavigate={handleNavigate}
                farmerName={farmerName}
              />
            )}

            {activeTab === 'detect' && (
              <DetectPage
                language={currentLanguage}
                onAskAssistant={handleAskAssistantWithDiagnosis}
                onSaveHistory={handleSaveScanToHistory}
                onNavigateToMarket={(crop) => handleNavigate('market-prices', { crop })}
              />
            )}

            {activeTab === 'market-prices' && (
              <MarketPricesPage
                language={currentLanguage}
                initialCrop={marketInitialCrop}
              />
            )}

            {activeTab === 'weather' && (
              <WeatherPage
                language={currentLanguage}
              />
            )}

            {activeTab === 'advisory' && (
              <AdvisoryPage
                language={currentLanguage}
              />
            )}

            {activeTab === 'assistant' && (
              <AssistantPage
                language={currentLanguage}
                activeDiagnosisContext={activeDiagnosisContext}
                onClearDiagnosisContext={() => setActiveDiagnosisContext(null)}
              />
            )}

            {activeTab === 'schemes' && (
              <SchemesPage
                language={currentLanguage}
                onAskAssistantWithScheme={(scheme) => {
                  handleNavigate('assistant', { initialQuery: `Tell me more about ${scheme.title}` });
                }}
              />
            )}

            {activeTab === 'news' && (
              <FarmerNewsPage
                language={currentLanguage}
              />
            )}

            {activeTab === 'resources' && (
              <FarmResourcesPage
                language={currentLanguage}
                farmerName={farmerName}
                farmerPhone={farmerPhone}
              />
            )}

            {activeTab === 'profile' && (
              <ProfilePage
                language={currentLanguage}
                onLanguageChange={handleLanguageChange}
                onProfileUpdated={(name) => setFarmerName(name)}
              />
            )}

            {activeTab === 'login' && (
              <LoginPage
                language={currentLanguage}
                onLoginSuccess={handleLoginSuccess}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
