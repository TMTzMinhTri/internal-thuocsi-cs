import React, { useEffect, createContext, useContext } from 'react';
import { Backdrop, CircularProgress } from '@material-ui/core';
import Loader from '@thuocsi/nextjs-components/loader/loader';
import { useRouter } from 'next/router';

const GlobalContext = createContext({});

export const GlobalProvider = ({ children, theme }) => {
  const router = useRouter();
  const [showLoader, setShowLoader] = React.useState(true);
  const [showBackdrop, setShowBackdrop] = React.useState(false);

  useEffect(() => {
    const routeChangeStart = () => setShowBackdrop(true);
    const routeChangeComplete = () => setShowBackdrop(false);

    router.events.on('routeChangeStart', routeChangeStart);
    router.events.on('routeChangeComplete', routeChangeComplete);
    router.events.on('routeChangeError', routeChangeComplete);
    setTimeout(() => {
      setShowLoader(false);
    }, 200);
    return () => {
      router.events.off('routeChangeStart', routeChangeStart);
      router.events.off('routeChangeComplete', routeChangeComplete);
      router.events.off('routeChangeError', routeChangeComplete);
    };
  }, []);

  return (
    <GlobalContext.Provider value={{ showLoader, showBackdrop, theme }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGobal = () => useContext(GlobalContext);

export const LoadingRoute = ({ children }) => {
  const { showLoader, showBackdrop, theme } = useGobal();

  if (showLoader) {
    return <Loader show={showLoader} />;
  }
  if (showBackdrop) {
    return (
      <Backdrop style={{ zIndex: theme.zIndex.drawer + 1, color: '#fff' }} open={showBackdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }
  return children;
};
