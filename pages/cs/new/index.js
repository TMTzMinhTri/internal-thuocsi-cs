import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Paper,
  FormControl,
  FormLabel,
  TextField,
  Typography,
  Grid,
  TextareaAutosize,
} from '@material-ui/core';

import Head from 'next/head';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import ImageUploadField from "components/image-upload-field";
import AppCS from 'pages/_layout';

import { actionErrorText, unknownErrorText } from 'components/commonErrors';

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { useForm } from 'react-hook-form';

import { doWithLoggedInUser, renderWithLoggedInUser } from '@thuocsi/nextjs-components/lib/login';
import { MyCard, MyCardContent, MyCardHeader } from '@thuocsi/nextjs-components/my-card/my-card';
import MuiSingleAuto from '@thuocsi/nextjs-components/muiauto/single';
import MuiMultipleAuto from '@thuocsi/nextjs-components/muiauto/multiple';
import { useToast } from '@thuocsi/nextjs-components/toast/useToast';
import LabelBox from "@thuocsi/nextjs-components/editor/label-box/index";
import { LabelFormCs, TicketTable } from 'components';
import { getData, getFirst, isValid } from 'utils';
import { PATH_URL } from 'data';
import { getTicketClient, getCustomerClient, getAccountClient, getOrderClient, getCommonClient } from 'client';
import styles from './request.module.css';

const breadcrumb = [
  {
    name: 'Trang chủ',
    link: '/cs',
  },
  {
    name: 'Thêm yêu cầu mới',
  },
];

export async function loadRequestData(ctx) {
  const { orderNo = '' } = ctx?.query;

  const accountClient = getAccountClient(ctx, {});
  const ticketClient = getTicketClient(ctx, {});
  const orderClient = getOrderClient(ctx, {});
  const customerClient = getCustomerClient(ctx, {});

  const [listDepartmentResult, listReasonsResult] = await Promise.all([
    accountClient.getListDepartment(0, 20, ''),
    ticketClient.getListReason(),
  ]);

  const listDepartment =
    listDepartmentResult?.data?.map((department) => ({
      ...department,
      value: department.code,
      label: department.name,
    })) || [];

  const listReasons = listReasonsResult?.data?.map((item) => ({
    value: item.code,
    label: item.name,
  }));

  let orderData = null;
  let tickets = [];

  if (orderNo && orderNo.length > 0) {
    const [orderResult, ticketResult] = await Promise.all([
      orderClient.getByOrderNo(orderNo),
      ticketClient.getTicketBySaleOrderCodeServer({ saleOrderCode: orderNo }),
    ]);

    orderData = getFirst(orderResult);

    if (orderData) {
      const bankResult = await customerClient.getListBankAccountServer(orderData.customerID);
      if (isValid(bankResult)) {
        orderData.bankInfo = getFirst(bankResult);
      }
    }

    tickets = getData(ticketResult);
  }

  return {
    props: {
      listDepartment,
      listReasons,
      orderData,
      tickets,
      orderNo,
    },
  };
}

export async function getServerSideProps(ctx) {
  return doWithLoggedInUser(ctx, (cbCtx) => loadRequestData(cbCtx));
}

