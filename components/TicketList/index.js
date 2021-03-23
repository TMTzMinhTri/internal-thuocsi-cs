import React, { useCallback, useState, useEffect } from 'react';
import { Button, FormControl, TextField, Typography, Grid } from '@material-ui/core';

import Link from 'next/link';

import { formatUTCTime, listStatus } from 'components/global';

import { faPlus, faFilter } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useForm } from 'react-hook-form';

import MuiSingleAuto from '@thuocsi/nextjs-components/muiauto/single';
import MuiMultipleAuto from '@thuocsi/nextjs-components/muiauto/multiple';
import { MyCard, MyCardContent, MyCardHeader } from '@thuocsi/nextjs-components/my-card/my-card';

import { getTicketClient } from 'client';

import useModal from 'hooks/useModal';
import { useRouter } from 'next/router';
import { cleanObj, convertObjectToParameter, isValid, getData } from 'utils';
import TicketTable from '../TicketTable';
import LabelFormCs from '../LabelFormCs';
import { ExportCSV } from '../ExportCSV';
import styles from './request.module.css';

const TicketList = ({
    total,
    tickets,
    listReason,
    action,
    filter = {},
    formData = {},
    isMyTicket = false,
}) => {
    const ticketClient = getTicketClient();
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const fileName = `Danh_Sach_Yeu_Cau_${new Date()
        .toLocaleString()
        .replace(/[ :]/g, '_')
        .replace(/[,]/g, '')}`;
    const limit = 50;
    const totalPageSize = Math.ceil(total / limit);

    // Modal
    const [showHideFilter, toggleFilter] = useModal(action === 'filter');

    const statusFilter = filter?.status && listStatus.find((item) => item.value === filter.status);
    const reasonsFilter =
        filter?.reasons && listReason.filter((item) => filter.reasons.indexOf(item.value) >= 0);

    const defaultValues = {
        ...filter,
        ...(statusFilter && { status: statusFilter }),
        ...(reasonsFilter && { reasons: reasonsFilter }),
    };

    const { register, handleSubmit, errors, control, getValues } = useForm({
        defaultValues,
        mode: 'onChange',
    });

    const router = useRouter();

    // query + params

    // TODO:
    // function
    const onSearch = useCallback(
        async ({
            saleOrderCode,
            saleOrderID = 0,
            status,
            reasons,
            assignUser,
            createdTime,
            lastUpdatedTime,
        }) => {
            const filterData = cleanObj({
                action: 'filter',
                saleOrderCode: saleOrderCode.length === 0 ? null : saleOrderCode,
                saleOrderID: saleOrderID && saleOrderID > 0 ? parseInt(saleOrderID, 10) : null,
                status: status?.value || null,
                reasons: reasons?.length > 0 ? reasons.map((reason) => reason.value) : null,
                assignUser: assignUser?.value || null,
                createdTime: createdTime ? new Date(formatUTCTime(createdTime)).toISOString() : null,
                lastUpdatedTime: lastUpdatedTime
                    ? new Date(formatUTCTime(lastUpdatedTime)).toISOString()
                    : null,
            });
            router.push(
                {
                    pathname: '',
                    query: filterData,
                },
                `?${convertObjectToParameter(filterData)}`,
                { shallow: false },
            );
            return false;
        },
        [],
    );
    const csvData = useCallback(async () => {
        setLoading(true);
        const requestGetAllData = [];
        for (let i = 0; i < totalPageSize; ++i) {
            const offset = i * limit;
            requestGetAllData.push(ticketClient.getTicketByFilter({ offset, limit, formData }));
        }

        const arrayResult = await Promise.all(requestGetAllData);

        let data = [];

        arrayResult.forEach((res) => {
            data = data.concat(getData(res));
        });
        setLoading(false);
        return data;
    }, []);

    return (
        <>
            <div className={styles.grid}>
                <MyCard>
                    <MyCardHeader title="Danh sách phiếu hỗ trợ">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={toggleFilter}
                            className={styles.cardButton}
                            style={{ marginRight: '10px' }}
                        >
                            <FontAwesomeIcon icon={faFilter} style={{ marginRight: 8 }} />
              Bộ lọc
            </Button>
                        <Link href="/cs/new">
                            <Button variant="contained" color="primary" className={styles.cardButton}>
                                <FontAwesomeIcon icon={faPlus} style={{ marginRight: 8 }} />
                Thêm phiếu
              </Button>
                        </Link>
                    </MyCardHeader>
                    <form>
                        <MyCardContent>
                            <FormControl size="medium">
                                <Grid
                                    container
                                    spacing={3}
                                    direction="row"
                                    justify="space-between"
                                    alignItems="center"
                                    className={styles.filter}
                                >
                                    {!showHideFilter && (
                                        <>
                                            <Grid item xs={12} sm={12} md={4}>
                                                <Typography gutterBottom>
                                                    <LabelFormCs>Mã SO:</LabelFormCs>
                                                </Typography>
                                                <TextField
                                                    variant="outlined"
                                                    size="small"
                                                    type="text"
                                                    name="saleOrderCode"
                                                    inputRef={register}
                                                    fullWidth
                                                    placeholder="Nhập Mã SO"
                                                    onKeyPress={(event) => {
                                                        if (event.key === 'Enter') {
                                                            event.preventDefault();
                                                            onSearch(getValues());
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                        </>
                                    )}
                                    {showHideFilter && (
                                        <>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <Typography gutterBottom>
                                                    <LabelFormCs>Mã SO:</LabelFormCs>
                                                </Typography>
                                                <TextField
                                                    name="saleOrderCode"
                                                    inputRef={register}
                                                    variant="outlined"
                                                    size="small"
                                                    type="text"
                                                    fullWidth
                                                    placeholder="Nhập Mã SO"
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <Typography gutterBottom>
                                                    <LabelFormCs>Order ID:</LabelFormCs>
                                                </Typography>
                                                <TextField
                                                    name="saleOrderID"
                                                    inputRef={register}
                                                    variant="outlined"
                                                    size="small"
                                                    type="text"
                                                    fullWidth
                                                    placeholder="Nhập Order ID"
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <Typography gutterBottom>
                                                    <LabelFormCs>Trạng thái:</LabelFormCs>
                                                </Typography>
                                                <MuiSingleAuto
                                                    options={listStatus}
                                                    placeholder="Chọn"
                                                    name="status"
                                                    errors={errors}
                                                    control={control}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <Typography gutterBottom>
                                                    <LabelFormCs>Lý do:</LabelFormCs>
                                                </Typography>
                                                <MuiMultipleAuto
                                                    name="reasons"
                                                    options={listReason}
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
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={handleSubmit(onSearch)}
                                                        >
                                                            Tìm kiếm
                            </Button>
                                                    </Link>
                                                </Grid>
                                            </Grid>
                                        </>
                                    )}
                                </Grid>
                            </FormControl>
                        </MyCardContent>
                    </form>
                </MyCard>
            </div>
            <TicketTable
                listReasons={listReason}
                data={tickets}
                total={total}
                search={search}
                isMyTicket={isMyTicket}
            />
        </>
    );
};

export default TicketList;
