import { combineReducers } from "redux";
import user from './user';
import config from './config';
import usersInfo from './usersInfo';

const rootReducer = combineReducers({
    user,
    config,
    usersInfo
});

export default rootReducer;