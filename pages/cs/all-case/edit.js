import React, { useEffect, useState } from 'react';
import { Button, FormControl, FormLabel, TextField, Typography, Grid } from '@material-ui/core';
import Head from 'next/head';
import { MyCard, MyCardContent, MyCardHeader } from '@thuocsi/nextjs-components/my-card/my-card';

import { doWithLoggedInUser, renderWithLoggedInUser } from '@thuocsi/nextjs-components/lib/login';
import AppCS from 'pages/_layout';

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { useForm } from 'react-hook-form';
import MuiSingleAuto from '@thuocsi/nextjs-components/muiauto/single';
import Link from 'next/link';
import { LabelFormCs } from 'components/atoms';
import styles from './request.module.css';

export async function loadRequestData() {
  const data = {
    props: {
      data: [
        {
          number: '20691',
          soNumber: 'SO18481',
          orderNumber: '62531',
          error: 'sai sản phẩ1',
          note: 'Hộp bị méo gó1',
          client: 'Nguyễn Văn 1',
          status: 'Chưa xử l1',
          createdPerson: 'c1',
          updatedPerson: 'c1',
        },
        {
          number: '20692',
          soNumber: 'SO18482',
          orderNumber: '62532',
          error: 'sai sản phẩ2',
          note: 'Hộp bị méo gó2',
          client: 'Nguyễn Văn 2',
          status: 'Chưa xử l2',
          createdPerson: 'c2',
          updatedPerson: 'c2',
        },
        {
          number: '20692',
          soNumber: 'SO18482',
          orderNumber: '62532',
          error: 'sai sản phẩ2',
          note: 'Hộp bị méo gó2',
          client: 'Nguyễn Văn 2',
          status: 'Chưa xử l2',
          createdPerson: 'c2',
          updatedPerson: 'c2',
        },
      ],
      count: 3,
      status: [
        {
          id: 1,
          name: 'Chưa xử lý',
        },
      ],
    },
  };

  return data;
}

export async function getServerSideProps(ctx) {
  return doWithLoggedInUser(ctx, (cbCtx) => loadRequestData(cbCtx));
}

