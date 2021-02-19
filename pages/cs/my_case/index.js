import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, FormControl, FormLabel, TextField, IconButton, Typography, Grid, Tooltip, Chip } from "@material-ui/core";

import { faPlus, faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import React, { useEffect, useState } from "react";
import { MyCard, MyCardContent, MyCardHeader } from "@thuocsi/nextjs-components/my-card/my-card";

import EditIcon from "@material-ui/icons/Edit";

import { makeStyles } from "@material-ui/core/styles";
import { red } from "@material-ui/core/colors";

import Head from "next/head";
import { doWithLoggedInUser, renderWithLoggedInUser } from "@thuocsi/nextjs-components/lib/login";
import AppCuS from "pages/_layout";
import styles from "./request.module.css";
import { useForm } from "react-hook-form";
import Link from "next/link";
import MyTablePagination from "@thuocsi/nextjs-components/my-pagination/my-pagination";
import MuiSingleAuto from "@thuocsi/nextjs-components/muiauto/single";

export async function getServerSideProps(ctx) {
    return await doWithLoggedInUser(ctx, (ctx) => {
        return loadRequestData(ctx);
    });
}

export async function loadRequestData(ctx) {
    let data = {
        props: {
            data: [
                {
                    number: "20691",
                    soNumber: "SO18481",
                    orderNumber: "62531",
                    error: "sai sản phẩ1",
                    note: "Hộp bị méo gó1",
                    client: "Nguyễn Văn 1",
                    status: "Chưa xử l1",
                    createdPerson: "c1",
                    updatedPerson: "c1",
                },
                {
                    number: "20692",
                    soNumber: "SO18482",
                    orderNumber: "62532",
                    error: "sai sản phẩ2",
                    note: "Hộp bị méo gó2",
                    client: "Nguyễn Văn 2",
                    status: "Chưa xử l2",
                    createdPerson: "c2",
                    updatedPerson: "c2",
                },
            ],
            count: 2,
            status: [
                {
                    id: 1,
                    name: "Chưa xử lý",
                },
            ],
        },
    };

    return data;
}

export default function ProductPage(props) {
    return renderWithLoggedInUser(props, render);
}

export function getFirstImage(val) {
    if (val && val.length > 0) {
        return val[0];
    }
    return `/default.png`;
}

export function formatEllipsisText(text, len = 100) {
    if (text) {
        if (text.length > 50) {
            return text.substring(0, len) + "...";
        }
        return text;
    }
    return "-";
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
}));

