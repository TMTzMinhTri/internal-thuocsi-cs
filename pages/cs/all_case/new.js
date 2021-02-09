import {
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@material-ui/core";
import Head from "next/head";
import { doWithLoggedInUser, renderWithLoggedInUser } from "@thuocsi/nextjs-components/lib/login";
import AppCuS from "pages/_layout"
import styles from './request.module.css'
import TextField from "@material-ui/core/TextField";
import RichTextField from "@thuocsi/nextjs-components/editor/rich-text-field/index";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { makeStyles } from '@material-ui/core/styles';
import { Controller, useForm } from "react-hook-form";
import { red } from '@material-ui/core/colors';
import MuiSingleAuto from "@thuocsi/nextjs-components/muiauto/single"


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
            number:"20691",
            soNumber: "SO18481",
            orderNumber:"62531",
            error:"sai sản phẩ1",
            note:"Hộp bị méo gó1",
            client:"Nguyễn Văn 1",
            status:"Chưa xử l1",
            createdPerson:"c1",
            updatedPerson:"c1",
        },
        {
            number:"20692",
            soNumber: "SO18482",
            orderNumber:"62532",
            error:"sai sản phẩ2",
            note:"Hộp bị méo gó2",
            client:"Nguyễn Văn 2",
            status:"Chưa xử l2",
            createdPerson:"c2",
            updatedPerson:"c2",
        },
        {
            number:"20692",
            soNumber: "SO18482",
            orderNumber:"62532",
            error:"sai sản phẩ2",
            note:"Hộp bị méo gó2",
            client:"Nguyễn Văn 2",
            status:"Chưa xử l2",
            createdPerson:"c2",
            updatedPerson:"c2",
        },
    ],
    count: 3,
    status:[
        {
            id:1,
            name:"Chưa xử lý",
        },

    ],
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

