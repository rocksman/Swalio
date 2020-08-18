import { connect } from "react-redux";
import Home from "../component/home";
import { meeetingUser, userCofig, usersInfo } from '../actions/syncActions';

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return {
    meetingUser: (data)=> dispatch(meeetingUser(data)),
    userConfig: (data) => dispatch(userCofig(data)),
    usersInfo: (data) => dispatch(usersInfo(data))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
