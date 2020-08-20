import React, { Component } from 'react';
import Draggable, {DraggableCore} from 'react-draggable'
import styled from 'styled-components';
import { Mic, MicOff, Videocam, VideocamOff, CallEnd } from '@material-ui/icons';
import { socket } from '../App';
import { constants } from '../constants/request';

const Wrapper = styled.div`
    width: 100vw;
    height: 100vh;
    background: ${props => props.theme.colors.background};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;
const Container = styled.div`
    position: relative;
    width: 90%;
    height: 90%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-flow: column wrap;
`;
const VideoBox = styled.video`
    height: 100%;
    width: 100%;
    background: ${props => props.theme.colors.black};
    border-radius: 5px;
    transform:rotateY(180deg) !important;
    object-fit: contain;
`;
const MyVideoBox = styled.div`
    position: fixed;
    z-index: 10;
    bottom: 10px;
    right: 10px;
    height: 200px;
    width: 350px;
    background: ${props => props.theme.colors.black};
    border-radius: 5px;
    /* transform:rotateY(180deg) !important; */
    box-shadow: 0 8px 6px -6px rgba(0,0,0,0.4);
    object-fit: contain;
    >video{
        height: 100%;
        width: 100%;
        transform:rotateY(180deg) !important;
        object-fit: contain;
    }
    @media (max-width: 1024px) {
        height: 100px;
        width: 175px;
        top: 10px;
        bottom: none;
    }
`;
const ControlContainer = styled.div`
    position: fixed;
    z-index: 20;
    bottom: 50px;
    left: 0px;
    width: 100%;
    height: 100px;
    display:flex;
    align-items: center;
    justify-content: center;
`;
const Controls = styled.div`
    height: 70px;
    width: 300px;
    padding: 0px;
    padding-left: 50px;
    display: ${props => props.active? 'flex': 'none'};
    background: ${props => props.theme.colors.black};
    box-shadow: 0 8px 6px -6px rgba(0,0,0,0.4);
    border-radius: 5px;
    align-items: center;
    justify-content: space-between;
`;
const Control = styled.div`
    height: 50px;
    width: 50px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid ${props => props.theme.colors.primary};
    background: ${props => props.active? 'none' : props.theme.colors.primary};
    border-radius: 50%;
    transition: .5s;
    :hover{
        background: ${props => props.active? props.theme.colors.primary: 'none'};
    }
`;
const Cancel = styled.button`
    height: 100%;
    width: 80px;
    border: none;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e53935;
