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
} from '@material-ui/core';
import MuiMultipleAuto from '@thuocsi/nextjs-components/muiauto/multiple';
import MuiSingleAuto from '@thuocsi/nextjs-components/muiauto/single';
import { MyCard, MyCardContent, MyCardHeader } from '@thuocsi/nextjs-components/my-card/my-card';
import { useToast } from '@thuocsi/nextjs-components/toast/useToast';
import { getAccountClient, getTicketClient } from 'client';
import clsx from 'clsx';
import { formatDateTime, formatNumber, listStatus } from 'components/global';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { isValid } from 'utils';
import LabelFormCs from '../LabelFormCs';

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

const ticketClient = getTicketClient();

const TicketEdit = ({
  isOpen,
  onClose,
  listReason,
  listDepartment,
  ticketDetail,
  listAssignUser: usersAssign,
}) => {
  const classes = useStyles();
  const styles = makeStyles(useStyles);
  const { success, error } = useToast();
  const [listAssignUser, setListAssignUser] = useState(usersAssign);

  const anchor = '';

  const onSubmit = async (data) => {
    const ticketUpdateDetail = {
      code: ticketDetail.code,
      ...data,
      assignUser: data?.assignUser?.value,
      departmentCode: data?.departmentCode?.code,
      reasons: data?.reasons?.map((item) => item.value) || [],
      cashback: parseInt(data?.cashback || 0, 10),
      status: data?.status?.value,
      facebookURL: data?.facebookURL,
      chatContent: data?.chatContent,
    };

    const ticketUpdateRes = await ticketClient.updateTicket(ticketUpdateDetail);
    if (!isValid(ticketUpdateRes)) {
      error(ticketUpdateRes?.message || 'Cập nhập thất bại ');
      return;
    }
    success('Cập nhập thành công.');
  };

  if (!ticketDetail) {
    return null;
  }

  const { register, handleSubmit, errors, control } = useForm({
    mode: 'onChange',
    defaultValues: {
      ...ticketDetail,
      status: listStatus.find((item) => item.value === ticketDetail.status),
      departmentCode: listDepartment.find((item) => item.value === ticketDetail.departmentCode),
      reasons: listReason.filter((item) => ticketDetail?.reasons?.indexOf(item.value) >= 0),
      assignUser: listAssignUser.find((item) => item.value === ticketDetail.assignUser),
    },
  });

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
        setListAssignUser([{ value: '', label: '' }]);
      }
    } else {
      setListAssignUser([{ value: '', label: '' }]);
    }
  }, []);

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
            <MyCardHeader title="Thông tin yêu cầu">
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
                          Số lượng sản phẩm: __
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
                          Họ tên khách hàng: {ticketDetail?.customerName}
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
                        onValueChange={(data) => updateListAssignUser(data)}
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
                        <LabelFormCs>Nôi dung tin nhắn vơi khách hàng:</LabelFormCs>
                      </Typography>
                      <TextField
                        name="facebookURL"
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
                        name="chatContent"
                        ref={register}
                        inputRef={register}
                        variant="outlined"
                        size="small"
                        type="text"
                        fullWidth
                        placeholder="Nôi dung xử lý khách hàng ..."
                        rows="5"
                      />
                    </Grid>
                    <Grid item xs={12} sm={12} md={12}>
                      <Typography gutterBottom>
                        <LabelFormCs>Mô tả (CS)</LabelFormCs>
                      </Typography>
                      <TextareaAutosize
                        style={{ width: '100%' }}
                        name="note"
                        ref={register}
                        inputRef={register}
                        variant="outlined"
                        size="small"
                        type="text"
                        fullWidth
                        placeholder="Ghi chú..."
                        rows="5"
                      />
                    </Grid>
                    {/* <Grid item xs={12} sm={12} md={12}>
                      <Typography gutterBottom>
                        <LabelFormCs>Nôi dung xử lý khách hàng</LabelFormCs>
                      </Typography>
                      <TextareaAutosize
                        style={{ width: '100%' }}
                        name="chatContent"
                        ref={register}
                        inputRef={register}
                        variant="outlined"
                        size="small"
                        type="text"
                        fullWidth
                        placeholder="Nôi dung xử lý khách hàng ..."
                        rows="10"
                      />
                    </Grid> */}
                    <Grid item container xs={12} justify="flex-end" spacing={1}>
                      <Grid item>
                        <Button variant="contained" color="default" onClick={() => onClose()}>
                          Quay lại
                        </Button>
                      </Grid>
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
