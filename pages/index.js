import { doWithLoggedInUser } from "@thuocsi/nextjs-components/lib/login";
import ProductPage, { loadProductData } from "pages/cms/product/index";

export async function getServerSideProps(ctx) {
    return await doWithLoggedInUser(ctx, (ctx) => {
        return loadProductData(ctx)
    })
}

export default function CMSIndexPage(props) {
    return ProductPage(props)
}