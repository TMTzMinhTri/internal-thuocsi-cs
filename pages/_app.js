import { faList, faFile } from '@fortawesome/free-solid-svg-icons';
import { Backdrop, CircularProgress, createMuiTheme, ThemeProvider } from '@material-ui/core';
import Layout from '@thuocsi/nextjs-components/layout/layout';
import Loader from '@thuocsi/nextjs-components/loader/loader';
import { ToastProvider } from '@thuocsi/nextjs-components/toast/providers/ToastProvider';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import styles from './global.css';

export const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#00b46e',
      dark: '#00a45e',
      contrastText: '#fff',
    },
  },
});

const menu = [
  {
    key: 'ALLCASE',
    name: 'DS phiếu yêu cầu',
    link: '/cs/all-case',
    icon: faList,
  },
  {
    key: 'MYCASE',
    name: 'DS yêu cầu cá nhân',
    link: '/cs/my-case',
    icon: faList,
  },
  {
    key: 'LISTFILE',
    name: 'Danh sách file',
    link: '/cs/list-file',
    icon: faFile,
  },
];

export default function App(props) {
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
    }, 500);
    return () => {
      router.events.off('routeChangeStart', routeChangeStart);
      router.events.off('routeChangeComplete', routeChangeComplete);
      router.events.off('routeChangeError', routeChangeComplete);
    };
  }, []);
  const { Component, pageProps } = props;

  if (pageProps.loggedIn) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastProvider>
          <Layout
            className={styles.blank}
            loggedInUserInfo={pageProps.loggedInUserInfo}
            menu={menu}
            title="CS"
          >
            <Component {...pageProps} />
            <Backdrop
              style={{ zIndex: theme.zIndex.drawer + 1, color: '#fff' }}
              open={showBackdrop}
            >
              <CircularProgress color="inherit" />
            </Backdrop>
          </Layout>
        </ToastProvider>
        <Loader show={showLoader} />
      </ThemeProvider>
    );
  }
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
