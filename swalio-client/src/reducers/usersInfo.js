import _ from "lodash";
import ActionTypes from "../constants/actionTypes";
import initialState from "../stores/initialState";

export default (state = initialState.usersInfo, action) => {
    switch (action.type) {
        case ActionTypes.USERS_INFO:
            return action.payload
        default:
            return state;
    }
};
