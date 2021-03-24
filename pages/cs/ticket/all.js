import React from 'react';
import Head from 'next/head';
import AppCS from 'pages/_layout';
import { getTicketClient } from 'client';
import { doWithLoggedInUser, renderWithLoggedInUser } from '@thuocsi/nextjs-components/lib/login';
import { LIMIT_DEFAULT, PAGE_DEFAULT } from 'data';
import TicketList from 'components/ticket/ticket-list';

export async function loadRequestData(ctx) {
    let props = {};
    let data = { props: props };

    // Setup
    const { query } = ctx;
    const { q = '', page = PAGE_DEFAULT, limit = LIMIT_DEFAULT } = query;
    const offset = page * limit;
    const filter = q != '' ? JSON.parse(q) : {};
    let ticketClient = getTicketClient(ctx, data);

    // call APIs
    const [ticketResult, listReasonRes] = await Promise.all([ticketClient.getAllTicket(filter, offset, limit), ticketClient.getReasonList()]);
    // set value to props
    props.total = ticketResult?.total || 0;
    props.tickets = ticketResult?.data || [];
    props.reasonList = listReasonRes?.data || [];
    props.filter = filter;

    return data;
}

export async function getServerSideProps(ctx) {
    return doWithLoggedInUser(ctx, (cbCtx) => loadRequestData(cbCtx));
}

const breadcrumb = [
    {
        name: 'Trang chủ',
        link: '/cs',
    },
    {
        name: 'Danh sách phiếu hỗ trợ',
    },
];

const ListTicketPage = (props) => (
    <AppCS select="/cs/all" breadcrumb={breadcrumb}>
        <Head>
            <title>Phiếu hỗ trợ</title>
        </Head>
        <TicketList {...props} />
    </AppCS>
);

export default function AllTicketPage(props) {
    return renderWithLoggedInUser(props, ListTicketPage);
}
