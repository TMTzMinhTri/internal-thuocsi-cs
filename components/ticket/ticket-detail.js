import {
    Button,
    Drawer,
    FormControl,
    FormLabel,
    Grid,
    makeStyles,
    TextareaAutosize,
    TextField,
    Typography,
    Dialog,
} from '@material-ui/core';
import MuiMultipleAuto from '@thuocsi/nextjs-components/muiauto/multiple';
import MuiSingleAuto from '@thuocsi/nextjs-components/muiauto/single';
import { MyCard, MyCardActions, MyCardContent, MyCardHeader } from '@thuocsi/nextjs-components/my-card/my-card';
import { useToast } from '@thuocsi/nextjs-components/toast/useToast';
import { getAccountClient, getTicketClient, getOrderClient } from 'client';
import clsx from 'clsx';
import { formatDateTime, formatNumber } from 'components/global';
import { useCallback, useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { isValid, getFirst } from 'utils';
import Image from 'next/image';
import useModal from 'hooks/useModal';
import LabelFormCs from '../LabelFormCs';
import { listStatus } from './ticket-display';


const useStyles = makeStyles((theme) => ({
    root: {
        maxWidth: 800,
    },
    muiDrawerRoot: {
        boxShadow: 'none',
        background: 'none',
        top: 20,
        bottom: 20,
        height: 'auto',
        transform: 'translateX(-50%)',
        left: '50%'
    },
    media: {
        height: 0,
        paddingTop: '56.25%', // 16:9
    },
    expand: {
        // transform: 'rotate(0deg)',
        marginLeft: 'auto',
        // transition: theme.transitions.create('transform', {
        //     duration: theme.transitions.duration.shortest,
        // }),
        transition: 'none'
    },
    BackdropProps: {
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    expandOpen: {
        // transform: 'rotate(180deg)',
    },
    list: {
        width: '70vw',
    },
}));

// control load data to display ticket detail 
export async function loadTicketDetail(ticketCode) {
    const ticketClient = getTicketClient();
    const orderClient = getOrderClient();
    const accountClient = getAccountClient();

    const [departmentsRes, ticketRes] = await Promise.all([
        accountClient.clientGetListDepartment(0, 100, ""),
        ticketClient.getTicketDetail(ticketCode)
    ])

    if (isValid(ticketRes)) {
        const ticketData = getFirst(ticketRes);
        const orderRes = await orderClient.getOrderByOrderNo(ticketData.saleOrderCode);
        if (isValid(orderRes)) {
            const orderInfo = getFirst(orderRes);
            ticketData.customerName = orderInfo.customerName;
            ticketData.customerPhone = orderInfo.customerPhone;
            ticketData.totalPrice = orderInfo.totalPrice;
            ticketData.orderCreatedTime = orderInfo.createdTime;
        }

        return {
            departments: departmentsRes?.data?.map((depart) => ({
                ...depart,
                value: depart.code,
                label: depart.name,
            })) || [],
            ticketData: ticketData
        }
    }

    return {
        departments: [],
        ticketData: null
    }
}

export default function TicketDetail(props) {
    const classes = useStyles();
    return <Drawer
        PaperProps={{
            classes: {
                elevation16: classes.muiDrawerRoot,
            },
        }}
        open={!!props.ticketCode}
        onClose={() => props.onClose()}
    >
        <TicketDetailContent {...props}></TicketDetailContent>
    </Drawer>
}

function TicketDetailContent({
    onClose,
    reasonList,
    ticketCode,
    ticketDetail,
    departments
}) {
    const classes = useStyles();
    const styles = makeStyles(useStyles);
    const { success, error } = useToast();
    const [listAssignUser, setListAssignUser] = useState(ticketDetail ? [{ label: ticketDetail.assignName, value: ticketDetail.assignUser }] : []);
    const [currentDepartment, setCurrentDepartment] = useState(ticketDetail?.departmentCode);
    const [imageSelected, setImageSelected] = useState('');
    const images = ticketDetail?.imageUrls || [];
    const anchor = '';
    const [open, toggle] = useModal();

    const onSubmit = async (data) => {
        const ticketUpdateDetail = {
            code: ticketDetail.code,
            ...data,
            assignUser: data?.assignUser?.value,
            assignName: data?.assignUser?.name,
            departmentCode: data?.departmentCode?.code,
            reasons: data?.reasons?.map((item) => item.value) || [],
            cashback: parseInt(data?.cashback || 0, 10),
            status: data?.status?.value,
        };

        const ticketUpdateRes = await getTicketClient().updateTicket(ticketUpdateDetail);
        if (!isValid(ticketUpdateRes)) {
            error(ticketUpdateRes?.message || 'Cập nhập thất bại ');
            return;
        }
        success('Cập nhập thành công.');
    };

    const { register, handleSubmit, errors, control, reset, setValue, getValues } = useForm({
        mode: 'onChange',
        defaultValues: {
            ...ticketDetail,
            reasons: reasonList.filter((item) => ticketDetail?.reasons?.indexOf(item.value) >= 0),
            status: listStatus.find((item) => item.value === ticketDetail?.status),
            departmentCode: departments.find((item) => item.value === ticketDetail?.departmentCode),
            assignUser: listAssignUser.find((item) => item.value === ticketDetail?.assignUser),
        }
    });

    useEffect(() => {
        setTimeout(() => {
            reset({
                ...ticketDetail,
                reasons: reasonList.filter((item) => ticketDetail?.reasons?.indexOf(item.value) >= 0),
                departmentCode: departments.find((item) => item.value === ticketDetail?.departmentCode),
                assignUser: listAssignUser.find((item) => item.value === ticketDetail?.assignUser),
                status: listStatus.find((item) => item.value === ticketDetail?.status),
            })
            setListAssignUser([{ label: ticketDetail?.assignName, value: ticketDetail?.assignUser }])
        }, 50)
        // console.log(departments)
        // setValue('departmentCode', departments.find((item) => item.value === ticketDetail?.departmentCode));
        // setValue('assignUser', listAssignUser.find((item) => item.value === ticketDetail?.assignUser))
        // setValue('status', listStatus.find((item) => item.value === ticketDetail?.status));
        // setTimeout(() => {
        //     console.log("VALUES", getValues())
        // }, 20)

    }, [ticketDetail])

    const updateListAssignUser = useCallback(async (department) => {
        if (department) {
            setListAssignUser([]);
            const accountClient = getAccountClient();
            const accountResp = await accountClient.getListEmployeeByDepartment(department.code);
            if (accountResp.status === 'OK') {
                // cheat to err data
                const tmpData = [];
                accountResp.data.forEach((account) => {
                    if (account && account.username) {
                        tmpData.push({
                            value: account.accountId,
                            name: account.username,
                            label: account.username,
                        });
                    }
                });

                setListAssignUser(tmpData);
            } else {
                setListAssignUser([{ value: '', label: '' }]);
            }
        } else {
            setListAssignUser([{ value: '', label: '' }]);
        }
    }, []);

    const handleShowImage = (image) => {
        setImageSelected(image);
        toggle();
    };
    return (

        <div
            className={clsx(classes.list, {
                [classes.fullList]: anchor === 'top' || anchor === 'bottom',
            })}
            role="presentation"
        >
            <div className={styles.grid}>
                {!!ticketDetail ? <MyCard style={{ marginBottom: 0, borderRadius: 0 }}>
                    <MyCardHeader title={`Thông tin phiếu hỗ trợ ${ticketDetail?.code}`}>
                        <Grid item container xs={12} justify="flex-end" spacing={1}>
                            <Grid item>
                                <Button variant="contained" color="primary" onClick={handleSubmit(onSubmit)}>
                                    Lưu
                                    </Button>
                            </Grid>
                        </Grid>
                    </MyCardHeader>
                    <form key={ticketDetail?.code}>
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
                                                style={{ color: 'black', marginBottom: '15px' }}
                                            >
                                                Ngày tạo: {formatDateTime(ticketDetail?.createdTime)}
                                            </FormLabel>
                                            <FormLabel
                                                component="legend"
                                                style={{ color: 'black', marginBottom: '15px', fontSize: '32px' }}
                                            >
                                                SO: <b>{ticketDetail?.saleOrderCode}</b>
                                            </FormLabel>
                                            <FormLabel
                                                component="legend"
                                                style={{ color: 'black', marginBottom: '15px' }}
                                            >
                                                Giá trị đơn hàng:{' '}
                                                <span style={{ color: 'green' }}>
                                                    {formatNumber(ticketDetail?.totalPrice)} đ
                            </span>
                                            </FormLabel>
                                            <FormLabel
                                                component="legend"
                                                style={{ color: 'black', marginBottom: '15px' }}
                                            >
                                                Người tạo:{' '}
                                                <span style={{ color: 'grey' }}>{ticketDetail?.createdBy}</span>
                                            </FormLabel>
                                            <LabelFormCs>
                                                Ngày mua:{' '}
                                                <span style={{ color: 'grey' }}>
                                                    {formatDateTime(ticketDetail?.orderCreatedTime)}
                                                </span>
                                            </LabelFormCs>
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={6}>
                                        <Typography gutterBottom>
                                            <FormLabel
                                                component="legend"
                                                style={{ color: 'black', marginBottom: '15px' }}
                                            >
                                                ID khách hàng: {ticketDetail?.customerID}
                                            </FormLabel>
                                            <FormLabel
                                                component="legend"
                                                style={{ color: 'black', marginBottom: '15px' }}
                                            >
                                                Mã khách hàng: {ticketDetail?.customerCode}
                                            </FormLabel>
                                            <FormLabel
                                                component="legend"
                                                style={{ color: 'black', marginBottom: '15px' }}
                                            >
                                                Tên khách hàng: {ticketDetail?.customerName}
                                            </FormLabel>
                                            <FormLabel
                                                component="legend"
                                                style={{ color: 'black', marginBottom: '15px' }}
                                            >
                                                Số điện thoại: {ticketDetail?.customerPhone}
                                            </FormLabel>
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography gutterBottom>
                                            <LabelFormCs>Tên Tài Khoản:</LabelFormCs>
                                        </Typography>
                                        <TextField
                                            name="bankAccountName"
                                            inputRef={register({ required: 'Vui lòng nhập thông tin' })}
                                            error={!!errors.bankAccountName}
                                            helperText={errors.bankAccountName?.message}
                                            variant="outlined"
                                            size="small"
                                            type="text"
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography gutterBottom>
                                            <LabelFormCs>Số tài khoản:</LabelFormCs>
                                        </Typography>
                                        <TextField
                                            name="bankCode"
                                            inputRef={register({ required: 'Vui lòng nhập thông tin' })}
                                            error={!!errors?.bankCode}
                                            helperText={errors?.bankCode?.message}
                                            variant="outlined"
                                            size="small"
                                            type="text"
                                            fullWidth
                                            inputRef={register({
                                                pattern: {
                                                    value: /^\d+$/,
                                                    message: 'Số tài khoản phải là số',
                                                },
                                            })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography gutterBottom>
                                            <LabelFormCs>Ngân hàng:</LabelFormCs>
                                        </Typography>
                                        <TextField
                                            name="bankName"
                                            inputRef={register({ required: 'Vui lòng nhập thông tin' })}
                                            error={!!errors.bank}
                                            helperText={errors.bank?.message}
                                            variant="outlined"
                                            size="small"
                                            type="text"
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography gutterBottom>
                                            <LabelFormCs>Chi nhánh:</LabelFormCs>
                                        </Typography>
                                        <TextField
                                            name="bankBranch"
                                            inputRef={register({ required: 'Vui lòng nhập thông tin' })}
                                            ref={register}
                                            error={!!errors.bankBranch}
                                            helperText={errors?.bankBranch?.message}
                                            variant="outlined"
                                            size="small"
                                            type="text"
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={6}>
                                        <Typography gutterBottom>
                                            <LabelFormCs>Nguyên nhân:</LabelFormCs>
                                        </Typography>
                                        <MuiMultipleAuto
                                            name="reasons"
                                            required
                                            options={reasonList}
                                            placeholder="Chọn"
                                            errors={errors}
                                            control={control}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography gutterBottom>
                                            <LabelFormCs>Chọn bộ phận tiếp nhận:</LabelFormCs>
                                        </Typography>
                                        <MuiSingleAuto
                                            name="departmentCode"
                                            onValueChange={(department) => {
                                                if (department?.code) {
                                                    updateListAssignUser(department);
                                                    setCurrentDepartment(department.code);
                                                } else {
                                                    updateListAssignUser(null);
                                                    setCurrentDepartment(department?.code || '');
                                                }
                                                setValue('assignUser', '');
                                            }}
                                            options={departments}
                                            required
                                            placeholder="Chọn"
                                            errors={errors}
                                            control={control}

                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography gutterBottom>
                                            <LabelFormCs>Chọn người tiếp nhận:</LabelFormCs>
                                        </Typography>
                                        <MuiSingleAuto
                                            name="assignUser"
                                            required
                                            options={listAssignUser}
                                            placeholder="Chọn"
                                            errors={errors}
                                            control={control}
                                            disabled={!currentDepartment}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography gutterBottom>
                                            <LabelFormCs>Chọn trạng thái:</LabelFormCs>
                                        </Typography>
                                        <MuiSingleAuto
                                            placeholder="Chọn"
                                            name="status"
                                            options={listStatus}
                                            errors={errors}
                                            control={control}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography gutterBottom>
                                            <LabelFormCs>Mã trả hàng:</LabelFormCs>
                                        </Typography>
                                        <TextField
                                            name="returnCode"
                                            inputRef={register}
                                            variant="outlined"
                                            size="small"
                                            type="text"
                                            fullWidth
                                            placeholder=""
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={6}>
                                        <Typography gutterBottom>
                                            <LabelFormCs>Số tiền chuyển lại khách:</LabelFormCs>
                                        </Typography>
                                        <TextField
                                            name="cashback"
                                            inputRef={register}
                                            variant="outlined"
                                            size="small"
                                            type="number"
                                            fullWidth
                                            placeholder="0"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={6}>
                                        <Typography gutterBottom>
                                            <LabelFormCs>Facebook khách hàng:</LabelFormCs>
                                        </Typography>
                                        <TextField
                                            name="facebookURL"
                                            inputRef={register}
                                            variant="outlined"
                                            size="small"
                                            type="text"
                                            fullWidth
                                            placeholder="https://facebook.com/thuocsivn"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={6}>
                                        <Typography gutterBottom>
                                            <LabelFormCs>Nôi dung tin nhắn với khách hàng:</LabelFormCs>
                                        </Typography>
                                        <TextField
                                            name="chatURL"
                                            inputRef={register}
                                            variant="outlined"
                                            size="small"
                                            type="text"
                                            fullWidth
                                            placeholder="https://messenger.com/thuocsivn"
                                        />
                                    </Grid>
                                    <Grid item xs={6} sm={6} md={6}>
                                        <Typography gutterBottom>
                                            <LabelFormCs>Phản hồi của khách hàng</LabelFormCs>
                                        </Typography>
                                        <TextareaAutosize
                                            style={{ width: '100%', resize: 'none', padding: 5 }}
                                            name="feedBackContent"
                                            ref={register}
                                            variant="outlined"
                                            size="small"
                                            type="text"
                                            placeholder="Nôi dung xử lý khách hàng ..."
                                            rows="5"
                                        />
                                    </Grid>
                                    <Grid item xs={6} sm={6} md={6}>
                                        <Typography gutterBottom>
                                            <LabelFormCs>Mô tả của nhân viên thuocsi</LabelFormCs>
                                        </Typography>
                                        <TextareaAutosize
                                            style={{ width: '100%', resize: 'none', padding: 5 }}
                                            name="note"
                                            ref={register}
                                            variant="outlined"
                                            size="small"
                                            type="text"
                                            placeholder="Ghi chú..."
                                            rows="5"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={12}>
                                        <Typography gutterBottom>
                                            <LabelFormCs>Hình ảnh sản phẩm (Số lượng : {images.length})</LabelFormCs>
                                        </Typography>
                                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                                            {images.length !== 0 ? (
                                                images.map((image) => (
                                                    <>
                                                        <div style={{ paddingRight: '30px', paddingTop: '15px' }}>
                                                            <div
                                                                style={{
                                                                    borderRadius: '5px',
                                                                    border: '2px solid rgba(0, 0, 0, 0.87)',
                                                                    lineHeight: '0.43',
                                                                }}
                                                            >
                                                                <Image
                                                                    src={image}
                                                                    quality={100}
                                                                    width={220}
                                                                    height={220}
                                                                    onClick={() => handleShowImage(image)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </>
                                                ))
                                            ) : (
                                                    <div>Không có hình ảnh</div>
                                                )}
                                        </div>
                                    </Grid>

                                    <Dialog
                                        open={open}
                                        onClose={toggle}
                                        aria-labelledby="simple-modal-title"
                                        aria-describedby="simple-modal-description"
                                        className={styles.dialog_carousel}
                                    >
                                        <Image src={imageSelected} width="1000" height="600" />
                                    </Dialog>

                                </Grid>
                            </FormControl>
                        </MyCardContent>
                        <MyCardActions>
                            <Grid item container xs={12} justify="flex-end" spacing={1}>
                                <Grid item>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleSubmit(onSubmit)}
                                    >
                                        Lưu
                                    </Button>
                                </Grid>
                            </Grid>
                        </MyCardActions>
                    </form>
                </MyCard> : <div style={{ textAlign: "center", padding: 60, fontSize: 24, color: "#555", background: "#fff", height: '90vh' }}>Đang tải dữ liệu</div>}
            </div>
        </div>
    );
}
