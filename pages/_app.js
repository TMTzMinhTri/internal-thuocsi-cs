import {
    faCapsules, faCube, faCubes, faFeather,
    faIndustry, faMapMarked, faTags, faList, faFile
} from '@fortawesome/free-solid-svg-icons';
import { Backdrop, CircularProgress, createMuiTheme, ThemeProvider } from '@material-ui/core';
import Layout from '@thuocsi/nextjs-components/layout/layout';
import Loader from '@thuocsi/nextjs-components/loader/loader';
import { ToastProvider } from "@thuocsi/nextjs-components/toast/providers/ToastProvider";
import { useRouter } from "next/router";
import React, { useEffect } from 'react';
import styles from "./global.css";
import CssBaseline from '@material-ui/core/CssBaseline';

export var theme = createMuiTheme({
    palette: {
        primary: {
            main: '#00b46e',
            dark: '#00a45e',
            contrastText: "#fff"
        }
    }
})

const menu = [{
    key: "ALLCASE",
    name: "All Cases",
    link: "/cs/all_case",
    icon: faList
}, 
{
    key: "MYCASE",
    name: "My Cases",
    link: "/cs/my_case",
    icon: faList
}, 
{
    key: "LISTFILE",
    name: "List Files",
    link: "/cs/list_file",
    icon: faFile
}]

export default function App(props) {
    const router = useRouter();
    const [showLoader, setShowLoader] = React.useState(true)
    const [showBackdrop, setShowBackdrop] = React.useState(false)

    useEffect(() => {
        let routeChangeStart = () => setShowBackdrop(true);
        let routeChangeComplete = () => setShowBackdrop(false);
    
        router.events.on("routeChangeStart", routeChangeStart);
        router.events.on("routeChangeComplete", routeChangeComplete);
        router.events.on("routeChangeError", routeChangeComplete);
        setTimeout(() => {
            setShowLoader(false)
        }, 500)
        return () => {
                router.events.off("routeChangeStart", routeChangeStart);
                router.events.off("routeChangeComplete", routeChangeComplete);
                router.events.off("routeChangeError", routeChangeComplete);
            }
        }, []
    )
    const {Component, pageProps} = props

    if (pageProps.loggedIn) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <ToastProvider>
                    <Layout className={styles.blank} loggedInUserInfo={pageProps.loggedInUserInfo} menu={menu} title="CS">
                        <Component {...pageProps} />
                        <Backdrop style={{zIndex: theme.zIndex.drawer + 1, color: '#fff'}} open={showBackdrop}>
                            <CircularProgress color="inherit" />
                        </Backdrop>
                    </Layout>
                </ToastProvider>
                <Loader show={showLoader}></Loader>
            </ThemeProvider>
        )
    } else {
        return (<ThemeProvider theme={theme}>
            <Component {...pageProps} />
        </ThemeProvider>)
    }

}
