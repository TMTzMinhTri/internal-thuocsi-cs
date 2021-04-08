import React from 'react';
import Head from 'next/head';
import AppCS from 'pages/_layout';
import { getOrderClient, getTicketClient } from 'client';
import { doWithLoggedInUser, renderWithLoggedInUser } from '@thuocsi/nextjs-components/lib/login';
import TicketList from 'components/ticket/ticket-list';
import { PAGE_DEFAULT, LIMIT_DEFAULT } from 'data';
import { getFirst } from 'utils';

export async function loadRequestData(ctx) {
    const props = {};
    const data = { props };

    // Setup
    const { query } = ctx;
    const { q = '', page = PAGE_DEFAULT, limit = LIMIT_DEFAULT } = query;
    const offset = page * limit;
    const filter = q !== '' ? JSON.parse(q) : {};
    const ticketClient = getTicketClient(ctx, data);
    const orderClient = getOrderClient(ctx, data);
    const { saleOrderCode = '' } = filter;

    if (saleOrderCode.length > 0) {
        const orderResult = await orderClient.filterOrder({ saleOrderCode });
        const orderInfo = getFirst(orderResult);
        if (orderInfo) {
            delete filter.saleOrderCode;

            filter.orderId = orderInfo.orderId;
        }
    }

    const [ticketResult, listReasonRes] = await Promise.all([ticketClient.getMyTicket(filter, offset, limit), ticketClient.getReasonList()]);

    // set value to props
    props.total = ticketResult?.total || 0;
    props.tickets = ticketResult?.data || [];
    props.reasonList = listReasonRes?.data;
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
        name: 'Phiếu hỗ trợ của tôi',
    },
];

const ListTicketPage = (props) => (
    <AppCS select="/cs/my" breadcrumb={breadcrumb}>
        <Head>
            <title>DS phiếu yêu cầu của tôi</title>
        </Head>
        <TicketList {...props} isMyTicket />
    </AppCS>
);

export default function MyTicketPage(props) {
    return renderWithLoggedInUser(props, ListTicketPage);
}
