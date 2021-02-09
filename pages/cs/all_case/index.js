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
import styles from './request.module.css'
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import CardMedia from "@material-ui/core/CardMedia";
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Controller, useForm } from "react-hook-form";

import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { red } from '@material-ui/core/colors';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Link from "next/link";
import EditIcon from '@material-ui/icons/Edit';
import MyTablePagination from "@thuocsi/nextjs-components/my-pagination/my-pagination";
import MuiMultipleAuto from "@thuocsi/nextjs-components/muiauto/multiple"
import MuiSingleAuto from "@thuocsi/nextjs-components/muiauto/single"
// import { useForm } from "react-hook-form";


import React, { useEffect, useState } from "react";
import Image from 'next/image';

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
    ],
    count: 2,
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
                <title>Danh sách yêu cầu của khách hàng</title>
            </Head>
            <div className={styles.grid}>
                <Grid container spacing={3} direction="row"
                        justify="space-between"
                        alignItems="center">
                            <Grid item xs={6} sm={3} md={3}>
                            
                            </Grid>
                    <Grid item xs={6} sm={3} md={3}>
                        <Link href="/cs/all_case/new">
                            <ButtonGroup color="primary" aria-label="contained primary button group"
                                         className={styles.rightGroup}>
                                <Button variant="contained" color="primary">Thêm yêu cầu</Button>
                            </ButtonGroup>
                        </Link>
                    </Grid>
                </Grid>
                <Grid container spacing={3} direction="row"
                        justify="space-between"
                        alignItems="center">
                            
                    <Grid item xs={12} sm={12} md={12}>
                        <Link href="#">
                        <Card className={classes.root}>
      
      <CardActions disableSpacing>
      <Typography paragraph>Bộ lọc</Typography>
        <IconButton
          className={clsx(classes.expand, {
            [classes.expandOpen]: expanded,
          })}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </IconButton>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
        
    <FormControl  size="small">
    
    <Grid container spacing={3} direction="row"
                        justify="space-between"
                        alignItems="center">
        <Grid item xs={4} sm={4} md={4}>
            <Typography gutterBottom>
                <FormLabel component="legend" style={{ fontWeight: 'bold', color: 'black' }}>Mã SO:</FormLabel>
            </Typography>
            <TextField
                variant="outlined"
                size="small"
                type="number"
                placeholder="Nhập Mã SO"
            />
        </Grid>
        <Grid item xs={4} sm={4} md={4}>
                <Typography gutterBottom>
            <FormLabel component="legend" style={{ fontWeight: 'bold', color: 'black' }}>Order ID:</FormLabel>
            </Typography>
            <TextField
            variant="outlined"
            size="small"
            type="number"
            placeholder="Nhập Order ID"
            />
        </Grid>
                <Grid item xs={4} sm={4} md={4}>
                <Typography gutterBottom>
            <FormLabel component="legend" style={{ fontWeight: 'bold', color: 'black' }}>Số điện thoại:</FormLabel>
            </Typography>
            <TextField
            variant="outlined"
            size="small"
            type="number"
            placeholder="Nhập Số Điện Thoại"
            />
        </Grid>
        <Grid item xs={4} sm={4} md={4}>
            <Typography gutterBottom>
                <FormLabel component="legend" style={{ fontWeight: 'bold', color: 'black' }}>Trạng thái:</FormLabel>
            </Typography>
            <MuiSingleAuto
            placeholder="Chọn"
            name="trạng thái"
            errors={errors}
            control={control}
            >

            </MuiSingleAuto>
        </Grid>
        <Grid item xs={4} sm={4} md={4}>
            <Typography gutterBottom>
                <FormLabel component="legend" style={{ fontWeight: 'bold', color: 'black' }}>Lý do:</FormLabel>
            </Typography>
            <MuiSingleAuto
            placeholder="Chọn"
            name="lý do"
            errors={errors}
            control={control}
            >

            </MuiSingleAuto>
        </Grid>
        <Grid item xs={4} sm={4} md={4}>
            <Typography gutterBottom>
                <FormLabel component="legend" style={{ fontWeight: 'bold', color: 'black' }}>Người tiếp nhận:</FormLabel>
            </Typography>
            <MuiSingleAuto
            placeholder="Chọn"
            name="người tiếp nhận"
            errors={errors}
            control={control}
            >

            </MuiSingleAuto>
        </Grid>
        <Grid item xs={4} sm={4} md={4}>
            <Typography gutterBottom>
                <FormLabel component="legend" style={{ fontWeight: 'bold', color: 'black' }}>Người tạo:</FormLabel>
            </Typography>
            <MuiSingleAuto
            placeholder="Chọn"
            name="người tạo"
            errors={errors}
            control={control}
            >

            </MuiSingleAuto>
        </Grid>
        <Grid item xs={10} sm={10} md={10}>
                        <Link href="/cs/all_case/new">
                            <ButtonGroup color="primary" aria-label="contained primary button group"
                                         className={styles.rightGroup}>
                                <Button variant="contained" color="primary">Xuất file</Button>
                            </ButtonGroup>
                        </Link>
                        
                    </Grid>
                    <Grid item xs={2} sm={2} md={2}>
                    <Link href="/cs/all_case/new">
                            <ButtonGroup color="primary" aria-label="contained primary button group"
                                         className={styles.rightGroup}>
                                <Button variant="contained" color="primary">Tìm kiếm</Button>
                            </ButtonGroup>
                        </Link>
                    </Grid>
    </Grid>
        
     
     </FormControl>    
     
          
                    
        </CardContent>
      </Collapse>
    </Card>
                        </Link>
                    </Grid>
                </Grid>
            </div>
            <TableContainer component={Paper}>
                <Table size="small" aria-label="a dense table">
                    <colgroup>
                        <col width="5%"/>
                        <col width="5%"/>
                        <col width="5%"/>
                        <col width="15%"/>
                        <col width="20%"/>
                        <col width="15%"/>
                        <col width="10%"/>
                        <col width="5%"/>
                        <col width="10%"/>
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
                                        <TableCell align="center">Chưa xử lý</TableCell>
                                        <TableCell align="center">ct</TableCell>
                                        <TableCell align="center">ct</TableCell>
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