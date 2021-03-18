import React from 'react';

import Head from 'next/head';

import AppCS from 'pages/_layout';

import { getAccountClient, getTicketClient } from 'client';

import { doWithLoggedInUser, renderWithLoggedInUser } from '@thuocsi/nextjs-components/lib/login';
import { LIMIT_DEFAULT, PAGE_DEFAULT } from 'data';

import { MyTicketList } from 'components';
import { getFirst } from 'utils';

export async function loadRequestData(ctx) {
  // Fetch data from external API

  const accountClient = getAccountClient(ctx, {});
  const userResult = await accountClient.getUserInfoMe();
  const userInfo = getFirst(userResult);

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
    assignUser: [userInfo.account.accountId],
  };

  // TODO offset limit
  const [ticketResult, listReasonRes] = await Promise.all([
    action === 'filter'
      ? ticketClient.getTicketByFilterServer(filterValue)
      : ticketClient.getTicketByAssignUser(offset, limit, search),
    ticketClient.getListReason(),
  ]);

  const total = ticketResult?.total || 0;
  const tickets =
    ticketResult?.data?.map(async (ticket) => {
      if (ticket) {
        await accountClient.get;
      }

      return ticket;
    }) || [];

  const listReason = listReasonRes?.data?.map((item) => ({ value: item.code, label: item.name }));

  return {
    props: {
      listReason,
      total,
      tickets,
      action,
      filter: { ...restProps },
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
    name: 'DS phiếu yêu cầu của tôi',
  },
];

const ListTicketPage = (props) => (
  <AppCS select="/cs/my" breadcrumb={breadcrumb}>
    <Head>
      <title>DS phiếu yêu cầu của tôi</title>
    </Head>
    <MyTicketList {...props} />
  </AppCS>
);

const index = (props) => renderWithLoggedInUser(props, ListTicketPage);

export default index;
