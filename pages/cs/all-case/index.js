import React, { useEffect, useState } from 'react';
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
  makeStyles,
  Drawer,
} from '@material-ui/core';

import Link from 'next/link';
import Head from 'next/head';
import Router, { useRouter } from 'next/router';

import AppCS from 'pages/_layout';

import { formatUTCTime, listStatus, ErrorCode, formatUrlSearch, reasons } from 'components/global';

import { faPlus, faFilter } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import EditIcon from '@material-ui/icons/Edit';

import { useForm } from 'react-hook-form';
import { getOrderClient, getAccountClient, getTicketClient } from 'client';

import { v4 as uuidv4 } from 'uuid';

import MyTablePagination from '@thuocsi/nextjs-components/my-pagination/my-pagination';
import MuiSingleAuto from '@thuocsi/nextjs-components/muiauto/single';
import MuiMultipleAuto from '@thuocsi/nextjs-components/muiauto/multiple';
import { doWithLoggedInUser, renderWithLoggedInUser } from '@thuocsi/nextjs-components/lib/login';
import { MyCard, MyCardContent, MyCardHeader } from '@thuocsi/nextjs-components/my-card/my-card';

import List from 'container/cs/list';
import styles from './request.module.css';

export async function loadRequestData(ctx) {
  // Fetch data from external API
  const { query } = ctx;
  const { q = '', page = 0, limit = 20 } = query;
  const offset = page * limit;

  const accountClient = getAccountClient(ctx, {});
  const ticketClient = getTicketClient(ctx, {});

  // TODO offset limit
  const [accountResult, ticketResult, listDepartmentResult] = await Promise.all([
    accountClient.getListEmployee(0, 1000, ''),
    ticketClient.getList(offset, limit, q),
    accountClient.getListDepartment(0, 20, ''),
  ]);

  const listDepartment =
    listDepartmentResult?.data?.map((depart) => ({
      ...depart,
      value: depart.code,
      label: depart.name,
    })) || [];

  const total = ticketResult?.total || 0;
  const data = ticketResult?.data || [];
  const usersAssign =
    accountResult?.data?.map((acc) => ({ value: acc.username, label: acc.username })) || [];

  return {
    props: {
      listDepartment,
      total,
      data,
      usersAssign,
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

const ListTicketPage = (props) => {
  const { usersAssign, total } = props;

  const { register, handleSubmit, errors, control, getValues } = useForm({
    defaultValues: {
      imageUrls: [],
    },
    mode: 'onChange',
  });

  const router = useRouter();
  const [search, setSearch] = useState('');

  const q = router.query.q || '';

  const [data, setData] = useState(props);
  const [listAssignUser, setListAssignUser] = useState([...usersAssign]);

  const limit = parseInt(router.query.limit) || 5;
  const page = parseInt(router.query.page) || 0;

  useEffect(() => {
    setData(props);
    setSearch(formatUrlSearch(q));
  }, [props]);

  const [showHideFilter, setShowHideResults] = React.useState(false);
  const ShowHideFilter = () => {
    if (showHideFilter === false) {
      setShowHideResults(true);
    } else {
      setShowHideResults(false);
    }
  };

  const breadcrumb = [
    {
      name: 'Trang chủ',
      link: '/cs',
    },
    {
      name: 'DS phiếu yêu cầu',
    },
  ];

  const classes = useStyles();

  const [state, setState] = React.useState({});

  const debounceSearchAssignUser = async (q) => {
    const accountClient = getAccountClient();
    const accountResp = await accountClient.getListEmployeeFromClient(0, 20, q);
    const tmpData = [];
    if (accountResp.status === 'OK') {
      // cheat to err data
      accountResp.data.forEach((account) => {
        if (account && account.username) {
          tmpData.push({ value: account.username, label: account.username });
        }
      });
    }
    return tmpData;
  };

  const onSubmit = async (formData) => {
    const ticketClient = getTicketClient();
    const ticketResp = await ticketClient.getTicketByFilter({
      saleOrderCode: formData.saleOrderCode,
      saleOrderID: +formData.saleOrderID,
      status: formData.status?.value,
      reasons:
        formData.reasons?.length > 0
          ? formData.reasons.map((reason) => ({ code: reason.value, name: reason.label }))
          : null,
      assignUser: formData.assignUser?.value,
      createdTime: formData.createdTime
        ? new Date(formatUTCTime(formData.createdTime)).toISOString()
        : null,
      lastUpdatedTime: formData.lastUpdatedTime
        ? new Date(formatUTCTime(formData.lastUpdatedTime)).toISOString()
        : null,
    });
    if (ticketResp.status === 'OK') {
      setData(ticketResp);
    } else {
      setData({ data: [] });
    }
  };

  const toggleDrawer = (anchor, open) => {
    setState({ ...state, [anchor]: open });
  };

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
              onClick={ShowHideFilter}
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
                  {showHideFilter ? null : (
                    <>
                      <Grid item xs={12} sm={12} md={12}>
                        <Typography gutterBottom>
                          <FormLabel
                            component="legend"
                            style={{ fontWeight: 'bold', color: 'black' }}
                          >
                            Mã SO:
                          </FormLabel>
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
                  {showHideFilter ? (
                    <>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography gutterBottom>
                          <FormLabel
                            component="legend"
                            style={{ fontWeight: 'bold', color: 'black' }}
                          >
                            Mã SO:
                          </FormLabel>
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
                          <FormLabel
                            component="legend"
                            style={{ fontWeight: 'bold', color: 'black' }}
                          >
                            Order ID:
                          </FormLabel>
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
                          <FormLabel
                            component="legend"
                            style={{ fontWeight: 'bold', color: 'black' }}
                          >
                            Trạng thái:
                          </FormLabel>
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
                          <FormLabel
                            component="legend"
                            style={{ fontWeight: 'bold', color: 'black' }}
                          >
                            Lý do:
                          </FormLabel>
                        </Typography>
                        <MuiMultipleAuto
                          name="reasons"
                          options={reasons}
                          placeholder="Chọn"
                          errors={errors}
                          control={control}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography gutterBottom>
                          <FormLabel
                            component="legend"
                            style={{ fontWeight: 'bold', color: 'black' }}
                          >
                            Người tiếp nhận:
                          </FormLabel>
                        </Typography>
                        <MuiSingleAuto
                          options={listAssignUser}
                          onFieldChange={debounceSearchAssignUser}
                          placeholder="Chọn"
                          name="assignUser"
                          errors={errors}
                          control={control}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography gutterBottom>
                          <FormLabel
                            component="legend"
                            style={{ fontWeight: 'bold', color: 'black' }}
                          >
                            Ngày bắt đầu:
                          </FormLabel>
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
                          <FormLabel
                            component="legend"
                            style={{ fontWeight: 'bold', color: 'black' }}
                          >
                            Ngày kết thúc:
                          </FormLabel>
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
                  ) : null}
                </Grid>
              </FormControl>
            </MyCardContent>
          </form>
        </MyCard>
      </div>

      <TableContainer component={Paper}>
        <Table size="small" aria-label="a dense table">
          <colgroup>
            <col width="5%" />
            <col width="5%" />
            <col width="5%" />
            <col width="15%" />
            <col width="20%" />
            <col width="15%" />
            <col width="10%" />
            <col width="5%" />
            <col width="5%" />
            <col width="5%" />
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell align="center">#Mã Phiếu</TableCell>
              <TableCell align="center">SO#</TableCell>
              <TableCell align="center">Số lượng#</TableCell>
              <TableCell align="left">Lỗi</TableCell>
              <TableCell align="left">Ghi chú của KH</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          {data.total <= 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="left">
                {ErrorCode.NOT_FOUND_TABLE}
              </TableCell>
            </TableRow>
          ) : (
            <TableBody>
              {data.data.map((row) => (
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
                  <TableCell align="center">
                    {listStatus.filter((status) => status.value === row.status)[0].label}
                  </TableCell>
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
                              idxPage
                              toggleDrawer={toggleDrawer}
                              anchor={anchor}
                              listDepartment={props.listDepartment}
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
          {data.count > 0 && (
            <MyTablePagination
              labelUnit="yêu cầu"
              count={total}
              rowsPerPage={limit}
              page={page}
              onChangePage={(event, newPage, rowsPerPage) => {
                Router.push(`/cs/all-case?page=${newPage}&limit=${rowsPerPage}&q=${search}`);
              }}
            />
          )}
        </Table>
      </TableContainer>
    </AppCS>
  );
};

const index = (props) => renderWithLoggedInUser(props, ListTicketPage);

export default index;
