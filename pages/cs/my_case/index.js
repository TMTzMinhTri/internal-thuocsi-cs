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
} from "@material-ui/core";

import {
  MyCard,
  MyCardActions,
  MyCardHeader,
} from "@thuocsi/nextjs-components/my-card/my-card";

import {
  doWithLoggedInUser,
  renderWithLoggedInUser,
} from "@thuocsi/nextjs-components/lib/login";

import { ErrorCode, formatUrlSearch } from "components/global";

import { faPlus, faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import EditIcon from "@material-ui/icons/Edit";
import { makeStyles } from "@material-ui/core/styles";
import Head from "next/head";
import AppCuS from "pages/_layout";
import styles from "./request.module.css";
import { useForm } from "react-hook-form";
import Link from "next/link";
import MyTablePagination from "@thuocsi/nextjs-components/my-pagination/my-pagination";
import MuiSingleAuto from "@thuocsi/nextjs-components/muiauto/single";
import { List } from "container/cs/list";
import { reasons } from "components/global";
import { getOrderClient } from "client/order";
import { getAccountClient } from "client/account";
import { getTicketClient } from "client/ticket";
import Router, { useRouter } from "next/router";
import { formatUTCTime, listStatus } from "components/global";

const LIMIT = 20;

export async function getServerSideProps(ctx) {
  return await doWithLoggedInUser(ctx, (ctx) => {
    return loadRequestData(ctx);
  });
}

export async function loadRequestData(ctx) {
  // setup data
  let data = { props: {} };

  // Fetch data from external API
  let query = ctx.query;
  let q = typeof query.q === "undefined" ? "" : query.q;
  let page = query.page || 0;
  let limit = query.limit || 20;
  let offset = page * limit;

  let _client = getOrderClient(ctx, {});
  data.props = await _client.getListOrder(offset, limit, q);
  if (data.props.status !== "OK") {
    return { props: { data: [], count: 0, message: data.props.message } };
  }
  data.props.count = data.props.total;

  const _accountClient = getAccountClient(ctx, {});
  const listDepartment = await _accountClient.getListDepartment(0, 20, "");
  if (listDepartment.status === "OK") {
    data.props.listDepartment = listDepartment.data.map((department) => ({
      ...department,
      value: department.code,
      label: department.name,
    }));
  }

  const accountResp = await _accountClient.getListEmployee(0, 20, "");
  let tmpData = [];
  if (accountResp.status === "OK") {
    // cheat to err data
    accountResp.data.map((account) => {
      if (account && account.username) {
        tmpData.push({
          value: account.username,
          label: account.username,
        });
      }
    });
  }

  data.props.accountInfo = tmpData;

  const _ticketClient = getTicketClient(ctx, {});
  const myTicketResp = await _ticketClient.getTicketByAssignUser();
  data.props.myTicketResp = [];
  if (myTicketResp.status === "OK") {
    data.props.myTicketResp = myTicketResp.data;
  }

  return data;
}

export default function TicketPage(props) {
  return renderWithLoggedInUser(props, render);
}

export function getFirstImage(val) {
  if (val && val.length > 0) {
    return val[0];
  }
  return `/default.png`;
}

const useStyles = makeStyles((theme) => ({
  root: {
    // maxWidth: 00,
  },
  muiDrawerRoot: {
    boxShadow: "none",
  },
  media: {
    height: 0,
    paddingTop: "56.25%", // 16:9
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  BackdropProps: {
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
  list: {
    width: "70vw",
  },
}));

function render(props) {
  const {
    register,
    handleSubmit,
    errors,
    reset,
    control,
    getValues,
    setValue,
  } = useForm({
    defaultValues: {
      imageUrls: [],
    },
    mode: "onChange",
  });
  console.log(props);
  const classes = useStyles();
  let [data, setData] = useState(props);
  const [state, setState] = React.useState({});
  const [myTicketList, setMyTicketList] = useState([]);
  const [expanded, setExpanded] = React.useState(false);
  const [showHideFilter, setShowHideResults] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(
    new Date("2014-08-18T21:11:54")
  );
  let router = useRouter();
  let q = router.query.q || "";
  let limit = parseInt(router.query.limit) || 20;
  let page = parseInt(router.query.page) || 0;
  const [listAssignUser, setListAssignUser] = useState([...props.accountInfo]);
  let [search, setSearch] = useState("");

  useEffect(() => {
    setData(props);
    setSearch(formatUrlSearch(q));
    setMyTicketList(props.myTicketResp);
  }, [props]);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const ShowHideFilter = () => {
    if (showHideFilter === false) {
      setShowHideResults(true);
    } else {
      setShowHideResults(false);
    }
  };

  let breadcrumb = [
    {
      name: "Trang chủ",
      link: "/cs",
    },
    {
      name: "DS yêu cầu cá nhân",
    },
  ];

  const toggleDrawer = (anchor, open) => {
    setState({ ...state, [anchor]: open });
  };

  const onSubmit = async (formData) => {
    const ticketClient = getTicketClient();
    const ticketResp = await ticketClient.getTicketByFilter({
      saleOrderCode: formData.saleOrderCode,
      saleOrderID: +formData.saleOrderID,
      status: formData.status?.value,
      reasons:
        formData.reasons?.length > 0
          ? formData.reasons.map((reason) => ({
              code: reason.value,
              name: reason.label,
            }))
          : null,
      assignUser: formData.assignUser?.value,
      createdTime: formData.createdTime
        ? new Date(formatUTCTime(formData.createdTime)).toISOString()
        : null,
      lastUpdatedTime: formData.lastUpdatedTime
        ? new Date(formatUTCTime(formData.lastUpdatedTime)).toISOString()
        : null,
    });
    if (ticketResp.status === "OK") {
      setData(ticketResp);
    } else {
      setData({ data: [] });
    }
  };

  return (
    <AppCuS select="/cs/all_case" breadcrumb={breadcrumb}>
      <Head>
        <title>DS yêu cầu cá nhân</title>
      </Head>
      <div className={styles.grid}>
        <MyCard>
          <MyCardHeader title="DS yêu cầu cá nhân">
            <Button
              variant="contained"
              color="primary"
              onClick={ShowHideFilter}
              className={styles.cardButton}
              style={{ marginRight: "10px" }}
            >
              <FontAwesomeIcon
                icon={faFilter}
                style={{ paddingRight: "2px" }}
              />
              Bộ lọc
            </Button>
            <Link href="/cs/my_case/new">
              <Button
                variant="contained"
                color="primary"
                className={styles.cardButton}
              >
                <FontAwesomeIcon
                  icon={faPlus}
                  style={{ paddingRight: "2px" }}
                />
                Thêm yêu cầu
              </Button>
            </Link>
          </MyCardHeader>
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
                  {showHideFilter ? null : (
                    <>
                      <Grid item xs={12} sm={12} md={12}>
                        <Typography gutterBottom>
                          <FormLabel
                            component="legend"
                            style={{
                              fontWeight: "bold",
                              color: "black",
                            }}
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
                          onKeyPress={(event) => {
                            if (event.key === "Enter") {
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
                            style={{
                              fontWeight: "bold",
                              color: "black",
                            }}
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
                            style={{
                              fontWeight: "bold",
                              color: "black",
                            }}
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
                            style={{
                              fontWeight: "bold",
                              color: "black",
                            }}
                          >
                            Trạng thái:
                          </FormLabel>
                        </Typography>
                        <MuiSingleAuto
                          name="status"
                          options={listStatus}
                          placeholder="Chọn"
                          fullWidth
                          errors={errors}
                          control={control}
                        ></MuiSingleAuto>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography gutterBottom>
                          <FormLabel
                            component="legend"
                            style={{
                              fontWeight: "bold",
                              color: "black",
                            }}
                          >
                            Lý do:
                          </FormLabel>
                        </Typography>
                        <MuiSingleAuto
                          name="reasons"
                          options={reasons}
                          placeholder="Chọn"
                          fullWidth
                          errors={errors}
                          control={control}
                        ></MuiSingleAuto>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography gutterBottom>
                          <FormLabel
                            component="legend"
                            style={{
                              fontWeight: "bold",
                              color: "black",
                            }}
                          >
                            Người tiếp nhận:
                          </FormLabel>
                        </Typography>
                        <MuiSingleAuto
                          options={listAssignUser}
                          placeholder="Chọn"
                          name="assignUser"
                          fullWidth
                          errors={errors}
                          control={control}
                        ></MuiSingleAuto>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography gutterBottom>
                          <FormLabel
                            component="legend"
                            style={{
                              fontWeight: "bold",
                              color: "black",
                            }}
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
                            style={{
                              fontWeight: "bold",
                              color: "black",
                            }}
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
                      <Grid
                        item
                        container
                        xs={12}
                        justify="flex-end"
                        spacing={1}
                      >
                        <Grid item>
                          <Link href="/cs/all_case/new">
                            <Button variant="contained" color="primary">
                              Xuất file
                            </Button>
                          </Link>
                        </Grid>
                        <Grid item>
                          <Link href="/cs/all_case">
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
            </MyCardActions>
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
              <TableCell align="center">#</TableCell>
              <TableCell align="center">SO#</TableCell>
              <TableCell align="center">Order#</TableCell>
              <TableCell align="left">Lỗi</TableCell>
              <TableCell align="left">Ghi chú của KH</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          {myTicketList.length <= 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="left">
                {ErrorCode["NOT_FOUND_TABLE"]}
              </TableCell>
            </TableRow>
          ) : (
            <TableBody>
              {myTicketList.map((row, i) => (
                <TableRow key={i}>
                  <TableCell align="left">{row.code}</TableCell>
                  <TableCell align="left">{row.saleOrderCode}</TableCell>
                  <TableCell align="left">{row.saleOrderID}</TableCell>
                  <TableCell align="left">
                    {row.reasons.map((reason) => (
                      <Chip
                        style={{ margin: "3px" }}
                        size="small"
                        label={reason.name}
                      />
                    ))}
                  </TableCell>
                  <TableCell align="left">{row.note}</TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={
                        listStatus.filter(
                          (status) => status.value === row.status
                        )[0].label
                      }
                    />
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
          {myTicketList.length > 0 ? (
            <MyTablePagination
              labelUnit="yêu cầu"
              count={myTicketList.length}
              rowsPerPage={limit}
              page={page}
              onChangePage={(event, page, rowsPerPage) => {
                Router.push(
                  `/cs/my_case?page=${page}&limit=${rowsPerPage}&q=${search}`
                );
              }}
            />
          ) : (
            <div />
          )}
        </Table>
      </TableContainer>
    </AppCuS>
  );
}
