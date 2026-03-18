import { useState, useEffect } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from './hooks/useQueries';
import SplashScreen from './pages/SplashScreen';
import LoginScreen from './pages/LoginScreen';
import HomeScreen from './pages/HomeScreen';
import ProviderProfileScreen from './pages/ProviderProfileScreen';
import InboxScreen from './pages/InboxScreen';
import ConversationScreen from './pages/ConversationScreen';
import ReviewScreen from './pages/ReviewScreen';
import ProfileSetupModal from './components/ProfileSetupModal';
import Layout from './components/Layout';
import { Toaster } from '@/components/ui/sonner';

export type AppRoute =
  | { page: 'splash' }
  | { page: 'login' }
  | { page: 'home' }
  | { page: 'provider'; providerId: string }
  | { page: 'inbox' }
  | { page: 'conversation'; threadId: string; otherUserId: string }
  | { page: 'review'; providerId: string; providerName: string };

export default function App() {
  const [route, setRoute] = useState<AppRoute>({ page: 'splash' });
  const [splashDone, setSplashDone] = useState(false);
  const { identity, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();

  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  // Splash → login/home after 2.2s
  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashDone(true);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  // Navigate after splash
  useEffect(() => {
    if (!splashDone) return;
    if (isInitializing) return;

    if (!isAuthenticated) {
      setRoute({ page: 'login' });
    } else if (profileFetched && userProfile !== null) {
      if (route.page === 'splash' || route.page === 'login') {
        setRoute({ page: 'home' });
      }
    }
  }, [splashDone, isAuthenticated, isInitializing, profileFetched, userProfile]);

  // After login, navigate to home if profile exists
  useEffect(() => {
    if (isAuthenticated && profileFetched && userProfile !== null && route.page === 'login') {
      setRoute({ page: 'home' });
    }
  }, [isAuthenticated, profileFetched, userProfile, route.page]);

  const navigate = (newRoute: AppRoute) => {
    setRoute(newRoute);
    window.scrollTo(0, 0);
  };

  const handleLogout = async () => {
    queryClient.clear();
    setRoute({ page: 'login' });
  };

  if (route.page === 'splash') {
    return <SplashScreen />;
  }

  if (route.page === 'login') {
    return (
      <>
        <LoginScreen onLoginSuccess={() => {}} />
        <Toaster />
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen onLoginSuccess={() => {}} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <Layout route={route} navigate={navigate} onLogout={handleLogout}>
        {route.page === 'home' && (
          <HomeScreen navigate={navigate} />
        )}
        {route.page === 'provider' && (
          <ProviderProfileScreen
            providerId={route.providerId}
            navigate={navigate}
          />
        )}
        {route.page === 'inbox' && (
          <InboxScreen navigate={navigate} />
        )}
        {route.page === 'conversation' && (
          <ConversationScreen
            threadId={route.threadId}
            otherUserId={route.otherUserId}
            navigate={navigate}
          />
        )}
        {route.page === 'review' && (
          <ReviewScreen
            providerId={route.providerId}
            providerName={route.providerName}
            navigate={navigate}
          />
        )}
      </Layout>

      {showProfileSetup && (
        <ProfileSetupModal
          onComplete={() => {
            setRoute({ page: 'home' });
          }}
        />
      )}

      <Toaster />
    </>
  );
}
