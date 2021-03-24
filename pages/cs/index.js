import MyTicketPage, { loadRequestData } from "./ticket/my-ticket/index";
import { doWithLoggedInUser } from "@thuocsi/nextjs-components/lib/login";

export async function getServerSideProps(ctx) {
    return await doWithLoggedInUser(ctx, loadRequestData)
}

export default function CSIndexPage(props) {
    return MyTicketPage(props)
}