import App from "@thuocsi/nextjs-components/app/app";
import { Component } from "react";
export default class AppCMS extends Component {

    constructor(props) {
        super(props)
        this.state = {
            menu: []
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