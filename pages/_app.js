import React from 'react';
import { faList, faPlus } from '@fortawesome/free-solid-svg-icons';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import Layout from '@thuocsi/nextjs-components/layout/layout';
import { ToastProvider } from '@thuocsi/nextjs-components/toast/providers/ToastProvider';

import { GlobalProvider, LoadingRoute } from 'context/GlobalContext';
import CssBaseline from '@material-ui/core/CssBaseline';
import styles from './global.css';
import { useRouter } from 'next/router';
import Loader, { setupLoading } from '@thuocsi/nextjs-components/loader/loader';

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
        key: 'CS_TICKET',
        name: 'Phiếu hỗ trợ',
        required: '/cs',
        subMenu: [
            {
                key: 'ALL_TICKET',
                name: 'Tất cả phiếu hỗ trợ',
                link: '/cs',
                icon: faList,
            },
            {
                key: 'MY_TICKET',
                name: 'Phiếu hỗ trợ của tôi',
                link: '/cs/my-ticket',
                icon: faList,
            },
            {
                key: 'NEW_TICKET',
                name: 'Tạo mới yêu cầu',
                link: '/cs/new',
                icon: faPlus,
            },
        ]
    },
];

export default function App(props) {
    const router = useRouter();
    const [showLoader, setShowLoader] = React.useState(true)
    const [showLoaderText, setShowLoaderText] = React.useState(true)

    // do once
    React.useEffect(() => {

        // setup first loading
        setTimeout(() => {
            setShowLoaderText(false)
            setShowLoader(false)
        }, 500)

        // setup loading when navigate
        return setupLoading(router, setShowLoader)
    }, [])

    const { Component, pageProps } = props

    if (pageProps.loggedIn) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <ToastProvider>
                    <Layout className={styles.blank} loggedInUserInfo={pageProps.loggedInUserInfo} menu={menu} title="CS">
                        <Component {...pageProps} />
                    </Layout>
                </ToastProvider>
                <Loader show={showLoader} showText={showLoaderText}></Loader>
            </ThemeProvider>
        )
    } else {
        return (<ThemeProvider theme={theme}>
            <Component {...pageProps} />
        </ThemeProvider>)
    }
}
