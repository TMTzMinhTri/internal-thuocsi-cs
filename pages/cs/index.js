import React, { useState } from 'react';

import Head from 'next/head';

import AppCS from 'pages/_layout';

import { getAccountClient, getTicketClient } from 'client';

import { doWithLoggedInUser, renderWithLoggedInUser } from '@thuocsi/nextjs-components/lib/login';
import { LIMIT_DEFAULT, PAGE_DEFAULT } from 'data';

import { TicketList } from 'components';
import { ReasonUtils } from 'utils';

export async function loadRequestData(ctx) {
  // Fetch data from external API
  const { query } = ctx;
  const { q = '', page = PAGE_DEFAULT, limit = LIMIT_DEFAULT } = query;
  const offset = page * limit;

  const accountClient = getAccountClient(ctx, {});
  const ticketClient = getTicketClient(ctx, {});

  // TODO offset limit
  const [accountResult, ticketResult, listDepartmentResult, listReasonRes] = await Promise.all([
    accountClient.getListEmployee(0, 1000, ''),
    ticketClient.getList(offset, limit, q),
    accountClient.getListDepartment(0, 20, ''),
    ticketClient.getListReason(),
  ]);

  const listDepartment =
    listDepartmentResult?.data?.map((depart) => ({
      ...depart,
      value: depart.code,
      label: depart.name,
    })) || [];

  const total = ticketResult?.total || 0;
  const tickets = ticketResult?.data || [];
  const listUserAssign =
    accountResult?.data?.map((acc) => ({ value: acc.username, label: acc.username })) || [];

  const listReason = listReasonRes?.data?.map((item) => ({ value: item.code, label: item.name }));

  return {
    props: {
      listReason,
      mapListReason: ReasonUtils.convertReasonList(listReasonRes?.data || []),
      listDepartment,
      total,
      tickets,
      listUserAssign,
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
