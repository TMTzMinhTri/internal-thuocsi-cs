
import { faHourglass } from '@fortawesome/free-regular-svg-icons';
import { faInbox, faHourglassHalf, faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chip, Box, Tooltip } from '@material-ui/core';

export const listStatus = [
    {
        value: 'PENDING',
        label: 'Chưa xử lý',
        color: '#cc5555',
        iconColor: '#cc5555',
        icon: faHourglass
    },
    {
        value: 'ASSIGNED',
        label: 'Đã tiếp nhận',
        color: '#000',
        iconColor: '#55cccc',
        icon: faInbox
    },
    {
        value: 'IN_PROCESS',
        label: 'Đang xử lý',
        color: '#000',
        iconColor: '#55cccc',
        icon: faHourglassHalf
    },
    {
        value: 'DONE',
        label: 'Đã xử lý',
        color: '#5b5',
        iconColor: '#5b5',
        icon: faCheckCircle
    },
    {
        value: 'CANCELLED',
        label: 'Đã huỷ',
        color: '#bbb',
        iconColor: '#bbb',
        icon: faTimes
    },

];

export const mapStatus = {}
listStatus.forEach((status) => {
    mapStatus[status.value] = status
})

const styles = {
    ticketStatus: {
        borderRadius: 7,
        padding: "4px 0",
        width: 120
    },
    ticketIcon: {

        marginRight: 5,
        width: 24
    },
    ticketLabel: {
        fontWeight: "bold"
    }
}

export function TicketStatus({ status }) {
    let info = mapStatus[status]
    if (!info) {
        return ""
    }

    return <Box style={styles.ticketStatus} >
        <FontAwesomeIcon icon={info.icon} style={{ ...styles.ticketIcon, color: info.iconColor }} />
        <span style={{
            ...styles.ticketLabel, color: info.color
        }}>{info.label}</span>
    </Box>
}

export function TicketReason({ label }) {
    return <Chip
        style={{ margin: '3px', borderRadius: '4px' }}
        size="small"
        label={label}
    />
}

// Account Type display
const accountTypes = {
    CUSTOMER: {
        label: "KH",
        tooltip: "Khách mua hàng trên thuocsi.vn",
        color: "#d64"
    },
    EMPLOYEE: {
        label: "NV",
        tooltip: "Nhân viên của công ty BuyMed & các công ty liên quan",
        color: "#4a8"
    },

}



export function AccountType({ type }) {
    let accDisplay = accountTypes[type]
    if (!accDisplay) {
        accDisplay = accountTypes.CUSTOMER
    }
    const accStyle = {
        border: "solid 1px " + accDisplay.color,
        color: accDisplay.color,
        borderRadius: 5,
        padding: "0 2px",
        width: 32,
        marginRight: 4,
        display: "inline-block",
        textAlign: "center"
    }
    return <Tooltip title={accDisplay.tooltip}>
        <Box style={accStyle}>
            {accDisplay.label}
        </Box>
    </Tooltip>
}