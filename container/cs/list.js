import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, FormControl, FormLabel, TextField, IconButton, Typography, Grid, Tooltip, Chip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useState } from "react"
import { reasons } from "components/global"
import { formatNumber, formatDateTime } from "components/global"
import { MyCard, MyCardContent, MyCardHeader } from "@thuocsi/nextjs-components/my-card/my-card";
import MuiSingleAuto from "@thuocsi/nextjs-components/muiauto/single";
import MuiMultipleAuto from "@thuocsi/nextjs-components/muiauto/multiple";
import styles from "pages/cs/all_case/request.module.css";
import Link from "next/link";
import { useForm } from "react-hook-form";


import clsx from "clsx";

export const List = ({ anchor, row, customerInf, orderData, listAssignUser, listDepartment }) => {
    const {
        register,
        handleSubmit,
        errors,
        control,
        getValues,
        setValue,
    } = useForm({
        defaultValues: {
            customerName: orderData.customerName,
            bankCode: customerInf.bankCode,
            bank: customerInf.bank,
            bankBranch: customerInf.bankBranch,
            reasons: row.reasons.map(reason => ({ value: reason.code, label: reason.name })),
            departmentCode: row.departmentCode,
            assignUser: row.assignUser,
            returnCode: row.returnCode,
            note: row.note,
            cashback: row.cashback,
        },
        mode: "onSubmit",
    });

    const onSubmit = (data) => console.log(data)
    
    const [listAssignUser,setListAssignUser] = useState()

    const useStyles = makeStyles((theme) => ({
        muiDrawerRoot: {
            boxShadow: 'none'
        },
        BackdropProps: {
            backgroundColor: 'rgba(0,0,0,0.5)'
        },
        list: {
            width: "70vw",
        },
    }));

    const classes = useStyles();
    const [state, setState] = useState({
        right: false,
    });

    const toggleDrawer = (anchor, open) => (event) => {
        if (
            event.type === "keydown" &&
            (event.key === "Tab" || event.key === "Shift")
        ) {
            return;
        }

        setState({ ...state, [anchor]: open });
    };

    const updateListAssignUser = department => {
        if (department) {
            const accountClient = getAccountClient()
            const accountResp = await accountClient.getListEmployeeByDepartment(department.code)
            if (accountResp.status === "OK") {
                setListAssignUser(accountResp.data.map(account => ({ value: account.email, label: account.username })))
            } else {
                setListAssignUser([{ value: "", label: "" }])
            }
        } else {
            setListAssignUser([{ value: "", label: "" }])
        }
    }

    useEffect(() => {
       
    }, [])

    return (
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
                    <MyCardHeader title="Thông tin yêu cầu"></MyCardHeader>
                    <form key={row.code}>
                        <MyCardContent>
                            <FormControl size="small">
                                <Grid container spacing={3} direction="row" justify="space-between" alignItems="center">
                                    <Grid item xs={12} sm={6} md={6}>
                                        <Typography gutterBottom>
                                            <FormLabel component="legend" style={{ color: "black", marginBottom: "15px" }}>
                                                Ngày tạo: {formatDateTime(row.createdTime)}
                                            </FormLabel>
                                            <FormLabel component="legend" style={{ color: "black", marginBottom: "15px", fontSize: "40px" }}>
                                                {row.code} - {row.saleOrderCode}
                                            </FormLabel>
                                            <FormLabel component="legend" style={{ color: "black", marginBottom: "15px" }}>
                                                Gía đơn hàng: <span style={{ color: "green" }}>{formatNumber(orderData.totalPrice)} đ</span>
                                            </FormLabel>
                                            <FormLabel component="legend" style={{ color: "black", marginBottom: "15px" }}>
                                                Số lượng sản phẩm: 37
                                            </FormLabel>
                                            <FormLabel component="legend" style={{ color: "black", marginBottom: "15px" }}>
                                                Người tạo: <span style={{ color: "grey" }}>{row.createdBy}</span>
                                            </FormLabel>
                                            <FormLabel component="legend" style={{ color: "black", marginBottom: "15px" }}>
                                                Ngày mua: <span style={{ color: "grey" }}>{formatDateTime(orderData.createdTime)}</span>
                                            </FormLabel>
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={6}>
                                        <Typography gutterBottom>
                                            <FormLabel component="legend" style={{ color: "black", marginBottom: "15px" }}>
                                                User ID: {row.customerID}
                                            </FormLabel>
                                            <FormLabel component="legend" style={{ color: "black", marginBottom: "15px" }}>
                                                Số điện thoại: {orderData.customerPhone}
                                            </FormLabel>
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography gutterBottom>
                                            <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                                Tên khách hàng:
                                            </FormLabel>
                                        </Typography>
                                        <TextField name="customerName" inputRef={register({ required: "Vui lòng nhập thông tin" })} error={!!errors.customerName} helperText={errors.customerName?.message}
                                            variant="outlined" size="small" type="text" fullWidth />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography gutterBottom>
                                            <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                                Số tài khoản:
                                            </FormLabel>
                                        </Typography>
                                        <TextField name="bankCode" inputRef={register({ required: "Vui lòng nhập thông tin" })} error={!!errors.bankCode} helperText={errors.bankCode?.message}
                                            variant="outlined" size="small" type="text" fullWidth />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography gutterBottom>
                                            <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                                Ngân hàng:
                                            </FormLabel>
                                        </Typography>
                                        <TextField name="bank" inputRef={register({ required: "Vui lòng nhập thông tin" })} error={!!errors.bank} helperText={errors.bank?.message}
                                            variant="outlined" size="small" type="text" fullWidth />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography gutterBottom>
                                            <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                                Chi nhánh:
                                            </FormLabel>
                                        </Typography>
                                        <TextField name="bankBranch" inputRef={register({ required: "Vui lòng nhập thông tin" })} error={!!errors.bankBranch} helperText={errors.bankBranch?.message}
                                            variant="outlined" size="small" type="text" fullWidth />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={6}>
                                        <Typography gutterBottom>
                                            <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                                Nguyên nhân:
                                            </FormLabel>
                                        </Typography>
                                        <MuiMultipleAuto name="reasons" required options={reasons} required placeholder="Chọn" errors={errors} control={control}></MuiMultipleAuto>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography gutterBottom>
                                            <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                                Chọn bộ phận tiếp nhận:
                                            </FormLabel>
                                        </Typography>
                                        <MuiSingleAuto name="departmentCode" onValueChange={(data) => updateListAssignUser(data)} options={listDepartment} required placeholder="Chọn" errors={errors} control={control}></MuiSingleAuto>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography gutterBottom>
                                            <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                                Chọn người tiếp nhận:
                                            </FormLabel>
                                        </Typography>
                                        <MuiSingleAuto name="assignUser" required options={listAssignUser} required placeholder="Chọn" errors={errors} control={control}></MuiSingleAuto>
                                    </Grid>
                                    {/* <Grid item xs={12} sm={6} md={3}>
                                        <Typography gutterBottom>
                                            <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                                Chọn trạng thái:
                                            </FormLabel>
                                        </Typography>
                                        <MuiSingleAuto placeholder="Chọn" name="người tạo" errors={errors} control={control}></MuiSingleAuto>
                                    </Grid> */}
                                    <Grid item xs={12} sm={6} md={6}>
                                        <Typography gutterBottom>
                                            <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                                Mã trả hàng:
                                            </FormLabel>
                                        </Typography>
                                        <TextField name="returnCode" variant="outlined" size="small" type="text" fullWidth placeholder="0" />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={6}>
                                        <Typography gutterBottom>
                                            <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                                Số tiền chuyển lại khách:
                                            </FormLabel>
                                        </Typography>
                                        <TextField name="cashback" variant="outlined" size="small" type="number" fullWidth placeholder="0" />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={6}>
                                        <Typography gutterBottom>
                                            <FormLabel component="legend" style={{ fontWeight: "bold", color: "black" }}>
                                                Mô tả
                                            </FormLabel>
                                        </Typography>
                                        <TextField name="note" inputRef={register} value={row.note} variant="outlined" size="small" type="text" fullWidth placeholder="Ghi chú..." />
                                    </Grid>
                                    <Grid item container xs={12} justify="flex-end" spacing={1}>
                                        <Grid item>
                                            <Link href="#">
                                                <Button variant="contained" color="default">
                                                    Quay lại
                                                </Button>
                                            </Link>
                                        </Grid>
                                        <Grid item>
                                            <Button variant="contained" color="primary" onClick={handleSubmit(onSubmit)}>
                                                Lưu
                                                </Button>
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
}