function render(props) {
    const { register, handleSubmit, errors, reset, control, getValues, setValue } = useForm({
        defaultValues: {
            imageUrls: [],
        },
        mode: "onChange",
    });

    let [data, setData] = useState(props);

    useEffect(() => {
        setData(props);
    }, [props]);

    const classes = useStyles();
    const [expanded, setExpanded] = React.useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const [selectedDate, setSelectedDate] = React.useState(new Date("2014-08-18T21:11:54"));

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

    

    return (
        <AppCuS select="/cs/all_case">
            <Head>
                <title>Danh sách yêu cầu của khách hàng</title>
            </Head>
            <div className={styles.grid}>
                <MyCard>
                    <MyCardHeader title="Danh sách yêu cầu">
                        <Button variant="contained" color="primary" onClick={ShowHideFilter} className={styles.cardButton} style={{ marginRight: "10px" }}>
                            <FontAwesomeIcon icon={faFilter} style={{ paddingRight: "2px" }} />
                            Bộ lọc
                        </Button>
                        <Link href="/cs/my_case/new">
                            <Button variant="contained" color="primary" className={styles.cardButton}>
                                <FontAwesomeIcon icon={faPlus} style={{ paddingRight: "2px" }} />
                                Thêm yêu cầu
                            </Button>
                        </Link>
                    </MyCardHeader>
                    <form>
                        <MyCardContent>
                            <FormControl size="small">
                                <Grid container spacing={3} direction="row" justify="space-between" alignItems="center">
                                    {showHideFilter ? null : (
                                        <>
                                            <Grid item xs={12} sm={12} md={12}>
                                                <Typography gutterBottom>
                                                    <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                                        Mã SO:
                                                    </FormLabel>
                                                </Typography>
                                                <TextField variant="outlined" size="small" type="text" fullWidth placeholder="Nhập Mã SO" />
                                            </Grid>
                                        </>
                                    )}
                                    {showHideFilter ? (
                                        <>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Typography gutterBottom>
                                                    <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                                        Mã SO:
                                                    </FormLabel>
                                                </Typography>
                                                <TextField variant="outlined" size="small" type="text" fullWidth placeholder="Nhập Mã SO" />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Typography gutterBottom>
                                                    <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                                        Order ID:
                                                    </FormLabel>
                                                </Typography>
                                                <TextField variant="outlined" size="small" type="text" fullWidth placeholder="Nhập Order ID" />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Typography gutterBottom>
                                                    <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                                        Số điện thoại:
                                                    </FormLabel>
                                                </Typography>
                                                <TextField variant="outlined" size="small" type="text" fullWidth placeholder="Nhập Số Điện Thoại" />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Typography gutterBottom>
                                                    <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                                        Trạng thái:
                                                    </FormLabel>
                                                </Typography>
                                                <MuiSingleAuto placeholder="Chọn" name="trạng thái" fullWidth errors={errors} control={control}></MuiSingleAuto>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Typography gutterBottom>
                                                    <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                                        Lý do:
                                                    </FormLabel>
                                                </Typography>
                                                <MuiSingleAuto placeholder="Chọn" name="lý do" fullWidth errors={errors} control={control}></MuiSingleAuto>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Typography gutterBottom>
                                                    <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                                        Người tiếp nhận:
                                                    </FormLabel>
                                                </Typography>
                                                <MuiSingleAuto placeholder="Chọn" name="người tiếp nhận" fullWidth errors={errors} control={control}></MuiSingleAuto>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Typography gutterBottom>
                                                    <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                                        Người tạo:
                                                    </FormLabel>
                                                </Typography>
                                                <MuiSingleAuto placeholder="Chọn" name="người tạo" fullWidth errors={errors} control={control}></MuiSingleAuto>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Typography gutterBottom>
                                                    <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                                        Ngày bắt đầu:
                                                    </FormLabel>
                                                </Typography>
                                                <TextField variant="outlined" size="small" fullWidth type="datetime-local" />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Typography gutterBottom>
                                                    <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                                        Ngày kết thúc:
                                                    </FormLabel>
                                                </Typography>
                                                <TextField variant="outlined" size="small" fullWidth type="datetime-local" />
                                            </Grid>
                                            <Grid item container xs={12} justify="flex-end" spacing={1}>
                                                <Grid item>
                                                    <Link href="/cs/all_case/new">
                                                        <Button variant="contained" color="primary">
                                                            Xuất file
                                                        </Button>
                                                    </Link>
                                                </Grid>
                                                <Grid item>
                                                    <Link href="/cs/all_case/new">
                                                        <Button variant="contained" color="primary">
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
                            <TableCell align="center">Trạng thái</TableCell>
                            <TableCell align="center">Người tạo</TableCell>
                            <TableCell align="center">Người cập nhật</TableCell>
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
                                    <TableCell align="left">{row.number}</TableCell>
                                    <TableCell align="left">SO18487</TableCell>
                                    <TableCell align="left">62532</TableCell>
                                    <TableCell align="left">
                                        <Chip size="small" label={"Sai sản phẩm"} />
                                    </TableCell>
                                    <TableCell align="left">Hộp bị móp góc phải</TableCell>
                                    <TableCell align="center">Nguyễn Văn A</TableCell>
                                    <TableCell align="center">
                                        <Chip size="small" label={"Chưa xử lý"} />
                                    </TableCell>
                                    <TableCell align="center">ct</TableCell>
                                    <TableCell align="center">ct</TableCell>
                                    <TableCell align="center">
                                        <Link href={`/cs/my_case/edit`}>
                                            <a>
                                                <Tooltip title="Cập nhật thông tin của yêu cầu">
                                                    <IconButton>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </a>
                                        </Link>
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
                                Router.push(`/cms/product?page=${page}&limit=${rowsPerPage}&q=${search}`);
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
