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
import colors from 'data/colors';

const TicketTable = ({ data, total, listReasons = [] }) => {
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
    changeUrl({ orderNo });
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
            <col width="5%" />
            <col width="5%" />
            <col width="5%" />
            <col width="15%" />
            <col width="20%" />
            <col width="15%" />
            <col width="10%" />
            <col width="5%" />
            <col width="5%" />
            <col width="5%" />
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell align="center">#Mã Phiếu</TableCell>
              <TableCell align="center">SO#</TableCell>
              <TableCell align="left">Lỗi</TableCell>
              <TableCell align="left">Ghi chú của KH</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
              <TableCell align="center">Người tạo</TableCell>
              <TableCell align="center">Người cập nhật</TableCell>
              <TableCell align="center">Thao tác</TableCell>
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
                  <TableCell align="center">{item.code}</TableCell>
                  <TableCell align="center">{item.saleOrderCode}</TableCell>
                  <TableCell align="left">
                    {item?.reasons?.map((code) => (
                      <Chip
                        key={uuidv4()}
                        style={{ margin: '3px', borderRadius: '4px!important' }}
                        size="small"
                        label={listReasons.find((reason) => reason.value === code)?.label || 'xxx'}
                      />
                    ))}
                  </TableCell>
                  <TableCell align="left">{item.note}</TableCell>
                  <TableCell align="center">
                    <Chip
                      key={uuidv4()}
                      style={{
                        margin: '3px',
                        borderRadius: '4px',
                        backgroundColor:
                          listStatus.find(({ value }) => value === item.status)?.color ||
                          colors.palette.grey[500],
                      }}
                      size="small"
                      label={listStatus.find(({ value }) => value === item.status)?.label || ''}
                    />
                  </TableCell>
                  <TableCell align="center">{item.createdBy}</TableCell>
                  <TableCell align="center">{item.assignName}</TableCell>
                  <TableCell align="center">
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
