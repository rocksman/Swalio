import ActionTypes from "../constants/actionTypes";

export const meeetingUser = (data) => ({
    type: ActionTypes.CREATE_MEETING_USER,
    payload: data
});

export const userCofig = (data) => ({
    type: ActionTypes.USER_CONFIG,
    payload: data
});

export const usersInfo = (data) => ({
    type: ActionTypes.USERS_INFO,
    payload: data
})