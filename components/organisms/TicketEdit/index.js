import {
  Button,
  Drawer,
  FormControl,
  FormLabel,
  Grid,
  makeStyles,
  TextField,
  Typography,
} from '@material-ui/core';
import MuiMultipleAuto from '@thuocsi/nextjs-components/muiauto/multiple';
import MuiSingleAuto from '@thuocsi/nextjs-components/muiauto/single';
import { MyCard, MyCardContent, MyCardHeader } from '@thuocsi/nextjs-components/my-card/my-card';
import { getAccountClient, getCustomerClient, getOrderClient, getTicketClient } from 'client';
import clsx from 'clsx';
import { LabelFormCs } from 'components/atoms';
import { formatDateTime, formatNumber, listStatus } from 'components/global';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getFirst, isValid } from 'utils';

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 800,
  },
  muiDrawerRoot: {
    boxShadow: 'none',
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
  BackdropProps: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  list: {
    width: '70vw',
  },
}));

const customerClient = getCustomerClient();
const ticketClient = getTicketClient();
const orderClient = getOrderClient();

const TicketEdit = ({ isOpen, onClose, ticketId, listReason, listDepartment, listAssignUser }) => {
  const classes = useStyles();
  const styles = makeStyles(useStyles);
  const [ticketDetail, setTicketDetail] = useState({});

  const anchor = '';

  const { register, handleSubmit, errors, control, clearErrors, setValue } = useForm({
    defaultValues: {
      imageUrls: [],
    },
    mode: 'onChange',
  });

  useEffect(() => {
    const fetchDataDetail = async (code) => {
      const [ticketResult] = await Promise.all([ticketClient.getTicketDetail({ code })]);

      if (isValid(ticketResult)) {
        const detail = getFirst(ticketResult);
        const [accRes, orderRes] = await Promise.all([
          customerClient.getCustomer(detail.customerID),
          orderClient.getOrderByOrderNo(detail.saleOrderCode),
        ]);

        if (isValid(accRes)) {
          detail.customer = getFirst(accRes);
        }
        if (isValid(orderRes)) {
          detail.order = getFirst(orderRes);
        }

        setTicketDetail(detail);
      }
    };

    fetchDataDetail(ticketId);
  }, []);

  const { cashback = 0, bankBranch = '', bankName = '', note = '', returnCode = '' } = ticketDetail;
  return (
    <Drawer
      ModalProps={{
        BackdropProps: {
          classes: {
            root: classes.BackdropProps,
          },
        },
      }}
      PaperProps={{
        classes: {
          elevation16: classes.muiDrawerRoot,
        },
      }}
      anchor="right"
      open={isOpen}
      onClose={() => onClose()}
    >
      <div
        className={clsx(classes.list, {
          [classes.fullList]: anchor === 'top' || anchor === 'bottom',
        })}
        role="presentation"
      >
        <div className={styles.grid}>
          <MyCard>
            <MyCardHeader title="Thông tin yêu cầu" />
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
                          style={{ color: 'black', marginBottom: '15px', fontSize: '40px' }}
                        >
                          {ticketDetail?.code} - {ticketDetail?.saleOrderCode}
                        </FormLabel>
                        <FormLabel
                          component="legend"
                          style={{ color: 'black', marginBottom: '15px' }}
                        >
                          Gía đơn hàng:{' '}
                          <span style={{ color: 'green' }}>
                            {formatNumber(ticketDetail?.totalPrice)} đ
                          </span>
                        </FormLabel>
                        <FormLabel
                          component="legend"
                          style={{ color: 'black', marginBottom: '15px' }}
                        >
                          Số lượng sản phẩm: 37
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
                            {formatDateTime(ticketDetail?.order?.createdTime)}
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
                          User ID: {ticketDetail?.customerID}
                        </FormLabel>
                        <FormLabel
                          component="legend"
                          style={{ color: 'black', marginBottom: '15px' }}
                        >
                          Tên doanh nghiệp:
                        </FormLabel>
                        <FormLabel
                          component="legend"
                          style={{ color: 'black', marginBottom: '15px' }}
                        >
                          Họ tên khách hàng: {ticketDetail?.order?.customerName}
                        </FormLabel>
                        <FormLabel
                          component="legend"
                          style={{ color: 'black', marginBottom: '15px' }}
                        >
                          Số điện thoại: {ticketDetail?.order?.customerPhone}
                        </FormLabel>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography gutterBottom>
                        <LabelFormCs>Tên khách hàng:</LabelFormCs>
                      </Typography>
                      <TextField
                        name="customerName"
                        inputRef={register({ required: 'Vui lòng nhập thông tin' })}
                        error={!!errors.customerName}
                        helperText={errors.customerName?.message}
                        variant="outlined"
                        size="small"
                        type="text"
                        fullWidth
                        value={ticketDetail?.order?.customerName}
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
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography gutterBottom>
                        <LabelFormCs>Ngân hàng:</LabelFormCs>
                      </Typography>
                      <TextField
                        name="bank"
                        inputRef={register({ required: 'Vui lòng nhập thông tin' })}
                        error={!!errors.bank}
                        helperText={errors.bank?.message}
                        variant="outlined"
                        size="small"
                        type="text"
                        fullWidth
                        value={bankName}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography gutterBottom>
                        <LabelFormCs>Chi nhánh:</LabelFormCs>
                      </Typography>
                      <TextField
                        name="bankBranch"
                        inputRef={register({ required: 'Vui lòng nhập thông tin' })}
                        error={!!errors.bankBranch}
                        helperText={errors?.bankBranch?.message}
                        variant="outlined"
                        size="small"
                        type="text"
                        fullWidth
                        value={bankBranch}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <Typography gutterBottom>
                        <LabelFormCs>Nguyên nhân:</LabelFormCs>
                      </Typography>
                      <MuiMultipleAuto
                        name="reasons"
                        required
                        options={listReason}
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
                        onValueChange={(data) => {
                          console.log(data);
                        }}
                        options={listDepartment}
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
                        placeholder="0"
                        value={returnCode}
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
                        value={cashback}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <Typography gutterBottom>
                        <LabelFormCs>Mô tả</LabelFormCs>
                      </Typography>
                      <TextField
                        name="note"
                        inputRef={register}
                        variant="outlined"
                        size="small"
                        type="text"
                        fullWidth
                        placeholder="Ghi chú..."
                        value={note}
                      />
                    </Grid>
                    <Grid item container xs={12} justify="flex-end" spacing={1}>
                      <Grid item>
                        <Button
                          variant="contained"
                          color="default"
                          // onClick={() => toggleDrawer(anchor, false)}
                        >
                          Quay lại
                        </Button>
                      </Grid>
                      <Grid item>
                        <Button
                          variant="contained"
                          color="primary"
                          // onClick={handleSubmit(onSubmit)}
                        >
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
    </Drawer>
  );
};

export default TicketEdit;
