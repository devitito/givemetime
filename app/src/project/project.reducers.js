import * as projectActions from './project.actionTypes'
import * as giveTimeActions from './components/giveTime/giveTime.actionTypes'
import * as projectRowActions from './components/projectRow/projectRow.actionTypes'
import * as addProjectActions from './components/addProject/addProject.actionTypes'

export default function (state = { projects: [], snackbar: { open: false, message: '' } }, action) {
    switch (action.type) {

    case projectActions.PROJECT_FETCHED:
        return { ...state,
            projects: state.projects
                .filter(project => project.id !== action.id)
                .concat([{
                    id: action.id,
                    title: action.title,
                    estimate: parseFloat(action.estimate),
                    acquired: parseFloat(action.acquired),
                    description: action.description,
                    author: action.author,
                    author_id: action.author_id,
                }]),
        }

    case giveTimeActions.GAVE_TIME:
        return { ...state,
            projects: state.projects.map(
                project => project.id === action.id
                    ? { ...project, acquired: parseFloat(action.acquired) }
                    : project
            ),
        }

    case addProjectActions.PROJECT_CREATED:
        return { ...state,
            projects: state.projects.concat([{
                id: action.id,
                title: action.title,
                estimate: parseFloat(action.estimate),
                acquired: parseFloat(action.acquired),
                description: action.description,
                author: action.author,
                author_id: action.author_id,
            }]),
        }

    case projectRowActions.PROJECT_DELETED:
        return { ...state,
            projects: state.projects.filter(project => project.id !== action.id),
        }
    case projectActions.SHOW_SNACKBAR:
        return { ...state, snackbar: { open: true, message: action.message } }
    case projectActions.HIDE_SNACKBAR:
        return { ...state, snackbar: { open: false, message: '' } }
    default:
        return state

    }
}