`;


let id;
let rtcPeerConnection;
let localstream;
let tracks = [];

class Room extends Component {
    constructor(props) {
        super(props);
        this.state = {
            controls: true
        }
        this.local = React.createRef();
        this.remote = React.createRef();
    }
    componentDidUpdate = (prevProps) => {
        if(JSON.stringify(this.props.config) != JSON.stringify(prevProps.config)){
            if(this.props.config.video || this.props.config.audio){
                navigator.mediaDevices.getUserMedia({ video: this.props.config.video, audio: this.props.config.audio }).then((stream) => {
                    this.showStream(stream);
                    localstream.getAudioTracks()[0].enabled = this.props.config.audio;
                    localstream.getVideoTracks()[0].enabled = this.props.config.video;
                });
            }
        }
    }
    componentDidMount = () => {
        id = this.props.match.params.id;
        if (!id)
            this.props.history.push('/');
        else {
            if (!this.props.user.name) {
                this.props.history.push(`/${id}`)
            }
            else {
                window.addEventListener("beforeunload", this.onUnload)
                setTimeout(() => {
                    this.setState({ controls: false});
                }, 5000);
                if (!this.props.user.create) {
                    navigator.mediaDevices.getUserMedia(this.props.config).then((stream) => {
                        localstream = stream;
                        this.showStream(stream)
                        socket.emit('ready', id);
                    })
                }
                else {
                    navigator.mediaDevices.getUserMedia(this.props.config).then((stream) => {
                        localstream = stream;
                        this.showStream(stream)
                    })
                }
                socket.on('ready', () => {
                    if (this.props.user.create) {
                        rtcPeerConnection = new RTCPeerConnection(constants.iceServers);
                        rtcPeerConnection.onicecandidate = this.onIceCandidate;
                        rtcPeerConnection.ontrack = this.onAddStream;
                        localstream.getTracks().map(track => {
                            tracks.push(rtcPeerConnection.addTrack(track, localstream));
                        })
                        rtcPeerConnection.createOffer()
                            .then(sessionDescription => {
                                rtcPeerConnection.setLocalDescription(sessionDescription);
                                socket.emit('offer', {
                                    type: 'offer',
                                    sdp: sessionDescription,
                                    room: id
                                });
                            })
                            .catch(error => {
                                console.log(error)
                            })
                    }
                });
                socket.on('offer', (event) => {
                    if (!this.props.user.create) {
                        console.log('offer', event);
                        rtcPeerConnection = new RTCPeerConnection(constants.iceServers);
                        rtcPeerConnection.onicecandidate = this.onIceCandidate;
                        rtcPeerConnection.ontrack = this.onAddStream;
                        localstream.getTracks().map(track => {
                            tracks.push(rtcPeerConnection.addTrack(track, localstream));
                        })
                        rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
                        rtcPeerConnection.createAnswer()
                            .then(sessionDescription => {
                                rtcPeerConnection.setLocalDescription(sessionDescription);
                                socket.emit('answer', {
                                    type: 'answer',
                                    sdp: sessionDescription,
                                    room: id
                                });
                            })
                            .catch(error => {
                                console.log(error)
                            })
                    }
                });
                socket.on('answer', function (event) {
                    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
                })
                socket.on('candidate', function (event) {
                    var candidate = new RTCIceCandidate({
                        sdpMLineIndex: event.label,
                        candidate: event.candidate
                    });
                    rtcPeerConnection.addIceCandidate(candidate);
                });
                socket.on('close', ()=>{
                    rtcPeerConnection.close();
                    this.props.history.push(`/roomend/end`);
                })
            }
        }
    }

    componentWillUnmount = () => {
        window.removeEventListener("beforeunload", this.onUnload)
    }

    onUnload = e => { // the method that will be used for both add and remove event
        e.preventDefault();
        e.returnValue = 'Sure you want to leave?';
        console.log('Hi there reload');
        try{
            rtcPeerConnection.close();
        }
        catch(e){}
        socket.emit('leave', id);
        return 'Sure you want to leave?'
     }

    showStream = (stream) => {
        this.local.current.srcObject = stream;
        this.local.current.play();
    }
    onIceCandidate = (event) => {
        if (event.candidate) {
            console.log('sending ice candidate');
            socket.emit('candidate', {
                type: 'candidate',
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate,
                room: id
            })
        }
    }

    toggleControls = () => {
        if(!this.state.controls){
            this.setState({controls: true});
            setTimeout(() => {
                this.setState({ controls: false});
            }, 5000)
        }
    }

    onAddStream = (event) => {
        if (this.remote.current) {
            console.log(event)
            this.remote.current.srcObject = event.streams[0];
            this.remote.current.play();
        }
    }
    videoController = () => {
        this.props.userConfig({video: !this.props.config.video, audio: this.props.config.audio});
    }
    audioController = () => {
        this.props.userConfig({video: this.props.config.video, audio: !this.props.config.audio});
    }
    closeMeeting = () => {
        try{
            rtcPeerConnection.close();
        }
        catch(e){
            console.log('No connection yet')
        }
        socket.emit('close', id);
        this.props.history.push('/roomend/end');
    }

    render() {
        return (
            <Wrapper onMouseMove={this.toggleControls}>
                <Container>
                    <Draggable>
                        <MyVideoBox>
                            <video ref={this.local} muted></video>
                        </MyVideoBox>
                    </Draggable>
                    <VideoBox ref={this.remote}></VideoBox>
                </Container>
                <ControlContainer>
                    <Controls onMouseOver={this.toggleControls} active={this.state.controls}>
                        <Control onClick={this.videoController} active={this.props.config.video}>
                            {this.props.config.video ? <Videocam fontSize="large" style={{ color: '#fff' }} /> : <VideocamOff fontSize="large" style={{ color: '#fff' }} />}
                        </Control>
                        <Control onClick={this.audioController} active={this.props.config.audio}>
                            {this.props.config.audio ? <Mic fontSize="large" style={{ color: '#fff' }} /> : <MicOff fontSize="large" style={{ color: '#fff' }} />}
                        </Control>
                        <Cancel onClick={this.closeMeeting}>
                            <CallEnd fontSize="large" style={{ color: '#fff' }} />
                        </Cancel>
                    </Controls>
                </ControlContainer>
            </Wrapper>
        )
    }
}

export default Room;