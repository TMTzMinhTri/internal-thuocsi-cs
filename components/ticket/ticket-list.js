import React, { useCallback, useState } from 'react';
import { Button, FormControl, TextField, Typography, Grid } from '@material-ui/core';

import Link from 'next/link';

import { faPlus, faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useForm } from 'react-hook-form';

import MuiSingleAuto from '@thuocsi/nextjs-components/muiauto/single';
import MuiMultipleAuto from '@thuocsi/nextjs-components/muiauto/multiple';
import { MyCard, MyCardContent, MyCardHeader } from '@thuocsi/nextjs-components/my-card/my-card';

import { getTicketClient } from 'client';

import useModal from 'hooks/useModal';
import { useRouter } from 'next/router';
import { cleanObj, getData } from 'utils';
import TicketTable from './ticket-table';
import LabelFormCs from '../LabelFormCs';
import { ExportCSV } from '../export-cvs';
import styles from './ticket.module.css';
import { listStatus } from './ticket-display';
import ChangeStatusModal from '../changes-status-modal';

const TicketList = ({ total, tickets, reasonList, filter = {}, isMyTicket = false }) => {
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [openChangeStatus, toggleChangeStatus] = useModal();
    const fileName = `Danh_Sach_Phieu_Ho_Tro_${new Date().toLocaleString().replace(/[ :]/g, '_').replace(/[,]/g, '')}`;

    // setup default values
    filter.statusFilter = filter?.status && listStatus.find((item) => item.value === filter.status);

    filter.reasonsFilter = filter?.reasons && reasonList.filter((item) => filter.reasons.indexOf(item.value) >= 0);
    console.log('filter reasons filter ', filter.reasonsFilter);
    const { register, handleSubmit, errors, control, getValues } = useForm({
        defaultValues: filter,
        mode: 'onChange',
    });

    const router = useRouter();

    // TODO:
    // function
    const onSearch = useCallback(
        async ({ orderCode, orderId = 0, status, reasonsFilter = [], assignUser, fromTime, toTime, customerId, saleOrderCode }) => {
            const filterData = cleanObj({
                orderCode: orderCode.length === 0 ? null : orderCode,
                saleOrderCode: saleOrderCode?.length === 0 ? null : saleOrderCode,
                orderId: orderId && orderId > 0 ? parseInt(orderId, 10) : null,
                customerId: customerId && customerId > 0 ? parseInt(customerId, 10) : null,
                status: status?.value || null,
                reasons: reasonsFilter?.length > 0 ? reasonsFilter.map((reason) => reason.value) : null,
                assignUser: assignUser?.value || null,
                fromTime,
                toTime,
            });
            router.push(
                {
                    pathname: '',
                    query: { q: JSON.stringify(filterData) },
                },
                `?q=${JSON.stringify(filterData)}`,
                { shallow: false },
            );
            return false;
        },
        [],
    );
    const csvData = useCallback(async () => {
        setLoading(true);
        const limit = 100;
        const totalPageSize = Math.ceil(total / limit);

        const ticketClient = getTicketClient();
        const requestGetAllData = [];
        for (let page = 0; page < totalPageSize; ++page) {
            requestGetAllData.push(
                isMyTicket
                    ? ticketClient.getMyTicket({ q: getValues(), offset: page * limit, limit })
                    : ticketClient.getAllTicket({ q: getValues(), offset: page * limit, limit }),
            );
        }

        const arrayResult = await Promise.all(requestGetAllData);

        let data = [];

        arrayResult.forEach((res) => {
            data = data.concat(getData(res));
        });
        setLoading(false);
        data.forEach((row) => {
            row.reasons && (row.reasons = row.reasons.join(','));
        });
        return data;
    }, []);

    return (
        <>
            <div className={styles.grid}>
                <MyCard>
                    <MyCardHeader title="Danh sách phiếu hỗ trợ">
                        <Link href="/cs/ticket/new">
                            <Button variant="contained" color="primary" className={styles.cardButton} style={{ marginRight: 8 }}>
                                <FontAwesomeIcon icon={faPlus} style={{ marginRight: 8 }} /> Thêm phiếu
                            </Button>
                        </Link>
                        <Button variant="contained" color="primary" className={styles.cardButton} onClick={toggleChangeStatus}>
                            <FontAwesomeIcon icon={faCog} style={{ marginRight: 8 }} /> Thay đổi trạng thái hàng loạt
                        </Button>
                    </MyCardHeader>
                    <form>
                        <MyCardContent>
                            <FormControl size="medium">
                                <Grid container spacing={3} direction="row" justify="space-between" alignItems="center" className={styles.filter}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography gutterBottom>
                                            <LabelFormCs>SO:</LabelFormCs>
                                        </Typography>
                                        <TextField
                                            name="saleOrderCode"
                                            inputRef={register}
                                            variant="outlined"
                                            size="small"
                                            type="text"
                                            fullWidth
                                            placeholder="Nhập SO"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography gutterBottom>
                                            <LabelFormCs>ID đơn hàng:</LabelFormCs>
                                        </Typography>
                                        <TextField
                                            name="orderId"
                                            inputRef={register}
                                            variant="outlined"
                                            size="small"
                                            type="text"
                                            fullWidth
                                            placeholder="Nhập ID đơn hàng"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography gutterBottom>
                                            <LabelFormCs>Mã đơn hàng:</LabelFormCs>
                                        </Typography>
                                        <TextField
                                            name="orderCode"
                                            inputRef={register}
                                            variant="outlined"
                                            size="small"
                                            type="text"
                                            fullWidth
                                            placeholder="Nhập mã đơn hàng"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography gutterBottom>
                                            <LabelFormCs>ID khách hàng:</LabelFormCs>
                                        </Typography>
                                        <TextField
                                            name="customerId"
                                            inputRef={register}
                                            variant="outlined"
                                            size="small"
                                            type="text"
                                            fullWidth
                                            placeholder="Nhập ID khách hàng"
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container spacing={3} direction="row" justify="space-between" alignItems="center" className={styles.filter}>
                                    <Grid item xs={12} sm={12} md={3}>
                                        <Typography gutterBottom>
                                            <LabelFormCs>Trạng thái:</LabelFormCs>
                                        </Typography>
                                        <MuiSingleAuto options={listStatus} placeholder="Chọn" name="status" errors={errors} control={control} />
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={9}>
                                        <Typography gutterBottom>
                                            <LabelFormCs>Lý do:</LabelFormCs>
                                        </Typography>
                                        <MuiMultipleAuto
                                            name="reasonsFilter"
                                            options={reasonList}
                                            placeholder="Chọn"
                                            errors={errors}
                                            control={control}
                                        />
                                    </Grid>
                                    <Grid item container xs={12} justify="flex-end" spacing={1}>
                                        <Grid item>
                                            <ExportCSV csvData={csvData} fileName={fileName} loading={loading} />
                                        </Grid>
                                        <Grid item>
                                            <Link href="/cs/new">
                                                <Button variant="contained" color="primary" onClick={handleSubmit(onSearch)}>
                                                    Tìm kiếm
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
            <TicketTable reasonList={reasonList} data={tickets} total={total} search={search} isMyTicket={isMyTicket} />
            <ChangeStatusModal open={openChangeStatus} toggle={toggleChangeStatus} />
        </>
    );
};

export default TicketList;
