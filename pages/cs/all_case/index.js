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
    InputBase,
    Tooltip,
} from "@material-ui/core";

import React, { useEffect, useState } from "react";

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

    const [showResults, setShowResults] = React.useState(false);
    const SetResults = () => {
        if (showResults === false) {
            setShowResults(true);
        } else {
            setShowResults(false);
        }
    };
    const ShowFilter = () => {
        return <div>{showResults ? <Results /> : null}</div>;
    };

    const Results = () => (
        <Paper className={`${styles.search}`}>
            <FormControl size="small">
                <Grid container spacing={3} direction="row" justify="space-between" alignItems="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography gutterBottom>
                            <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                Mã SO:
                            </FormLabel>
                        </Typography>
                        <TextField variant="outlined" size="small" type="number" fullWidth placeholder="Nhập Mã SO" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography gutterBottom>
                            <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                Order ID:
                            </FormLabel>
                        </Typography>
                        <TextField variant="outlined" size="small" type="number" fullWidth placeholder="Nhập Order ID" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography gutterBottom>
                            <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                Số điện thoại:
                            </FormLabel>
                        </Typography>
                        <TextField variant="outlined" size="small" type="number" fullWidth placeholder="Nhập Số Điện Thoại" />
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
                                Start Date:
                            </FormLabel>
                        </Typography>
                        <TextField variant="outlined" size="small" fullWidth type="datetime-local" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography gutterBottom>
                            <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                End Date:
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
                </Grid>
            </FormControl>
        </Paper>
    );

    return (
        <AppCuS select="/cs/all_case">
            <Head>
                <title>Danh sách yêu cầu của khách hàng</title>
            </Head>
            <div className={styles.grid}>
                <Grid container spacing={3} direction="row" justify="flex-end" alignItems="center" style={{ marginBottom: "5px" }}>
                    <Grid item xs={2} sm={8} md={9}></Grid>
                    <Grid item xs={5} sm={2} md={1}>
                        <Button variant="contained" color="primary" onClick={SetResults}>
                            Bộ lọc
                        </Button>
                    </Grid>
                    <Grid item xs={5} sm={2} md={2}>
                        <Link href="/cs/all_case/new">
                            <Button variant="contained" color="primary">
                                Thêm yêu cầu
                            </Button>
                        </Link>
                    </Grid>
                </Grid>
                <Grid container spacing={3} direction="row" justify="space-between" alignItems="center" style={{ marginBottom: "5px" }}>
                    <Grid item xs={6} sm={4} md={4}>
                        <Paper className={`${styles.search} ${styles.floadSpaceBetween}`}>
                            <InputBase
                                id="q"
                                name="q"
                                className={styles.inputSearch}
                                inputRef={register}
                                onKeyPress={(event) => {
                                    if (event.key === "Enter") {
                                        onSearch();
                                    }
                                }}
                                autoComplete="off"
                                placeholder="Nhập SO number hoặc Order number"
                                inputProps={{ "aria-label": "Nhập SO number hoặc Order number" }}
                            />
                        </Paper>
                    </Grid>
                    <Grid item xs={6} sm={5} md={5}>
                        <Button variant="contained" color="primary">
                            Tìm kiếm
                        </Button>
                    </Grid>
                    <Grid item xs={6} sm={3} md={3}></Grid>
                </Grid>
                <ShowFilter />
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
                            <TableCell align="center">Lỗi</TableCell>
                            <TableCell align="center">Ghi chú của KH</TableCell>
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
                                    <TableCell align="left">Sai sản phẩm</TableCell>
                                    <TableCell align="left">Hộp bị móp góc phải</TableCell>
                                    <TableCell align="center">Nguyễn Văn A</TableCell>
                                    <TableCell align="left">Chưa xử lý</TableCell>
                                    <TableCell align="center">ct</TableCell>
                                    <TableCell align="center">ct</TableCell>
                                    <TableCell align="center">
                                        <Link href={`/cs/all_case/edit`}>
                                            <a>
                                                <Tooltip title="Cập nhật thông tin của vùng">
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
