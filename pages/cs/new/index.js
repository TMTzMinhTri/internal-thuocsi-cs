import React, { useState } from 'react';
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  FormLabel,
  TextField,
  IconButton,
  Typography,
  Grid,
  Tooltip,
  Chip,
} from '@material-ui/core';

import Head from 'next/head';
import Link from 'next/link';
import Router from 'next/router';

import AppCS from 'pages/_layout';

import { v4 as uuidv4 } from 'uuid';

import { formatDateTime } from 'components/global';
import { actionErrorText, unknownErrorText } from 'components/commonErrors';

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { makeStyles } from '@material-ui/core/styles';
import { useForm } from 'react-hook-form';

import { doWithLoggedInUser, renderWithLoggedInUser } from '@thuocsi/nextjs-components/lib/login';
import { MyCard, MyCardContent, MyCardHeader } from '@thuocsi/nextjs-components/my-card/my-card';
import MuiSingleAuto from '@thuocsi/nextjs-components/muiauto/single';
import MuiMultipleAuto from '@thuocsi/nextjs-components/muiauto/multiple';
import { useToast } from '@thuocsi/nextjs-components/toast/useToast';

import EditIcon from '@material-ui/icons/Edit';
import Drawer from '@material-ui/core/Drawer';
import { LabelFormCs } from 'components/atoms';
import { getData, getFirst, isValid } from 'utils';
import { PATH_URL } from 'data';
import { getTicketClient, getCustomerClient, getAccountClient, getOrderClient } from 'client';
import List from 'container/cs/list';
import styles from './request.module.css';

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

  return {
    props: {
      listDepartment,
      listReasons: listReasonsResult?.data || [],
    },
  };
}
export async function getServerSideProps(ctx) {
  return doWithLoggedInUser(ctx, (cbCtx) => loadRequestData(cbCtx));
}

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 800,
  },
  muiDrawerRoot: {
    boxShadow: 'none',
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  BackdropProps: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  list: {
    width: '70vw',
  },
}));

