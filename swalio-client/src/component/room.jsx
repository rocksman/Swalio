import React, { Component } from 'react';
import styled from 'styled-components';
import { Mic, MicOff, Videocam, VideocamOff } from '@material-ui/icons';
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
    transform:rotateY(180deg);
    object-fit: cover;
`;
const MyVideoBox = styled.video`
    position: fixed;
    z-index: 10;
    bottom: 10px;
    right: 10px;
    height: 200px;
    width: 350px;
    background: ${props => props.theme.colors.black};
    border-radius: 5px;
    transform:rotateY(180deg);
    box-shadow: 0 8px 6px -6px rgba(0,0,0,0.4);
    object-fit: cover;
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
    height: 50px;
    width: 200px;
    padding: 10px 5%;
    background: ${props => props.theme.colors.black};
    box-shadow: 0 8px 6px -6px rgba(0,0,0,0.4);
    border-radius: 5px;
    display: flex;
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
    :hover{
        background: ${props => props.active? props.theme.colors.primary: 'none'};
    }
    :nth-child(1){
        margin-right: 30px;
    }
`;

let id;
let rtcPeerConnection;
let localstream;
let tracks = [];

class Room extends Component {
    constructor(props) {
        super(props);
        this.local = React.createRef();
        this.remote = React.createRef();
    }
    componentDidUpdate = (prevProps) => {
        if(JSON.stringify(this.props.config) != JSON.stringify(prevProps.config)){
            if(this.props.config.video || this.props.config.audio){
                // rtcPeerConnection.getSenders().map(sender => {
                //     console.log(sender);
                //     rtcPeerConnection.removeTrack(sender);
                // })
                navigator.mediaDevices.getUserMedia({ video: this.props.config.video, audio: this.props.config.audio }).then((stream) => {
                    this.showStream(stream);
                    localstream.getAudioTracks()[0].enabled = this.props.config.audio;
                    localstream.getVideoTracks()[0].enabled = this.props.config.video;
                    // localstream.getTracks().map(track => {
                    //     tracks.push(rtcPeerConnection.addTrack(track, localstream));
                    //     console.log(tracks);
                    // })
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
                if (!this.props.user.create) {
                    navigator.mediaDevices.getUserMedia(this.props.config).then((stream) => {
                        localstream = stream;
                        this.showStream(stream)
                        socket.emit('ready', id);
                    })
                }
                else {
                    console.log(this.props.config);
                    navigator.mediaDevices.getUserMedia(this.props.config).then((stream) => {
                        localstream = stream;
                        this.showStream(stream)
                    })
                }
                socket.on('ready', () => {
                    if (this.props.user.create) {
                        console.log('ready');
                        rtcPeerConnection = new RTCPeerConnection(constants.iceServers);
                        rtcPeerConnection.onicecandidate = this.onIceCandidate;
                        rtcPeerConnection.ontrack = this.onAddStream;
                        localstream.getTracks().map(track => {
                            tracks.push(rtcPeerConnection.addTrack(track, localstream));
                        })
                        // rtcPeerConnection.addTrack(localstream.getTracks()[0], localstream);
                        // rtcPeerConnection.addTrack(localstream.getTracks()[1], localstream);
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
                        // rtcPeerConnection.addTrack(localstream.getTracks()[0], localstream);
                        // rtcPeerConnection.addTrack(localstream.getTracks()[1], localstream);
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
            }
        }
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

    onAddStream = (event) => {
        if (this.remote.current) {
            // this.remote.current.play();
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

    render() {
        return (
            <Wrapper>
                <Container>
                    {/* {usersInfo.users.map((item, index) => (
                        <Video 
                            size={usersInfo.size} 
                            name={item} 
                            current={user} 
                            room={id} 
                            vidRef={(video) =>  this[`vid${index}_ref`] = video} 
                            key={index} 
                            showStream = {this.showStream}
                            onIceCandidate = {this.onIceCandidate}
                            onAddStream = {this.onAddStream}
                        />
                    ))} */}
                    <MyVideoBox ref={this.local} muted></MyVideoBox>
                    <VideoBox ref={this.remote}></VideoBox>
                </Container>
                <ControlContainer>
                    <Controls>
                        <Control onClick={this.videoController} active={this.props.config.video}>
                            {this.props.config.video ? <Videocam fontSize="large" style={{ color: '#fff' }} /> : <VideocamOff fontSize="large" style={{ color: '#fff' }} />}
                        </Control>
                        <Control onClick={this.audioController} active={this.props.config.audio}>
                            {this.props.config.audio ? <Mic fontSize="large" style={{ color: '#fff' }} /> : <MicOff fontSize="large" style={{ color: '#fff' }} />}
                        </Control>
                    </Controls>
                </ControlContainer>
            </Wrapper>
        )
    }
}

export default Room;