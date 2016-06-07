import React, { PropTypes } from 'react'
import IconButton from 'material-ui/IconButton'
import ActionDelete from 'material-ui/svg-icons/action/delete'
import LinearProgress from 'material-ui/LinearProgress'
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import ProjectDialog from './ProjectDialog.jsx'
import GiveTimeDialog from './GiveTimeDialog.jsx'
import { connect } from 'react-redux'
import { getGraphQL, projectDeleted } from '../actions.js'


export class ProjectTableRow extends React.Component {
    render () {
        return (
          <Card onTouchTap={this.handleDiscoverClick} expanded={null} expandable={false} initiallyExpanded={false}>
              <CardHeader title={this.props.title} subtitle={this.props.author}/>
              <CardText>
                  <div>Estimated time : {this.props.estimate}</div>
                  <LinearProgress max={this.props.estimate} min={0} value={this.props.acquired} mode="determinate"/>
              </CardText>
              <CardActions>
                  <ProjectDialog
                      ref="ProjectDialog"
                      id={this.props.id}
                      description={this.props.description}
                      title={this.props.title}
                      author={this.props.author}
                      estimate={this.props.estimate}
                      acquired={this.props.acquired} />
                  <GiveTimeDialog
                      id={this.props.id}
                      rowId={this.props.rowId}
                      description={this.props.description}
                      title={this.props.title}
                      author={this.props.author}
                      estimate={this.props.estimate}
                      acquired={this.props.acquired} />
                    <IconButton onTouchTap={() => this.props.onDelete.call(this, this.props.rowId)}>
                      <ActionDelete />
                  </IconButton>
              </CardActions>
          </Card>
        )
    }
}

ProjectTableRow.propTypes = {
    id: PropTypes.string.isRequired,
    rowId: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string,
    description: PropTypes.string,
    estimate: PropTypes.number.isRequired,
    acquired: PropTypes.number.isRequired,
    onDelete: PropTypes.func.isRequired,
}


const mapDispatchToProps = (dispatch) => {
    return {
        onDelete: (id) => {
            dispatch(getGraphQL(`
                mutation deleteProject(
                    $rowId: Int!
                ) {
                    deleteProject(input: {
                        rowId: $rowId
                    }) {
                        project {
                          id
                        }
                    }
                }`,
                { rowId: id },
                (response) => dispatch(projectDeleted(response.deleteProject.project.id))
            ))
        },
    }
}

export default connect(null, mapDispatchToProps)(ProjectTableRow)
