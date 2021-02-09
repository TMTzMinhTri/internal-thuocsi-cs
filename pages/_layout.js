import { faList,faFile

} from "@fortawesome/free-solid-svg-icons";
import App from "@thuocsi/nextjs-components/app/app";
import { Component } from "react";
export default class AppCS extends Component {

    constructor(props) {
        super(props)
        this.state = {
            menu: [{
                key:"ALL_CASE",
                name: "All Cases",
                link:"/cs/all_case",
                icon: faList
            },
            {
                key:"MY_CASE",
                name: "My Case",
                link:"/cs/my_case",
                icon: faList
            },
            {
                key:"LIST_FILE",
                name: "List Files",
                link:"/cs/list_file",
                icon: faFile
            },
        ]
        }
    }

    render() {
        let { children } = this.props
        return (
            <App menu={this.state.menu}
                select={this.props.select} > { children}
            </App>
        )
    }
}