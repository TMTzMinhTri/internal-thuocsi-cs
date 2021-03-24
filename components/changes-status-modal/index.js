import React, { useState } from 'react';
import { Button, TextField, Typography, Grid, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@material-ui/core';
import * as XLSX from 'xlsx';
import { getTicketClient } from 'client';
import CloseIcon from '@material-ui/icons/Close';
import { palette } from 'data/colors';
import Router from 'next/router';
import LabelFormCs from '../LabelFormCs';
import styles from './styles.module.css';

const StatusEnum = {
    'chưa xử lý': 'PENDING',
    'đã tiếp nhận': 'ASSIGNED',
    'đang xử lý': 'IN_PROCESS',
    'đã xử lý': 'DONE',
    'đã huỷ': 'CANCELED',
};

const ChangeStatusModal = ({ open, toggle }) => {
    const ticketClient = getTicketClient();
    const [text, setText] = useState('');
    const [dataStatus, setDataStatus] = useState([]);

    const clearText = () => {
        setText('');
    };

    const readExcel = (file) => {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);

        fileReader.onload = (e) => {
            const bufferArray = e?.target.result;
            if (!e?.target?.result) return;
            const wb = XLSX.read(bufferArray, { type: 'buffer' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
            const dataChangeStatus = data.filter((arr) => arr.length === 2 && arr[0] && arr[1]);
            clearText();
            setText('\nĐang đổi trạng thái ..... ');
            const total = dataChangeStatus.length;
            if (total === 0) {
                setText('\nKhông có dữ liệu hoặc dữ liệu không phù hợp');
                return;
            }
            const statusData = [];
            for (let i = 0; i < total; i += 1) {
                const row = dataChangeStatus[i];
                if (!row) {
                    setText(`\n Dòng : ${i} : không tồn tại dữ liệu`);
                    continue;
                }
                const id = row[0];
                if (!id) {
                    setText(`\n Dòng ${i} : không điền thông tin mã yêu cầu`);
                    continue;
                }
                const status = StatusEnum[row[1]];
                if (!status) {
                    setText(`\n Dòng ${i} : không điền trạng thái hoặc trạng thái không đúng`);
                    continue;
                }
                statusData.push({
                    code: row[0],
                    status,
                });
            }

            setText('\nLoad dữ liệu thành công, vui lòng nhấn vào chuyển trạng thái');
            setDataStatus(statusData);
        };
    };
    const handleChangeStatus = async () => {
        setText('\nĐang chuyển trạng thái');
        await Promise.all(dataStatus.map((data) => ticketClient.updateTicket(data)));
        setText('\nChuyển trạng thái thành công');
    };

    const handleChangeFile = (e) => {
        const file = e.target.files[0];
        readExcel(file);
    };

    const handleOnClose = () => {
        setText('');
        toggle();
        Router.push(Router.asPath);
    };
    return (
        <>
            <Dialog onClose={handleOnClose} aria-labelledby="simple-dialog-title" open={open}>
                <DialogTitle id="simple-dialog-title" className={styles.dialog_title}>
                    Công cụ đổi trạng thái hàng loạt
                    <IconButton aria-label="close" onClick={handleOnClose} style={{ position: 'absolute', right: 0, top: 0 }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container style={{ padding: '20px' }} spacing={1} justify="space-between">
                        <Grid item xs={9}>
                            <TextField type="file" style={{ width: '100%' }} variant="outlined" size="small" fullWidth onChange={handleChangeFile} />
                        </Grid>
                        <Grid item xs={3}>
                            <Button variant="contained" color="primary" style={{ textTransform: 'none', width: '100%' }} onClick={handleChangeStatus}>
                                Chuyển trạng thái
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            Chọn file muốn đổi trạng thái hàng loạt
                            <a
                                href="/sample_change_status_so.xlsx"
                                style={{
                                    fontWeight: '500',
                                    fontStyle: 'italic',
                                    textDecoration: 'none',
                                }}
                            >
                                <i> ( Tải file mẫu tại đây ) </i>
                            </a>
                        </Grid>
                        <Grid item xs={12} style={{ marginTop: '20px' }}>
                            <Typography gutterBottom>
                                <LabelFormCs>Danh sách phiếu yêu cầu lỗi</LabelFormCs>
                            </Typography>
                            <TextField
                                type="text"
                                style={{ width: '100%' }}
                                variant="outlined"
                                size="small"
                                multiline
                                rows={10}
                                fullWidth
                                InputProps={{
                                    style: {
                                        color: palette.info.default,
                                    },
                                    accept: '.xlsx, .xls, .csv',
                                }}
                                value={text}
                                disabled
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="secondary" style={{ textTransform: 'none' }} onClick={handleOnClose}>
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ChangeStatusModal;