const PageEditCs = (props) => {
  const [data, setData] = useState(props);
  const { errors, control } = useForm({
    defaultValues: {
      imageUrls: [],
    },
    mode: 'onChange',
  });

  useEffect(() => {
    setData(props);
  }, [props]);

  const breadcrumb = [
    {
      name: 'Trang chủ',
      link: '/cs',
    },
    {
      name: 'Danh sách tất cả phiếu yêu cầu',
      link: '/cs/all-case',
    },
    {
      name: 'Chỉnh sửa yêu cầu',
    },
  ];

  return (
    <AppCS select="/cs/all-case" breadcrumb={breadcrumb}>
      <Head>
        <title>Chỉnh sửa</title>
      </Head>
      <div className={styles.grid}>
        <MyCard>
          <MyCardHeader title="Chỉnh sửa yêu cầu" />
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
                  <Grid item xs={12} sm={6} md={6}>
                    <Typography gutterBottom>
                      <FormLabel
                        component="legend"
                        style={{ color: 'black', marginBottom: '15px' }}
                      >
                        Ngày tạo: 18/12/2020 13:17
                      </FormLabel>
                      <FormLabel
                        component="legend"
                        style={{ color: 'black', marginBottom: '15px', fontSize: '40px' }}
                      >
                        SO18487 - 62532
                      </FormLabel>
                      <FormLabel
                        component="legend"
                        style={{ color: 'black', marginBottom: '15px' }}
                      >
                        Gía đơn hàng: <span style={{ color: 'green' }}>2.165.150 đ</span>
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
                        Người tạo: <span style={{ color: 'grey' }}>Minh Trí</span>
                      </FormLabel>
                      <FormLabel
                        component="legend"
                        style={{ color: 'black', marginBottom: '15px' }}
                      >
                        Ngày mua: <span style={{ color: 'grey' }}>26/2/2020</span>
                      </FormLabel>
                      <FormLabel
                        component="legend"
                        style={{ color: 'black', marginBottom: '15px' }}
                      >
                        Trạng thái đơn hàng: <span style={{ color: 'red' }}>Hoàn tất</span>
                      </FormLabel>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <Typography gutterBottom>
                      <FormLabel
                        component="legend"
                        style={{ color: 'black', marginBottom: '15px' }}
                      >
                        User ID: 5355
                      </FormLabel>
                      <FormLabel
                        component="legend"
                        style={{ color: 'black', marginBottom: '15px' }}
                      >
                        Tên doanh nghiệp: QUẦY THUỐC PHƯƠNG LAN
                      </FormLabel>
                      <FormLabel
                        component="legend"
                        style={{ color: 'black', marginBottom: '15px' }}
                      >
                        Họ tên khách hàng: NGUYỄN PHƯƠNG LAN
                      </FormLabel>
                      <FormLabel
                        component="legend"
                        style={{ color: 'black', marginBottom: '15px' }}
                      >
                        Số điện thoại: 0123456789
                      </FormLabel>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography gutterBottom>
                      <FormLabel component="legend" style={{ fontWeight: 'bold', color: 'black' }}>
                        Tên khách hàng:
                      </FormLabel>
                    </Typography>
                    <TextField
                      variant="outlined"
                      size="small"
                      type="text"
                      fullWidth
                      placeholder="Trấn Thành"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography gutterBottom>
                      <FormLabel component="legend" style={{ fontWeight: 'bold', color: 'black' }}>
                        Số tài khoản:
                      </FormLabel>
                    </Typography>
                    <TextField
                      variant="outlined"
                      size="small"
                      type="text"
                      fullWidth
                      placeholder="0987654321"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography gutterBottom>
                      <FormLabel component="legend" style={{ fontWeight: 'bold', color: 'black' }}>
                        Ngân hàng:
                      </FormLabel>
                    </Typography>
                    <TextField
                      variant="outlined"
                      size="small"
                      type="text"
                      fullWidth
                      placeholder="Dong A Bank"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography gutterBottom>
                      <FormLabel component="legend" style={{ fontWeight: 'bold', color: 'black' }}>
                        Chi nhánh:
                      </FormLabel>
                    </Typography>
                    <TextField
                      variant="outlined"
                      size="small"
                      type="text"
                      fullWidth
                      placeholder="Tân Phú"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography gutterBottom>
                      <LabelFormCs>Sai sản phẩm:</LabelFormCs>
                    </Typography>
                    <MuiSingleAuto
                      placeholder="Chọn"
                      name="người tạo"
                      errors={errors}
                      control={control}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography gutterBottom>
                      <LabelFormCs>Chọn bộ phận tiếp nhận:</LabelFormCs>
                    </Typography>
                    <MuiSingleAuto
                      placeholder="Chọn"
                      name="người tạo"
                      errors={errors}
                      control={control}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography gutterBottom>
                      <LabelFormCs>Chọn người tiếp nhận:</LabelFormCs>
                    </Typography>
                    <MuiSingleAuto
                      placeholder="Chọn"
                      name="người tạo"
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
                      name="người tạo"
                      errors={errors}
                      control={control}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <Typography gutterBottom>
                      <LabelFormCs>Mã trả hàng:</LabelFormCs>
                    </Typography>
                    <TextField
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
                      variant="outlined"
                      size="small"
                      type="number"
                      fullWidth
                      placeholder="0"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <Typography gutterBottom>
                      <LabelFormCs>Mô tả</LabelFormCs>
                    </Typography>
                    <TextField
                      variant="outlined"
                      size="small"
                      type="text"
                      fullWidth
                      placeholder="Ghi chú..."
                    />
                  </Grid>
                  <Grid item container xs={12} justify="flex-end" spacing={1}>
                    <Grid item>
                      <Link href="#id">
                        <Button variant="contained" color="primary">
                          Lưu
                        </Button>
                      </Link>
                    </Grid>
                    <Grid item>
                      <Link href="#id">
                        <Button variant="contained" color="default">
                          Hủy bỏ
                        </Button>
                      </Link>
                    </Grid>
                  </Grid>
                </Grid>
              </FormControl>
            </MyCardContent>
          </form>
        </MyCard>
      </div>
    </AppCS>
  );
};

export default function index(props) {
  return renderWithLoggedInUser(props, PageEditCs);
}
