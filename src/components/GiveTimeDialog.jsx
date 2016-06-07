import React, { PropTypes } from 'react'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import { connect } from 'react-redux'
import { giveTime, giveTimeFormChange, openGiveTimeDialog, getGraphQL, closeGiveTimeDialog } from '../actions.js'

export class GiveTimeDialog extends React.Component {
    isOpen () {
        return this.props.openId === this.props.id
    }

    render () {
        const textFieldWidth = {
            width: '30px',
        }
        const actions = [
            <FlatButton
                label="Close"
                primary={true}
                onTouchTap={this.props.closeDialog}
            />,
            <FlatButton
                label="GIVE !"
                secondary={true}
                onTouchTap={() => this.props.onSave(this.props.amount, this.props.rowId, this.props.userRowId)}
            />,
        ]

        const title = 'Give Time to project ' + this.props.title + ' (' + this.props.acquired + '/' + this.props.estimate + ')'
        return (
            <span>
                <RaisedButton label="GIVE TIME" secondary={true}
                              onTouchTap={() => this.props.openDialog(this.props.id)}/>
                <Dialog
                    title={title}
                    actions={actions}
                    modal={false}
                    open={this.isOpen()}
                    onRequestClose={this.props.closeDialog}
                    autoScrollBodyContent={true}
                >
                    <div>
                        <TextField
                            name="amount"
                            style={textFieldWidth}
                            value={this.props.amount}
                            errorText={this.props.errorAmount}
                            onChange={(e) => this.props.onChange(parseInt(e.target.value) || 0, this.props.id)}
                        /> out of {this.props.userCredit} credits.
                    </div>
                </Dialog>
            </span>
        )
    }
}


GiveTimeDialog.propTypes = {
    openId: PropTypes.string,
    amount: PropTypes.number.isRequired,
    id: PropTypes.string.isRequired,
    rowId: PropTypes.number.isRequired,
    userRowId: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    estimate: PropTypes.number.isRequired,
    acquired: PropTypes.number.isRequired,
    userCredit: PropTypes.number.isRequired,
    errorAmount: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    closeDialog: PropTypes.func.isRequired,
    openDialog: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => {
    return {
        openId: state.giveTimeDialog.openId,
        amount: state.giveTimeDialog.amount,
        userCredit: state.giveTimeDialog.userCredit,
        userId: state.user.id,
        userRowId: state.user.rowId,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onSave: (amount, projectRowId, userRowId) => {
            dispatch(getGraphQL(`
                mutation giveTime(
                    $projectRowId: Int!,
                    $userRowId: Int!,
                    $credit: Int!
                ){
                    projectGiveTime(input: {
                        personId: $userRowId,
                        projectId: $projectRowId,
                        amount: $credit
                    }) {
                        output {
                            rowId,
                            acquired
                        }
                    }
                }`,
                {
                    credit: amount,
                    userRowId: userRowId,
                    projectRowId: projectRowId,
                },
                () => {
                    dispatch(giveTime(amount, projectRowId))
                    dispatch(closeGiveTimeDialog())
                }
            ))
        },
        openDialog: (id) => {
            dispatch(openGiveTimeDialog(id))
        },
        closeDialog: () => {
            dispatch(closeGiveTimeDialog())
        },
        onChange: (amount, projectId) => {
            dispatch(giveTimeFormChange(amount, projectId))
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GiveTimeDialog)
