import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import Head from "next/head";
import { doWithLoggedInUser, renderWithLoggedInUser } from "@thuocsi/nextjs-components/lib/login";
import AppCuS from "pages/_layout";
import styles from "./request.module.css";
import TextField from "@material-ui/core/TextField";
import RichTextField from "@thuocsi/nextjs-components/editor/rich-text-field/index";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { makeStyles } from "@material-ui/core/styles";
import { Controller, useForm } from "react-hook-form";
import { red } from "@material-ui/core/colors";
import MuiSingleAuto from "@thuocsi/nextjs-components/muiauto/single";

import React, { useEffect, useState } from "react";

const LIMIT = 20;

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

    return (
        <AppCuS select="/cs/all_case">
            <Head>
                <title>Chỉnh sửa</title>
            </Head>
            <div className={styles.grid}>
                <TableContainer component={Paper}>
                    <Table size="small" aria-label="a dense table">
                        <colgroup>
                            <col width="10%" />
                            <col width="10%" />
                            <col width="10%" />
                            <col width="10%" />
                        </colgroup>
                        <TableHead>
                            <TableRow>
                                <TableCell align="left" colSpan="4">
                                    Ngày tạo: 18/12/2020 13:17
                                </TableCell>
                                <TableCell align="left" colSpan="4">
                                    {/* Người tạo: <span style={{ color: "grey" }}>Minh Trí</span> */}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" colSpan="4">
                                    <span style={{ fontSize: "2rem" }}>SO18487 - 62532</span>
                                </TableCell>
                                <TableCell align="left" colSpan="4">
                                Người tạo: <span style={{ color: "grey" }}>Minh Trí</span>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" colSpan="4">
                                    Giá đơn hàng: <span style={{ color: "green" }}>2.165.150 đ</span>
                                </TableCell>
                                <TableCell align="left" colSpan="4">
                                Ngày mua: <span style={{ color: "grey" }}>26/2/2020</span>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" colSpan="4">
                                    Số lượng sản phẩm: 37
                                </TableCell>
                                <TableCell align="left" colSpan="4">
                                Trạng thái đơn hàng: <span style={{ color: "red" }}>Hoàn tất</span>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" colSpan="8">
                                    Sai sản phẩm
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" colSpan="4">
                                    <MuiSingleAuto placeholder="Chọn" name="người tạo" fullWidth errors={errors} control={control}></MuiSingleAuto>
                                </TableCell>
                                <TableCell align="left" colSpan="4"></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" colSpan="4">
                                    Số tiền chuyển lại khách:
                                </TableCell>
                                <TableCell align="left" colSpan="4">
                                    User ID: 5355
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" colSpan="4">
                                    <TextField variant="outlined" size="small" fullWidth type="number" placeholder="7777777777" />
                                </TableCell>
                                <TableCell align="left" colSpan="4">
                                    Tên doanh nghiệp: Quầy Thuốc Phương Lan
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" colSpan="4">
                                    Mã trả hàng:
                                </TableCell>
                                <TableCell align="left" colSpan="4">
                                    Họ Tên KH: Nguyễn Phương Lan
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" colSpan="4">
                                    <TextField variant="outlined" size="small" fullWidth type="number" placeholder="7777777777" />
                                </TableCell>
                                <TableCell align="left" colSpan="4">
                                    Số điện thoại: 0123456789
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell align="left" colSpan="4">
                                    * Thông tin ngân hàng
                                </TableCell>
                                <TableCell align="left" colSpan="4"></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" colSpan="2">
                                    Tên khách hàng
                                </TableCell>
                                <TableCell align="left" colSpan="2">
                                    Số tài khoản
                                </TableCell>
                                <TableCell align="left" colSpan="2">
                                    Ngân hàng
                                </TableCell>
                                <TableCell align="left" colSpan="2">
                                    Chi nhánh
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" colSpan="2">
                                    <TextField variant="outlined" size="small" fullWidth type="text" placeholder="Bùi Huỳnh Trấn Thành" />
                                </TableCell>
                                <TableCell align="left" colSpan="2">
                                    <TextField variant="outlined" size="small" fullWidth type="text" placeholder="123456789" />
                                </TableCell>
                                <TableCell align="left" colSpan="2">
                                    <TextField variant="outlined" size="small" fullWidth type="text" placeholder="DongA Bank" />
                                </TableCell>
                                <TableCell align="left" colSpan="2">
                                    <TextField variant="outlined" size="small" fullWidth type="text" placeholder="Tân Phú" />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" colSpan="4">
                                    Chọn bộ phận tiếp nhận:
                                </TableCell>
                                <TableCell align="left" colSpan="2">
                                    Người tiếp nhận:
                                </TableCell>
                                <TableCell align="left" colSpan="2">
                                    Trạng thái:
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" colSpan="4">
                                    <MuiSingleAuto placeholder="Chọn" name="người tạo" fullWidth errors={errors} control={control}></MuiSingleAuto>
                                </TableCell>
                                <TableCell align="left" colSpan="2">
                                    <MuiSingleAuto placeholder="Chọn" name="người tạo" fullWidth errors={errors} control={control}></MuiSingleAuto>
                                </TableCell>
                                <TableCell align="left" colSpan="2">
                                    <MuiSingleAuto placeholder="Chọn" name="người tạo" fullWidth errors={errors} control={control}></MuiSingleAuto>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" colSpan="8">
                                    Mô tả:
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" colSpan="8">
                                    <RichTextField name="description" getValue={getValues} setValue={setValue} />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan="6"></TableCell>
                                <TableCell align="right">
                                    <Button variant="contained" color="primary">
                                        Lưu
                                    </Button>
                                </TableCell>
                                <TableCell align="left">
                                    <Button variant="contained" color="default">
                                        Hủy bỏ
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                    </Table>
                </TableContainer>
            </div>
        </AppCuS>
    );
}
