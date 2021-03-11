import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Paper,
  FormControl,
  FormLabel,
  TextField,
  Typography,
  Grid,
} from '@material-ui/core';

import Head from 'next/head';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';

import AppCS from 'pages/_layout';

import { actionErrorText, unknownErrorText } from 'components/commonErrors';

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { useForm } from 'react-hook-form';

import { doWithLoggedInUser, renderWithLoggedInUser } from '@thuocsi/nextjs-components/lib/login';
import { MyCard, MyCardContent, MyCardHeader } from '@thuocsi/nextjs-components/my-card/my-card';
import MuiSingleAuto from '@thuocsi/nextjs-components/muiauto/single';
import MuiMultipleAuto from '@thuocsi/nextjs-components/muiauto/multiple';
import { useToast } from '@thuocsi/nextjs-components/toast/useToast';

import { LabelFormCs, TicketTable } from 'components';
import { getData, getFirst, isValid } from 'utils';
import { PATH_URL } from 'data';
import { getTicketClient, getCustomerClient, getAccountClient, getOrderClient } from 'client';
import styles from './request.module.css';

const breadcrumb = [
  {
    name: 'Trang chủ',
    link: '/cs',
  },
  {
    name: 'Thêm yêu cầu mới',
  },
];

export async function loadRequestData(ctx) {
  const accountClient = getAccountClient(ctx, {});
  const ticketClient = getTicketClient(ctx, {});

  const [listDepartmentResult, listReasonsResult] = await Promise.all([
    accountClient.getListDepartment(0, 20, ''),
    ticketClient.getListReason(),
  ]);

  const listDepartment =
    listDepartmentResult?.data?.map((department) => ({
      ...department,
      value: department.code,
      label: department.name,
    })) || [];

  const listReasons = listReasonsResult?.data?.map((item) => ({
    value: item.code,
    label: item.name,
  }));

  return {
    props: {
      listDepartment,
      listReasons,
    },
  };
}

export async function getServerSideProps(ctx) {
  return doWithLoggedInUser(ctx, (cbCtx) => loadRequestData(cbCtx));
}

