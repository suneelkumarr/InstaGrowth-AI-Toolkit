import React, { useState, useEffect } from 'react';
import { UserSearch, HashtagSearch, PostIdeaGenerator, CompetitorAnalysis, BestTimeToPost, PostPerformance, HashtagGenerator, InfluencerDiscovery, CollabMatcher, HookAnalyser, HookCreator, OnboardingGuide, ContentCalendar } from './components';
import { UserIcon, HashtagIcon, SparklesIcon, InstagramIcon, UsersGroupIcon, ClockIcon, ChartBarIcon, TagIcon, MagnifyingGlassCircleIcon, HandshakeIcon, BoltIcon, CalendarIcon } from './components/common/icons';
import ApiKeyInput from './components/ApiKeyInput';

type View = 'user' | 'performance' | 'competitor' | 'discovery' | 'postingTime' | 'hashtag' | 'hashtagGen' | 'ai' | 'collab' | 'hookAnalyser' | 'hookCreator' | 'calendar';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('user');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hookToAnalyze, setHookToAnalyze] = useState<string | null>(null);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    if (hasCompletedOnboarding !== 'true') {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setShowOnboarding(false);
  };

  const handleAnalyzeHookRequest = (hook: string) => {
    setHookToAnalyze(hook);
    setActiveView('hookAnalyser');
  };


  const renderView = () => {
    switch (activeView) {
      case 'user':
        return <UserSearch />;
      case 'performance':
        return <PostPerformance />;
      case 'competitor':
        return <CompetitorAnalysis />;
      case 'discovery':
        return <InfluencerDiscovery />;
      case 'postingTime':
        return <BestTimeToPost />;
      case 'hashtag':
        return <HashtagSearch />;
      case 'hashtagGen':
        return <HashtagGenerator />;
      case 'ai':
        return <PostIdeaGenerator />;
      case 'collab':
        return <CollabMatcher />;
      case 'hookAnalyser':
        return <HookAnalyser initialHook={hookToAnalyze} onAnalysisDone={() => setHookToAnalyze(null)} />;
      case 'hookCreator':
        return <HookCreator onAnalyzeHook={handleAnalyzeHookRequest} />;
      case 'calendar':
        return <ContentCalendar />;
      default:
        return <UserSearch />;
    }
  };
  
  const NavItem = ({ view, icon, label }: { view: View, icon: React.ReactElement, label: string }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex items-center space-x-3 p-3 w-full text-left rounded-lg transition-all duration-200 ${
        activeView === view
          ? 'bg-indigo-600 text-white shadow-lg'
          : 'text-gray-400 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-[#111827] to-[#1a2035]">
      {showOnboarding && <OnboardingGuide onComplete={handleOnboardingComplete} />}

      <aside className="w-full md:w-64 bg-gray-900/50 backdrop-blur-sm p-4 border-b md:border-b-0 md:border-r border-gray-700/50 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-8 px-2">
          <InstagramIcon className="w-10 h-10 text-indigo-500" />
          <div>
            <h1 className="text-xl font-bold text-white">InstaGrowth AI</h1>
            <p className="text-xs text-gray-400">Toolkit</p>
          </div>
        </div>
        <nav className="flex flex-row overflow-x-auto md:overflow-x-visible md:flex-col gap-2">
           <NavItem view="user" icon={<UserIcon className="w-6 h-6" />} label="User Analysis" />
           <NavItem view="performance" icon={<ChartBarIcon className="w-6 h-6" />} label="Post Performance" />
           <NavItem view="competitor" icon={<UsersGroupIcon className="w-6 h-6" />} label="Competitor Analysis" />
           <NavItem view="collab" icon={<HandshakeIcon className="w-6 h-6" />} label="Collab Matcher" />
           <NavItem view="discovery" icon={<MagnifyingGlassCircleIcon className="w-6 h-6" />} label="Influencer Discovery" />
           <NavItem view="postingTime" icon={<ClockIcon className="w-6 h-6" />} label="Best Time to Post" />
           <NavItem view="hashtag" icon={<HashtagIcon className="w-6 h-6" />} label="Hashtag Research" />
           <NavItem view="hashtagGen" icon={<TagIcon className="w-6 h-6" />} label="AI Hashtag Generator" />
           <NavItem view="ai" icon={<SparklesIcon className="w-6 h-6" />} label="AI Content Ideas" />
           <NavItem view="calendar" icon={<CalendarIcon className="w-6 h-6" />} label="Content Calendar" />
           <NavItem view="hookCreator" icon={<BoltIcon className="w-6 h-6" />} label="AI Hook Creator" />
           <NavItem view="hookAnalyser" icon={<BoltIcon className="w-6 h-6" />} label="AI Hook Analyser" />
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <ApiKeyInput />
        {renderView()}
      </main>
    </div>
  );
};

export default App;