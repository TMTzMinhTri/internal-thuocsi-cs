import {
    Chip,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Grid,
} from '@material-ui/core';

import { Edit as EditIcon } from '@material-ui/icons';
import { ErrorCode, listStatus } from 'components/global';
import { v4 as uuidv4 } from 'uuid';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAccountClient, getOrderClient, getTicketClient } from 'client';
import MyTablePagination from '@thuocsi/nextjs-components/my-pagination/my-pagination';
import { getFirst, isValid, convertObjectToParameter } from 'utils';
import { LIMIT_DEFAULT, PAGE_DEFAULT } from 'data';
import moment from 'moment';
import { TicketStatus } from 'components/ticket/ticket-status';
import { mapStatus } from 'components/global';
import { TicketReason } from './ticket-reason';
import TicketDetail, { loadTicketDetail } from './ticket-detail';

const TicketTable = ({ data, total, reasonList = [], isMyTicket = false }) => {
    const reasonMap = {}
    reasonList.forEach((item) => reasonMap[item.value] = item.label)

    const router = useRouter();
    const { ticketCode } = router.query;
    const [ticketSelected, setTicketSelected] = useState(ticketCode);
    const limit = parseInt(router.query.limit, 20) || LIMIT_DEFAULT;
    const page = parseInt(router.query.page, 10) || PAGE_DEFAULT;

    useEffect(() => {
        window.addEventListener('popstate', () => {
            const { ticketCode } = router.query;
            setTicketSelected(ticketCode)
        })
    }, [])

    const changeUrl = ({ ticketCode, clear = false }) => {
        const query = {
            ...router.query
        };

        // add page query only for listing page
        if (router.query.limit) {
            query.limit = limit
        }
        if (router.query.page) {
            query.page = page
        }

        if (clear) {
            query.ticketCode && (delete query['ticketCode'])
        } else {
            query.ticketCode = ticketCode
        }
        // use window.history to avoid loading screen
        window.history.pushState(
            // {
            //     pathname: '',
            //     query,
            // },
            {}, '', `?${convertObjectToParameter(query)}`,
            // { shallow: false },
        );
    };

    const onClickBtnEdit = useCallback(async (code) => {
        // todo
        setTicketSelected(code)
        changeUrl({ ticketCode: code });
    }, []);

    const handleCloseBtnEdit = useCallback(async () => {
        changeUrl({ clear: true });
        setTicketSelected(null);

    });

    const [departments, setDepartments] = useState([])
    const [ticketData, setTicketData] = useState()
    useEffect(() => {
        (async () => {
            if (ticketSelected) {
                let { departments, ticketData } = await loadTicketDetail(ticketSelected)
                console.log(ticketData)
                setDepartments(departments)
                setTicketData(ticketData)
            } else {
                setTicketData(null);
            }

        })()
    }, [ticketSelected])

    return (
        <>
            <TableContainer component={Paper}>
                <Table size="small">
                    <colgroup>
                        <col width={120} />
                        <col width={120} />
                        <col />
                        <col />
                        <col />
                        <col />
                        <col />
                        <col />
                        <col />
                        <col />
                        <col width={100} />
                    </colgroup>
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">#Mã Phiếu</TableCell>
                            <TableCell align="left">SO#</TableCell>
                            <TableCell align="left">Lỗi</TableCell>
                            <TableCell align="left">Ghi chú của KH</TableCell>
                            <TableCell align="left">Trạng thái</TableCell>
                            <TableCell align="left">Thời gian tạo</TableCell>
                            <TableCell align="left">Người tạo</TableCell>
                            {!isMyTicket && <TableCell align="left">Người cập nhật</TableCell>}
                            <TableCell align="right">Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    {!data || data.length === 0 ? (
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={5} align="left">
                                    {ErrorCode.NOT_FOUND_TABLE}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    ) : (
                            <TableBody>
                                {data.map((item) => (
                                    <TableRow key={uuidv4()}>
                                        <TableCell align="left">{item.code}</TableCell>
                                        <TableCell align="left">{item.saleOrderCode}</TableCell>
                                        <TableCell align="left">
                                            {item.reasons.map((reason) =>
                                                <TicketReason key={reason} label={reasonMap[reason]} />)}

                                        </TableCell>
                                        <TableCell align="left">{item.note}</TableCell>
                                        <TableCell align="left"> {
                                            <TicketStatus
                                                status={item.status}
                                                options={mapStatus} />
                                        }
                                        </TableCell>
                                        <TableCell align="left"> {moment(item.createdTime).locale('vi').fromNow()}
                                        </TableCell>
                                        <TableCell align="left">{item.createdBy}</TableCell>
                                        {!isMyTicket && <TableCell align="left">{item.assignName}</TableCell>}
                                        <TableCell align="right">
                                            <a onClick={() => onClickBtnEdit(item.code)}>
                                                <Tooltip title="Cập nhật thông tin của phiếu hỗ trợ">
                                                    <IconButton>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </a>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        )}

                    {total > 0 && (
                        <MyTablePagination
                            labelUnit="phiếu"
                            count={total}
                            rowsPerPage={limit}
                            page={page}
                            onChangePage={(event, newPage, rowsPerPage) => {
                                const pageSize = { page: newPage, limit: rowsPerPage };
                                const { query } = router;

                                router.push(
                                    `${router.pathname}?${convertObjectToParameter({
                                        ...query,
                                        ...pageSize,
                                    })}`,
                                );
                            }}
                        />
                    )}
                </Table>
            </TableContainer>
            {ticketSelected && <TicketDetail
                key={+new Date()}
                onClose={handleCloseBtnEdit}
                reasonList={reasonList}
                ticketCode={ticketSelected}
                departments={departments}
                ticketDetail={ticketData}
            />}
        </>
    );
};

export default TicketTable;
