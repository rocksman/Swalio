import React, { Component, createRef } from 'react';
import styled from 'styled-components';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import { socket } from '../App';

const Wrapper = styled.div`
    height: 100vh;
    width: 100vw;
    background: ${props => props.theme.colors.background};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-y: auto;
`;
const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: row;
    width: ${props => props.theme.width};
    @media (max-width: 1024px) {
        flex-direction: column;
    }
`;
const VideoController = styled.div`
    position: relative;
    @media (max-width: 1024px) {
        margin-bottom: 50px;
    }
`;
const Video = styled.video`
    height: 360px;
    width: 640px;
    border-radius: 10px;
    background: ${props => props.theme.colors.black};
    transform:rotateY(180deg);
    box-shadow: 0 8px 6px -6px rgba(0,0,0,0.4);
    object-fit: contain;
    @media (max-width: 1024px) {
        height: 100vh;
        width: 100vw;
        border-radius: 0px;
        box-shadow: none;
    }
`;
const Actions = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    position: absolute;
    bottom: 20px;
`;
const Action = styled.div`
    height: 50px;
    width: 50px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid ${props => props.theme.colors.primary};
    background: ${props => props.active? props.theme.colors.primary+'11' : props.theme.colors.primary};
    border-radius: 50%;
    :hover{
        background: ${props => props.active? props.theme.colors.primary: 'none'};
    }
    :nth-child(1){
        margin-right: 30px;
    }
`;
const Line = styled.div`
    width: 1px;
    height: 280px;
    background: ${props => props.theme.colors.lightGrey};
    @media (max-width: 1024px) {
        display: none;
    }
`;
const FormController = styled.div`
    width: 320px;
    >h1{
        color: ${props=> props.theme.colors.white};
        text-transform: capitalize;
        font-weight: 400;
        margin-bottom: 50px;
    }
    @media (max-width: 1024px) {
        width: 90%;
        margin: auto;
        margin-bottom: 30px;
    }
`;
const TextField = styled.input`
    width: 80%;
    font-family: 'Quicksand', sans-serif;
    border: none;
    background: none;
    color: white;
    padding: 5px 10px;
    font-size: 14px;
    border-bottom: 1px solid #fff;
    margin-bottom: 30px;
    :focus{
        border-bottom: 2px solid ${props => props.theme.colors.primary};
        outline: 0;
    }
`;
const Button = styled.button`
    background: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.white};
    font-family: 'Quicksand', sans-serif;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    box-shadow: 0 8px 6px -6px rgba(135,71,171,0.2) ;
    :focus{
        outline: 0;
    }
`;

let id;

class Home extends Component{
    constructor(props) {
        super(props);
        this.vidRef = createRef();
        this.state = {
            create: true,
            audio: true,
            video: true,
            name: ''
        }
    }
    componentDidMount = () => {
        id = this.props.match.params.id;
        if(id)
            this.setState({create: false});
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            this.getUserStream();
        }
        socket.on('created', (data) => {
            this.props.usersInfo({users: data.members, size: data.clients});
            this.props.history.push(`/room/${data.room}`);
        })
        socket.on('joined', (data) => {
            this.props.usersInfo({users: data.members, size: data.clients});
            this.props.history.push(`/room/${data.room}`);
        })
        socket.on('full', (data)=>{
            alert('Room Full');
        })
    }
    getUserStream = () => {
        if(this.state.video || this.state.audio){
            navigator.mediaDevices.getUserMedia({ video: this.state.video, audio: this.state.audio }).then((stream) => {
                this.vidRef.current.srcObject = stream;
                this.vidRef.current.play();
            });
        }
    }
    videoController = () => {
        this.setState({video: !this.state.video}, ()=> {
            this.getUserStream();
        });
    }
    audioController = () => {
        this.setState({audio: !this.state.audio}, () => {
            this.getUserStream();
        });
    }
    inputHandler = (e) => {
        this.setState({name: e.target.value})
    }
    buttonHandler = () => {
        const {video, audio, name, create } = this.state;
        this.props.meetingUser({name, create});
        this.props.userConfig({video, audio});
        socket.emit('create or join', {room: id, name});
    } 
    render(){
        return(
            <Wrapper>
                <Container>
                    <VideoController>
                        <Video ref={this.vidRef} muted></Video>
                        <Actions>
                            <Action onClick={this.videoController} active={this.state.video}>
                                {this.state.video? <VideocamIcon fontSize="large" style={{ color: '#fff' }}/>: <VideocamOffIcon fontSize="large" style={{ color: '#fff' }}/>}
                            </Action>
                            <Action onClick={this.audioController} active={this.state.audio}>
                                {this.state.audio? <MicIcon fontSize="large" style={{ color: '#fff' }}/>: <MicOffIcon fontSize="large" style={{ color: '#fff' }}/>}
                            </Action>
                        </Actions>
                    </VideoController>
                    <Line/>
                    <FormController>
                        <h1>Create connections with people</h1>
                        <TextField placeholder="Name" value={this.state.name} onChange={this.inputHandler}/>
                        <Button onClick={this.buttonHandler}>{this.state.create? 'Create': 'Join'} Room</Button>
                    </FormController>
                </Container>
            </Wrapper>
        )
    }
}

export default Home;