const PageNewCS = ({
  listReasons,
  listDepartment,
  orderData = null,
  tickets = [],
  orderNo = '',
}) => {
  const router = useRouter();

  const [listAssignUser, setListAssignUser] = useState([
    { value: '', label: 'Không có nguời tiếp nhận' },
  ]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [ticketImages, setTicketImages] = useState(orderData.imageUrls ?? []);
  const { error, success } = useToast();

  const { register, handleSubmit, errors, control, getValues, setValue } = useForm({
    mode: 'onChange',
    defaultValues: {
      imageUrls: []
    }
  });

  const onSearchOrder = useCallback(async (code) => {
    router.push(`?orderNo=${code}`);
  }, []);

  const handleRefreshData = () => {
    onSearchOrder(orderNo);
  };
  const commonClient = getCommonClient();
  async function uploadImage(img) {
    const res = await commonClient.uploadImage(img);
    return res.data;
  }

  async function handleCropCallback(value) {
    setUploadingImage(true);
    try {
      const result = await uploadImage({
        data: value,
      });
      const images = [...getValues("imageUrls"), result[0]];
      setValue("imageUrls", images);
      setTicketImages(images);
    } catch (err) {
      error(err.message || err.toString());
    }
    setUploadingImage(false);
  }

  const handleRemoveImage = (url) => {
    setUploadingImage(true);
    const images = [...getValues("imageUrls")?.filter((imgUrl) => imgUrl !== url)];
    setValue("imageUrls", images);
    setTicketImages(images);
    setUploadingImage(false);
  };

  // onSubmit
  const onSubmit = async (formData) => {
    try {
      const ticketClient = getTicketClient();
      const customerClient = getCustomerClient();
      const ticketResp = await ticketClient.createTicket({
        saleOrderCode: orderData.orderNo,
        saleOrderID: orderData.orderId,
        customerID: orderData.customerID,
        departmentCode: formData.departmentCode.code,
        reasons: formData.reasons.map(({ value }) => value),
        returnCode: formData.returnCode,
        cashback: +formData.cashback,
        note: formData.note,
        assignUser: parseInt(formData.assignUser.value, 10),
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
        accountID: orderData.customerID,
      });

      if (ticketResp.status !== 'OK') {
        error(ticketResp.message ?? actionErrorText);
      } else {
        success('Tạo yêu cầu thành công');
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
            tmpData.push({ value: account.accountId, label: account.username });
          }
        });
        setListAssignUser(tmpData);
      } else {
        setListAssignUser([{ value: '', label: 'Không có người tiếp nhận' }]);
      }
    } else {
      setListAssignUser([{ value: '', label: 'Không có người tiếp nhận' }]);
    }
  }, []);
  useEffect(() => {
    register({ name: "imageUrls" });
  }, []);
  return (
    <AppCS select={PATH_URL.ALL_TICKETS} readcrumb={breadcrumb}>
      <Head>
        <title>Thêm yêu cầu mới</title>
      </Head>
      <div className={styles.grid}>
        <MyCard>
          <MyCardHeader title="Thêm yêu cầu mới" />
          <form>
            <MyCardContent>
              <FormControl size="small">
                <Grid
                  container
                  spacing={3}
                  direction="row"
                  justify="space-between"
                  alignItems="center"
                >
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
                      defaultValue={orderNo}
                      onKeyDown={(e) => e.key === 'Enter' && onSearchOrder(getValues('orderNo'))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={5}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => onSearchOrder(getValues('orderNo'))}
                    >
                      Tìm kiếm
                    </Button>
                  </Grid>
                </Grid>
              </FormControl>
            </MyCardContent>
            {orderData && (
              <>
                <Paper className={`${styles.search}`}>
                  <FormControl size="small">
                    <Grid
                      container
                      spacing={3}
                      direction="row"
                      justify="space-between"
                      alignItems="center"
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
                          name="bankAcountName"
                          error={!!errors.bankAcountName}
                          helperText={errors.bankAcountName?.message}
                          inputRef={register({
                            required: 'Vui lòng nhập thông tin',
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
                            required: 'Vui lòng nhập thông tin',
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
                          inputRef={register({
                            required: 'Vui lòng nhập thông tin',
                          })}
                          defaultValue={orderData?.bankInfo?.bankCode}
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
                          inputRef={register({
                            required: 'Vui lòng nhập thông tin',
                          })}
                          defaultValue={orderData?.bankInfo?.bankBranch}
                        />
                      </Grid>
                    </Grid>
                  </FormControl>
                </Paper>
                {/* table cs  */}
                <TicketTable
                  data={tickets}
                  listReasons={listReasons}
                  refreshData={handleRefreshData}
                />

                <Paper className={`${styles.search}`}>
                  <FormControl size="small">
                    <Grid
                      container
                      spacing={3}
                      direction="row"
                      justify="space-between"
                      alignItems="center"
                    >
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography gutterBottom>
                          <LabelFormCs>
                            Chọn lý do: <span style={{ color: 'red' }}>(*)</span>
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
                          onValueChange={(data) => updateListAssignUser(data)}
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
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography gutterBottom>
                          <FormLabel
                            component="legend"
                            style={{ fontWeight: 'bold', color: 'black' }}
                          >
                            Mã giao hàng tiết kiệm: (Mã return)
                          </FormLabel>
                        </Typography>
                        <TextField
                          name="returnCode"
                          inputRef={register}
                          variant="outlined"
                          size="small"
                          type="text"
                          fullWidth
                          placeholder="0"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={6}>
                        <Typography gutterBottom>
                          <LabelFormCs>Số tiền trả lại:</LabelFormCs>
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
                          <LabelFormCs>
                            Ghi chú (hàng trả về): <span style={{ color: 'red' }}>(*)</span>
                          </LabelFormCs>
                        </Typography>
                        <TextField
                          name="note"
                          error={!!errors.note}
                          helperText={errors.note?.message}
                          inputRef={register({
                            required: 'Vui lòng nhập thông tin',
                          })}
                          variant="outlined"
                          size="small"
                          type="text"
                          fullWidth
                          placeholder="Ghi chú..."
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
                          <LabelFormCs>Nôi dung tin nhắn vơi khách hàng:</LabelFormCs>
                        </Typography>
                        <TextField
                          name="chatURL"
                          inputRef={register}
                          variant="outlined"
                          size="small"
                          type="text"
                          fullWidth
                          placeholder="https://messenger.comthuocsivn"
                        />
                      </Grid>
                      <Grid item xs={12} sm={12} md={12}>
                        <Typography gutterBottom>
                          <LabelFormCs>Phản hồi khách hàng</LabelFormCs>
                        </Typography>
                        <TextareaAutosize
                          style={{ width: '100%' }}
                          name="feedBackContent"
                          ref={register}
                          variant="outlined"
                          size="small"
                          type="text"
                          placeholder="Nôi dung xử lý khách hàng ..."
                          rows="5"
                        />
                      </Grid>
                      <Grid item xs={12} sm={12} md={12}>
                        <LabelBox label="Hình ảnh phản hồi" padding={5}>
                          <ImageUploadField
                            title="Cập nhật hình ảnh sản phẩm"
                            images={ticketImages}
                            handleCropCallback={handleCropCallback}
                            handleRemoveImage={handleRemoveImage}

                          />
                        </LabelBox>
                      </Grid>
                      <Grid item container xs={12} justify="flex-end" spacing={1}>
                        <Grid item>
                          <Link href="/cs">
                            <Button variant="contained" color="default">
                              Quay lại
                            </Button>
                          </Link>
                        </Grid>
                        <Grid item>
                          <Link href="#id">
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={handleSubmit(onSubmit)}
                            >
                              Lưu
                            </Button>
                          </Link>
                        </Grid>
                      </Grid>
                    </Grid>
                  </FormControl>
                </Paper>
              </>
            )}
          </form>
        </MyCard>
      </div>
    </AppCS>
  );
};

export default function index(props) {
  return renderWithLoggedInUser(props, PageNewCS);
}
