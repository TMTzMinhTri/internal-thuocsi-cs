import { IconButton, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@material-ui/core';

import { Edit as EditIcon } from '@material-ui/icons';
import { ErrorCode, formatDateTime } from 'components/global';
import { v4 as uuidv4 } from 'uuid';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MyTablePagination from '@thuocsi/nextjs-components/my-pagination/my-pagination';
import { convertObjectToParameter } from 'utils';
import { LIMIT_DEFAULT, PAGE_DEFAULT } from 'data';
import moment from 'moment';
import Link from 'next/link';
import { TicketStatus, TicketReason, AccountType } from 'components/ticket/ticket-display';
import TicketDetail, { loadTicketDetail } from './ticket-detail';

const useStyles = makeStyles({
    table: {
        minWidth: 650,
        overflowX: 'auto',
    },
    container: {
        overflowX: 'auto',
    },
});

const TicketTable = ({ data, total, reasonList = [], isMyTicket = false }) => {
    const reasonMap = {};
    reasonList.forEach((item) => (reasonMap[item.value] = item.label));

    const router = useRouter();
    const { ticketCode, limit = 20, page = 0 } = router.query;
    const [ticketSelected, setTicketSelected] = useState(ticketCode);

    useEffect(() => {
        window.addEventListener('popstate', () => {
            const { ticketCode } = router.query;
            setTicketSelected(ticketCode);
        });
    }, []);

    const changeUrl = ({ ticketCode, clear = false }) => {
        const query = {
            ...router.query,
        };

        // add page query only for listing page
        if (router.query.limit) {
            query.limit = limit;
        }
        if (router.query.page) {
            query.page = page;
        }

        if (clear) {
            query.ticketCode && delete query['ticketCode'];
        } else {
            query.ticketCode = ticketCode;
        }
        router.push(`${router.pathname}?${convertObjectToParameter(query)}`);
        // use window.history to avoid loading screen
        // window.history.pushState({}, '', `?${convertObjectToParameter(query)}`);
    };

    const onClickBtnEdit = useCallback(async (code) => {
        // todo
        setTicketSelected(code);
        changeUrl({ ticketCode: code });
    }, []);

    const handleCloseBtnEdit = useCallback(async () => {
        changeUrl({ clear: true });
        setTicketSelected(null);
    });

    const [departments, setDepartments] = useState([]);
    const [ticketData, setTicketData] = useState();

    const handleReloadTicketData = useCallback(async () => {
        if (ticketSelected) {
            const { departments, ticketData } = await loadTicketDetail(ticketSelected);
            setDepartments(departments);
            setTicketData(ticketData);
        } else {
            setTicketData(null);
        }
    });

    useEffect(() => {
        (async () => {
            await handleReloadTicketData();
        })();
    }, [ticketSelected]);

    const classess = useStyles();

    return (
        <>
            <TableContainer component={Paper} className={classess.container}>
                <Table className={classess.table}>
                    <colgroup>
                        <col width={50} />
                        <col width={100} />
                        <col width={100} />
                        <col width={100} />
                        <col width={100} />
                        <col width={100} />
                        <col width={100} />
                        <col width={100} />
                        <col width={100} />
                        <col width={50} />
                        <col width={50} />
                        <col width={50} />
                    </colgroup>
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">#Mã Phiếu</TableCell>
                            <TableCell align="left">SO</TableCell>
                            <TableCell align="left">Đơn hàng</TableCell>
                            <TableCell align="left">Lỗi</TableCell>
                            <TableCell align="left">Ghi chú</TableCell>
                            <TableCell align="left">Trạng thái</TableCell>
                            <TableCell align="left">Thời gian tạo</TableCell>
                            <TableCell width={50} align="left">
                                Người tạo
                            </TableCell>
                            {!isMyTicket && (
                                <TableCell width={50} align="left">
                                    Người tiếp nhận
                                </TableCell>
                            )}
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
                            {data.map((ticket) => (
                                <TableRow key={uuidv4()}>
                                    <TableCell align="left">{ticket.code}</TableCell>
                                    <TableCell align="left">{ticket.saleOrderCode}</TableCell>
                                    <TableCell align="left">
                                        <Link href={`/crm/order/detail?orderNo=${ticket.orderCode}`} prefetch={false}>
                                            <a target="_blank" style={{ textDecoration: 'none', color: 'green' }}>
                                                {ticket.orderId}-{ticket.orderCode}
                                            </a>
                                        </Link>
                                    </TableCell>
                                    <TableCell align="left">
                                        {ticket.reasons.map((reason) => (
                                            <TicketReason key={reason} label={reasonMap[reason]} />
                                        ))}
                                    </TableCell>
                                    <TableCell align="left">{ticket.note}</TableCell>
                                    <TableCell align="left">
                                        <TicketStatus status={ticket.status} />
                                    </TableCell>
                                    <TableCell align="left">
                                        <Tooltip title={formatDateTime(ticket.createdTime)}>
                                            <span>{moment(ticket.createdTime).locale('vi').fromNow()}</span>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align="left">
                                        <AccountType type={ticket.createdByType} /> {ticket.createdBy}
                                    </TableCell>
                                    {!isMyTicket && <TableCell align="left">{ticket.assignName || '-'}</TableCell>}
                                    <TableCell align="right">
                                        <a onClick={() => onClickBtnEdit(ticket.code)}>
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
            {ticketSelected && (
                <TicketDetail
                    key={+new Date()}
                    onClose={handleCloseBtnEdit}
                    onReload={handleReloadTicketData}
                    reasonList={reasonList}
                    ticketCode={ticketSelected}
                    departments={departments}
                    ticketDetail={ticketData}
                />
            )}
        </>
    );
};

export default TicketTable;
