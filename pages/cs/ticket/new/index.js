import React, { useCallback, useEffect, useState } from 'react';
import { Button, FormControl, FormLabel, TextField, Typography, Grid, TextareaAutosize, Box } from '@material-ui/core';

import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ImageUploadField from 'components/image-upload-field';
import AppCS from 'pages/_layout';

import { actionErrorText, unknownErrorText } from 'components/commonErrors';

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { useForm } from 'react-hook-form';

import { doWithLoggedInUser, renderWithLoggedInUser } from '@thuocsi/nextjs-components/lib/login';
import { MyCard, MyCardActions, MyCardContent, MyCardHeader } from '@thuocsi/nextjs-components/my-card/my-card';
import MuiSingleAuto from '@thuocsi/nextjs-components/muiauto/single';
import MuiMultipleAuto from '@thuocsi/nextjs-components/muiauto/multiple';
import { useToast } from '@thuocsi/nextjs-components/toast/useToast';
import LabelBox from '@thuocsi/nextjs-components/editor/label-box';
import { LabelFormCs } from 'components';
import { getData, getFirst, isValid } from 'utils';
import { PATH_URL } from 'data';
import { getTicketClient, getCustomerClient, getAccountClient, getOrderClient } from 'client';
import TicketTable from 'components/ticket/ticket-table';
import styles from './request.module.css';

const breadcrumb = [
    {
        name: 'Trang chủ',
        link: '/cs',
    },
    {
        name: 'Thêm phiếu hỗ trợ mới',
    },
];

export async function loadRequestData(ctx) {
    const props = {};
    const data = { props };

    const { so = '' } = ctx?.query;

    const accountClient = getAccountClient(ctx, data);
    const ticketClient = getTicketClient(ctx, data);
    const orderClient = getOrderClient(ctx, data);
    const customerClient = getCustomerClient(ctx, data);

    // fetch data from APIs
    if (so && so.length > 0) {
        // nếu so là số thì sẽ gọi api get orderId , còn lại  là orderCode
        let params = {};
        if (so && +so > 0) {
            params = { orderId: +so };
        } else {
            params = { orderCode: so };
        }

        const [listDepartmentResult, listReasonsResult, orderResult, ticketResult] = await Promise.all([
            accountClient.getListDepartment(0, 100, ''),
            ticketClient.getReasonList(),
            orderClient.getByOrderNo(so),
            ticketClient.getAllTicket(params, 0, 100),
        ]);

        const listDepartment =
            listDepartmentResult?.data?.map((department) => ({
                ...department,
                value: department.code,
                label: department.name,
            })) || [];

        const listReasons = listReasonsResult?.data || [];

        let orderData = null;
        let tickets = [];

        orderData = getFirst(orderResult);

        if (orderData) {
            const bankResult = await customerClient.getListBankAccountServer(orderData.customerID);
            if (isValid(bankResult)) {
                orderData.bankInfo = getFirst(bankResult);
            }
        }
        tickets = getData(ticketResult);

        // data mapping
        props.tickets = tickets;
        props.listReasons = listReasons;
        props.listDepartment = listDepartment;
        props.orderData = orderData;
        props.so = so;
    }

    return data;
}

export async function getServerSideProps(ctx) {
    return doWithLoggedInUser(ctx, (cbCtx) => loadRequestData(cbCtx));
}

