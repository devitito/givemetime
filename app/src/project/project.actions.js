import { RequestService } from '../common/common.actions.js'
import * as constants from './project.actionTypes'

const handleNodeFetched = dispatch => node => {
    dispatch(projectFetched(
      node.id,
      node.title,
      node.estimate,
      node.acquired,
      node.description,
      node.author || null,
      node.author_id
  ))
}

export function loadProjects () {
    return dispatch => {
        dispatch(RequestService('GET', null, null, 'projects',
            ({ response }) => {
                response.map(handleNodeFetched(dispatch))
            }
        ))
    }
}

export function loadProject (id) {
    return () => dispatch => {
        dispatch(RequestService('GET', null, null, `project/${id}`,
            ({ response }) => {
                handleNodeFetched(dispatch)(response)
            }
        ))
    }
}

export const projectFetched = (id, title, estimate, acquired, description, author, author_id) => {
    return {
        type: constants.PROJECT_FETCHED,
        id: id,
        estimate: estimate,
        acquired: acquired,
        description: description,
        title: title,
        author: author,
        author_id: author_id,
    }
}
