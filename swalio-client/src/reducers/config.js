import _ from "lodash";
import ActionTypes from "../constants/actionTypes";
import initialState from "../stores/initialState";

export default (state = initialState.config, action) => {
    switch (action.type) {
        case ActionTypes.USER_CONFIG:
            return action.payload;
        default:
            return state;
    }
};
