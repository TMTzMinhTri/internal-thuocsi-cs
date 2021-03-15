import React, { useCallback, useState } from 'react';
import { Button, FormControl, TextField, Typography, Grid } from '@material-ui/core';

import Link from 'next/link';

import { formatUTCTime, listStatus } from 'components/global';

import { faPlus, faFilter } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useForm } from 'react-hook-form';
import { getAccountClient, getTicketClient } from 'client';

import MuiSingleAuto from '@thuocsi/nextjs-components/muiauto/single';
import MuiMultipleAuto from '@thuocsi/nextjs-components/muiauto/multiple';
import { MyCard, MyCardContent, MyCardHeader } from '@thuocsi/nextjs-components/my-card/my-card';

import useModal from 'hooks/useModal';

import { getData, isValid } from 'utils';
import TicketTable from '../TicketTable';
import LabelFormCs from '../LabelFormCs';

import styles from './request.module.css';

const TicketList = ({ total, tickets, listReason }) => {
  const [search, setSearch] = useState('');
  const [listTickets, setListickets] = useState(tickets);
  const [listUserAssign] = useState([]);

  // Modal
  const [showHideFilter, toggleFilter] = useModal(false);

  const { register, handleSubmit, errors, control, getValues } = useForm({
    defaultValues: {},
    mode: 'onChange',
  });

  // const router = useRouter();

  // query + params

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
      const ticketClient = getTicketClient();

      const ticketResp = await ticketClient.getTicketByFilter({
        saleOrderCode: saleOrderCode.length === 0 ? null : saleOrderCode,
        saleOrderID: parseInt(saleOrderID, 10),
        status: status?.value,
        reasons: reasons?.length > 0 ? reasons.map((reason) => reason.value) : null,
        assignUser: assignUser?.value,
        createdTime: createdTime ? new Date(formatUTCTime(createdTime)).toISOString() : null,
        lastUpdatedTime: lastUpdatedTime
          ? new Date(formatUTCTime(lastUpdatedTime)).toISOString()
          : null,
      });
      setListickets(getData(ticketResp));
    },
    [],
  );

  const debounceSearchAssignUser = useCallback(async (q) => {
    const accountClient = getAccountClient();
    const accountResp = await accountClient.clientGetListEmployee(0, 100, q);

    if (!isValid(accountResp)) {
      return [];
    }

    return (
      accountResp?.data?.map(({ username, accountId }) => ({
        value: accountId,
        label: username,
      })) || []
    );
  }, []);

  return (
    <>
      <div className={styles.grid}>
        <MyCard>
          <MyCardHeader title="Danh sách yêu cầu">
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
                Thêm yêu cầu
              </Button>
            </Link>
          </MyCardHeader>
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
                  {!showHideFilter && (
                    <>
                      <Grid item xs={12} sm={12} md={12}>
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
                      <Grid item xs={12} sm={6} md={4}>
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
                      <Grid item xs={12} sm={6} md={4}>
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
                      <Grid item xs={12} sm={6} md={4}>
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
                      <Grid item xs={12} sm={6} md={4}>
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
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography gutterBottom>
                          <LabelFormCs>Người tiếp nhận:</LabelFormCs>
                        </Typography>
                        <MuiSingleAuto
                          options={listUserAssign}
                          onFieldChange={debounceSearchAssignUser}
                          placeholder="Chọn"
                          name="assignUser"
                          errors={errors}
                          control={control}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography gutterBottom>
                          <LabelFormCs>Ngày bắt đầu:</LabelFormCs>
                        </Typography>
                        <TextField
                          name="createdTime"
                          inputRef={register}
                          variant="outlined"
                          size="small"
                          fullWidth
                          type="datetime-local"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography gutterBottom>
                          <LabelFormCs>Ngày kết thúc:</LabelFormCs>
                        </Typography>
                        <TextField
                          name="lastUpdatedTime"
                          inputRef={register}
                          variant="outlined"
                          size="small"
                          fullWidth
                          type="datetime-local"
                        />
                      </Grid>
                      <Grid item container xs={12} justify="flex-end" spacing={1}>
                        <Grid item>
                          <Link href="/cs/new">
                            <Button variant="contained" color="lightgray" disabled>
                              Xuất file
                            </Button>
                          </Link>
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
      <TicketTable listReasons={listReason} data={listTickets} total={total} />
    </>
  );
};

export default TicketList;
