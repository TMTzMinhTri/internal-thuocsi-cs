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
import TicketEdit from 'components/TicketEdit';
import { getFirst, isValid, convertObjectToParameter } from 'utils';
import { LIMIT_DEFAULT, PAGE_DEFAULT } from 'data';
import moment from 'moment';
import { TicketStatus } from 'components/ticket/ticket-status';
import { mapStatus } from 'components/global';

const TicketTable = ({ data, total, listReasons = [], isMyTicket = false }) => {
    const router = useRouter();
    const { ticketId } = router.query;
    const [ticketSelected] = useState(ticketId);
    const [detail, setDetail] = useState(null);
    const [listDepartment, setListDepartment] = useState([]);
    const [listUserAssign, setListUserAssign] = useState([]);

    // query + params
    const limit = parseInt(router.query.limit, 10) || LIMIT_DEFAULT;
    const page = parseInt(router.query.page, 10) || PAGE_DEFAULT;

    const changeUrl = ({ ticketId, orderNo, search, page, limit, reload = false }) => {
        const query = {
            ...(ticketId && { ticketId }),
            ...(orderNo && { orderNo }),
            ...(search && { search }),
            ...(page && { page }),
            ...(limit && { limit }),
        };
        router.push(
            {
                pathname: '',
                query,
            },
            `?${convertObjectToParameter(query)}`,
            { shallow: !reload },
        );
    };

    const onClickBtnEdit = useCallback(async (code) => {
        // todo
        const { orderNo = null } = router.query;
        changeUrl({ orderNo, ticketId: code });
    }, []);

    const handleCloseBtnEdit = useCallback(async () => {
        const { orderNo = null } = router.query;

        changeUrl({ orderNo, reload: true });
        setDetail(null);
    });

    useEffect(() => {
        const loadData = async (code) => {
            // init client
            const ticketClient = getTicketClient();
            const orderClient = getOrderClient();
            const accountClient = getAccountClient();

            // validate list department
            if (listDepartment.length === 0) {
                const listDepartmentRes = await accountClient.clientGetListDepartment(0, 20, '');
                if (isValid(listDepartmentRes)) {
                    setListDepartment(
                        listDepartmentRes?.data?.map((depart) => ({
                            ...depart,
                            value: depart.code,
                            label: depart.name,
                        })) || [],
                    );
                }
            }

            // validate user assign
            if (listUserAssign.length === 0) {
                const listUserAssignRes = await accountClient.clientGetListEmployee(0, 10, '');
                if (isValid(listUserAssignRes)) {
                    setListUserAssign(
                        listUserAssignRes?.data?.map((acc) => ({
                            value: acc.accountId || '',
                            label: acc.username || '',
                        })) || [],
                    );
                }
            }
            // always get data detail
            const [ticketRes] = await Promise.all([ticketClient.clientGetTicketDetail({ code })]);
            if (isValid(ticketRes)) {
                const ticketData = getFirst(ticketRes);
                const orderRes = await orderClient.getOrderByOrderNo(ticketData.saleOrderCode);
                if (isValid(orderRes)) {
                    const orderInfo = getFirst(orderRes);
                    ticketData.customerName = orderInfo.customerName;
                    ticketData.customerPhone = orderInfo.customerPhone;
                    ticketData.totalPrice = orderInfo.totalPrice;
                    ticketData.orderCreatedTime = orderInfo.createdTime;
                }

                setDetail(ticketData);
            }
        };
        loadData(ticketSelected);
    }, [ticketSelected]);

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
                                            {item?.reasons?.map((code) => (
                                                <Chip
                                                    key={uuidv4()}
                                                    style={{ margin: '3px', borderRadius: '4px' }}
                                                    size="small"
                                                    label={listReasons.find((reason) => reason.value === code)?.label || ''}
                                                />
                                            ))}
                                        </TableCell>
                                        <TableCell align="left">{item.note}</TableCell>
                                        <TableCell align="left"> {
                                            (() => {
                                                let statusInfo = mapStatus[item.status]
                                                return statusInfo ? <TicketStatus
                                                    color={statusInfo.color}
                                                    label={statusInfo.label} /> : ""
                                            })()
                                        }
                                        </TableCell>
                                        <TableCell align="left"> {moment(item.createdTime).locale('vi').fromNow()}
                                        </TableCell>
                                        <TableCell align="left">{item.createdBy}</TableCell>
                                        {!isMyTicket && <TableCell align="left">{item.assignName}</TableCell>}
                                        <TableCell align="right">
                                            <a onClick={() => onClickBtnEdit(item.code)}>
                                                <Tooltip title="Cập nhật thông tin của yêu cầu">
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
                            labelUnit="yêu cầu"
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
            {detail && (
                <TicketEdit
                    isOpen
                    onClose={handleCloseBtnEdit}
                    listReason={listReasons}
                    listAssignUser={listUserAssign}
                    listDepartment={listDepartment}
                    ticketDetail={detail}
                />
            )}
        </>
    );
};

export default TicketTable;