const PageNewCS = ({ listReasons, listDepartment }) => {
  const router = useRouter();

  const { orderNo } = router.query;
  const [orderData, setOrderData] = useState(null);
  const [listAssignUser, setListAssignUser] = useState([{ value: '', label: '' }]);
  const [search, setSearch] = useState(orderNo);

  const { error, success } = useToast();

  const { register, handleSubmit, errors, control, setValue, getValues } = useForm({
    mode: 'onChange',
  });

  async function handleChange(event) {
    const { value } = event.target;
    setSearch(value);
  }

  const onSearchOrder = useCallback(async (code) => {
    const ticketClient = getTicketClient();
    const orderClient = getOrderClient();

    // get order
    const resp = await orderClient.getOrderByOrderNo(code);
    if (!isValid(resp)) {
      setOrderData(null);
      setValue('customerName', '');
      error('Không tìm thấy thông tin đơn hàng');
      return false;
    }
    // todo
    Router.push(
      {
        pathname: '',
        query: {
          ticketId: code,
        },
      },
      `?orderNo=${code}`,
      { shallow: true },
    );

    const orderDetail = getFirst(resp);

    const { customerName, customerID } = orderDetail;

    const respTicket = await ticketClient.getTicketBySaleOrderCode({
      saleOrderCode: orderDetail.orderNo,
    });
    orderDetail.tickets = getData(respTicket);
    setOrderData(orderDetail);
    setValue('customerName', customerName);
    return false;
  }, []);

  // onSubmit
  const onSubmit = async (formData) => {
    try {
      const ticketClient = getTicketClient();
      const customerClient = getCustomerClient();

      const ticketResp = await ticketClient.createTicket({
        saleOrderCode: orderData.orderNo,
        saleOrderID: orderData.orderId,
        customerID: orderData.customerID,
        departmentCode: formData.departmentCode.code,
        reasons: formData.reasons.map(({ value }) => value),
        returnCode: formData.returnCode,
        cashback: +formData.cashback,
        note: formData.note,
        assignUser: parseInt(formData.assignUser.value, 10),
        bankName: formData.bankName,
        bankAccountName: formData.bankAccountName,
        bankCode: formData.bankCode,
        bankBranch: formData.bankBranch,
      });

      if (ticketResp.status !== 'OK') {
        error(ticketResp.message ?? actionErrorText);
        return;
      }

      await customerClient.updateBankCustomer({
        bankName: formData.bankName,
        bankCode: formData.bankCode,
        bankBranch: formData.bankBranch,
        bankAccountName: formData.bankAccountName,
        accountID: orderData.customerID,
      });

      if (ticketResp.status !== 'OK') {
        error(ticketResp.message ?? actionErrorText);
      } else {
        success('Tạo yêu cầu thành công');
      }
    } catch (err) {
      error(err ?? unknownErrorText);
    }
  };

  const updateListAssignUser = useCallback(async (department) => {
    if (department) {
      const accountClient = getAccountClient();
      const accountResp = await accountClient.getListEmployeeByDepartment(department.code);
      if (accountResp.status === 'OK') {
        // cheat to err data
        const tmpData = [];
        accountResp.data.forEach((account) => {
          if (account && account.username) {
            tmpData.push({ value: account.accountId, label: account.username });
          }
        });
        setListAssignUser(tmpData);
      } else {
        setListAssignUser([{ value: '', label: '' }]);
      }
    } else {
      setListAssignUser([{ value: '', label: '' }]);
    }
  }, []);

  useEffect(() => {
    if (search && search.length > 0) onSearchOrder(search);
  }, [search]);

  return (
    <AppCS select={PATH_URL.ALL_TICKETS} breadcrumb={breadcrumb}>
      <Head>
        <title>Thêm yêu cầu mới</title>
      </Head>
      <div className={styles.grid}>
        <MyCard>
          <MyCardHeader title="Thêm yêu cầu mới" />
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
                  <Grid item xs={12} sm={12} md={7}>
                    <TextField
                      variant="outlined"
                      name="orderNo"
                      error={!!errors.orderNo}
                      helperText={errors.orderNo?.message}
                      inputRef={register({
                        required: 'Vui lòng nhập thông tin',
                      })}
                      size="small"
                      type="text"
                      fullWidth
                      placeholder="Nhập Mã SO"
                      defaultValue={search}
                      onKeyDown={(e) => e.key === 'Enter' && onSearchOrder(getValues('orderNo'))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={5}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => onSearchOrder(getValues('orderNo'))}
                    >
                      Tìm kiếm
                    </Button>
                  </Grid>
                </Grid>
              </FormControl>
            </MyCardContent>
            {orderData && (
              <>
                <Paper className={`${styles.search}`}>
                  <FormControl size="small">
                    <Grid
                      container
                      spacing={3}
                      direction="row"
                      justify="space-between"
                      alignItems="center"
                    >
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography gutterBottom>
                          <LabelFormCs>Tên tài khoản:</LabelFormCs>
                        </Typography>
                        <TextField
                          disabled={!orderData}
                          variant="outlined"
                          size="small"
                          type="text"
                          fullWidth
                          name="bankAcountName"
                          error={!!errors.bankAcountName}
                          helperText={errors.bankAcountName?.message}
                          inputRef={register({
                            required: 'Vui lòng nhập thông tin',
                          })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography gutterBottom>
                          <LabelFormCs>Số tài khoản:</LabelFormCs>
                        </Typography>
                        <TextField
                          disabled={!orderData}
                          variant="outlined"
                          size="small"
                          type="text"
                          fullWidth
                          name="bankCode"
                          error={!!errors.bankCode}
                          helperText={errors.bankCode?.message}
                          inputRef={register({
                            required: 'Vui lòng nhập thông tin',
                          })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography gutterBottom>
                          <LabelFormCs>Ngân hàng:</LabelFormCs>
                        </Typography>
                        <TextField
                          disabled={!orderData}
                          variant="outlined"
                          size="small"
                          type="text"
                          fullWidth
                          name="bankName"
                          error={!!errors.bankName}
                          helperText={errors.bankName?.message}
                          inputRef={register({
                            required: 'Vui lòng nhập thông tin',
                          })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography gutterBottom>
                          <LabelFormCs>Chi nhánh:</LabelFormCs>
                        </Typography>
                        <TextField
                          disabled={!orderData}
                          variant="outlined"
                          size="small"
                          type="text"
                          fullWidth
                          name="bankBranch"
                          error={!!errors.bankBranch}
                          helperText={errors.bankBranch?.message}
                          inputRef={register({
                            required: 'Vui lòng nhập thông tin',
                          })}
                        />
                      </Grid>
                    </Grid>
                  </FormControl>
                </Paper>
                {/* table cs  */}
                <TicketTable data={orderData.tickets} listReasons={listReasons} />

                <Paper className={`${styles.search}`}>
                  <FormControl size="small">
                    <Grid
                      container
                      spacing={3}
                      direction="row"
                      justify="space-between"
                      alignItems="center"
                    >
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography gutterBottom>
                          <LabelFormCs>
                            Chọn lý do: <span style={{ color: 'red' }}>(*)</span>
                          </LabelFormCs>
                        </Typography>
                        <MuiMultipleAuto
                          required
                          name="reasons"
                          options={listReasons}
                          placeholder="Chọn"
                          errors={errors}
                          control={control}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography gutterBottom>
                          <LabelFormCs>
                            Chọn bộ phận tiếp nhận: <span style={{ color: 'red' }}>(*)</span>
                          </LabelFormCs>
                        </Typography>
                        <MuiSingleAuto
                          required
                          onValueChange={(data) => updateListAssignUser(data)}
                          options={listDepartment}
                          placeholder="Chọn"
                          name="departmentCode"
                          errors={errors}
                          control={control}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography gutterBottom>
                          <LabelFormCs>
                            Chọn người tiếp nhận: <span style={{ color: 'red' }}>(*)</span>
                          </LabelFormCs>
                        </Typography>
                        <MuiSingleAuto
                          options={listAssignUser}
                          required
                          placeholder="Chọn"
                          name="assignUser"
                          errors={errors}
                          control={control}
                          defaultValue=""
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography gutterBottom>
                          <FormLabel
                            component="legend"
                            style={{ fontWeight: 'bold', color: 'black' }}
                          >
                            Mã giao hàng tiết kiệm: (Mã return)
                          </FormLabel>
                        </Typography>
                        <TextField
                          name="returnCode"
                          inputRef={register}
                          variant="outlined"
                          size="small"
                          type="text"
                          fullWidth
                          placeholder="0"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={6}>
                        <Typography gutterBottom>
                          <LabelFormCs>Số tiền trả lại:</LabelFormCs>
                        </Typography>
                        <TextField
                          name="cashback"
                          inputRef={register}
                          variant="outlined"
                          size="small"
                          type="number"
                          fullWidth
                          placeholder="0"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={6}>
                        <Typography gutterBottom>
                          <LabelFormCs>
                            Ghi chú (hàng trả về): <span style={{ color: 'red' }}>(*)</span>
                          </LabelFormCs>
                        </Typography>
                        <TextField
                          name="note"
                          error={!!errors.note}
                          helperText={errors.note?.message}
                          inputRef={register({
                            required: 'Vui lòng nhập thông tin',
                          })}
                          variant="outlined"
                          size="small"
                          type="text"
                          fullWidth
                          placeholder="Ghi chú..."
                        />
                      </Grid>
                      <Grid item container xs={12} justify="flex-end" spacing={1}>
                        <Grid item>
                          <Link href="/cs/new">
                            <Button variant="contained" color="default">
                              Quay lại
                            </Button>
                          </Link>
                        </Grid>
                        <Grid item>
                          <Link href="#id">
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={handleSubmit(onSubmit)}
                            >
                              Lưu
                            </Button>
                          </Link>
                        </Grid>
                      </Grid>
                    </Grid>
                  </FormControl>
                </Paper>
              </>
            )}
          </form>
        </MyCard>
      </div>
    </AppCS>
  );
};

export default function index(props) {
  return renderWithLoggedInUser(props, PageNewCS);
}