const PageNewCS = ({ listReasons, listDepartment, orderData = null, tickets = [], so = '' }) => {
    const router = useRouter();
    const [listAssignUser, setListAssignUser] = useState([{ value: '', label: 'Không có nguời tiếp nhận', name: '' }]);
    const [ticketImages, setTicketImages] = useState([]);
    const [currentDepartment, setCurrentDepartment] = useState('');
    const { error, success } = useToast();

    const { register, handleSubmit, errors, control, getValues, setValue } = useForm({
        mode: 'onChange',
        defaultValues: {
            imageUrls: [],
        },
    });

    const onSearchOrder = useCallback(async (code) => {
        router.push(`?so=${code}`);
    }, []);

    const handleRefreshData = () => {
        onSearchOrder(so);
    };
    const ticketClient = getTicketClient();
    async function uploadImage(img) {
        const res = await ticketClient.uploadImage(img);
        return res?.data || [];
    }

    async function handleCropCallback(data) {
        try {
            const imageData = await uploadImage({
                data,
            });
            const images = [...getValues('imageUrls'), imageData[0]];
            setValue('imageUrls', images);
            setTicketImages(images);
        } catch (err) {
            error(err.message || err.toString());
        }
    }

    const handleRemoveImage = (url) => {
        const images = getValues('imageUrls')?.filter((imgUrl) => imgUrl !== url);
        setValue('imageUrls', images);
        setTicketImages(images);
    };

    // onSubmit
    const onSubmit = async (formData) => {
        if (!formData.departmentCode.code) {
            error('Vui lòng chọn bộ phận tiếp nhận');
            return;
        }
        if (!formData.assignUser?.value) {
            error('vui lòng chọn người tiếp nhận');
            return;
        }
        try {
            const customerClient = getCustomerClient();
            const ticketResp = await ticketClient.createTicket({
                saleOrderCode: orderData.orderNo,
                saleOrderID: orderData.orderId,
                orderId: orderData.orderId,
                customerID: orderData.customerID,
                customerCode: orderData.customerCode,
                departmentCode: formData.departmentCode.code,
                reasons: formData.reasons.map(({ value }) => value),
                returnCode: formData.returnCode,
                cashback: +formData.cashback,
                note: formData.note,
                assignUser: parseInt(formData.assignUser.value, 10),
                assignName: formData.assignUser.name,
                bankName: formData.bankName,
                bankAccountName: formData.bankAccountName,
                bankCode: formData.bankCode,
                bankBranch: formData.bankBranch,
                facebookURL: formData.facebookURL,
                chatURL: formData.chatURL,
                feedBackContent: formData.feedBackContent,
                imageUrls: formData.imageUrls,
            });
            if (ticketResp.status !== 'OK') {
                error(ticketResp.message ?? actionErrorText);
                return;
            }

            await customerClient.updateBankCustomer({
                bankName: formData.bankName,
                bankCode: formData.bankCode,
                bankBranch: formData.bankBranch,
                bankAccountName: formData.bankAccountName,
                customerID: orderData.customerID,
            });

            if (ticketResp.status !== 'OK') {
                error(ticketResp.message ?? actionErrorText);
            } else {
                success('Tạo yêu cầu thành công');
                setTimeout(() => {
                    router.reload();
                }, 1500);
            }
        } catch (err) {
            error(err ?? unknownErrorText);
        }
    };

    const updateListAssignUser = useCallback(async (department) => {
        if (department) {
            const accountClient = getAccountClient();
            const accountResp = await accountClient.getListEmployeeByDepartment(department.code);
            if (accountResp.status === 'OK') {
                // cheat to err data
                const tmpData = [];
                accountResp.data.forEach((account) => {
                    if (account && account.username) {
                        tmpData.push({
                            value: account.accountId,
                            label: account.username,
                            name: account.username,
                        });
                    }
                });
                setListAssignUser(tmpData);
            } else {
                setListAssignUser([{ value: '', label: 'Không có người tiếp nhận', name: '' }]);
            }
        } else {
            setListAssignUser([{ value: '', label: 'Không có người tiếp nhận', name: '' }]);
        }
    }, []);
    useEffect(() => {
        register({ name: 'imageUrls' });
    }, []);
    return (
        <AppCS select={PATH_URL.ALL_TICKETS} breadcrumb={breadcrumb}>
            <Head>
                <title>Thêm phiếu mới</title>
            </Head>
            <div className={styles.grid}>
                <MyCard>
                    <MyCardHeader title="Tìm đơn theo SO" small />
                    <MyCardContent>
                        <FormControl size="small">
                            <Grid container spacing={3} direction="row" justify="space-between" alignItems="center">
                                <Grid item xs={12} sm={12} md={7}>
                                    <TextField
                                        variant="outlined"
                                        name="orderNo"
                                        error={!!errors.orderNo}
                                        helperText={errors.orderNo?.message}
                                        inputRef={register({
                                            required: 'Vui lòng nhập thông tin',
                                        })}
                                        size="small"
                                        type="text"
                                        placeholder="Nhập Mã SO"
                                        defaultValue={so}
                                        onKeyDown={(e) => e.key === 'Enter' && onSearchOrder(getValues('orderNo'))}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={12} md={5}>
                                    <Button variant="contained" color="primary" onClick={() => onSearchOrder(getValues('orderNo'))}>
                                        Tìm kiếm
                                    </Button>
                                </Grid>
                            </Grid>
                        </FormControl>
                    </MyCardContent>
                </MyCard>

                {orderData && (
                    <Box>
                        <MyCard>
                            <MyCardHeader title={`Các phiếu hỗ trợ đang có của đơn ${so}`} small />
                            <TicketTable data={tickets} reasonList={listReasons} refreshData={handleRefreshData} isNew />
                        </MyCard>

                        <MyCard>
                            <MyCardHeader title="Thêm phiếu hỗ trợ mới" small />
                            <form>
                                <MyCardContent>
                                    <FormControl size="small">
                                        <Grid
                                            container
                                            spacing={3}
                                            direction="row"
                                            justify="space-between"
                                            alignItems="center"
                                            style={{ marginTop: '10px' }}
                                        >
                                            <Grid item xs={12} sm={6} md={3}>
                                                <Typography gutterBottom>
                                                    <LabelFormCs>Tên tài khoản:</LabelFormCs>
                                                </Typography>
                                                <TextField
                                                    disabled={!orderData}
                                                    variant="outlined"
                                                    size="small"
                                                    type="text"
                                                    fullWidth
                                                    name="bankAccountName"
                                                    error={!!errors.bankAccountName}
                                                    helperText={errors.bankAccountName?.message}
                                                    inputRef={register({
                                                        // required: 'Vui lòng nhập thông tin',
                                                    })}
                                                    defaultValue={orderData?.bankInfo?.bankAccountName}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <Typography gutterBottom>
                                                    <LabelFormCs>Số tài khoản:</LabelFormCs>
                                                </Typography>
                                                <TextField
                                                    disabled={!orderData}
                                                    variant="outlined"
                                                    size="small"
                                                    type="text"
                                                    fullWidth
                                                    name="bankCode"
                                                    error={!!errors.bankCode}
                                                    helperText={errors.bankCode?.message}
                                                    inputRef={register({
                                                        pattern: {
                                                            value: /^\d+$/,
                                                            message: 'Số tài khoản phải là số',
                                                        },
                                                    })}
                                                    defaultValue={orderData?.bankInfo?.bankCode}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <Typography gutterBottom>
                                                    <LabelFormCs>Ngân hàng:</LabelFormCs>
                                                </Typography>
                                                <TextField
                                                    disabled={!orderData}
                                                    variant="outlined"
                                                    size="small"
                                                    type="text"
                                                    fullWidth
                                                    name="bankName"
                                                    error={!!errors.bankName}
                                                    helperText={errors.bankName?.message}
                                                    inputRef={register({})}
                                                    defaultValue={orderData?.bankInfo?.bankName}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <Typography gutterBottom>
                                                    <LabelFormCs>Chi nhánh:</LabelFormCs>
                                                </Typography>
                                                <TextField
                                                    disabled={!orderData}
                                                    variant="outlined"
                                                    size="small"
                                                    type="text"
                                                    fullWidth
                                                    name="bankBranch"
                                                    error={!!errors.bankBranch}
                                                    helperText={errors.bankBranch?.message}
                                                    inputRef={register({})}
                                                    defaultValue={orderData?.bankInfo?.bankBranch}
                                                />
                                            </Grid>
                                        </Grid>
                                        <Grid
                                            container
                                            spacing={3}
                                            direction="row"
                                            justify="space-between"
                                            alignItems="center"
                                            style={{ marginTop: '10px' }}
                                        >
                                            <Grid item xs={12} sm={6} md={6}>
                                                <Typography gutterBottom>
                                                    <LabelFormCs>
                                                        Chọn nguyên nhân: <span style={{ color: 'red' }}>(*)</span>
                                                    </LabelFormCs>
                                                </Typography>
                                                <MuiMultipleAuto
                                                    required
                                                    name="reasons"
                                                    options={listReasons}
                                                    placeholder="Chọn"
                                                    errors={errors}
                                                    control={control}
                                                />
                                            </Grid>

                                            <Grid item xs={12} sm={6} md={3}>
                                                <Typography gutterBottom>
                                                    <LabelFormCs>
                                                        Chọn bộ phận tiếp nhận: <span style={{ color: 'red' }}>(*)</span>
                                                    </LabelFormCs>
                                                </Typography>
                                                <MuiSingleAuto
                                                    required
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
                                                    options={listDepartment}
                                                    placeholder="Chọn"
                                                    name="departmentCode"
                                                    errors={errors}
                                                    control={control}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <Typography gutterBottom>
                                                    <LabelFormCs>
                                                        Chọn người tiếp nhận: <span style={{ color: 'red' }}>(*)</span>
                                                    </LabelFormCs>
                                                </Typography>
                                                <MuiSingleAuto
                                                    options={listAssignUser}
                                                    required
                                                    placeholder="Chọn"
                                                    name="assignUser"
                                                    errors={errors}
                                                    control={control}
                                                    defaultValue=""
                                                    disabled={!currentDepartment}
                                                />
                                            </Grid>

                                            <Grid item xs={12} sm={6} md={6}>
                                                <Typography gutterBottom>
                                                    <FormLabel component="legend" style={{ fontWeight: 'bold', color: 'black' }}>
                                                        Mã trả hàng:
                                                    </FormLabel>
                                                </Typography>
                                                <TextField
                                                    name="returnCode"
                                                    inputRef={register}
                                                    variant="outlined"
                                                    size="small"
                                                    type="text"
                                                    fullWidth
                                                    placeholder="X547PFD"
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={6}>
                                                <Typography gutterBottom>
                                                    <LabelFormCs>Số tiền trả lại:</LabelFormCs>
                                                </Typography>
                                                <TextField
                                                    name="cashback"
                                                    inputRef={register({
                                                        min: {
                                                            value: 1,
                                                            message: 'số tiển nhỏ nhất là 1',
                                                        },
                                                        max: {
                                                            value: 100000000,
                                                            message: 'số tiền lớn nhất là 100.000.000',
                                                        },
                                                    })}
                                                    variant="outlined"
                                                    size="small"
                                                    type="number"
                                                    fullWidth
                                                    placeholder="0"
                                                    error={!!errors.cashback}
                                                    helperText={errors.cashback?.message}
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
                                            <Grid item xs={12} sm={12} md={6}>
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
                                            <Grid item xs={12} sm={12} md={6}>
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
                                                    placeholder="Ghi chú ..."
                                                    rows="5"
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={12} md={6} className={styles.image}>
                                                <LabelBox label="Hình ảnh phản hồi" padding={2}>
                                                    <ImageUploadField
                                                        title="Cập nhật hình ảnh sản phẩm"
                                                        images={ticketImages}
                                                        handleCropCallback={handleCropCallback}
                                                        handleRemoveImage={handleRemoveImage}
                                                    />
                                                </LabelBox>
                                            </Grid>
                                        </Grid>
                                    </FormControl>
                                </MyCardContent>
                                <MyCardActions>
                                    <Grid item container xs={12} justify="flex-end" spacing={1}>
                                        <Grid item>
                                            <Link href="#id">
                                                <Button variant="contained" color="primary" onClick={handleSubmit(onSubmit)}>
                                                    Tạo phiếu
                                                </Button>
                                            </Link>
                                        </Grid>
                                    </Grid>
                                </MyCardActions>
                            </form>
                        </MyCard>
                    </Box>
                )}
            </div>
        </AppCS>
    );
};

export default function index(props) {
    return renderWithLoggedInUser(props, PageNewCS);
}
