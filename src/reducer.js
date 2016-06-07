
export default function (state, action) {
    let tmp = {}
    switch (action.type) {
    case 'PROJECT_DELETED':
        return Object.assign({}, state, {
            projects: state.projects.filter((project) => project.id !== action.id),
        })

    case 'USER_LOGGED_IN':
        return Object.assign({}, state, { user: {
            id : action.id,
            rowId: action.rowId,
            credit: action.credit,
            fullname: action.fullname,
        } })

    case 'USER_LOGGED_OUT':
        return Object.assign({}, state, { user: {
            id : action.id,
            rowId: action.rowId,
            credit: action.credit,
            fullname: action.fullname,
        }, projects: [] })

    case 'USER_CREDIT_CHANGED':
        return Object.assign({}, state, {
            user: Object.assign({}, state.user, { credit: action.credit }),
        })

    case 'PROJECT_CREATED':
    case 'PROJECT_FETCHED':
        return Object.assign({}, state, {
            projects: state.projects.concat([{
                id: action.id,
                rowId: action.rowId,
                name: action.name,
                time: action.time,
                title: action.title,
                estimate: action.estimate,
                acquired: action.acquired,
                description: action.description,
                author: action.author,
            }]),
        })

    case 'ADD_PROJECT_DIALOG_OPEN':
        return Object.assign({}, state, {
            addProjectDialog: Object.assign({}, state.addProjectDialog, { open: true }),
        })

    case 'ADD_PROJECT_DIALOG_CLOSE':
        return Object.assign({}, state, {
            addProjectDialog: Object.assign({}, state.addProjectDialog, { open: false }),
        })

    case 'VIEW_PROJECT_DIALOG_OPEN':
        return Object.assign({}, state, {
            viewProjectDialog: Object.assign({}, state.viewProjectDialog, { openId: action.id }),
        })

    case 'VIEW_PROJECT_DIALOG_CLOSE':
        return Object.assign({}, state, {
            viewProjectDialog: Object.assign({}, state.viewProjectDialog, { openId: null }),
        })

    case 'GIVE_TIME_DIALOG_OPEN':
        return Object.assign({}, state, {
            giveTimeDialog: Object.assign({}, state.giveTimeDialog, {
                openId: action.id,
                userCredit: state.user.credit,
                amount: state.projects.reduce((agg, project) => {
                    return project.id === action.id ? Math.min(agg, project.estimate - project.acquired) : agg
                }, state.user.credit),
            }),
        })

    case 'GIVE_TIME_DIALOG_CLOSE':
        return Object.assign({}, state, {
            giveTimeDialog: Object.assign({}, state.giveTimeDialog, { openId: null, projectId: null }),
        })

    case 'GIVE_TIME':
        return Object.assign({}, state, {
            projects: state.projects.map(
                (project) => project.rowId === action.id
                    ? Object.assign({}, project, { acquired: project.acquired + action.amount })
                    : project
            ),
            user: Object.assign({}, state.user, { credit: state.user.credit - action.amount }),
        })

    case 'GIVE_TIME_FORM_CHANGE':
        return Object.assign({}, state, {
            giveTimeDialog: Object.assign({}, state.giveTimeDialog, {
                amount: Math.max(
                    0,
                    state.projects.reduce((agg, project) => {
                        return project.id === action.id ? Math.min(agg, project.estimate - project.acquired) : agg
                    }, Math.min(action.amount, state.user.credit))
                ),
            }),
        })

    case 'PROJECT_FORM_CHANGE':
        tmp[action.prop] = action.value
        return Object.assign({}, state, {
            addProjectDialog: Object.assign({}, state.addProjectDialog, tmp),
        })

    case 'APOLOGIZE':
        console.error(action.message) // eslint-disable-line no-console
        return state
    }
    return state
}
