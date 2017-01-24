import { connect } from 'react-redux'
import { ViewProjectComponent } from './viewProject.view'
import { bindActionCreators } from 'redux'
import * as actions from '../../project.actions'

const mapStateToProps = (state, ownProps) => ({
    project: state.project.project.projects.find(project => project.id == ownProps.id),
})

const mapDispatchToProps = (dispatch, ownProps) => {
    return bindActionCreators({
        loadProject: actions.loadProject(ownProps.id),
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewProjectComponent)
