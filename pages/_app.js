import React from 'react';
import { faList } from '@fortawesome/free-solid-svg-icons';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import Layout from '@thuocsi/nextjs-components/layout/layout';
import { ToastProvider } from '@thuocsi/nextjs-components/toast/providers/ToastProvider';

import { GlobalProvider, LoadingRoute } from 'context/GlobalContext';
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
    key: 'ALLCASE_CS',
    name: 'DS phiếu yêu cầu',
    link: '/cs',
    icon: faList,
  },
  {
    key: 'MYCASE_CS',
    name: 'DS yêu cầu cá nhân',
    link: '/cs/my',
    icon: faList,
  },
  {
    key: 'NEW_CS',
    name: 'Tạo mới yêu cầu',
    link: '/cs/new',
    icon: faList,
  },
];

export default function App(props) {
  const { Component, pageProps } = props;

  if (pageProps.loggedIn) {
    return (
      <ThemeProvider theme={theme}>
        <GlobalProvider theme={theme}>
          <LoadingRoute>
            <CssBaseline />
            <ToastProvider>
              <Layout
                className={styles.blank}
                loggedInUserInfo={pageProps.loggedInUserInfo}
                menu={menu}
                title="CS"
              >
                <Component {...pageProps} />
              </Layout>
            </ToastProvider>
          </LoadingRoute>
        </GlobalProvider>
      </ThemeProvider>
    );
  }
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