const PageNewCS = (props) => {
  const { listReasons, listDepartment } = props;
  const [state, setState] = React.useState({});

  const [orderData, setOrderData] = useState();

  const [listTicket, setListTicket] = useState([]);

  const [listAssignUser, setListAssignUser] = useState([{ value: '', label: '' }]);

  const [search, setSearch] = useState();
  const [customerInf, setCustomerInf] = useState({
    bank: '',
    bankCode: '',
    bankBranch: '',
  });

  const classes = useStyles();
  const { error, success } = useToast();

  const { register, handleSubmit, errors, control, clearErrors, setValue } = useForm({
    defaultValues: {
      imageUrls: [],
    },
    mode: 'onChange',
  });

  async function handleChange(event) {
    const { value } = event.target;
    setSearch(value);
  }

  const onSearchOrder = async () => {
    const ticketClient = getTicketClient();
    const customerClient = getCustomerClient();
    const orderClient = getOrderClient();

    const resp = await orderClient.getOrderByOrderNo(search);

    if (!isValid(resp)) {
      // setOrderData(null);
      // setListTicket([]);
      // setCustomerInf({ bank: '', bankCode: '', bankBranch: '' });
      // setValue('bank', '');
      // setValue('customerName', '');
      // setValue('bankCode', '');
      // setValue('bankBranch', '');
      // if (resp.status === 'NOT_FOUND') {
      //   return {
      //     props: { data: [], count: 0, message: 'Không tìm thấy đơn hàng' },
      //   };
      // }
      // return { props: { data: [], count: 0, message: resp.message } };
      return false;
    }
    const searchOrderData = getData(resp);
    setOrderData(searchOrderData);
    const { customerName, customerID } = searchOrderData;
    setValue('customerName', customerName);

    const respCustomer = await customerClient.getListBankAccount(customerID);
    if (isValid(respCustomer)) {
      const customerInfo = getFirst(respCustomer);
      const { bank, bankCode, bankBranch } = customerInfo;
      setValue('bank', bank);
      setValue('bankCode', bankCode);
      setValue('bankBranch', bankBranch);
      clearErrors();
      setCustomerInf(customerInfo);
    }

    const respTicket = await ticketClient.getTicketBySaleOrderCode({
      saleOrderCode: searchOrderData.orderNo,
    });

    if (isValid(respTicket)) {
      setListTicket(respTicket.data);
    }
  };

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
        reasons: formData.reasons.map(({ value, label }) => ({
          code: value,
          name: label,
        })),
        returnCode: formData.returnCode,
        cashback: +formData.cashback,
        note: formData.note,
        assignUser: formData.assignUser.value.toString(),
      });

      if (ticketResp.status !== 'OK') {
        error(ticketResp.message ?? actionErrorText);
        return;
      }

      const customerResp = await customerClient.updateBankCustomer({
        bank: formData.bank,
        bankCode: formData.bankCode,
        bankBranch: formData.bankBranch,
        customerID: orderData.customerID,
      });

      if (customerResp.status !== 'OK') {
        error(customerResp.message ?? actionErrorText);
      } else {
        success('Tạo yêu cầu thành công');
        Router.push('/cs');
      }
    } catch (err) {
      error(err ?? unknownErrorText);
    }
  };

  const breadcrumb = [
    {
      name: 'Trang chủ',
      link: '/cs',
    },
    {
      name: 'DS yêu cầu cá nhân',
      link: '/cs',
    },
    {
      name: 'Thêm yêu cầu mới',
    },
  ];

  const updateListAssignUser = async (department) => {
    if (department) {
      const accountClient = getAccountClient();
      const accountResp = await accountClient.getListEmployeeByDepartment(department.code);
      if (accountResp.status === 'OK') {
        // cheat to err data
        const tmpData = [];
        accountResp.data.forEach((account) => {
          if (account && account.username) {
            tmpData.push({ value: account.username, label: account.username });
          }
        });
        setListAssignUser(tmpData);
      } else {
        setListAssignUser([{ value: '', label: '' }]);
      }
    } else {
      setListAssignUser([{ value: '', label: '' }]);
    }
  };

  const toggleDrawer = (anchor, open) => {
    setState({ ...state, [anchor]: open });
  };

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
                      onChange={handleChange}
                      size="small"
                      type="text"
                      fullWidth
                      placeholder="Nhập Mã SO"
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={5}>
                    <Button variant="contained" color="primary" onClick={() => onSearchOrder()}>
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
                          <LabelFormCs>Tên khách hàng:</LabelFormCs>
                        </Typography>
                        <TextField
                          disabled={!orderData}
                          variant="outlined"
                          size="small"
                          type="text"
                          fullWidth
                          name="customerName"
                          error={!!errors.customerName}
                          helperText={errors.customerName?.message}
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
                          name="bank"
                          error={!!errors.bank}
                          helperText={errors.bank?.message}
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
                <TableContainer component={Paper}>
                  <Table size="small" aria-label="a dense table">
                    <colgroup>
                      <col width="5%" />
                      <col width="5%" />
                      <col width="5%" />
                      <col width="15%" />
                      <col width="15%" />
                      <col width="20%" />
                      <col width="15%" />
                      <col width="15%" />
                    </colgroup>
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">#</TableCell>
                        <TableCell align="center">SO#</TableCell>
                        <TableCell align="center">Order#</TableCell>
                        <TableCell align="left">Lỗi</TableCell>
                        <TableCell align="left">Mô tả</TableCell>
                        <TableCell align="center">Khách hàng</TableCell>
                        <TableCell align="center">Người tạo</TableCell>
                        <TableCell align="center">Ngày tạo</TableCell>
                        <TableCell align="center">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    {listTicket.length <= 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="left">
                          Không có yêu cầu nào cả
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableBody>
                        {listTicket.map((row) => (
                          <TableRow key={uuidv4()}>
                            <TableCell align="center">{row.code}</TableCell>
                            <TableCell align="center">{row.saleOrderCode}</TableCell>
                            <TableCell align="center">{row.saleOrderID}</TableCell>
                            <TableCell align="left">
                              {row.reasons.map((reason) => (
                                <Chip
                                  key={uuidv4()}
                                  style={{ margin: '3px' }}
                                  size="small"
                                  label={reason.name}
                                />
                              ))}
                            </TableCell>
                            <TableCell align="left">{row.note}</TableCell>
                            <TableCell align="center">{orderData.customerName}</TableCell>
                            <TableCell align="center">{row.createdBy}</TableCell>
                            <TableCell align="center">{formatDateTime(row.createdTime)}</TableCell>
                            <TableCell align="center">
                              <div>
                                {[`right${row.code}`].map((anchor) => (
                                  <React.Fragment key={anchor}>
                                    <a onClick={() => toggleDrawer(anchor, true)}>
                                      <Tooltip title="Cập nhật thông tin của yêu cầu">
                                        <IconButton>
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </a>
                                    <Drawer
                                      ModalProps={{
                                        BackdropProps: {
                                          classes: {
                                            root: classes.BackdropProps,
                                          },
                                        },
                                      }}
                                      PaperProps={{
                                        classes: {
                                          elevation16: classes.muiDrawerRoot,
                                        },
                                      }}
                                      anchor="right"
                                      open={state[anchor]}
                                      onClose={() => toggleDrawer(anchor, false)}
                                    >
                                      <List
                                        resetData={onSearchOrder}
                                        toggleDrawer={toggleDrawer}
                                        anchor={anchor}
                                        listDepartment={listDepartment}
                                        row={row}
                                      />
                                    </Drawer>
                                  </React.Fragment>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    )}
                  </Table>
                </TableContainer>
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
                          <Link href={PATH_URL.NEW_TICKETS}>
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
