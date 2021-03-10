import React, { useEffect, useState } from 'react';
import { Button, FormControl, TextField, Typography, Grid } from '@material-ui/core';

import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';

import AppCS from 'pages/_layout';

import { formatUTCTime, listStatus, formatUrlSearch } from 'components/global';

import { faPlus, faFilter } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useForm } from 'react-hook-form';
import { getAccountClient, getTicketClient } from 'client';

import MuiSingleAuto from '@thuocsi/nextjs-components/muiauto/single';
import MuiMultipleAuto from '@thuocsi/nextjs-components/muiauto/multiple';
import { doWithLoggedInUser, renderWithLoggedInUser } from '@thuocsi/nextjs-components/lib/login';
import { MyCard, MyCardContent, MyCardHeader } from '@thuocsi/nextjs-components/my-card/my-card';
import { LIMIT_DEFAULT, PAGE_DEFAULT } from 'data';

import { LabelFormCs } from 'components/atoms';
import { TableCs, DrawerEdit } from 'components/organisms';
import { getData, isValid, ReasonUtils } from 'utils';
import useModal from 'hooks/useModal';
import styles from './request.module.css';

export async function loadRequestData(ctx) {
  // Fetch data from external API
  const { query } = ctx;
  const { q = '', page = PAGE_DEFAULT, limit = LIMIT_DEFAULT } = query;
  const offset = page * limit;

  const accountClient = getAccountClient(ctx, {});
  const ticketClient = getTicketClient(ctx, {});

  // TODO offset limit
  const [accountResult, ticketResult, listDepartmentResult, listReason] = await Promise.all([
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
  const usersAssign =
    accountResult?.data?.map((acc) => ({ value: acc.username, label: acc.username })) || [];

  console.log('listReason >>> ', listReason);

  return {
    props: {
      listReason: listReason?.data || [],
      mapListReason: ReasonUtils.convertReasonList(listReason?.data || []),
      listDepartment,
      total,
      tickets,
      usersAssign,
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

const ListTicketPage = (props) => {
  const { usersAssign, total, tickets, listReason, mapListReason } = props;

  const { register, handleSubmit, errors, control, getValues } = useForm({
    defaultValues: {
      imageUrls: [],
    },
    mode: 'onChange',
  });

  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showHideFilter, toggleFilter] = useModal(false);

  const q = router.query.q || '';

  const [listTickets, setListickets] = useState(tickets);

  const limit = parseInt(router.query.limit, 10) || LIMIT_DEFAULT;
  const page = parseInt(router.query.page, 10) || PAGE_DEFAULT;

  useEffect(() => {
    setSearch(formatUrlSearch(q));
  }, [props]);

  const debounceSearchAssignUser = async (q) => {
    const accountClient = getAccountClient();
    const accountResp = await accountClient.getListEmployeeFromClient(0, 100, q);

    if (!isValid(accountResp)) {
      return [];
      // cheat to err data
    }
    return accountResp.data.map(({ username }) => ({ value: username, label: username }));
  };

  const onSubmit = async ({
    saleOrderCode,
    saleOrderID,
    status,
    reasons,
    assignUser,
    createdTime,
    lastUpdatedTime,
  }) => {
    const ticketClient = getTicketClient();
    const ticketResp = await ticketClient.getTicketByFilter({
      saleOrderCode,
      saleOrderID,
      status: status?.value,
      reasons:
        reasons?.length > 0
          ? reasons.map((reason) => ({ code: reason.value, name: reason.label }))
          : null,
      assignUser: assignUser?.value,
      createdTime: createdTime ? new Date(formatUTCTime(createdTime)).toISOString() : null,
      lastUpdatedTime: lastUpdatedTime
        ? new Date(formatUTCTime(lastUpdatedTime)).toISOString()
        : null,
    });
    setListickets(getData(ticketResp));
  };
  const [showEditPopup, toggleEdit] = useModal(false);

  const handleBtnEdit = (id) => {
    // show modal
    toggleEdit();
    // get info
    console.log(id);
  };

  // const toggleDrawer = (anchor, open) => {
  //   setState({ ...state, [anchor]: open });
  // };

  console.log('listReasons >> ', listReason);
  console.log('mapListReason > ', mapListReason);

  return (
    <AppCS select="/cs/all-case" breadcrumb={breadcrumb}>
      <Head>
        <title>DS phiếu yêu cầu</title>
      </Head>
      <div className={styles.grid}>
        <MyCard>
          <MyCardHeader title="Danh sách yêu cầu">
            <Button
              variant="contained"
              color="primary"
              onClick={toggleFilter}
              className={styles.cardButton}
              style={{ marginRight: '10px' }}
            >
              <FontAwesomeIcon icon={faFilter} style={{ marginRight: 8 }} />
              Bộ lọc
            </Button>
            <Link href="/cs/all-case/new">
              <Button variant="contained" color="primary" className={styles.cardButton}>
                <FontAwesomeIcon icon={faPlus} style={{ marginRight: 8 }} />
                Thêm yêu cầu
              </Button>
            </Link>
          </MyCardHeader>
          <form>
            <MyCardContent>
              <FormControl size="small">
                <Grid
                  container
                  spacing={3}
                  direction="row"
                  justify="space-between"
                  alignItems="center"
                >
                  {!showHideFilter && (
                    <>
                      <Grid item xs={12} sm={12} md={12}>
                        <Typography gutterBottom>
                          <LabelFormCs>Mã SO:</LabelFormCs>
                        </Typography>
                        <TextField
                          variant="outlined"
                          size="small"
                          type="text"
                          name="saleOrderCode"
                          inputRef={register}
                          fullWidth
                          placeholder="Nhập Mã SO"
                          onKeyPress={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              onSubmit(getValues());
                            }
                          }}
                        />
                      </Grid>
                    </>
                  )}
                  {showHideFilter && (
                    <>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography gutterBottom>
                          <LabelFormCs>Mã SO:</LabelFormCs>
                        </Typography>
                        <TextField
                          name="saleOrderCode"
                          inputRef={register}
                          variant="outlined"
                          size="small"
                          type="text"
                          fullWidth
                          placeholder="Nhập Mã SO"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography gutterBottom>
                          <LabelFormCs>Order ID:</LabelFormCs>
                        </Typography>
                        <TextField
                          name="saleOrderID"
                          inputRef={register}
                          variant="outlined"
                          size="small"
                          type="text"
                          fullWidth
                          placeholder="Nhập Order ID"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography gutterBottom>
                          <LabelFormCs>Trạng thái:</LabelFormCs>
                        </Typography>
                        <MuiSingleAuto
                          options={listStatus}
                          placeholder="Chọn"
                          name="status"
                          errors={errors}
                          control={control}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography gutterBottom>
                          <LabelFormCs>Lý do:</LabelFormCs>
                        </Typography>
                        <MuiMultipleAuto
                          name="reasons"
                          options={listReason}
                          placeholder="Chọn"
                          errors={errors}
                          control={control}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography gutterBottom>
                          <LabelFormCs>Người tiếp nhận:</LabelFormCs>
                        </Typography>
                        <MuiSingleAuto
                          options={usersAssign}
                          onFieldChange={debounceSearchAssignUser}
                          placeholder="Chọn"
                          name="assignUser"
                          errors={errors}
                          control={control}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography gutterBottom>
                          <LabelFormCs>Ngày bắt đầu:</LabelFormCs>
                        </Typography>
                        <TextField
                          name="createdTime"
                          inputRef={register}
                          variant="outlined"
                          size="small"
                          fullWidth
                          type="datetime-local"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography gutterBottom>
                          <LabelFormCs>Ngày kết thúc:</LabelFormCs>
                        </Typography>
                        <TextField
                          name="lastUpdatedTime"
                          inputRef={register}
                          variant="outlined"
                          size="small"
                          fullWidth
                          type="datetime-local"
                        />
                      </Grid>
                      <Grid item container xs={12} justify="flex-end" spacing={1}>
                        <Grid item>
                          <Link href="/cs/all-case/new">
                            <Button variant="contained" color="primary">
                              Xuất file
                            </Button>
                          </Link>
                        </Grid>
                        <Grid item>
                          <Link href="/cs/all-case/new">
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={handleSubmit(onSubmit)}
                            >
                              Tìm kiếm
                            </Button>
                          </Link>
                        </Grid>
                      </Grid>
                    </>
                  )}
                </Grid>
              </FormControl>
            </MyCardContent>
          </form>
        </MyCard>
      </div>
      {/* table cs  */}
      <TableCs
        data={listTickets}
        total={total}
        page={page}
        limit={limit}
        search={search}
        listReasons={listReason}
        mapListReason={mapListReason}
        onClickBtnEdit={handleBtnEdit}
      />
      <DrawerEdit isOpen={showEditPopup} onClose={toggleEdit} />
    </AppCS>
  );
};

const index = (props) => renderWithLoggedInUser(props, ListTicketPage);

export default index;
