import { connect } from 'react-redux'
import * as actions from './project.actions'
import { bindActionCreators } from 'redux'
import { ProjectListComponent } from './projectList.view'

const mapStateToProps = state => {
    return {
        projects: state.project.project.projects,
        snackbar: state.project.common.snackbar,
        apology: state.project.common.apology,
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreators({
        closeSnackbar: actions.closeSnackbar,
        loadProjects: actions.loadProjects }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectListComponent)
