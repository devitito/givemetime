import React, { PropTypes, Component } from 'react'
import ProjectPropTypes from '../../project.propTypes'
import Inovia from '../../../../assets/inovia.png'
import CircularProgressbar from 'react-circular-progressbar'
import RaisedButton from 'material-ui/RaisedButton'
import { Link } from 'react-router'
import DownArrow from '../../../../assets/down-arrow.png'
import UpArrow from '../../../../assets/up-arrow.png'

import './viewProject.css'

export class ViewProjectComponent extends Component {

    constructor (props) {
        super(props)
        this.state = { showDesc: false }
    }

    render () {
        const { project, loadProject } = this.props

        if (!this.props.project) {
            loadProject()
            return (
                <div>Loading...</div>
            )
        }

        const { description } = project
        return (
            <div className='view_project'>
                <div className='description'>
                    <div className='title_arrow'>
                        <h2 className='title_desc'>Description</h2>
                        <img className='arrow_desc' />
                    </div>
                    <p>{description}</p>
                </div>
            </div>
        )
    }
}

ViewProjectComponent.propTypes = {
    project: ProjectPropTypes,
    loadProject: PropTypes.func.isRequired,
}
