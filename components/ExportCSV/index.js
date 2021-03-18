import React from 'react'
import { Button } from '@material-ui/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import CircularProgress from '@material-ui/core/CircularProgress';
import styles from './styles.module.css';

export const ExportCSV = ({csvData, fileName, loading}) => {

    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    const exportToCSV = (csvData, fileName) => {
        csvData().then(res => {
            const ws = XLSX.utils.json_to_sheet(res);
            const wb = { Sheets: { 'Danh sách': ws }, SheetNames: ['Danh sách'] };
            
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const data = new Blob([excelBuffer], {type: fileType});
            FileSaver.saveAs(data, fileName + fileExtension);
        })
    }

    return (
        <div className={styles.wrapper}>
        <Button variant="contained" color="primary" disabled={loading} onClick={(e) => exportToCSV(csvData,fileName)}>Xuất file</Button>
        {loading && <CircularProgress size={24} className={styles.buttonProgress} />}
      </div>
        
    )
}