const useStyles = makeStyles((theme) => ({
    root: {
      maxWidth: 800,
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
    expandOpen: {
      transform: 'rotate(180deg)',
    },
    avatar: {
      backgroundColor: red[800],
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
            imageUrls: []
        },
        mode: "onChange"
    });
    
    let [data, setData] = useState(props)

    useEffect(() => {
        setData(props)
    }, [props])

    const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

    return (
        <AppCuS select="/cs/all_case">
            <Head>
                <title>Tạo mới</title>
            </Head>
            <div className={styles.grid}>
                
                
            <TableContainer component={Paper}>
            
                
     
                <Table size="small" aria-label="a dense table">
                    <colgroup>
                        <col width="5%"/>
                        <col width="5%"/>
                        <col width="5%"/>
                        <col width="15%"/>
                        <col width="15%"/>
                        <col width="20%"/>
                        <col width="15%"/>
                        <col width="15%"/>
                    </colgroup>
                    <TableHead>
                        <TableRow>
                            <TableCell align="left" colSpan="4">Tạo mới</TableCell>
                            <TableCell align="left" colSpan="8"></TableCell>
                        </TableRow>
                        <TableRow>
                        <TableCell align="center" colSpan="2">
                                        <TextField
                                    variant="outlined"
                                    size="small"
                                    type="number"
                                    placeholder="SO18487"
                                />
                        </TableCell>
                        <TableCell align="left" colSpan="2">
                            <Button variant="contained" color="primary">Tìm kiếm</Button>
                        </TableCell>
                            <TableCell align="left" colSpan="8"></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="left" colSpan="4">* Thông tin ngân hàng</TableCell>
                            <TableCell align="left" colSpan="8"></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="left" colSpan="3">Tên khách hàng</TableCell>
                            <TableCell align="left" colSpan="2">Số tài khoản</TableCell>
                            <TableCell align="left" colSpan="1">Ngân hàng</TableCell>
                            <TableCell align="left" colSpan="2">Chi nhánh</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="left" colSpan="3">
                            <TextField
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        placeholder="Nguyễn Văn A"
                                    />
                            </TableCell>
                            <TableCell align="left" colSpan="2">
                            <TextField
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        placeholder="123456789"
                                    />
                            </TableCell>
                            <TableCell align="left" colSpan="1">
                            <TextField
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        placeholder="DongA Bank"
                                    />
                            </TableCell>
                            <TableCell align="left" colSpan="2">
                            <TextField
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        placeholder="Tân Phú"
                                    />
                            </TableCell>
                        
                            
                        </TableRow>
                        <TableRow>
                            <TableCell align="center">#</TableCell>
                            <TableCell align="center">SO#</TableCell>
                            <TableCell align="center">Order#</TableCell>
                            <TableCell align="left">Lỗi</TableCell>
                            <TableCell align="left">Mô tả</TableCell>
                            <TableCell align="center">Khách hàng</TableCell>
                            <TableCell align="center">Người tạo</TableCell>
                            <TableCell align="center">Người cập nhật</TableCell>
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
                                        <TableCell align="center">SO18487</TableCell>
                                        <TableCell align="center">62532</TableCell>
                                        <TableCell align="left">Sai sản phẩm</TableCell>
                                        <TableCell align="left">Hộp bị móp góc phải</TableCell>
                                        <TableCell align="center">Nguyễn Văn A</TableCell>
                                        <TableCell align="center">ct</TableCell>
                                        <TableCell align="center">ct</TableCell>
                                    </TableRow>
                                
                                ))}
                            </TableBody>
                        )}
                        <TableHead>
                            <TableRow>
                                <TableCell align="left" colSpan="4">Chọn lý do: <span style={{color:"red"}}>(*)</span></TableCell>
                                <TableCell align="left" colSpan="4"></TableCell>

                            </TableRow>
                            <TableRow>
                                <TableCell align="left" colSpan="4">
                                    <MuiSingleAuto
                                        placeholder="Chọn"
                                        name="người tạo"
                                        errors={errors}
                                        control={control}
                                        >

                                    </MuiSingleAuto>
                                </TableCell>
                                <TableCell align="left" colSpan="4"></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" colSpan="4">Chọn bộ phận tiếp nhận: <span style={{color:"red"}}>(*)</span></TableCell>
                                <TableCell align="left" colSpan="2">Người tiếp nhận: <span style={{color:"red"}}>(*)</span></TableCell>
                                <TableCell align="left" colSpan="2"></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" colSpan="4">
                                    <MuiSingleAuto
                                        placeholder="Chọn"
                                        name="người tạo"
                                        errors={errors}
                                        control={control}
                                        >

                                    </MuiSingleAuto>
                                </TableCell>
                                <TableCell align="left" colSpan="2">
                                    <MuiSingleAuto
                                        placeholder="Chọn"
                                        name="người tạo"
                                        errors={errors}
                                        control={control}
                                        >

                                    </MuiSingleAuto>
                                </TableCell>
                                <TableCell align="left" colSpan="2"></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" colSpan="4">Mã giao hàng tiết kiệm: (Mã return)</TableCell>
                                <TableCell align="left" colSpan="2">Số tiền trả lại:</TableCell>
                                <TableCell align="left" colSpan="2"></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" colSpan="4">
                                <TextField
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        placeholder="0"
                                    />
                                </TableCell>
                                <TableCell align="left" colSpan="2">
                                <TextField
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        placeholder="0 đ"
                                    />
                                </TableCell>
                                <TableCell align="left" colSpan="2"></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" colSpan="4">Ghi chú (hàng trả về): <span style={{color:"red"}}>(*)</span></TableCell>
                                <TableCell align="left" colSpan="4"></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" colSpan="8">
                                    <RichTextField
                                                name="description"
                                                getValue={getValues}
                                                setValue={setValue}
                                            />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan="6"></TableCell>
                                <TableCell align="right">
                                    <Button variant="contained" color="primary">Lưu</Button>
                                </TableCell>
                                <TableCell align="left">
                                    <Button variant="contained" color="default">Hủy bỏ</Button>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                </Table>
            </TableContainer>
            </div>
        </AppCuS>
    )
}