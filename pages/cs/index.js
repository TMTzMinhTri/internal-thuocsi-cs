import React from 'react';

import Head from 'next/head';

import AppCS from 'pages/_layout';

import { getTicketClient } from 'client';

import { doWithLoggedInUser, renderWithLoggedInUser } from '@thuocsi/nextjs-components/lib/login';
import { LIMIT_DEFAULT, PAGE_DEFAULT } from 'data';

import { TicketList } from 'components';

export async function loadRequestData(ctx) {
  // Fetch data from external API

  const { query } = ctx;
  const {
    search = '',
    page = PAGE_DEFAULT,
    limit = LIMIT_DEFAULT,
    action = '',
    ...restProps
  } = query;
  const offset = page * limit;

  const ticketClient = getTicketClient(ctx, {});
  const filterValue = {
    ...restProps,
    ...(restProps?.reasons && { reasons: restProps?.reasons.split(',') }),
  };

  // TODO offset limit
  const [ticketResult, listReasonRes] = await Promise.all([
    action === 'filter'
      ? ticketClient.getTicketByFilterServer(filterValue)
      : ticketClient.getList(offset, limit, search),
    ticketClient.getListReason(),
  ]);

  const total = ticketResult?.total || 0;
  const tickets = ticketResult?.data || [];

  const listReason = listReasonRes?.data?.map((item) => ({ value: item.code, label: item.name }));

  return {
    props: {
      listReason,
      total,
      tickets,
      action,
      filter: { ...restProps },
      filterObject: filterValue
    },
  };
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
    name: 'DS phiếu yêu cầu',
  },
];

const ListTicketPage = (props) => (
  <AppCS select="/cs" breadcrumb={breadcrumb}>
    <Head>
      <title>DS phiếu yêu cầu</title>
    </Head>
    <TicketList {...props} />
  </AppCS>
);

const index = (props) => renderWithLoggedInUser(props, ListTicketPage);

export default index;
