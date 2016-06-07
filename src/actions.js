export const getGraphQL = (payload, variables, onSuccess, onError) => {
    onSuccess = onSuccess || ((a) => a)
    return (dispatch) => {
        onError = onError || ((a) => dispatch(apologize(a)))
        return new Promise((resolve) => {
            let request = new XMLHttpRequest()
            request.open('POST', '/graphql', true)
            request.setRequestHeader('Content-Type', 'application/json')
            request.send(JSON.stringify({ query: payload, variables: variables }))
            request.onreadystatechange = () => {
                if (request.readyState === 4) {
                    resolve(request.responseText)
                }
            }
        })
        .catch((response) => onError(JSON.parse(response)))
        .then((response) => {
            response = JSON.parse(response)
            if (response.errors) {
                onError(response)
            } else {
                onSuccess(response.data)
            }
        })
    }
}

export const userLoggedIn = (id, rowId, fullname, credit) => {
    return {
        type: 'USER_LOGGED_IN',
        id: id,
        rowId: rowId,
        fullname: fullname,
        credit : credit,
    }
}
export const userLoggedOut = () => {
    return {
        type: 'USER_LOGGED_OUT',
        id: null,
        rowId: null,
        fullname: null,
        credit : null,
        projects : [],
    }
}
export const userCreditChanged = (newCredit) => {
    return {
        type: 'USER_CREDIT_CHANGED',
        credit: newCredit,
    }
}

export const projectFetched = (id, row_id, title, estimate, acquired, description, author) => {
    return {
        type: 'PROJECT_FETCHED',
        id: id,
        rowId: row_id,
        estimate: estimate,
        acquired: acquired,
        description: description,
        title: title,
        author: author,
    }
}
export const projectCreated = (id, row_id, title, estimate, acquired, description) => {
    return {
        type: 'PROJECT_CREATED',
        id: id,
        rowId: row_id,
        estimate: estimate,
        acquired: acquired,
        description: description,
        title: title,
    }
}
export const projectDeleted = (id) => {
    return {
        type: 'PROJECT_DELETED',
        id: id,
    }
}

export const apologize = (msg) => {
    return {
        type: 'APOLOGIZE',
        message: msg,
    }
}

export const addProjectDialogToggle = (open) => {
    if (open) {
        return {
            type: 'ADD_PROJECT_DIALOG_OPEN',
        }
    } else {
        return {
            type: 'ADD_PROJECT_DIALOG_CLOSE',
        }
    }
}

export const closeProjectDialog = () => {
    return {
        type: 'VIEW_PROJECT_DIALOG_CLOSE',
    }
}
export const openProjectDialog = (id) => {
    return {
        type: 'VIEW_PROJECT_DIALOG_OPEN',
        id: id,
    }
}


export const closeGiveTimeDialog = () => {
    return {
        type: 'GIVE_TIME_DIALOG_CLOSE',
    }
}
export const openGiveTimeDialog = (id) => {
    return {
        type: 'GIVE_TIME_DIALOG_OPEN',
        id: id,
    }
}
export const giveTime = (amount, projectRowId) => {
    return {
        type: 'GIVE_TIME',
        amount: amount,
        id: projectRowId,
    }
}
export const giveTimeFormChange = (amount, projectId) => {
    return {
        type: 'GIVE_TIME_FORM_CHANGE',
        amount: amount,
        id: projectId,
    }
}

// create dependency between store structure and redux connector but small amount of code :)
export const projectFormChange = (prop, value) => {
    return {
        type: 'PROJECT_FORM_CHANGE',
        prop: prop,
        value: value,
    }
}
