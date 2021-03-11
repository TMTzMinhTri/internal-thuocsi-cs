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
import React from 'react';
import Router from 'next/router';
import MyTablePagination from '@thuocsi/nextjs-components/my-pagination/my-pagination';

const TicketTable = ({ data, total, page, limit, search, onClickBtnEdit, listReasons }) => (
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
          <TableCell align="center">Số lượng#</TableCell>
          <TableCell align="left">Lỗi</TableCell>
          <TableCell align="left">Ghi chú của KH</TableCell>
          <TableCell align="center">Trạng thái</TableCell>
          <TableCell align="center">Thao tác</TableCell>
        </TableRow>
      </TableHead>
      {data.length === 0 ? (
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
              <TableCell align="center">{item.saleOrderID}</TableCell>
              <TableCell align="left">
                {item?.reasons?.map((code) => (
                  <Chip
                    key={uuidv4()}
                    style={{ margin: '3px' }}
                    size="small"
                    label={listReasons.find((reason) => reason.value === code).label}
                  />
                ))}
              </TableCell>
              <TableCell align="left">{item.note}</TableCell>
              <TableCell align="center">
                {listStatus.filter((status) => status.value === item.status)[0].label}
              </TableCell>
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
            Router.push(`?page=${newPage}&limit=${rowsPerPage}&q=${search}`);
          }}
        />
      )}
    </Table>
  </TableContainer>
);

export default TicketTable;
