import _ from "lodash";
import ActionTypes from "../constants/actionTypes";
import initialState from "../stores/initialState";

export default (state = initialState.user, action) => {
    switch (action.type) {
        case ActionTypes.CREATE_MEETING_USER:
            return action.payload;
        default:
            return state;
    }
};
