import { connect } from "react-redux";
import Room from "../component/room";
import { userCofig } from '../actions/syncActions';

const mapStateToProps = state => {
  return {
      user: state.user,
      config: state.config,
      usersInfo: state.usersInfo
  };
};

const mapDispatchToProps = dispatch => {
  return {
    userConfig: (data) => dispatch(userCofig(data))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Room);
