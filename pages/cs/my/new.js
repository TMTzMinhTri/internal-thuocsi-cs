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
  Drawer,
} from '@material-ui/core';
import { MyCard, MyCardActions, MyCardHeader } from '@thuocsi/nextjs-components/my-card/my-card';
import { v4 as uuidv4 } from 'uuid';
import Head from 'next/head';
import { doWithLoggedInUser, renderWithLoggedInUser } from '@thuocsi/nextjs-components/lib/login';
import AppCuS from 'pages/_layout';

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { makeStyles } from '@material-ui/core/styles';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import EditIcon from '@material-ui/icons/Edit';

import { getOrderClient, getCustomerClient, getAccountClient, getTicketClient } from 'client';
import Router from 'next/router';
import { formatDateTime, ErrorCode } from 'components/global';
import { actionErrorText, unknownErrorText } from 'components/commonErrors';
import { useToast } from '@thuocsi/nextjs-components/toast/useToast';
import MuiMultipleAuto from '@thuocsi/nextjs-components/muiauto/multiple';
import MuiSingleAuto from '@thuocsi/nextjs-components/muiauto/single';
import styles from './request.module.css';

export async function loadRequestData(ctx) {
  const data = {
    props: {
      listDepartment: [],
    },
  };

  const accountClient = getAccountClient(ctx, {});
  const listDepartment = await accountClient.getListDepartment(0, 20, '');
  if (listDepartment.status === 'OK') {
    data.props.listDepartment = listDepartment.data.map((department) => ({
      ...department,
      value: department.code,
      label: department.name,
    }));
  }

  return data;
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

function render(props) {
  const { register, handleSubmit, errors, control, clearErrors, setValue } = useForm({
    defaultValues: {
      imageUrls: [],
    },
    mode: 'onChange',
  });

  const breadcrumb = [
    {
      name: 'Trang chủ',
      link: '/cs',
    },
    {
      name: 'DS yêu cầu cá nhân',
      link: '/cs/my-case',
    },
    {
      name: 'Thêm yêu cầu mới',
    },
  ];

  const { error, success } = useToast();
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

  const onSearchOrder = async () => {
    const orderClient = getOrderClient();
    const resp = await orderClient.getOrderByOrderNo(search);
    if (resp.status !== 'OK') {
      setOrderData(null);
      setListTicket([]);
      setCustomerInf({ bank: '', bankCode: '', bankBranch: '' });
      setValue('bank', '');
      setValue('customerName', '');
      setValue('bankCode', '');
      setValue('bankBranch', '');
      if (resp.status === 'NOT_FOUND') {
        return {
          props: { data: [], count: 0, message: 'Không tìm thấy đơn hàng' },
        };
      }
      return { props: { data: [], count: 0, message: resp.message } };
    }
    setOrderData(resp.data[0]);
    setValue('customerName', resp.data[0].customerName || '');

    const customerClient = getCustomerClient();
    const respCustomer = await customerClient.getListBankAccount(resp.data[0].customerID);
    if (respCustomer.status === 'OK') {
      setValue('bank', respCustomer.data[0].bank);
      setValue('bankCode', respCustomer.data[0].bankCode);
      setValue('bankBranch', respCustomer.data[0].bankBranch);
      clearErrors();
      setCustomerInf(respCustomer.data[0]);
    }

    const ticketClient = getTicketClient();
    const respTicket = await ticketClient.getTicketBySaleOrderCode({
      saleOrderCode: resp.data[0].orderNo,
    });
    if (respTicket.status === 'OK') {
      setListTicket(respTicket.data);
    }
  };

  const onSubmit = async (formData) => {
    try {
      const ticketClient = getTicketClient();
      const ticketResp = await ticketClient.createTicket({
        saleOrderCode: orderData.orderNo,
        saleOrderID: orderData.orderId,
        customerID: orderData.customerID,
        departmentCode: formData.departmentCode.code,
        reasons: formData.reasons.map((reason) => ({
          code: reason.value,
          name: reason.label,
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
      const customerClient = getCustomerClient();
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

  const updateListAssignUser = async (department) => {
    if (department) {
      const accountClient = getAccountClient();
      const accountResp = await accountClient.getListEmployeeByDepartment(department.code);
      if (accountResp.status === 'OK') {
        // cheat to err data
        let tmpData = [];
        accountResp.data.map((account) => {
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

  async function handleChange(event) {
    const { value } = event.target;
    setSearch(value);
  }

  const toggleDrawer = (anchor, open) => {
    setState({ ...state, [anchor]: open });
  };

  return (
    <AppCuS select="/cs/my-case" breadcrumb={breadcrumb}>
      <Head>
        <title>Thêm yêu cầu mới</title>
      </Head>
      <div className={styles.grid}>
        <MyCard>
          <MyCardHeader title="Thêm yêu cầu mới" />
          <form>
            <MyCardActions>
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
                      name="orderNo"
                      inputRef={register({
                        required: 'Vui lòng nhập thông tin',
                      })}
                      variant="outlined"
                      error={!!errors.orderNo}
                      helperText={errors.orderNo?.message}
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
            </MyCardActions>
          </form>
        </MyCard>

        <MyCard>
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
                    <FormLabel component="legend" style={{ fontWeight: 'bold', color: 'black' }}>
                      Tên khách hàng:
                    </FormLabel>
                  </Typography>
                  <TextField
                    name="customerName"
                    inputRef={register({
                      required: 'Vui lòng nhập thông tin',
                    })}
                    disabled={!orderData}
                    variant="outlined"
                    size="small"
                    type="text"
                    fullWidth
                    error={!!errors.customerName}
                    helperText={errors.customerName?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography gutterBottom>
                    <FormLabel component="legend" style={{ fontWeight: 'bold', color: 'black' }}>
                      Số tài khoản:
                    </FormLabel>
                  </Typography>
                  <TextField
                    name="bankCode"
                    inputRef={register({
                      required: 'Vui lòng nhập thông tin',
                    })}
                    disabled={!orderData}
                    variant="outlined"
                    size="small"
                    type="text"
                    fullWidth
                    error={!!errors.bankCode}
                    helperText={errors.bankCode?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography gutterBottom>
                    <FormLabel component="legend" style={{ fontWeight: 'bold', color: 'black' }}>
                      Ngân hàng:
                    </FormLabel>
                  </Typography>
                  <TextField
                    name="bank"
                    inputRef={register({
                      required: 'Vui lòng nhập thông tin',
                    })}
                    disabled={!orderData}
                    variant="outlined"
                    size="small"
                    type="text"
                    fullWidth
                    error={!!errors.bank}
                    helperText={errors.bank?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography gutterBottom>
                    <FormLabel component="legend" style={{ fontWeight: 'bold', color: 'black' }}>
                      Chi nhánh:
                    </FormLabel>
                  </Typography>
                  <TextField
                    name="bankBranch"
                    inputRef={register({
                      required: 'Vui lòng nhập thông tin',
                    })}
                    disabled={!orderData}
                    variant="outlined"
                    size="small"
                    type="text"
                    fullWidth
                    error={!!errors.bankBranch}
                    helperText={errors.bankBranch?.message}
                  />
                </Grid>
              </Grid>
            </FormControl>
          </Paper>
        </MyCard>

        <MyCard>
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
                  <TableCell align="center">Người cập nhật</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              {listTicket.length <= 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="left">
                    {ErrorCode.NOT_FOUND_TABLE}
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
                          <Chip style={{ margin: '3px' }} size="small" label={reason.name} />
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
                                    elevation16: classes.iiDrawerRoot,
                                  },
                                }}
                                anchor="right"
                                open={state[anchor]}
                                onClose={() => toggleDrawer(anchor, false)}
                              />
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
        </MyCard>

        <MyCard>
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
                    <FormLabel component="legend" style={{ fontWeight: 'bold', color: 'black' }}>
                      Chọn lý do: <span style={{ color: 'red' }}>(*)</span>
                    </FormLabel>
                  </Typography>
                  <MuiMultipleAuto
                    name="reasons"
                    options={reasons}
                    required
                    placeholder="Chọn"
                    errors={errors}
                    control={control}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography gutterBottom>
                    <FormLabel component="legend" style={{ fontWeight: 'bold', color: 'black' }}>
                      Chọn bộ phận tiếp nhận:
                      <span style={{ color: 'red' }}>(*)</span>
                    </FormLabel>
                  </Typography>
                  <MuiSingleAuto
                    name="departmentCode"
                    options={props.listDepartment}
                    onValueChange={(data) => updateListAssignUser(data)}
                    required
                    placeholder="Chọn"
                    errors={errors}
                    control={control}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography gutterBottom>
                    <FormLabel component="legend" style={{ fontWeight: 'bold', color: 'black' }}>
                      Chọn người tiếp nhận:
                      <span style={{ color: 'red' }}>(*)</span>
                    </FormLabel>
                  </Typography>
                  <MuiSingleAuto
                    name="assignUser"
                    options={listAssignUser}
                    required
                    placeholder="Chọn"
                    errors={errors}
                    control={control}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography gutterBottom>
                    <FormLabel component="legend" style={{ fontWeight: 'bold', color: 'black' }}>
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
                    <FormLabel component="legend" style={{ fontWeight: 'bold', color: 'black' }}>
                      Số tiền trả lại:
                    </FormLabel>
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
                    <FormLabel component="legend" style={{ fontWeight: 'bold', color: 'black' }}>
                      Ghi chú (hàng trả về):
                      <span style={{ color: 'red' }}>(*)</span>
                    </FormLabel>
                  </Typography>
                  <TextField
                    name="note"
                    inputRef={register({
                      required: 'Vui lòng nhập thông tin',
                    })}
                    error={!!errors.note}
                    helperText={errors.note?.message}
                    variant="outlined"
                    size="small"
                    type="text"
                    fullWidth
                    placeholder="Ghi chú..."
                  />
                </Grid>
                <Grid item container xs={12} justify="flex-end" spacing={1}>
                  <Grid item>
                    <Link href="#id">
                      <Button variant="contained" color="default">
                        Quay lại
                      </Button>
                    </Link>
                  </Grid>
                  <Grid item>
                    <Link href="#id">
                      <Button variant="contained" color="primary" onClick={handleSubmit(onSubmit)}>
                        Lưu
                      </Button>
                    </Link>
                  </Grid>
                </Grid>
              </Grid>
            </FormControl>
          </Paper>
        </MyCard>
      </div>
    </AppCuS>
  );
}
export default function TicketPage(props) {
  return renderWithLoggedInUser(props, render);
}
