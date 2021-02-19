import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, FormControl, FormLabel, TextField, IconButton, Typography, Grid, Tooltip, Chip } from "@material-ui/core";
import { MyCard, MyCardContent, MyCardHeader } from "@thuocsi/nextjs-components/my-card/my-card";
import MyTablePagination from "@thuocsi/nextjs-components/my-pagination/my-pagination";

import Head from "next/head";
import { doWithLoggedInUser, renderWithLoggedInUser } from "@thuocsi/nextjs-components/lib/login";
import AppCS from "pages/_layout";
import styles from "./request.module.css";
import RichTextField from "@thuocsi/nextjs-components/editor/rich-text-field/index";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { makeStyles } from "@material-ui/core/styles";
import { useForm } from "react-hook-form";
import { red } from "@material-ui/core/colors";
import MuiSingleAuto from "@thuocsi/nextjs-components/muiauto/single";
import Link from "next/link";
import EditIcon from "@material-ui/icons/Edit";

import React, { useEffect, useState } from "react";

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
            count: 3,
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
        maxWidth: 800,
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

// function handleClick(event) {
//     event.preventDefault();
//     console.info("You clicked a breadcrumb.");
// }

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

    let breadcrumb = [
        {
            name: "Danh sách yêu cầu",
            link: "/cs/all_case",
        },
        {
            name: "Thêm yêu cầu mới"
        },
    ];
    return (
        <AppCS select="/cs/all_case" breadcrumb={breadcrumb}>
            <Head>
                <title>Thêm yêu cầu mới</title>
            </Head>
            <div className={styles.grid}>
                <MyCard>
                    <MyCardHeader title="Thêm yêu cầu mới"></MyCardHeader>
                    <form>
                        <MyCardContent>
                            <FormControl size="small">
                                <Grid container spacing={3} direction="row" justify="space-between" alignItems="center">
                                    <Grid item xs={12} sm={12} md={7}>
                                        <TextField variant="outlined" size="small" type="text" fullWidth placeholder="Nhập Mã SO" />
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={5}>
                                        <Button variant="contained" color="primary">
                                            Tìm kiếm
                                        </Button>
                                    </Grid>
                                </Grid>
                            </FormControl>
                        </MyCardContent>
                    </form>
                </MyCard>

                <Paper className={`${styles.search}`}>
                    <FormControl size="small">
                        <Grid container spacing={3} direction="row" justify="space-between" alignItems="center">
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography gutterBottom>
                                    <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                        Tên khách hàng:
                                    </FormLabel>
                                </Typography>
                                <TextField variant="outlined" size="small" type="text" fullWidth placeholder="Trấn Thành" />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography gutterBottom>
                                    <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                        Số tài khoản:
                                    </FormLabel>
                                </Typography>
                                <TextField variant="outlined" size="small" type="text" fullWidth placeholder="0987654321" />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography gutterBottom>
                                    <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                        Ngân hàng:
                                    </FormLabel>
                                </Typography>
                                <TextField variant="outlined" size="small" type="text" fullWidth placeholder="Dong A Bank" />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography gutterBottom>
                                    <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                        Chi nhánh:
                                    </FormLabel>
                                </Typography>
                                <TextField variant="outlined" size="small" type="text" fullWidth placeholder="Tân Phú" />
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
                                        <TableCell align="center">{row.number}</TableCell>
                                        <TableCell align="center">SO18487</TableCell>
                                        <TableCell align="center">62532</TableCell>
                                        <TableCell align="left">
                                            <Chip size="small" label={"Sai sản phẩm"} />
                                        </TableCell>
                                        <TableCell align="left">Hộp bị móp góc phải</TableCell>
                                        <TableCell align="center">Nguyễn Văn A</TableCell>
                                        <TableCell align="center">ct</TableCell>
                                        <TableCell align="center">ct</TableCell>
                                        <TableCell align="center">
                                            <Link href={`/cs/all_case/edit`}>
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

                <Paper className={`${styles.search}`}>
                    <FormControl size="small">
                        <Grid container spacing={3} direction="row" justify="space-between" alignItems="center">
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography gutterBottom>
                                    <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                        Chọn lý do: <span style={{ color: "red" }}>(*)</span>
                                    </FormLabel>
                                </Typography>
                                <MuiSingleAuto placeholder="Chọn" name="người tạo" errors={errors} control={control}></MuiSingleAuto>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography gutterBottom>
                                    <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                        Chọn bộ phận tiếp nhận: <span style={{ color: "red" }}>(*)</span>
                                    </FormLabel>
                                </Typography>
                                <MuiSingleAuto placeholder="Chọn" name="người tạo" errors={errors} control={control}></MuiSingleAuto>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography gutterBottom>
                                    <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                        Chọn người tiếp nhận: <span style={{ color: "red" }}>(*)</span>
                                    </FormLabel>
                                </Typography>
                                <MuiSingleAuto placeholder="Chọn" name="người tạo" errors={errors} control={control}></MuiSingleAuto>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography gutterBottom>
                                    <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                        Mã giao hàng tiết kiệm: (Mã return)
                                    </FormLabel>
                                </Typography>
                                <TextField variant="outlined" size="small" type="text" fullWidth placeholder="0" />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <Typography gutterBottom>
                                    <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                        Số tiền trả lại:
                                    </FormLabel>
                                </Typography>
                                <TextField variant="outlined" size="small" type="number" fullWidth placeholder="0" />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <Typography gutterBottom>
                                    <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                        Ghi chú (hàng trả về): <span style={{ color: "red" }}>(*)</span>
                                    </FormLabel>
                                </Typography>
                                <TextField variant="outlined" size="small" type="text" fullWidth placeholder="Ghi chú..." />
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
                </Paper>
            </div>
        </AppCS>
    );
}
