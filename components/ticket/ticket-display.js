
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chip, Box, Tooltip } from '@material-ui/core';
import styles from './ticket.module.css'

export function TicketStatus({ status, options }) {
    let info = options[status]
    if (!info) {
        return ""
    }

    return <Box className={styles.ticketStatus} >
        <FontAwesomeIcon icon={info.icon} style={{ color: info.iconColor, marginRight: 5, width: 24 }} />
        <span style={{
            color: info.color, fontWeight: "bold"
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