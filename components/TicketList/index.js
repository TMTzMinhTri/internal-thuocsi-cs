import React, { useCallback, useState } from 'react';
import { Button, FormControl, TextField, Typography, Grid } from '@material-ui/core';

import Link from 'next/link';
import { useRouter } from 'next/router';

import { formatUTCTime, listStatus } from 'components/global';

import { faPlus, faFilter } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useForm } from 'react-hook-form';
import { getAccountClient, getOrderClient, getTicketClient } from 'client';

import MuiSingleAuto from '@thuocsi/nextjs-components/muiauto/single';
import MuiMultipleAuto from '@thuocsi/nextjs-components/muiauto/multiple';
import { MyCard, MyCardContent, MyCardHeader } from '@thuocsi/nextjs-components/my-card/my-card';
import { LIMIT_DEFAULT, PAGE_DEFAULT } from 'data';
import useModal from 'hooks/useModal';

import { getData, getFirst, isValid } from 'utils';
import TicketTable from '../TicketTable';
import TicketEdit from '../TicketEdit';
import LabelFormCs from '../LabelFormCs';

import styles from './request.module.css';

const TicketList = ({ total, tickets, listReason }) => {
  const [search, setSearch] = useState('');
  const [listTickets, setListickets] = useState(tickets);
  const [listDepartment, setListDepartment] = useState([]);
  const [listUserAssign, setListUserAssign] = useState([]);
  // Modal
  const [showHideFilter, toggleFilter] = useModal(false);
  const [detail, setDetail] = useState(null);
  // const [showHideFilter, toggleModalEdit] = useModal(false);

  const { register, handleSubmit, errors, control, getValues } = useForm({
    defaultValues: {},
    mode: 'onChange',
  });

  const router = useRouter();

  // query + params
  const pathName = router.pathname;
  const limit = parseInt(router.query.limit, 10) || LIMIT_DEFAULT;
  const page = parseInt(router.query.page, 10) || PAGE_DEFAULT;

  // function
  const onSubmit = useCallback(
    async ({
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
    },
    [],
  );

  const handleBtnEdit = useCallback(async (code) => {
    // init client
    const ticketClient = getTicketClient();
    const orderClient = getOrderClient();
    const accountClient = getAccountClient();

    // validate list department
    if (listDepartment.length === 0) {
      const listDepartmentRes = await accountClient.clientGetListDepartment(0, 20, '');
      if (isValid(listDepartmentRes)) {
        setListDepartment(
          listDepartmentRes?.data?.map((depart) => ({
            ...depart,
            value: depart.code,
            label: depart.name,
          })) || [],
        );
      }
    }

    // validate user assign
    if (listUserAssign.length === 0) {
      const listUserAssignRes = await accountClient.clientGetListEmployee(0, 10, '');
      if (isValid(listUserAssignRes)) {
        setListUserAssign(
          listUserAssignRes?.data?.map((acc) => ({
            value: acc.accountId || '',
            label: acc.username || '',
          })) || [],
        );
      }
    }

    // always get data detail
    const [ticketRes] = await Promise.all([ticketClient.clientGetTicketDetail({ code })]);
    // const ticketRes = await ticketClient.clientGetTicketDetail({ code });
    if (isValid(ticketRes)) {
      const ticketData = getFirst(ticketRes);
      const orderRes = await orderClient.getOrderByOrderNo(ticketData.saleOrderCode);

      if (isValid(orderRes)) {
        const orderInfo = getFirst(orderRes);
        ticketData.customerName = orderInfo.customerName;
        ticketData.customerPhone = orderInfo.customerPhone;
        ticketData.totalPrice = orderInfo.totalPrice;
        ticketData.orderCreatedTime = orderInfo.createdTime;
      }

      // account

      // list reasons

      // department

      setDetail(ticketData);
    }
  }, []);

  const handleCloseBtnEdit = () => {
    setDetail(null);
  };

  const debounceSearchAssignUser = useCallback(async (q) => {
    const accountClient = getAccountClient();
    const accountResp = await accountClient.getListEmployeeFromClient(0, 100, q);

    if (!isValid(accountResp)) {
      return [];
    }

    return accountResp.data.map(({ username }) => ({ value: username, label: username }));
  }, []);

  return (
    <>
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
            <Link href={`${pathName}/new`}>
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
                          options={listUserAssign}
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
                          <Link href={`${pathName}/new`}>
                            <Button variant="contained" color="primary">
                              Xuất file
                            </Button>
                          </Link>
                        </Grid>
                        <Grid item>
                          <Link href={`${pathName}/new`}>
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
      {detail && (
        <TicketEdit
          isOpen
          onClose={handleCloseBtnEdit}
          listReason={listReason}
          listAssignUser={listUserAssign}
          listDepartment={listDepartment}
          ticketDetail={detail}
        />
      )}
      {/* table cs  */}
      <TicketTable
        data={listTickets}
        total={total}
        page={page}
        limit={limit}
        search={search}
        listReasons={listReason}
        onClickBtnEdit={handleBtnEdit}
      />
    </>
  );
};

export default TicketList;
