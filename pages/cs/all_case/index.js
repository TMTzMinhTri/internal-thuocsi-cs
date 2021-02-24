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
} from "@material-ui/core";

import clsx from "clsx";
import Drawer from "@material-ui/core/Drawer";
import Router, { useRouter } from "next/router";
import { formatUTCTime } from "components/global"
import {
  ErrorCode,
  formatEllipsisText,
  formatMessageError,
  formatUrlSearch,
} from "components/global";
import { getOrderClient } from "client/order";

import { faPlus, faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import React, { useEffect, useState } from "react";
import {
  MyCard,
  MyCardContent,
  MyCardHeader,
} from "@thuocsi/nextjs-components/my-card/my-card";

import EditIcon from "@material-ui/icons/Edit";

import { makeStyles } from "@material-ui/core/styles";
import { red } from "@material-ui/core/colors";

import Head from "next/head";
import {
  doWithLoggedInUser,
  renderWithLoggedInUser,
} from "@thuocsi/nextjs-components/lib/login";
import AppCS from "pages/_layout";
import styles from "./request.module.css";
import { useForm } from "react-hook-form";
import Link from "next/link";
import MyTablePagination from "@thuocsi/nextjs-components/my-pagination/my-pagination";
import MuiSingleAuto from "@thuocsi/nextjs-components/muiauto/single";
import MuiMultipleAuto from "@thuocsi/nextjs-components/muiauto/multiple";
import { reasons } from "components/global";
import { getAccountClient } from "client/account";
import { getTicketClient } from "client/ticket";

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

  const accountClient = getAccountClient(ctx, {});
  const listDepartment = await accountClient.getListDepartment(0, 20, "");
  if (listDepartment.status === "OK") {
    data.props.listDepartment = listDepartment.data.map((department) => ({
      ...department,
      value: department.code,
      label: department.name,
    }));
  }

  // const accountClient = getAccountClient();
  const accountResp = await accountClient.getListEmployee(0, 20, "");

  let abcs = []
  if (accountResp.status === "OK") {

    accountResp.data.map((account) => (

      abcs.push({
        value: account.username,
        label: account.fullname,
      })
    ))
  }

  data.props.abcs = abcs

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
  expandOpen: {
    transform: "rotate(180deg)",
  },
  avatar: {
    backgroundColor: red[800],
  },
  list: {
    width: "70vw",
  },
  fullList: {
    width: "auto",
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

  let router = useRouter();
  let [search, setSearch] = useState("");
  let q = router.query.q || "";

  async function handleChange(e) {
    const value = e.target.value;
    setSearch(value);
  }

  async function onSearch() {
    q = formatUrlSearch(search);
    router.push(`?q=${q}`);
  }

  function onClearTextSearch() {
    setSearch("");
    Router.push(`/cs/all_case`);
  }

  let [data, setData] = useState(props);
  const [listAssignUser, setListAssignUser] = useState([...props.abcs]);

  console.log("listAssignUser", listAssignUser)
  useEffect(() => {
    setData(props);
    setSearch(formatUrlSearch(q));
  }, [props]);

  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const [selectedDate, setSelectedDate] = React.useState(
    new Date("2014-08-18T21:11:54")
  );

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  const [showHideFilter, setShowHideResults] = React.useState(false);
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
      name: "DS phiếu yêu cầu",
    },
  ];

  const classes = useStyles();

  const [state, setState] = React.useState({
    right: false,
  });

  const updateListAssignUser = async (department) => {
    if (department) {
      const accountClient = getAccountClient();
      const accountResp = await accountClient.getListEmployeeByDepartment(
        department.code
      );
      if (accountResp.status === "OK") {
        setListAssignUser(
          accountResp.data.map((account) => ({
            value: account.email,
            label: account.username,
          }))
        );
      } else {
        setListAssignUser([{ value: "", label: "" }]);
      }
    } else {
      setListAssignUser([{ value: "", label: "" }]);
    }
  };

  const onSubmit = async (formData) => {
    console.log(formData)
    const ticketClient = getTicketClient()
    const ticketResp = await ticketClient.getTicketByFilter({
      saleOrderCode: formData.saleOrderCode,
      saleOrderID: formData.saleOrderID,
      status: formData.status,
      reasons: formData.Reasons,
      assignUser: formData.assignUser,
      createdTime: formData.createdTime,
      lastUpdatedTime: formData.lastUpdatedTime
    })

  }

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const list = (anchor) => (
    <div
      className={clsx(classes.list, {
        [classes.fullList]: anchor === "top" || anchor === "bottom",
      })}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <div className={styles.grid}>
        <MyCard>
          <MyCardHeader title="Chỉnh sửa yêu cầu"></MyCardHeader>
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
                  <Grid item xs={12} sm={6} md={6}>
                    <Typography gutterBottom>
                      <FormLabel
                        component="legend"
                        style={{ color: "black", marginBottom: "15px" }}
                      >
                        Ngày tạo: 18/12/2020 13:17
                      </FormLabel>
                      <FormLabel
                        component="legend"
                        style={{
                          color: "black",
                          marginBottom: "15px",
                          fontSize: "40px",
                        }}
                      >
                        SO18487 - 62532
                      </FormLabel>
                      <FormLabel
                        component="legend"
                        style={{ color: "black", marginBottom: "15px" }}
                      >
                        Gía đơn hàng:
                        <span style={{ color: "green" }}>2.165.150 đ</span>
                      </FormLabel>
                      <FormLabel
                        component="legend"
                        style={{ color: "black", marginBottom: "15px" }}
                      >
                        Số lượng sản phẩm: 37
                      </FormLabel>
                      <FormLabel
                        component="legend"
                        style={{ color: "black", marginBottom: "15px" }}
                      >
                        Người tạo:{" "}
                        <span style={{ color: "grey" }}>Minh Trí</span>
                      </FormLabel>
                      <FormLabel
                        component="legend"
                        style={{ color: "black", marginBottom: "15px" }}
                      >
                        Ngày mua:{" "}
                        <span style={{ color: "grey" }}>26/2/2020</span>
                      </FormLabel>
                      <FormLabel
                        component="legend"
                        style={{ color: "black", marginBottom: "15px" }}
                      >
                        Trạng thái đơn hàng:{" "}
                        <span style={{ color: "red" }}>Hoàn tất</span>
                      </FormLabel>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <Typography gutterBottom>
                      <FormLabel
                        component="legend"
                        style={{ color: "black", marginBottom: "15px" }}
                      >
                        User ID: 5355
                      </FormLabel>
                      <FormLabel
                        component="legend"
                        style={{ color: "black", marginBottom: "15px" }}
                      >
                        Tên doanh nghiệp: QUẦY THUỐC PHƯƠNG LAN
                      </FormLabel>
                      <FormLabel
                        component="legend"
                        style={{ color: "black", marginBottom: "15px" }}
                      >
                        Họ tên khách hàng: NGUYỄN PHƯƠNG LAN
                      </FormLabel>
                      <FormLabel
                        component="legend"
                        style={{ color: "black", marginBottom: "15px" }}
                      >
                        Số điện thoại: 0123456789
                      </FormLabel>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography gutterBottom>
                      <FormLabel
                        component="legend"
                        style={{ fontWeight: "bold", color: "black" }}
                      >
                        Tên khách hàng:
                      </FormLabel>
                    </Typography>
                    <TextField
                      variant="outlined"
                      size="small"
                      type="text"
                      fullWidth
                      placeholder="Trấn Thành"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography gutterBottom>
                      <FormLabel
                        component="legend"
                        style={{ fontWeight: "bold", color: "black" }}
                      >
                        Số tài khoản:
                      </FormLabel>
                    </Typography>
                    <TextField
                      variant="outlined"
                      size="small"
                      type="text"
                      fullWidth
                      placeholder="0987654321"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography gutterBottom>
                      <FormLabel
                        component="legend"
                        style={{ fontWeight: "bold", color: "black" }}
                      >
                        Ngân hàng:
                      </FormLabel>
                    </Typography>
                    <TextField
                      variant="outlined"
                      size="small"
                      type="text"
                      fullWidth
                      placeholder="Dong A Bank"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography gutterBottom>
                      <FormLabel
                        component="legend"
                        style={{ fontWeight: "bold", color: "black" }}
                      >
                        Chi nhánh:
                      </FormLabel>
                    </Typography>
                    <TextField
                      variant="outlined"
                      size="small"
                      type="text"
                      fullWidth
                      placeholder="Tân Phú"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography gutterBottom>
                      <FormLabel
                        component="legend"
                        style={{ fontWeight: "bold", color: "black" }}
                      >
                        Sai sản phẩm:
                      </FormLabel>
                    </Typography>
                    <MuiSingleAuto
                      placeholder="Chọn"
                      name="người tạo"
                      errors={errors}
                      control={control}
                    ></MuiSingleAuto>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography gutterBottom>
                      <FormLabel
                        component="legend"
                        style={{ fontWeight: "bold", color: "black" }}
                      >
                        Chọn bộ phận tiếp nhận:
                      </FormLabel>
                    </Typography>
                    <MuiSingleAuto
                      placeholder="Chọn"
                      name="người tạo"
                      errors={errors}
                      control={control}
                    ></MuiSingleAuto>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography gutterBottom>
                      <FormLabel
                        component="legend"
                        style={{ fontWeight: "bold", color: "black" }}
                      >
                        Chọn người tiếp nhận:
                      </FormLabel>
                    </Typography>
                    <MuiSingleAuto
                      placeholder="Chọn"
                      name="người tạo"
                      errors={errors}
                      control={control}
                    ></MuiSingleAuto>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography gutterBottom>
                      <FormLabel
                        component="legend"
                        style={{ fontWeight: "bold", color: "black" }}
                      >
                        Chọn trạng thái:
                      </FormLabel>
                    </Typography>
                    <MuiSingleAuto
                      placeholder="Chọn"
                      name="người tạo"
                      errors={errors}
                      control={control}
                    ></MuiSingleAuto>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <Typography gutterBottom>
                      <FormLabel
                        component="legend"
                        style={{ fontWeight: "bold", color: "black" }}
                      >
                        Mã trả hàng:
                      </FormLabel>
                    </Typography>
                    <TextField
                      variant="outlined"
                      size="small"
                      type="text"
                      fullWidth
                      placeholder="0"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <Typography gutterBottom>
                      <FormLabel
                        component="legend"
                        style={{ fontWeight: "bold", color: "black" }}
                      >
                        Số tiền chuyển lại khách:
                      </FormLabel>
                    </Typography>
                    <TextField
                      variant="outlined"
                      size="small"
                      type="number"
                      fullWidth
                      placeholder="0"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <Typography gutterBottom>
                      <FormLabel
                        component="legend"
                        style={{ fontWeight: "bold", color: "black" }}
                      >
                        Mô tả
                      </FormLabel>
                    </Typography>
                    <TextField
                      variant="outlined"
                      size="small"
                      type="text"
                      fullWidth
                      placeholder="Ghi chú..."
                    />
                  </Grid>
                  <Grid item container xs={12} justify="flex-end" spacing={1}>
                    <Grid item>
                      <Link href="#">
                        <Button variant="contained" color="primary">
                          Lưu
                        </Button>
                      </Link>
                    </Grid>
                    <Grid item>
                      <Link href="#">
                        <Button variant="contained" color="default">
                          Hủy bỏ
                        </Button>
                      </Link>
                    </Grid>
                  </Grid>
                </Grid>
              </FormControl>
            </MyCardContent>
          </form>
        </MyCard>
      </div>
    </div>
  );

  const listStatus = [
    {
      value: "new",
      label: "Mới",
    },
    {
      value: "pending",
      label: "Đang chờ",
    },
    {
      value: "completed",
      label: "Hoàn tất",
    },
  ];



  return (
    <AppCS select="/cs/all_case" breadcrumb={breadcrumb}>
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
              style={{ marginRight: "10px" }}
            >
              <FontAwesomeIcon icon={faFilter} style={{ marginRight: 8 }} />
              Bộ lọc
            </Button>
            <Link href="/cs/all_case/new">
              <Button
                variant="contained"
                color="primary"
                className={styles.cardButton}
              >
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
                            style={{ fontWeight: "bold", color: "black" }}
                          >
                            Mã SO:
                          </FormLabel>
                        </Typography>
                        <TextField
                          variant="outlined"
                          size="small"
                          type="text"
                          fullWidth
                          placeholder="Nhập Mã SO"
                          onKeyPress={(event) => {
                            if (event.key === "Enter") {
                              onSearch();
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
                            style={{ fontWeight: "bold", color: "black" }}
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
                            style={{ fontWeight: "bold", color: "black" }}
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
                      {/* <Grid item xs={12} sm={6} md={4}>
                        <Typography gutterBottom>
                          <FormLabel
                            component="legend"
                            style={{ fontWeight: "bold", color: "black" }}
                          >
                            Số điện thoại:
                          </FormLabel>
                        </Typography>
                        <TextField
                          variant="outlined"
                          size="small"
                          type="text"
                          fullWidth
                          placeholder="Nhập Số Điện Thoại"
                        />
                      </Grid> */}
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography gutterBottom>
                          <FormLabel
                            component="legend"
                            style={{ fontWeight: "bold", color: "black" }}
                          >
                            Trạng thái:
                          </FormLabel>
                        </Typography>
                        <MuiSingleAuto
                          options={listStatus}
                          placeholder="Chọn"
                          name="orderStatus"
                          errors={errors}
                          control={control}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography gutterBottom>
                          <FormLabel
                            component="legend"
                            style={{ fontWeight: "bold", color: "black" }}
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
                        ></MuiMultipleAuto>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography gutterBottom>
                          <FormLabel
                            component="legend"
                            style={{ fontWeight: "bold", color: "black" }}
                          >
                            Người tiếp nhận:
                          </FormLabel>
                        </Typography>
                        <MuiSingleAuto
                          options={listAssignUser}
                          placeholder="Chọn"
                          name="assignUser"
                          errors={errors}
                          control={control}
                        ></MuiSingleAuto>
                      </Grid>
                      {/* <Grid item xs={12} sm={6} md={4}>
                        <Typography gutterBottom>
                          <FormLabel
                            component="legend"
                            style={{ fontWeight: "bold", color: "black" }}
                          >
                            Người tạo:
                          </FormLabel>
                        </Typography>
                        <MuiSingleAuto
                          placeholder="Chọn"
                          name="người tạo"
                          fullWidth
                          errors={errors}
                          control={control}
                        ></MuiSingleAuto>
                      </Grid> */}
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography gutterBottom>
                          <FormLabel
                            component="legend"
                            style={{ fontWeight: "bold", color: "black" }}
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
                            style={{ fontWeight: "bold", color: "black" }}
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
                          <Link href="/cs/all_case/new">
                            <Button variant="contained" color="primary" onClick={handleSubmit(onSubmit)}>
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
              <TableCell align="center">#</TableCell>
              <TableCell align="center">SO#</TableCell>
              <TableCell align="center">Order#</TableCell>
              <TableCell align="left">Lỗi</TableCell>
              <TableCell align="left">Ghi chú của KH</TableCell>
              <TableCell align="center">Khách hàng</TableCell>
              {/* <TableCell align="center">Trạng thái</TableCell>
              <TableCell align="center">Người tạo</TableCell>
              <TableCell align="center">Người cập nhật</TableCell> */}
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          {data.count <= 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="left">
                {ErrorCode["NOT_FOUND_TABLE"]}
              </TableCell>
            </TableRow>
          ) : (
              <TableBody>
                {data.data.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell align="center">{row.code}</TableCell>
                    <TableCell align="center">{row.saleOrderCode}</TableCell>
                    <TableCell align="center">{row.saleOrderID}</TableCell>
                    <TableCell align="left">
                      {
                        row.reasons.map((reason) =>
                          <Chip style={{ margin: '3px' }} size="small" label={reason.name} />
                        )
                      }
                    </TableCell>
                    <TableCell align="left">{row.note}</TableCell>
                    <TableCell align="center">{row.customerID}</TableCell>
                    {/* <TableCell align="center">
                    <Chip size="small" label={"Chưa xử lý"} />
                  </TableCell>
                  <TableCell align="center">ct</TableCell>
                  <TableCell align="center">ct</TableCell> */}
                    <TableCell align="center">
                      <div>
                        {["right"].map((anchor) => (
                          <React.Fragment key={anchor}>
                            <a onClick={toggleDrawer(anchor, true)}>
                              <Tooltip title="Cập nhật thông tin của yêu cầu">
                                <IconButton>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </a>
                            <Drawer
                              anchor={anchor}
                              open={state[anchor]}
                              onClose={toggleDrawer(anchor, false)}
                            >
                              {list(anchor)}
                            </Drawer>
                          </React.Fragment>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          {data.count > 0 ? (
            <MyTablePagination
              labelUnit="yêu cầu"
              count={data.count}
              rowsPerPage={10}
              page={2}
              onChangePage={(event, page, rowsPerPage) => {
                Router.push(
                  `/cms/product?page=${page}&limit=${rowsPerPage}&q=${search}`
                );
              }}
            />
          ) : (
              <div />
            )}
        </Table>
      </TableContainer>
    </AppCS>
  );
}
