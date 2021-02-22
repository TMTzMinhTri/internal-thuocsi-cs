import {
    Button,
    ButtonGroup,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip
} from "@material-ui/core";
import Head from "next/head";
import { doWithLoggedInUser, renderWithLoggedInUser } from "@thuocsi/nextjs-components/lib/login";
import AppCuS from "pages/_layout"
import MyTablePagination from "@thuocsi/nextjs-components/my-pagination/my-pagination";


import React, { useEffect, useState } from "react";

const LIMIT = 20

export async function getServerSideProps(ctx) {
    return await doWithLoggedInUser(ctx, (ctx) => {
        return loadRequestData(ctx);
    })
}

export async function loadRequestData(ctx){
    let data = {props : {
        data: [
        {
            number:"177",
            fileName: "2021-02-07T16:34:18.286Z_2021-02-07T16:34:18.286Z_report_by_failure_",
            date:"2021-02-07T23:34:42.867+07:00",
            status:"succeeded",
        },
        {
            number:"177",
            fileName: "2021-02-07T16:34:18.286Z_2021-02-07T16:34:18.286Z_report_by_failure_",
            date:"2021-02-07T23:34:42.867+07:00",
            status:"succeeded",
        },
    ],
    count: 2,
}}

    return data
}

export default function ProductPage(props) {
    return renderWithLoggedInUser(props, render)
}

export function getFirstImage(val) {
    if (val && val.length > 0) {
        return val[0]
    }
    return `/default.png` 
}

export function formatEllipsisText(text, len = 100) {
    if (text) {
        if (text.length > 50) {
            return text.substring(0, len) + "..."
        }
        return text
    }
    return '-'
}
  

function render(props) {

    let [data, setData] = useState(props)

    useEffect(() => {
        setData(props)
    }, [props])

    let breadcrumb = [
        {
            name: "Trang chủ",
            link: "/cs"
        },
        {
            name: "Danh sách file",
        },
    ];

    return (
        <AppCuS select="/cs/list_file" breadcrumb={breadcrumb}>
            <Head>
                <title>Danh sách file</title>
            </Head>
      
            <TableContainer component={Paper}>
                <Table size="small" aria-label="a dense table">
                    <colgroup>
                        <col width="5%"/>
                        <col width="50%"/>
                        <col width="30%"/>
                        <col width="5%"/>
                        <col width="10%"/>
                    </colgroup>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">#</TableCell>
                            <TableCell align="center">Tên file</TableCell>
                            <TableCell align="center">Ngày</TableCell>
                            <TableCell align="center">Trạng thái</TableCell>
                            <TableCell align="center"></TableCell>
                        </TableRow>
                    </TableHead>
                    {data.count <= 0 ?
                        (
                            <TableRow>
                                <TableCell colSpan={5} align="left">{ErrorCode["NOT_FOUND_TABLE"]}</TableCell>
                            </TableRow>
                        )
                        :
                        (
                            <TableBody>
                                {data.data.map((row, i) => (
                                    
                                    <TableRow key={i}>
                                        <TableCell align='center'>{row.number}</TableCell>
                                        <TableCell align="center">{row.fileName}</TableCell>
                                        <TableCell align="center">{row.date}</TableCell>
                                        <TableCell align="center">{row.status}</TableCell>
                                        <TableCell align="center"><a href="#">Tải về</a></TableCell>
                                    </TableRow>
                                
                                ))}
                            </TableBody>
                        )}
                    {
                        data.count > 0 ? (
                            <MyTablePagination
                                labelUnit="sản phẩm"
                                count={data.count}
                                rowsPerPage={10}
                                page={2}
                                onChangePage={(event, page, rowsPerPage) => {
                                    Router.push(`/cms/product?page=${page}&limit=${rowsPerPage}&q=${search}`)
                                }}
                            />
                        ) : (<div/>)
                    }
                </Table>
            </TableContainer>
        </AppCuS>
    )
}