const { default: AppCS } = require("pages/_layout");
import Head from "next/head";
import { doWithLoggedInUser, renderWithLoggedInUser } from "@thuocsi/nextjs-components/lib/login";
import AppCuS from "pages/_layout"


export async function getServerSideProps(ctx) {
    return await doWithLoggedInUser(ctx, (ctx) => {
        return loadRequestData(ctx);
    })
}

export async function loadRequestData(ctx){

}

export default function ProductPage(props) {
    return renderWithLoggedInUser(props, render)
}

function render(props) {
    return (
        <AppCuS select="/cs/all_case">
            <Head>
                <title>Danh sách yêu cầu</title>
            </Head>
        </AppCuS>
    )
}